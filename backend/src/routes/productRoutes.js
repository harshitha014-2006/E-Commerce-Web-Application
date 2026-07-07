const express = require('express');
const prisma = require('../prismaClient');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/categories - Fetch all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    console.error('Fetch categories error:', error);
    res.status(500).json({ error: 'Server error fetching categories' });
  }
});

// POST /api/categories - Admin only: add a category
router.post('/categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const category = await prisma.category.create({
      data: { name },
    });
    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Server error creating category' });
  }
});

// GET /api/products - Get products (pagination, filter, search, sort)
router.get('/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const search = req.query.search || '';
    const categoryId = parseInt(req.query.category) || null;
    const sort = req.query.sort || 'newest'; // newest, price_asc, price_desc

    const skip = (page - 1) * limit;

    // Build filter query
    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Build order query
    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    }

    // Execute queries
    const [products, totalCount] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: { name: true }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      products,
      totalPages,
      currentPage: page,
      totalCount
    });
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ error: 'Server error fetching products' });
  }
});

// GET /api/products/:id - Get product details
router.get('/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { name: true }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Fetch product detail error:', error);
    res.status(500).json({ error: 'Server error fetching product details' });
  }
});

// POST /api/products - Admin only: Add a product
router.post('/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, imageUrl, stock, categoryId } = req.body;

    if (!name || !description || price === undefined || !imageUrl || stock === undefined || !categoryId) {
      return res.status(400).json({ error: 'All product fields are required' });
    }

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock);
    const parsedCategoryId = parseInt(categoryId);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }
    if (isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ error: 'Stock cannot be negative' });
    }

    const categoryExists = await prisma.category.findUnique({
      where: { id: parsedCategoryId }
    });
    if (!categoryExists) {
      return res.status(400).json({ error: 'Invalid category selection' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parsedPrice,
        imageUrl,
        stock: parsedStock,
        categoryId: parsedCategoryId
      },
      include: {
        category: {
          select: { name: true }
        }
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Server error creating product' });
  }
});

// PUT /api/products/:id - Admin only: Update a product
router.put('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const { name, description, price, imageUrl, stock, categoryId } = req.body;

    if (!name || !description || price === undefined || !imageUrl || stock === undefined || !categoryId) {
      return res.status(400).json({ error: 'All product fields are required' });
    }

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock);
    const parsedCategoryId = parseInt(categoryId);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }
    if (isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ error: 'Stock cannot be negative' });
    }

    const categoryExists = await prisma.category.findUnique({
      where: { id: parsedCategoryId }
    });
    if (!categoryExists) {
      return res.status(400).json({ error: 'Invalid category selection' });
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: parsedPrice,
        imageUrl,
        stock: parsedStock,
        categoryId: parsedCategoryId
      },
      include: {
        category: {
          select: { name: true }
        }
      }
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Server error updating product' });
  }
});

// DELETE /api/products/:id - Admin only: Delete a product
router.delete('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await prisma.product.delete({
      where: { id }
    });

    res.json({ message: 'Product deleted successfully', id });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Server error deleting product' });
  }
});

module.exports = router;
