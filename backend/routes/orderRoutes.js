const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', async (req, res) => {
  try {
    const items = req.body.products || req.body.items || [];

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty. Please add items to place order.' });
    }

    let calculatedTotal = 0;
    const itemsToOrder = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const pId = item.productId || item.id;
      const qty = Number(item.quantity) || 1;

      const product = await Product.findOne({ productId: pId });
      if (!product) {
        return res.status(404).json({ message: `Product ${pId} not found.` });
      }

      if (product.availableQuantity < qty) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}". Available: ${product.availableQuantity}, Requested: ${qty}`
        });
      }

      calculatedTotal += product.price * qty;

      itemsToOrder.push({
        productDoc: product,
        productId: product.productId,
        productName: product.name,
        price: product.price,
        quantity: qty
      });
    }

    for (let i = 0; i < itemsToOrder.length; i++) {
      const item = itemsToOrder[i];
      item.productDoc.availableQuantity = item.productDoc.availableQuantity - item.quantity;
      await item.productDoc.save();
    }

    const orderId = 'ORD' + Date.now();

    const newOrder = new Order({
      orderId: orderId,
      userId: req.user._id,
      userEmail: req.user.email,
      products: itemsToOrder.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity
      })),
      totalAmount: Number(calculatedTotal.toFixed(2)),
      orderDate: new Date(),
      orderStatus: 'Completed'
    });

    await newOrder.save();

    return res.status(201).json({
      message: 'Order placed successfully!',
      orderId: newOrder.orderId,
      order: newOrder
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ orderDate: -1 });

    return res.status(200).json({
      message: 'Orders retrieved successfully',
      count: orders.length,
      orders: orders
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied to this order' });
    }

    return res.status(200).json({
      message: 'Order details retrieved successfully',
      order: order
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
