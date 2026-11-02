import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Products from "./pages/Products";

// Protected Route Component: Restricts access to authenticated users
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Placeholders for Member 2's components during development
const CartPlaceholder = () => (
  <div style={{ textAlign: "center", padding: "60px 20px" }}>
    <h2>Shopping Cart</h2>
    <p>Shopping Cart module assigned to Member 2.</p>
  </div>
);

const ProfilePlaceholder = () => (
  <div style={{ textAlign: "center", padding: "60px 20px" }}>
    <h2>User Profile</h2>
    <p>Profile module assigned to Member 2.</p>
  </div>
);

const OrdersPlaceholder = () => (
  <div style={{ textAlign: "center", padding: "60px 20px" }}>
    <h2>Order History</h2>
    <p>Order History module assigned to Member 2.</p>
  </div>
);

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

        {/* Member 2 Integration Routes */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPlaceholder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePlaceholder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPlaceholder />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </Router>
  );
}