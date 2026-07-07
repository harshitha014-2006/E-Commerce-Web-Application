import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = (e) => {
    e.preventDefault(); // Stop navigation to detail page
    addToCart(product, 1);
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-card-link">
        <div className="product-card-image-wrapper">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-card-image"
            loading="lazy"
          />
          {isOutOfStock && (
            <div className="stock-badge out-of-stock">
              Out of Stock
            </div>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <div className="stock-badge low-stock">
              Only {product.stock} left!
            </div>
          )}
        </div>

        <div className="product-card-info">
          <span className="product-card-category">{product.category?.name || 'Catalog'}</span>
          <h3 className="product-card-title">{product.name}</h3>
          
          <div className="product-card-footer">
            <span className="product-card-price">${product.price.toFixed(2)}</span>
            <button
              onClick={handleAddToCart}
              className={`btn-add-to-cart ${isOutOfStock ? 'disabled' : ''}`}
              disabled={isOutOfStock}
              title={isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            >
              <ShoppingCart size={18} />
              <span>Add</span>
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};
export default ProductCard;
