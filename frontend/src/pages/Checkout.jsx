import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Truck, Receipt, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Checkout = () => {
  const { token, API_BASE } = useAuth();
  const { cartItems, subtotal, tax, total, clearCart } = useCart();
  const navigate = useNavigate();

  // Multi-step state: 1 = Shipping, 2 = Payment, 3 = Processing
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [shipping, setShipping] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
  });

  const [payment, setPayment] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });

  const handleShippingChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e) => {
    setPayment({ ...payment, [e.target.name]: e.target.value });
  };

  const validateShipping = () => {
    const { street, city, state, zip, phone } = shipping;
    return street.trim() && city.trim() && state.trim() && zip.trim() && phone.trim();
  };

  const validatePayment = () => {
    const { cardNumber, cardName, expiry, cvv } = payment;
    // Simple mock validations
    return (
      cardNumber.replace(/\s/g, '').length >= 16 &&
      cardName.trim() &&
      expiry.includes('/') &&
      cvv.length >= 3
    );
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!validateShipping()) {
        setError('Please fill in all shipping fields');
        return;
      }
      setError(null);
      setStep(2);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validatePayment()) {
      setError('Please enter valid mock payment details');
      return;
    }

    setError(null);
    setLoading(true);

    const fullAddress = `${shipping.street}, ${shipping.city}, ${shipping.state} ${shipping.zip}`;
    const orderItems = cartItems.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    }));

    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress: fullAddress,
          contactPhone: shipping.phone,
          items: orderItems,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      // Success
      clearCart();
      // Navigate to order-confirmation page passing order details
      navigate('/order-confirmation', { state: { order: data.order } });
    } catch (err) {
      setError(err.message || 'An error occurred during order checkout.');
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container py-8 text-center">
        <div className="card max-w-md mx-auto py-8">
          <h2>No items to checkout</h2>
          <p>Your cart is currently empty.</p>
          <Link to="/" className="btn-primary mt-4">
            Shop Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page container py-8">
      <h1 className="page-title text-center">Secure Checkout</h1>

      {/* Progress Timeline */}
      <div className="checkout-timeline">
        <div className={`timeline-step ${step >= 1 ? 'active' : ''}`}>
          <div className="step-circle"><Truck size={18} /></div>
          <span>Shipping</span>
        </div>
        <div className="timeline-connector"></div>
        <div className={`timeline-step ${step >= 2 ? 'active' : ''}`}>
          <div className="step-circle"><CreditCard size={18} /></div>
          <span>Payment</span>
        </div>
        <div className="timeline-connector"></div>
        <div className={`timeline-step ${step === 3 ? 'active' : ''}`}>
          <div className="step-circle"><Receipt size={18} /></div>
          <span>Order Confirmation</span>
        </div>
      </div>

      <div className="checkout-layout">
        {/* Step Forms */}
        <div className="checkout-forms-section">
          {error && <div className="error-alert-box card mb-4">{error}</div>}

          {step === 1 && (
            <form onSubmit={handleNextStep} className="checkout-form card">
              <h2>Shipping Information</h2>
              <div className="form-group">
                <label htmlFor="street">Street Address</label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  required
                  placeholder="123 Luxury Avenue"
                  value={shipping.street}
                  onChange={handleShippingChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group col">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    placeholder="New York"
                    value={shipping.city}
                    onChange={handleShippingChange}
                  />
                </div>
                <div className="form-group col">
                  <label htmlFor="state">State / Province</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    required
                    placeholder="NY"
                    value={shipping.state}
                    onChange={handleShippingChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col">
                  <label htmlFor="zip">ZIP / Postal Code</label>
                  <input
                    type="text"
                    id="zip"
                    name="zip"
                    required
                    placeholder="10001"
                    value={shipping.zip}
                    onChange={handleShippingChange}
                  />
                </div>
                <div className="form-group col">
                  <label htmlFor="phone">Contact Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    placeholder="+1 (555) 019-2834"
                    value={shipping.phone}
                    onChange={handleShippingChange}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full btn-large mt-6">
                <span>Continue to Payment</span>
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handlePlaceOrder} className="checkout-form card">
              <div className="form-header-back">
                <button type="button" onClick={() => setStep(1)} className="btn-text-back">
                  <ArrowLeft size={16} /> Back to Shipping
                </button>
                <h2>Mock Payment Gateway</h2>
              </div>

              <div className="mock-payment-banner">
                <span>💡 This is a development mode sandbox. Enter any mock card values.</span>
              </div>

              <div className="form-group">
                <label htmlFor="cardName">Cardholder Name</label>
                <input
                  type="text"
                  id="cardName"
                  name="cardName"
                  required
                  placeholder="John Doe"
                  value={payment.cardName}
                  onChange={handlePaymentChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="cardNumber">Credit Card Number</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  required
                  maxLength="19"
                  placeholder="4111 2222 3333 4444"
                  value={payment.cardNumber}
                  onChange={handlePaymentChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group col">
                  <label htmlFor="expiry">Expiration Date</label>
                  <input
                    type="text"
                    id="expiry"
                    name="expiry"
                    required
                    maxLength="5"
                    placeholder="MM/YY"
                    value={payment.expiry}
                    onChange={handlePaymentChange}
                  />
                </div>
                <div className="form-group col">
                  <label htmlFor="cvv">CVV</label>
                  <input
                    type="password"
                    id="cvv"
                    name="cvv"
                    required
                    maxLength="4"
                    placeholder="123"
                    value={payment.cvv}
                    onChange={handlePaymentChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`btn-primary w-full btn-large btn-pay mt-6 ${loading ? 'disabled' : ''}`}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spinner" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <span>Pay & Place Order (${total.toFixed(2)})</span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Order review column */}
        <aside className="checkout-review-section">
          <div className="checkout-review-card card">
            <h2>Order Review</h2>
            <div className="checkout-items-list">
              {cartItems.map((item) => (
                <div key={item.id} className="checkout-item-preview">
                  <img src={item.imageUrl} alt={item.name} className="checkout-item-img" />
                  <div className="checkout-item-desc">
                    <h4>{item.name}</h4>
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <span className="checkout-item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="divider"></div>

            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="free-shipping">FREE</span>
              </div>
              <div className="divider"></div>
              <div className="summary-row total-row">
                <span>Total Amount</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
export default Checkout;
