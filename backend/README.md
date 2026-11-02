# Backend - Shopping Application

Welcome to the backend service for the Shopping Application. This service is built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)**.

---

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection string

---

## Setup & Getting Started

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
     *(On Windows PowerShell: `Copy-Item .env.example .env`)*
   - Open `.env` and verify the values:
     ```env
     PORT=5000
     MONGODB_URI=mongodb://127.0.0.1:27017/shopping_app
     ```

4. **Seed the database with sample products:**
   ```bash
   npm run seed
   ```
   *(Note: The server will also automatically seed sample products on first startup if the products collection is empty.)*

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   Or start the production server:
   ```bash
   npm start
   ```

---

## Architecture & Conventions

### Authentication Note
- Per project requirements, **JWT and bcrypt are NOT used**.
- Passwords are stored in plain text.
- The authentication middleware (`middleware/authMiddleware.js`) validates requests using:
  - `Authorization: Bearer <userId>` or `Authorization: <userId/email>`
  - Custom headers: `x-user-id`, `x-user-email`
  - Query parameters: `?userId=...`, `?emailId=...`
- When authenticated, `req.user` (User document without password) and `req.userId` (User ObjectId) are attached to the request.

---

## Current Implementation (Member 3 - Completed)

### 1. Models
- **`models/User.js`**:
  - `username` (String, required)
  - `email` (String, required, unique, lowercase, alias `emailId`)
  - `age` (Number, required, positive)
  - `password` (String, required, minlength 6)
  - Method: `comparePassword(candidatePassword)`
- **`models/Product.js`**:
  - `productId` (String, required, unique, e.g., `"PROD001"`)
  - `name` (String, required, alias `productName`)
  - `price` (Number, required, alias `productPrice`)
  - `category` (String, required)
  - `availableQuantity` (Number, required, default 0)
  - `description` (String, required)
  - `imageUrl` (String, alias `productImageUrl`)
  - `rating` (Number, default 0, alias `productRating`)
  - `reviews` (Array of review objects: `{ userId, username, rating, comment, createdAt }`)
  - Virtual / toJSON: `inStock` boolean (`availableQuantity > 0`)

### 2. Implemented Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/users` | Public | Register new user. Validates inputs & duplicate emails. |
| POST | `/api/login` | Public | Login user. Returns 404 `"User Not Registered"` if email unknown, 401 `"Invalid Password"` if password wrong. |
| GET | `/api/products` | Protected | Fetch all products. Supports `?category=`, `?search=`, `?minPrice=`, `?maxPrice=`, `?sort=`. |
| GET | `/api/products/:id` | Protected | Fetch a single product by `productId` or MongoDB `_id`. |

---

## Next Steps for Member 4 (Profile, Cart & Orders)

You do **not** need to modify `server.js`! It is already configured to automatically load your route files as soon as they exist in `backend/routes/`.

### 1. Create `models/Order.js`
Schema requirements:
- `orderId`: String / Number, unique
- `userId`: ObjectId referencing `User`
- `products`: Array of items containing product references, product name, quantity, price
- `totalAmount`: Number
- `orderDate`: Date (default: `Date.now`)
- `orderStatus`: String (e.g. `'Pending'`, `'Completed'`)

### 2. Create `routes/userRoutes.js`
Mounts automatically at `/api`:
- **`PUT /api/users?emailId=user@email.com`**: Update full profile details (username, age).
- **`PATCH /api/users?emailId=user@email.com`**: Update selected profile fields.
- **`DELETE /api/users?emailId=user@email.com`**: Delete registered user account.
- *Use `authMiddleware` to protect these operations and verify the user modifies their own account.*

### 3. Create `routes/orderRoutes.js`
Mounts automatically at `/api/orders`:
- **`POST /api/orders`**:
  - Validate product availability and quantity against `Product.availableQuantity`.
  - Calculate total amount on the backend.
  - Decrement stock in `Product` collection.
  - Save order and return confirmation details.
- **`GET /api/orders`**:
  - Retrieve orders for the authenticated user (`req.userId`).

### 4. Create `routes/reviewRoutes.js`
Mounts automatically at `/api`:
- **`POST /api/products/:id/reviews`**: Add a rating & review to the product. Recalculate average rating on `Product`.
- **`GET /api/products/:id/reviews`**: Get all reviews for a product.

### 5. Using the Authentication Middleware
Import it in your routes:
```javascript
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); // Protect all routes in the file
// or
router.post('/orders', authMiddleware, async (req, res) => {
  const currentUserId = req.userId;
  // your order logic here
});
```
