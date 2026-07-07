import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, RefreshCw, XCircle } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';

export const ProductCatalog = () => {
  const { API_BASE } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filtering state derived from URL
  const params = new URLSearchParams(location.search);
  const currentPage = parseInt(params.get('page')) || 1;
  const currentCategory = params.get('category') || '';
  const currentSearch = params.get('search') || '';
  const currentSort = params.get('sort') || 'newest';

  const [totalPages, setTotalPages] = useState(1);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE}/categories`);
        if (!response.ok) throw new Error('Failed to load categories');
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error(err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, [API_BASE]);

  // Fetch products when URL parameters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: '8',
          search: currentSearch,
          category: currentCategory,
          sort: currentSort,
        });

        const response = await fetch(`${API_BASE}/products?${queryParams.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const data = await response.json();
        setProducts(data.products);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError(err.message || 'Something went wrong while loading products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [location.search, API_BASE, currentPage, currentCategory, currentSearch, currentSort]);

  // Helper to push new search params
  const updateParams = (newParams) => {
    const nextParams = new URLSearchParams(location.search);
    // Reset page to 1 for filters
    if (!newParams.page) nextParams.set('page', '1');

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    });

    navigate(`/?${nextParams.toString()}`);
  };

  const handleCategorySelect = (id) => {
    updateParams({ category: id === currentCategory ? '' : id });
  };

  const handleSortSelect = (e) => {
    updateParams({ sort: e.target.value });
  };

  const handleClearFilters = () => {
    navigate('/');
  };

  return (
    <div className="catalog-page-container container">
      {/* Search status notification */}
      {currentSearch && (
        <div className="search-status-bar">
          <p>
            Showing results for "<strong>{currentSearch}</strong>"
          </p>
          <button onClick={() => updateParams({ search: '' })} className="btn-clear-search">
            Clear search <XCircle size={14} />
          </button>
        </div>
      )}

      <div className="catalog-layout">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar card">
          <div className="sidebar-header">
            <SlidersHorizontal size={18} />
            <h2>Filters</h2>
          </div>

          <div className="filter-group">
            <h3>Categories</h3>
            {categoriesLoading ? (
              <div className="skeleton-list">
                <div className="skeleton-item"></div>
                <div className="skeleton-item"></div>
                <div className="skeleton-item"></div>
              </div>
            ) : (
              <ul className="category-list">
                <li>
                  <button
                    onClick={() => updateParams({ category: '' })}
                    className={`category-item-btn ${!currentCategory ? 'active' : ''}`}
                  >
                    All Categories
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => handleCategorySelect(cat.id.toString())}
                      className={`category-item-btn ${currentCategory === cat.id.toString() ? 'active' : ''}`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="filter-group">
            <h3>Sorting</h3>
            <div className="select-wrapper">
              <ArrowUpDown size={16} className="select-icon" />
              <select value={currentSort} onChange={handleSortSelect} className="filter-select">
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {(currentCategory || currentSearch || currentSort !== 'newest') && (
            <button onClick={handleClearFilters} className="btn-secondary w-full btn-clear-filters">
              Reset All Filters
            </button>
          )}
        </aside>

        {/* Catalog Grid */}
        <main className="catalog-main-content">
          {loading ? (
            <div className="catalog-loading-grid">
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="skeleton-card">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-title"></div>
                  <div className="skeleton-price"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="error-alert-box card">
              <p>{error}</p>
              <button onClick={() => updateParams({})} className="btn-primary">
                Retry <RefreshCw size={16} />
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-catalog-container card">
              <XCircle size={48} className="empty-icon" />
              <h2>No products found</h2>
              <p>We couldn't find any products matching your selection.</p>
              <button onClick={handleClearFilters} className="btn-primary">
                Back to Shop
              </button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination-controls">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => updateParams({ page: (currentPage - 1).toString() })}
                    className="btn-pagination"
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => updateParams({ page: (currentPage + 1).toString() })}
                    className="btn-pagination"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
export default ProductCatalog;
