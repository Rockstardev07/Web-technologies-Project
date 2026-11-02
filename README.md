
# Shopping Application

A full-stack shopping application developed using **React.js, Node.js, Express.js, and MongoDB**. It provides user authentication, product browsing, shopping cart management, product reviews, and order management.

## Features

- **User Authentication:** User registration, login, password hashing, and JWT-based authentication.
- **Product Display:** View products with details, images, prices, categories, and stock availability.
- **Shopping Cart:** Add, remove, and update product quantities with automatic total calculation.
- **Search & Filters:** Search products by name and filter by category, rating, and price.
- **Product Reviews:** View and submit product ratings and reviews.
- **User Profile:** View, update, and delete user profile information.
- **Order Management:** Place orders and view previous order history.
- **Stock Management:** Validate product availability and update stock after successful orders.

## Tech Stack

- **Frontend:** React.js, Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT, bcrypt
- **Tools:** Git, GitHub, Thunder Client

## Project Structure

```text
ShoppingApp/
│
├── frontend/
│
├── backend/
│
├── .gitignore
└── README.md
```

## Team Members

| Name | Role |
|---|---|
| Sunil R | Backend Developer – Core Backend |
| Prasanth M | Backend Developer – Profile, Cart & Orders |
| Tarun S | Frontend Developer – Basic Pages |
| Pratyussh T | Frontend Developer – Shopping Features |

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB
- Git

### Setup

Clone the repository:

```bash
git clone <repository-url>
cd ShoppingApp
```

Install and start the backend:

```bash
cd backend
npm install
npm run dev
```

Install and start the frontend in a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Configure the required environment variables in `.env` files before running the application.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users` | Register user |
| POST | `/api/login` | User login |
| GET | `/api/products` | Retrieve products |
| PUT | `/api/users?emailId=...` | Update complete profile |
| PATCH | `/api/users?emailId=...` | Update selected profile fields |
| DELETE | `/api/users?emailId=...` | Delete user account |
| POST | `/api/orders` | Place an order |
| GET | `/api/orders` | Retrieve order history |
| POST | `/api/products/:id/reviews` | Submit product review |
| GET | `/api/products/:id/reviews` | Retrieve product reviews |

## Development

The project is developed collaboratively by four team members, with separate responsibilities for frontend and backend development.

Individual features are integrated and tested to ensure the complete application works as expected.
