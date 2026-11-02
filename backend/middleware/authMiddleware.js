const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader =
      req.header('Authorization') ||
      req.headers['authorization'] ||
      req.headers['x-user-id'] ||
      req.headers['x-user-email'] ||
      req.query.userId ||
      req.query.emailId ||
      req.query.email;

    if (!authHeader) {
      return res.status(401).json({
        message: 'Access denied. Please login to access this resource.'
      });
    }

    const identifier = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : String(authHeader).trim();

    if (!identifier) {
      return res.status(401).json({
        message: 'Access denied. Please login to access this resource.'
      });
    }

    let user = null;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(identifier).select('-password');
    } else if (identifier.includes('@')) {
      user = await User.findOne({ email: identifier.toLowerCase() }).select('-password');
    } else {
      user = await User.findOne({
        $or: [{ username: identifier }, { email: identifier.toLowerCase() }]
      }).select('-password');
    }

    if (!user) {
      return res.status(401).json({
        message: 'Authentication failed. User not found.'
      });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Authentication error. Please login again.'
    });
  }
};

module.exports = authMiddleware;
