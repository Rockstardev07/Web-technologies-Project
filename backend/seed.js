const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const sampleProducts = [
  {
    productId: 'PROD001',
    name: 'Wireless Noise-Canceling Headphones',
    price: 129.99,
    category: 'Electronics',
    availableQuantity: 35,
    description: 'Premium over-ear wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear sound quality.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
    rating: 4.8,
    reviews: [
      {
        username: 'Alex Carter',
        rating: 5,
        comment: 'Amazing sound quality and battery life. Noise cancellation is top notch!'
      },
      {
        username: 'Sarah Jenkins',
        rating: 4,
        comment: 'Very comfortable for long listening sessions. Highly recommend.'
      }
    ]
  },
  {
    productId: 'PROD002',
    name: 'Smart Fitness Watch',
    price: 79.99,
    category: 'Electronics',
    availableQuantity: 20,
    description: 'Track your steps, heart rate, sleep stages, and workout metrics with a vibrant AMOLED touchscreen and 7-day battery life.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
    rating: 4.4,
    reviews: [
      {
        username: 'David Miller',
        rating: 4,
        comment: 'Great features for the price. Heart rate monitor is very accurate.'
      }
    ]
  },
  {
    productId: 'PROD003',
    name: 'Ergonomic Mechanical Keyboard',
    price: 99.50,
    category: 'Electronics',
    availableQuantity: 15,
    description: 'Customizable RGB mechanical gaming and typing keyboard with tactile switches and durable aluminum frame.',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60',
    rating: 4.7,
    reviews: [
      {
        username: 'Ryan Cooper',
        rating: 5,
        comment: 'Satisfying tactile feedback and beautiful RGB lighting options.'
      }
    ]
  },
  {
    productId: 'PROD004',
    name: 'Portable Bluetooth Speaker',
    price: 49.99,
    category: 'Electronics',
    availableQuantity: 50,
    description: 'Compact IPX7 waterproof Bluetooth speaker delivering deep bass and 360-degree sound for outdoor adventures.',
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=60',
    rating: 4.3,
    reviews: [
      {
        username: 'Emily Watson',
        rating: 4,
        comment: 'Great loud volume for its size and completely waterproof.'
      }
    ]
  },
  {
    productId: 'PROD005',
    name: 'Classic Denim Jacket',
    price: 64.99,
    category: 'Clothing',
    availableQuantity: 25,
    description: 'Timeless denim jacket tailored with premium cotton denim, button-front closure, and practical front chest pockets.',
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=60',
    rating: 4.5,
    reviews: [
      {
        username: 'Michael Brown',
        rating: 5,
        comment: 'Fits true to size and the denim quality is sturdy yet comfortable.'
      }
    ]
  },
  {
    productId: 'PROD006',
    name: 'Organic Cotton Crewneck T-Shirt',
    price: 24.99,
    category: 'Clothing',
    availableQuantity: 60,
    description: 'Breathable, ultra-soft 100% organic cotton everyday essential t-shirt designed for all-day comfort and durability.',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60',
    rating: 4.2,
    reviews: [
      {
        username: 'Jessica Taylor',
        rating: 4,
        comment: 'Soft fabric and washes well without shrinking.'
      }
    ]
  },
  {
    productId: 'PROD007',
    name: 'Performance Running Shoes',
    price: 89.99,
    category: 'Footwear',
    availableQuantity: 18,
    description: 'Lightweight road running shoes with responsive foam cushioning, breathable mesh upper, and high-traction rubber outsole.',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60',
    rating: 4.6,
    reviews: [
      {
        username: 'Brian Clark',
        rating: 5,
        comment: 'Best running shoes I have owned. Super lightweight and cushioned.'
      }
    ]
  },
  {
    productId: 'PROD008',
    name: 'Casual Canvas Sneakers',
    price: 45.00,
    category: 'Footwear',
    availableQuantity: 0,
    description: 'Versatile low-top canvas sneakers with cushioned insole and vulcanized rubber sole for effortless casual style.',
    imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&auto=format&fit=crop&q=60',
    rating: 4.0,
    reviews: [
      {
        username: 'Chloe Bennett',
        rating: 4,
        comment: 'Cute and stylish shoes for everyday walking.'
      }
    ]
  },
  {
    productId: 'PROD009',
    name: 'Minimalist Travel Backpack',
    price: 59.99,
    category: 'Accessories',
    availableQuantity: 30,
    description: 'Water-resistant everyday commuter backpack with dedicated 15.6-inch laptop compartment and hidden anti-theft pocket.',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60',
    rating: 4.6,
    reviews: [
      {
        username: 'Daniel Lee',
        rating: 5,
        comment: 'Spacious, well-organized pockets and looks very sleek.'
      }
    ]
  },
  {
    productId: 'PROD010',
    name: 'Stainless Steel Insulated Water Bottle',
    price: 19.99,
    category: 'Accessories',
    availableQuantity: 45,
    description: 'Double-walled vacuum insulated 750ml flask that keeps drinks ice cold for 24 hours or piping hot for 12 hours.',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60',
    rating: 4.8,
    reviews: [
      {
        username: 'Laura Davis',
        rating: 5,
        comment: 'Keeps water cold all day even during summer heat!'
      }
    ]
  }
];

const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count > 0) {
      console.log(`Products already exist in database (${count} products). Skipping auto-seed.`);
      return;
    }

    await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${sampleProducts.length} sample products into MongoDB.`);
  } catch (error) {
    console.error('Error seeding products:', error.message);
  }
};

const runStandaloneSeed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopping_app';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully.');

    await Product.deleteMany({});
    console.log('Cleared existing products.');

    await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${sampleProducts.length} sample products.`);

    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Seed script failed:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  runStandaloneSeed();
}

module.exports = {
  sampleProducts,
  seedProducts
};
