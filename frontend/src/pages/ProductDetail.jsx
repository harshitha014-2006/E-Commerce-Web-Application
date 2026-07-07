import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ShoppingCart, Loader2, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { API_BASE } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/products/${id}`);
        if (!response.ok) {
          if (response.status === 404) throw new Error('Product not found');
          throw new Error('Failed to load product details');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message || 'Server error loading product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, API_BASE]);

  const handleQuantityChange = (val) => {
    if (!product) return;
    const newQty = quantity + val;
    if (newQty >= 1 && newQty <= product.stock) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
  };

  if (loading) {
    return (
      <div className="loader-container">
        <Loader2 className="spinner" size={48} />
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-8">
        <div className="error-alert-box card">
          <h3>Oops!</h3>
          <p>{error || 'Product could not be loaded.'}</p>
          <Link to="/" className="btn-primary mt-4">
            <ChevronLeft size={18} /> Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="product-detail-page container py-8">
      <button onClick={() => navigate(-1)} className="btn-back">
        <ChevronLeft size={16} /> Back
      </button>

      <div className="product-detail-grid card">
        <div className="product-detail-image-panel">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-detail-image"
          />
        </div>

        <div className="product-detail-info-panel">
          <span className="product-detail-category-badge">
            {product.category?.name || 'Catalog'}
          </span>
          <h1 className="product-detail-title">{product.name}</h1>
          <p className="product-detail-price">${product.price.toFixed(2)}</p>

          <div className="divider"></div>

          <div className="product-detail-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="divider"></div>

          <div className="product-detail-stock-section">
            <div className="stock-info-row">
              <span className="stock-label">Availability:</span>
              {isOutOfStock ? (
                <span className="stock-status out">Out of Stock</span>
              ) : product.stock <= 5 ? (
                <span className="stock-status low">Low Stock (Only {product.stock} left!)</span>
              ) : (
                <span className="stock-status in">In Stock ({product.stock} available)</span>
              )}
            </div>

            {!isOutOfStock && (
              <div className="quantity-selection-wrapper">
                <span className="stock-label">Quantity:</span>
                <div className="quantity-picker">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="quantity-picker-btn"
                  >
                    -
                  </button>
                  <span className="quantity-picker-value">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="quantity-picker-btn"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="product-detail-actions">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`btn-primary btn-large btn-add-detail ${isOutOfStock ? 'disabled' : ''}`}
              >
                <ShoppingCart size={20} />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Shopping Cart'}</span>
              </button>
            </div>
          </div>

          <div className="premium-guarantees">
            <div className="guarantee-item">
              <Info size={16} className="guarantee-icon" />
              <span>Free 30-day returns and exchanges</span>
            </div>
            <div className="guarantee-item">
              <Info size={16} className="guarantee-icon" />
              <span>Full original manufacturer warranty</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProductDetail;
