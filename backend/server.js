const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const { seedProducts } = require('./seed');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopping_app';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'Online',
    message: 'Shopping Application Backend API is running.',
    version: '1.0.0'
  });
});

app.use('/api', authRoutes);
app.use('/api/products', productRoutes);

const userRoutesPath = path.join(__dirname, 'routes', 'userRoutes.js');
if (fs.existsSync(userRoutesPath)) {
  app.use('/api', require(userRoutesPath));
}

const orderRoutesPath = path.join(__dirname, 'routes', 'orderRoutes.js');
if (fs.existsSync(orderRoutesPath)) {
  app.use('/api/orders', require(orderRoutesPath));
}

const reviewRoutesPath = path.join(__dirname, 'routes', 'reviewRoutes.js');
if (fs.existsSync(reviewRoutesPath)) {
  app.use('/api', require(reviewRoutesPath));
}

app.use((req, res) => {
  res.status(404).json({
    message: `Cannot ${req.method} ${req.originalUrl}. Route not found.`
  });
});

app.use((err, req, res, next) => {
  console.error('API Error:', err);

  if (err.name === 'ValidationError') {
    const errorMessages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      message: errorMessages.join(', ')
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(400).json({
      message: `${field === 'email' ? 'Email ID' : field} is already registered.`
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      message: `Invalid ID format: ${err.value}`
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      message: 'Invalid JSON payload provided.'
    });
  }

  return res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

const startServer = async () => {
  try {
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully.');

    await seedProducts();

    app.listen(PORT, () => {
      console.log(`Backend server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.log('Please ensure MongoDB is running and MONGODB_URI in .env is correct.');
    app.listen(PORT, () => {
      console.log(`Backend server is running on http://localhost:${PORT} (without active DB connection)`);
    });
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
