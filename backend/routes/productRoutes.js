const express = require('express');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, minRating, sort } = req.query;

    const filter = {};

    if (category && category !== 'All') {
      filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { productId: searchRegex }
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined && !isNaN(Number(minPrice))) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    if (minRating !== undefined && !isNaN(Number(minRating))) {
      filter.rating = { $gte: Number(minRating) };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc' || sort === 'low_to_high' || sort === 'price-asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price_desc' || sort === 'high_to_low' || sort === 'price-desc') {
      sortOption = { price: -1 };
    } else if (sort === 'rating_desc' || sort === 'rating') {
      sortOption = { rating: -1 };
    }

    const products = await Product.find(filter).sort(sortOption);

    if (products.length === 0) {
      res.setHeader('X-Message', 'No products available');
    }

    return res.status(200).json(products);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    let product = await Product.findOne({ productId: id });

    if (!product && id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    }

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
