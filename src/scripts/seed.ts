import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load env at the very top
dotenv.config({ path: '.env.local' });

const products = [
  {
    name: 'Smartphone X',
    description: 'A powerful smartphone with a great camera and long battery life.',
    price: 799.99,
    images: ['/images/smartphone-x-1.jpg', '/images/smartphone-x-2.jpg'],
    category: 'Electronics',
    stock: 50,
    ratings: 4.5,
    reviews: [],
  },
  {
    name: 'Laptop Pro',
    description: 'High-performance laptop for professionals and gamers.',
    price: 1299.99,
    images: ['/images/laptop-pro-1.jpg', '/images/laptop-pro-2.jpg'],
    category: 'Electronics',
    stock: 30,
    ratings: 4.8,
    reviews: [],
  },
  {
    name: 'Wireless Headphones',
    description: 'Immersive sound experience with noise-cancelling technology.',
    price: 199.99,
    images: ['/images/headphones-1.jpg', '/images/headphones-2.jpg'],
    category: 'Accessories',
    stock: 100,
    ratings: 4.2,
    reviews: [],
  },
  {
    name: 'Gaming Mouse',
    description: 'High-precision gaming mouse with customizable RGB lighting.',
    price: 49.99,
    images: ['/images/mouse-1.jpg', '/images/mouse-2.jpg'],
    category: 'Accessories',
    stock: 150,
    ratings: 4.6,
    reviews: [],
  },
  {
    name: 'Mechanical Keyboard',
    description: 'Tactile and responsive mechanical keyboard for typing and gaming.',
    price: 89.99,
    images: ['/images/keyboard-1.jpg', '/images/keyboard-2.jpg'],
    category: 'Accessories',
    stock: 80,
    ratings: 4.7,
    reviews: [],
  },
  {
    name: '4K Monitor',
    description: 'Stunning 27-inch 4K monitor with vibrant colors and sharp details.',
    price: 349.99,
    images: ['/images/monitor-1.jpg', '/images/monitor-2.jpg'],
    category: 'Electronics',
    stock: 40,
    ratings: 4.9,
    reviews: [],
  },
  {
    name: 'Webcam HD',
    description: 'High-definition webcam for video conferencing and streaming.',
    price: 69.99,
    images: ['/images/webcam-1.jpg', '/images/webcam-2.jpg'],
    category: 'Electronics',
    stock: 120,
    ratings: 4.4,
    reviews: [],
  },
  {
    name: 'External Hard Drive 1TB',
    description: 'Portable 1TB external hard drive for backups and storage.',
    price: 59.99,
    images: ['/images/hdd-1.jpg', '/images/hdd-2.jpg'],
    category: 'Accessories',
    stock: 200,
    ratings: 4.8,
    reviews: [],
  },
  {
    name: 'Smart Speaker',
    description: 'Voice-controlled smart speaker with a built-in AI assistant.',
    price: 99.99,
    images: ['/images/speaker-1.jpg', '/images/speaker-2.jpg'],
    category: 'Electronics',
    stock: 90,
    ratings: 4.5,
    reviews: [],
  },
  {
    name: 'Fitness Tracker',
    description: 'Track your steps, heart rate, and sleep with this advanced fitness tracker.',
    price: 79.99,
    images: ['/images/tracker-1.jpg', '/images/tracker-2.jpg'],
    category: 'Wearables',
    stock: 110,
    ratings: 4.3,
    reviews: [],
  },
  {
    name: 'Coffee Maker',
    description: 'Brew delicious coffee at home with this easy-to-use coffee maker.',
    price: 49.99,
    images: ['/images/coffee-1.jpg', '/images/coffee-2.jpg'],
    category: 'Home & Kitchen',
    stock: 60,
    ratings: 4.6,
    reviews: [],
  },
  {
    name: 'Blender',
    description: 'Powerful blender for smoothies, shakes, and more.',
    price: 39.99,
    images: ['/images/blender-1.jpg', '/images/blender-2.jpg'],
    category: 'Home & Kitchen',
    stock: 70,
    ratings: 4.7,
    reviews: [],
  },
];

async function seedDatabase() {
  const { default: dbConnect } = await import('../lib/mongodb');
  const { default: Product } = await import('../models/Product');
  await dbConnect();

  try {
    console.log('Seeding database...');

    // Clear existing products
    await (Product as any).deleteMany({});
    console.log('Existing products cleared.');

    // Insert new products
    await (Product as any).insertMany(products);
    console.log('Products seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();