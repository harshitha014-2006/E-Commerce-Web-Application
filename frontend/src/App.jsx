import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { ProductCatalog } from './pages/ProductCatalog';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { UserProfile } from './pages/UserProfile';
import { AdminDashboard } from './pages/AdminDashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

export const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app-root-layout">
            <Navbar />
            
            <main className="app-main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<ProductCatalog />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* User Protected Routes */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order-confirmation"
                  element={
                    <ProtectedRoute>
                      <OrderConfirmation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all redirects to Home */}
                <Route path="*" element={<ProductCatalog />} />
              </Routes>
            </main>

            <footer className="app-footer">
              <div className="container footer-grid">
                <div className="footer-brand">
                  <h3>AeroShop</h3>
                  <p>Elevated shopping experiences with high-fidelity components and seamless navigation.</p>
                </div>
                <div className="footer-links-col">
                  <h4>Customer Service</h4>
                  <ul>
                    <li><a href="#returns">Returns Policy</a></li>
                    <li><a href="#shipping">Shipping & Fares</a></li>
                    <li><a href="#support">Support Center</a></li>
                  </ul>
                </div>
                <div className="footer-links-col">
                  <h4>Developer Sandbox</h4>
                  <p>Full-Stack Express + SQLite + React application demonstrating security and transaction flows.</p>
                </div>
              </div>
              <div className="footer-bottom text-center">
                <p>&copy; {new Date().getFullYear()} AeroShop. Built for premiumPair-Programming. All rights reserved.</p>
              </div>
            </footer>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};
export default App;
