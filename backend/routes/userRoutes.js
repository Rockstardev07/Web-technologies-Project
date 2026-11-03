const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/users', async (req, res) => {
  try {
    const email = req.query.emailId || req.query.email || req.user.email;

    if (req.user.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({ message: 'You can only view your own account' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'User profile fetched successfully',
      user: user
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put('/users', async (req, res) => {
  try {
    const email = req.query.emailId || req.query.email;

    if (!email) {
      return res.status(400).json({ message: 'Email ID query parameter is required' });
    }

    if (req.user.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({ message: 'You can only update your own account' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { username, age, password } = req.body;
    if (!username || age === undefined) {
      return res.status(400).json({ message: 'Username and age are required for complete update' });
    }

    user.username = username;
    user.age = Number(age);
    if (password) {
      user.password = password;
    }

    await user.save();

    return res.status(200).json({
      message: 'User profile updated successfully using PUT',
      user: user
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.patch('/users', async (req, res) => {
  try {
    const email = req.query.emailId || req.query.email;

    if (!email) {
      return res.status(400).json({ message: 'Email ID query parameter is required' });
    }

    if (req.user.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({ message: 'You can only update your own account' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { username, age, password } = req.body;

    if (username !== undefined) {
      user.username = username;
    }
    if (age !== undefined) {
      user.age = Number(age);
    }
    if (password !== undefined) {
      user.password = password;
    }

    await user.save();

    return res.status(200).json({
      message: 'User profile updated successfully using PATCH',
      user: user
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete('/users', async (req, res) => {
  try {
    const email = req.query.emailId || req.query.email;

    if (!email) {
      return res.status(400).json({ message: 'Email ID query parameter is required' });
    }

    if (req.user.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({ message: 'You can only delete your own account' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.deleteOne({ email: email.toLowerCase() });

    return res.status(200).json({
      message: `User with email ${email} deleted successfully`
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
