import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import OrderHistory from "./pages/OrderHistory";
import ProductDetails from "./pages/ProductDetails";

// Protected Route Component: Restricts access to authenticated users
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/products" replace />} />

        {/* Member 1 Core Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:productId"
          element={
            <ProtectedRoute>
              <ProductDetails />
            </ProtectedRoute>
          }
        />

        {/* Member 2 Integration Routes */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </Router>
  );
}
