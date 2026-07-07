import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Pencil, Trash2, ChevronDown, ChevronUp, RefreshCw, Layers, Users, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminDashboard = () => {
  const { token, API_BASE, user: currentUser, updateUserRoleLocal } = useAuth();

  // Active tab: 'products', 'orders', 'users'
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Loaded data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  // Expanded order IDs
  const [expandedOrders, setExpandedOrders] = useState({});

  // Product Add/Edit Modal/Form State
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
    categoryId: '',
  });

  // Category Quick Add State
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Fetching helper functions
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/products?limit=100`); // Fetch all for admin management
      if (!response.ok) throw new Error('Failed to load products');
      const data = await response.json();
      setProducts(data.products);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/categories`);
      if (!response.ok) throw new Error('Failed to load categories');
      const data = await response.json();
      setCategories(data);
      // Pre-fill first category in form if empty
      if (data.length > 0 && !productForm.categoryId) {
        setProductForm(prev => ({ ...prev, categoryId: data[0].id.toString() }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to load system orders');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to load users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load appropriate data based on active tab
  useEffect(() => {
    setError(null);
    setSuccessMsg(null);
    if (activeTab === 'products') {
      fetchProducts();
      fetchCategories();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  // Product CRUD functions
  const handleOpenAddForm = () => {
    setIsEditing(false);
    setSelectedProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      stock: '',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80', // Default elegant mockup
      categoryId: categories[0]?.id.toString() || '',
    });
    setShowProductForm(true);
    setError(null);
  };

  const handleOpenEditForm = (prod) => {
    setIsEditing(true);
    setSelectedProduct(prod);
    setProductForm({
      name: prod.name,
      description: prod.description,
      price: prod.price.toString(),
      stock: prod.stock.toString(),
      imageUrl: prod.imageUrl,
      categoryId: prod.categoryId.toString(),
    });
    setShowProductForm(true);
    setError(null);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const method = isEditing ? 'PUT' : 'POST';
    const endpoint = isEditing ? `${API_BASE}/products/${selectedProduct.id}` : `${API_BASE}/products`;

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productForm),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save product');

      setSuccessMsg(isEditing ? 'Product updated successfully' : 'Product created successfully');
      setShowProductForm(false);
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setError(null);
    setSuccessMsg(null);
    try {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete product');
      }

      setSuccessMsg('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  // Category Quick Add
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setError(null);
    try {
      const response = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add category');

      setNewCategoryName('');
      setShowCategoryForm(false);
      fetchCategories();
      setSuccessMsg('Category added successfully');
      // Set as chosen category in form
      setProductForm(prev => ({ ...prev, categoryId: data.id.toString() }));
    } catch (err) {
      setError(err.message);
    }
  };

  // Order status management
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setError(null);
    setSuccessMsg(null);
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update status');

      setSuccessMsg(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  // User Role Management
  const handleToggleUserRole = async (userToUpdate) => {
    if (userToUpdate.id === currentUser.id) {
      setError('You cannot toggle your own admin status');
      return;
    }

    const nextRole = userToUpdate.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`Are you sure you want to change ${userToUpdate.name}'s role to ${nextRole}?`)) {
      return;
    }

    setError(null);
    setSuccessMsg(null);
    try {
      const response = await fetch(`${API_BASE}/users/${userToUpdate.id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: nextRole }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update user role');

      setSuccessMsg(`${userToUpdate.name}'s role changed to ${nextRole}`);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleExpandOrder = (id) => {
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="admin-dashboard container py-8">
      {/* Title & Banner */}
      <div className="admin-header card">
        <ShieldCheck className="admin-header-icon" size={32} />
        <div>
          <h1>Administration Dashboard</h1>
          <p>Manage system inventory, global orders fulfillment, and user access levels.</p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="admin-tabs-row">
        <button
          onClick={() => setActiveTab('products')}
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
        >
          <Layers size={18} />
          <span>Products Inventory</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
        >
          <ShoppingCart size={18} />
          <span>Fulfillment Orders</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
        >
          <Users size={18} />
          <span>User Directory</span>
        </button>
      </div>

      {/* Alert Banners */}
      {error && <div className="error-alert-box card mb-4">{error}</div>}
      {successMsg && <div className="success-alert-box card mb-4">{successMsg}</div>}

      {/* TAB 1: PRODUCTS INVENTORY */}
      {activeTab === 'products' && (
        <div className="admin-products-view card">
          <div className="tab-actions-header">
            <h2>System Inventory ({products.length} items)</h2>
            <div className="action-buttons-group">
              <button onClick={() => setShowCategoryForm(!showCategoryForm)} className="btn-secondary">
                <Plus size={16} /> Quick Category
              </button>
              <button onClick={handleOpenAddForm} className="btn-primary">
                <Plus size={16} /> Add Product
              </button>
            </div>
          </div>

          {/* Quick Category Form */}
          {showCategoryForm && (
            <form onSubmit={handleAddCategory} className="quick-category-form card">
              <h3>Create New Category</h3>
              <div className="form-row-inline">
                <input
                  type="text"
                  placeholder="e.g. Footwear"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" onClick={() => setShowCategoryForm(false)} className="btn-text">Cancel</button>
              </div>
            </form>
          )}

          {/* Product form toggle */}
          {showProductForm && (
            <form onSubmit={handleProductSubmit} className="admin-product-detail-form card">
              <h3>{isEditing ? `Edit Product: ${selectedProduct?.name}` : 'Add New Product'}</h3>
              
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zenith Active Watch"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Premium detail copy..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group col">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="199.99"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  />
                </div>
                <div className="form-group col">
                  <label>Stock Count</label>
                  <input
                    type="number"
                    required
                    placeholder="15"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col">
                  <label>Image URL</label>
                  <input
                    type="text"
                    required
                    placeholder="https://unsplash..."
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  />
                </div>
                <div className="form-group col">
                  <label>Category</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-actions mt-4">
                <button type="submit" className="btn-primary">
                  {isEditing ? 'Save Product' : 'Create Product'}
                </button>
                <button type="button" onClick={() => setShowProductForm(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Products List Table */}
          {loading ? (
            <div className="skeleton-list py-8">
              <div className="skeleton-item"></div>
              <div className="skeleton-item"></div>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => (
                    <tr key={prod.id}>
                      <td className="table-product-cell">
                        <img src={prod.imageUrl} alt={prod.name} className="table-prod-img" />
                        <div className="table-prod-info">
                          <strong>{prod.name}</strong>
                          <span className="table-prod-desc hide-mobile">{prod.description.substring(0, 50)}...</span>
                        </div>
                      </td>
                      <td>{prod.category?.name || 'Unassigned'}</td>
                      <td>${prod.price.toFixed(2)}</td>
                      <td>
                        <span className={`stock-level-indicator ${prod.stock === 0 ? 'empty' : prod.stock <= 5 ? 'low' : ''}`}>
                          {prod.stock} units
                        </span>
                      </td>
                      <td className="table-actions-cell text-right">
                        <button onClick={() => handleOpenEditForm(prod)} className="btn-table-action edit" title="Edit Product">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDeleteProduct(prod.id)} className="btn-table-action delete" title="Delete Product">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FULFILLMENT ORDERS */}
      {activeTab === 'orders' && (
        <div className="admin-orders-view card">
          <h2>System Orders Management</h2>
          
          {loading ? (
            <div className="skeleton-list py-8">
              <div className="skeleton-item"></div>
            </div>
          ) : orders.length === 0 ? (
            <p className="py-8 text-center">No customer orders found in the database.</p>
          ) : (
            <div className="admin-orders-list">
              {orders.map((order) => {
                const isExpanded = !!expandedOrders[order.id];

                return (
                  <div key={order.id} className="order-row-card admin card">
                    <div className="order-row-header" onClick={() => toggleExpandOrder(order.id)}>
                      <div className="order-main-meta">
                        <h3>#ORD-{order.id.toString().padStart(6, '0')}</h3>
                        <span className="order-customer-info">
                          {order.user?.name} ({order.user?.email})
                        </span>
                      </div>
                      
                      <div className="order-status-price-meta">
                        {/* Status update selector */}
                        <div className="status-update-wrapper" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="admin-status-select"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </div>
                        <strong className="order-row-price">${order.totalAmount.toFixed(2)}</strong>
                        <button className="btn-expand-order">
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="order-expanded-details">
                        <div className="expanded-shipping">
                          <p><strong>Fulfillment Address: </strong>{order.shippingAddress}</p>
                          <p className="mt-1"><strong>Phone Number: </strong>{order.contactPhone}</p>
                          <p className="mt-1"><strong>Date Placed: </strong>{new Date(order.createdAt).toLocaleString()}</p>
                          <p className="mt-1">
                            <strong>Invoice Payment Status: </strong>
                            <span className="payment-status-label">{order.paymentStatus}</span>
                          </p>
                        </div>

                        <div className="expanded-items-grid">
                          {order.items.map((item) => (
                            <div key={item.id} className="expanded-item-row">
                              <img src={item.product?.imageUrl} alt={item.product?.name} className="expanded-item-img" />
                              <div className="expanded-item-info">
                                <h4>{item.product?.name}</h4>
                                <p>Quantity: {item.quantity} | Unit Cost: ${item.priceAtPurchase.toFixed(2)}</p>
                              </div>
                              <span className="expanded-item-price">
                                ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USER DIRECTORY */}
      {activeTab === 'users' && (
        <div className="admin-users-view card">
          <h2>User Accounts Registry</h2>

          {loading ? (
            <div className="skeleton-list py-8">
              <div className="skeleton-item"></div>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Security Role</th>
                    <th>Status Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelf = u.id === currentUser.id;
                    return (
                      <tr key={u.id}>
                        <td>
                          <strong>{u.name}</strong>
                          {isSelf && <span className="admin-self-badge">(You)</span>}
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`role-badge ${u.role === 'ADMIN' ? 'admin' : 'user'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <button
                            disabled={isSelf}
                            onClick={() => handleToggleUserRole(u)}
                            className={`btn-table-toggle-role ${isSelf ? 'disabled' : ''}`}
                            title={isSelf ? 'Cannot toggle your own access level' : `Change role to ${u.role === 'ADMIN' ? 'USER' : 'ADMIN'}`}
                          >
                            {u.role === 'ADMIN' ? 'Revoke Admin' : 'Grant Admin'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;
