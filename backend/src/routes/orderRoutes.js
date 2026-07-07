const express = require('express');
const prisma = require('../prismaClient');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

const ALLOWED_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

// POST /api/orders - Place a new order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { shippingAddress, contactPhone, items } = req.body;

    if (!shippingAddress || !contactPhone || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Shipping details and items are required' });
    }

    // Process order in a Prisma transaction to ensure stock consistency and atomicity
    const orderResult = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of items) {
        const { productId, quantity } = item;
        const parsedQty = parseInt(quantity);

        if (isNaN(parsedQty) || parsedQty <= 0) {
          throw new Error(`Invalid quantity for product ID ${productId}`);
        }

        // Fetch product
        const product = await tx.product.findUnique({
          where: { id: productId }
        });

        if (!product) {
          throw new Error(`Product with ID ${productId} does not exist`);
        }

        if (product.stock < parsedQty) {
          throw new Error(`Insufficient stock for product '${product.name}'. Available: ${product.stock}`);
        }

        // Decrement stock
        await tx.product.update({
          where: { id: productId },
          data: {
            stock: product.stock - parsedQty
          }
        });

        const itemTotal = product.price * parsedQty;
        totalAmount += itemTotal;

        orderItemsData.push({
          productId,
          quantity: parsedQty,
          priceAtPurchase: product.price
        });
      }

      // Add tax (10% standard rate for mock invoice)
      const taxRate = 0.10;
      const finalTotalAmount = totalAmount * (1 + taxRate);

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          totalAmount: parseFloat(finalTotalAmount.toFixed(2)),
          shippingAddress,
          contactPhone,
          status: 'PENDING',
          paymentStatus: 'PAID', // Mock payment successful
          items: {
            create: orderItemsData
          }
        },
        include: {
          items: {
            include: {
              product: {
                select: { name: true, imageUrl: true }
              }
            }
          }
        }
      });

      return newOrder;
    });

    res.status(201).json({
      message: 'Order placed successfully',
      order: orderResult
    });
  } catch (error) {
    console.error('Order placement error:', error);
    res.status(400).json({ error: error.message || 'Failed to place order' });
  }
});

// GET /api/orders/my-orders - Get logged-in user's order history
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, imageUrl: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    console.error('Fetch user orders error:', error);
    res.status(500).json({ error: 'Server error fetching orders' });
  }
});

// GET /api/orders - Admin only: Get all orders
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            product: {
              select: { name: true, imageUrl: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    console.error('Fetch all orders error:', error);
    res.status(500).json({ error: 'Server error fetching all orders' });
  }
});

// PUT /api/orders/:id/status - Admin only: Update order status
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}` });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if status is cancelling
    let updatedOrder;
    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      // Revert stock inside transaction
      updatedOrder = await prisma.$transaction(async (tx) => {
        const orderItems = await tx.orderItem.findMany({
          where: { orderId }
        });

        for (const item of orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity }
            }
          });
        }

        return tx.order.update({
          where: { id: orderId },
          data: { status, paymentStatus: 'REFUNDED' },
          include: {
            items: {
              include: {
                product: { select: { name: true } }
              }
            }
          }
        });
      });
    } else {
      updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: {
          items: {
            include: {
              product: { select: { name: true } }
            }
          }
        }
      });
    }

    res.json({
      message: `Order status updated to ${status}`,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error updating order status' });
  }
});

// PUT /api/orders/:id/cancel - User or Admin: Cancel a PENDING order
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check ownership
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied: You cannot cancel this order' });
    }

    // Check status - only allow cancelling PENDING or PROCESSING orders
    if (order.status !== 'PENDING' && order.status !== 'PROCESSING') {
      return res.status(400).json({ error: `Cannot cancel order at '${order.status}' stage` });
    }

    // Revert stock inside transaction
    const cancelledOrder = await prisma.$transaction(async (tx) => {
      const orderItems = await tx.orderItem.findMany({
        where: { orderId }
      });

      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity }
          }
        });
      }

      return tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'REFUNDED'
        },
        include: {
          items: {
            include: {
              product: { select: { name: true } }
            }
          }
        }
      });
    });

    res.json({
      message: 'Order cancelled successfully and stock refunded',
      order: cancelledOrder
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Server error cancelling order' });
  }
});

module.exports = router;
