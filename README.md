# Kaadugal.in — Shopping Application

A full-stack e-commerce shopping application developed using the **MERN** stack (**MongoDB, Express.js, React.js, Node.js**) with **Vite**. The application provides end-to-end e-commerce capabilities including user authentication, real-time product browsing and filtering, product reviews, cart management with stock guard rails, order checkout, and user profile management.

---

## 🛠️ Tech Stack

- **Frontend**: React.js 18, Vite, React Router DOM 6, Axios, Pure CSS3
- **Backend**: Node.js, Express.js 5
- **Database**: MongoDB, Mongoose 9 ODM
- **Tools**: Git, GitHub, Thunder Client / Postman

---

## ✨ Features

- **User Authentication**: User registration and login with input validation and session token persistence in `localStorage`.
- **Product Catalog & Details**: Browse products with pricing, categories, high-resolution images, descriptions, and real-time stock availability.
- **Dynamic Search & Filtering**: Client-side reactive multi-attribute filtering by product name, category, price range, and star rating.
- **Product Reviews & Ratings**: Submit customer reviews and star ratings with dynamic recalculation of average product rating.
- **Shopping Cart**: Add items, adjust quantities, remove items, and calculate order totals with automatic stock limits.
- **Order Management**: Checkout validation against real-time database stock, automatic inventory decrements, and historical order tracking.
- **User Profile Management**: View profile details, update profile information using RESTful `PUT` and `PATCH` methods, and delete user accounts.

---

## 👥 Team Members & Roles

| Team Member | Role | Key Contributions |
|---|---|---|
| **Sunil R** | Backend Developer – Core Backend | Schemas (`User`, `Product`), database connection, seeding script (`seed.js`), authentication endpoints (`/api/users`, `/api/login`), product inventory APIs, and centralized error handling middleware. |
| **Prasanth M** | Backend Developer – Profile, Cart & Orders | Profile management APIs (`PUT`, `PATCH`, `DELETE /api/users`), Order schema & checkout endpoints (`POST`, `GET /api/orders`), stock decrement logic, and Product Review APIs. |
| **Tarun S** | Frontend Developer – Core UI & Auth | Registration and Login forms (`Register.jsx`, `Login.jsx`), Navigation Header (`Navbar.jsx`), Protected Route guards (`ProtectedRoute`), and user session handling. |
| **Pratyussh T** | Frontend Developer – Shopping Features | Catalog browsing with live filters (`Products.jsx`, `SearchFilter.jsx`), Product detail view (`ProductDetails.jsx`), Cart context & checkout (`CartContext.jsx`, `Cart.jsx`), Order history (`OrderHistory.jsx`), and Profile UI (`Profile.jsx`). |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed     # Populate database with sample products
npm run dev      # Server starts on http://localhost:5000
```

### 2. Frontend Setup
In a separate terminal:
```bash
cd frontend
npm install
npm run dev      # Application runs on http://localhost:5173
```

