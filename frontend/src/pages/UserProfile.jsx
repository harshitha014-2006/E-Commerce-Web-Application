import React, { useState, useEffect } from 'react';
import { Mail, Shield, Calendar, Package, RefreshCw, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UserProfile = () => {
  const { user, token, API_BASE } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  
  // Track which order rows are expanded to see item lists
  const [expandedOrders, setExpandedOrders] = useState({});

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to load order history');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token, API_BASE]);

  const toggleExpandOrder = (id) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Your payment will be refunded and items returned to stock.')) {
      return;
    }

    setCancellingId(orderId);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to cancel order');

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((ord) =>
          ord.id === orderId ? { ...ord, status: 'CANCELLED', paymentStatus: 'REFUNDED' } : ord
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'badge-warning';
      case 'PROCESSING': return 'badge-info';
      case 'SHIPPED': return 'badge-primary';
      case 'DELIVERED': return 'badge-success';
      case 'CANCELLED': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) return null;

  return (
    <div className="profile-page-container container py-8">
      <div className="profile-grid">
        {/* User Card */}
        <aside className="user-profile-sidebar card">
          <div className="avatar-placeholder">
            <span>{user.name.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
          </div>
          <h2>{user.name}</h2>
          
          <div className="profile-details-list">
            <div className="profile-detail-item">
              <Mail size={16} />
              <span>{user.email}</span>
            </div>
            <div className="profile-detail-item">
              <Shield size={16} />
              <span>Role: <strong>{user.role}</strong></span>
            </div>
            <div className="profile-detail-item">
              <Calendar size={16} />
              <span>Joined: 07/2026</span>
            </div>
          </div>
        </aside>

        {/* Order History */}
        <main className="profile-orders-main">
          <div className="section-header-row">
            <h2>Order History</h2>
            <button onClick={fetchOrders} className="btn-refresh" title="Reload Orders">
              <RefreshCw size={16} />
            </button>
          </div>

          {error && <div className="error-alert-box card mb-4">{error}</div>}

          {loading ? (
            <div className="orders-loading-stack">
              <div className="skeleton-item" style={{ height: '80px' }}></div>
              <div className="skeleton-item" style={{ height: '80px' }}></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-orders-card card text-center">
              <Package size={48} className="empty-icon" />
              <h3>No Orders Found</h3>
              <p>You haven't placed any orders yet. Browse our shop to make your first purchase!</p>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => {
                const isExpanded = !!expandedOrders[order.id];
                const canCancel = order.status === 'PENDING' || order.status === 'PROCESSING';

                return (
                  <div key={order.id} className="order-row-card card">
                    <div className="order-row-header" onClick={() => toggleExpandOrder(order.id)}>
                      <div className="order-main-meta">
                        <h3>#ORD-{order.id.toString().padStart(6, '0')}</h3>
                        <span className="order-date">{formatDate(order.createdAt)}</span>
                      </div>
                      
                      <div className="order-status-price-meta">
                        <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                        <strong className="order-row-price">${order.totalAmount.toFixed(2)}</strong>
                        <button className="btn-expand-order">
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="order-expanded-details animate-fade-in">
                        <div className="expanded-shipping">
                          <p><strong>Deliver to: </strong>{order.shippingAddress}</p>
                          <p className="mt-1"><strong>Phone: </strong>{order.contactPhone}</p>
                          <p className="mt-1">
                            <strong>Payment Status: </strong>
                            <span className="payment-status-label">{order.paymentStatus}</span>
                          </p>
                        </div>

                        <div className="expanded-items-grid">
                          {order.items.map((item) => (
                            <div key={item.id} className="expanded-item-row">
                              <img src={item.product?.imageUrl} alt={item.product?.name} className="expanded-item-img" />
                              <div className="expanded-item-info">
                                <h4>{item.product?.name}</h4>
                                <p>Quantity: {item.quantity}</p>
                              </div>
                              <span className="expanded-item-price">
                                ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {canCancel && (
                          <div className="expanded-actions">
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={cancellingId === order.id}
                              className={`btn-danger-outline btn-small ${cancellingId === order.id ? 'disabled' : ''}`}
                            >
                              {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
export default UserProfile;
