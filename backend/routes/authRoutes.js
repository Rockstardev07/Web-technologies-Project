const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.post('/users', async (req, res, next) => {
  try {
    const { username, age, password } = req.body;
    const emailInput = req.body.emailId || req.body.email;

    if (!username || !emailInput || age === undefined || age === null || !password) {
      return res.status(400).json({
        message: 'All fields (username, email ID, age, and password) are required.'
      });
    }

    const trimmedUsername = String(username).trim();
    if (trimmedUsername.length < 2) {
      return res.status(400).json({
        message: 'Username must be at least 2 characters long.'
      });
    }

    const normalizedEmail = String(emailInput).trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: 'Please provide a valid email ID.'
      });
    }

    const parsedAge = Number(age);
    if (isNaN(parsedAge) || parsedAge <= 0) {
      return res.status(400).json({
        message: 'Age must be a valid positive number.'
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long.'
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        message: 'Email ID is already registered.'
      });
    }

    const newUser = new User({
      username: trimmedUsername,
      email: normalizedEmail,
      age: parsedAge,
      password: String(password)
    });

    await newUser.save();

    return res.status(201).json({
      message: `Registration successful! Welcome, ${newUser.username}.`,
      user: {
        _id: newUser._id,
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        emailId: newUser.email,
        age: newUser.age
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Email ID is already registered.'
      });
    }
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { password } = req.body;
    const emailInput = req.body.emailId || req.body.email;

    if (!emailInput || !password) {
      return res.status(400).json({
        message: 'Email ID and password are required.'
      });
    }

    const normalizedEmail = String(emailInput).trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        message: 'User Not Registered'
      });
    }

    if (user.password !== String(password)) {
      return res.status(401).json({
        message: 'Invalid Password'
      });
    }

    return res.status(200).json({
      message: `Welcome back, ${user.username}! Login successful.`,
      user: {
        _id: user._id,
        id: user._id,
        username: user.username,
        email: user.email,
        emailId: user.email,
        age: user.age
      },
      token: user._id.toString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
