const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: {
      type: String,
      default: 'Anonymous'
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      trim: true,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: [true, 'Product ID is required'],
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Product Name is required'],
      trim: true,
      alias: 'productName'
    },
    price: {
      type: Number,
      required: [true, 'Product Price is required'],
      min: [0, 'Price must be a positive number'],
      alias: 'productPrice'
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    availableQuantity: {
      type: Number,
      required: [true, 'Available Quantity is required'],
      min: [0, 'Available quantity cannot be negative'],
      default: 0
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
      alias: 'productImageUrl'
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot exceed 5'],
      alias: 'productRating'
    },
    reviews: {
      type: [reviewSchema],
      default: [],
      alias: 'productReviews'
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.productName = ret.name;
        ret.productPrice = ret.price;
        ret.productImageUrl = ret.imageUrl;
        ret.productRating = ret.rating;
        ret.productReviews = ret.reviews;
        ret.inStock = ret.availableQuantity > 0;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      virtuals: true
    }
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
