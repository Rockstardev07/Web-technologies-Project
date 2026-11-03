const express = require('express');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/products/:id/reviews', authMiddleware, async (req, res) => {
  try {
    const productId = req.params.id;
    const { rating, comment } = req.body;

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    const product = await Product.findOne({ productId: productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const newReview = {
      userId: req.user._id,
      username: req.user.username || 'Anonymous',
      rating: Number(rating),
      comment: comment ? String(comment).trim() : '',
      createdAt: new Date()
    };

    product.reviews.push(newReview);

    let totalScore = 0;
    for (let i = 0; i < product.reviews.length; i++) {
      totalScore += product.reviews[i].rating;
    }
    product.rating = Number((totalScore / product.reviews.length).toFixed(1));

    await product.save();

    return res.status(201).json({
      message: 'Review submitted successfully',
      averageRating: product.rating,
      totalReviews: product.reviews.length,
      review: newReview
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/products/:id/reviews', async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findOne({ productId: productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({
      productId: product.productId,
      productName: product.name,
      averageRating: product.rating,
      totalReviews: product.reviews.length,
      reviews: product.reviews
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
