import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, Package, Truck, Compass, ShoppingBag } from 'lucide-react';

export const OrderConfirmation = () => {
  const location = useLocation();
  const order = location.state?.order;

  // Guard against direct URL access without order state
  if (!order) {
    return <Navigate to="/" replace />;
  }

  // Calculate delivery date estimate (e.g. 5 days from now)
  const deliveryDate = new Date(new Date(order.createdAt).getTime() + 5 * 24 * 60 * 60 * 1000);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="order-confirmation-page container py-12">
      <div className="confirmation-card card max-w-2xl mx-auto text-center">
        <CheckCircle2 className="success-icon animate-bounce-subtle" size={64} />
        <h1>Order Placed Successfully!</h1>
        <p className="subtitle">Thank you for your purchase. Your payment was approved.</p>

        <div className="order-meta-box">
          <div className="meta-row">
            <span>Order ID:</span>
            <strong>#ORD-{order.id.toString().padStart(6, '0')}</strong>
          </div>
          <div className="meta-row">
            <span>Total Paid:</span>
            <strong>${order.totalAmount.toFixed(2)}</strong>
          </div>
          <div className="meta-row">
            <span>Estimated Delivery:</span>
            <strong>{formattedDeliveryDate}</strong>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="tracking-timeline-widget">
          <h3>Order Tracking Timeline</h3>
          <div className="status-timeline">
            <div className="timeline-node active">
              <div className="node-icon"><Package size={16} /></div>
              <span>Pending</span>
            </div>
            <div className="timeline-bar"></div>
            <div className="timeline-node">
              <div className="node-icon"><Compass size={16} /></div>
              <span>Processing</span>
            </div>
            <div className="timeline-bar"></div>
            <div className="timeline-node">
              <div className="node-icon"><Truck size={16} /></div>
              <span>Shipped</span>
            </div>
            <div className="timeline-bar"></div>
            <div className="timeline-node">
              <div className="node-icon"><CheckCircle2 size={16} /></div>
              <span>Delivered</span>
            </div>
          </div>
        </div>

        <div className="shipping-info-summary text-left mt-6">
          <h3>Shipping To:</h3>
          <p>{order.shippingAddress}</p>
          <p className="mt-1">
            <strong>Phone: </strong>
            {order.contactPhone}
          </p>
        </div>

        <div className="itemized-summary text-left mt-6">
          <h3>Itemized Summary:</h3>
          <div className="itemized-list">
            {order.items?.map((item) => (
              <div key={item.id} className="itemized-row">
                <span>
                  {item.product?.name} <strong>x{item.quantity}</strong>
                </span>
                <span>${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="divider my-6"></div>

        <div className="confirmation-actions">
          <Link to="/" className="btn-primary">
            <ShoppingBag size={18} /> Continue Shopping
          </Link>
          <Link to="/profile" className="btn-secondary">
            View Order History
          </Link>
        </div>
      </div>
    </div>
  );
};
export default OrderConfirmation;
