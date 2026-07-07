import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, subtotal, tax, total } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="cart-page empty-cart-view container py-8">
        <div className="empty-cart-card card text-center">
          <ShoppingBag size={64} className="empty-cart-icon" />
          <h1>Your Cart is Empty</h1>
          <p>It looks like you haven't added any products to your cart yet.</p>
          <Link to="/" className="btn-primary mt-6">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page container py-8">
      <h1 className="page-title">Shopping Cart</h1>

      <div className="cart-layout">
        {/* Cart items list */}
        <div className="cart-items-section">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item-row card">
              <div className="cart-item-image-wrapper">
                <img src={item.imageUrl} alt={item.name} className="cart-item-image" />
              </div>

              <div className="cart-item-details">
                <span className="cart-item-category">{item.category?.name || 'Catalog'}</span>
                <Link to={`/product/${item.id}`} className="cart-item-title-link">
                  <h3>{item.name}</h3>
                </Link>
                <p className="cart-item-unit-price">${item.price.toFixed(2)} each</p>
              </div>

              <div className="cart-item-quantity-actions">
                <div className="quantity-picker">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="quantity-picker-btn"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="quantity-picker-value">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="quantity-picker-btn"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {item.quantity >= item.stock && (
                  <span className="stock-limit-warning">Max Stock reached</span>
                )}
              </div>

              <div className="cart-item-price-actions">
                <span className="cart-item-subtotal-price">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="btn-remove-item"
                  title="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Summary panel */}
        <aside className="cart-summary-section">
          <div className="cart-summary-card card">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Estimated Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span className="free-shipping">FREE</span>
            </div>

            <div className="divider"></div>

            <div className="summary-row total-row">
              <span>Order Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary btn-large btn-checkout w-full mt-6"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <Link to="/" className="btn-secondary w-full text-center mt-3">
              Continue Shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};
export default Cart;
