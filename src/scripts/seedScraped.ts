import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

// Load env at the very top
dotenv.config({ path: '.env.local' });

const SCRAPER_JSON_PATH = path.resolve(__dirname, '../../../AmazonScraper/output/amazon_products.json');
const IMAGES_DIR = path.resolve(__dirname, '../../../AmazonScraper/images');

// Mapping 47 raw subcategories to 9 premium high-level categories
const CATEGORY_MAP: { [key: string]: string } = {
  // Electronics
  'smartphone': 'Electronics',
  'laptop': 'Electronics',
  'tablet': 'Electronics',
  'smartwatch': 'Electronics',
  'smart_tv': 'Electronics',
  'camera': 'Electronics',
  'gaming_console': 'Electronics',
  'gaming_laptop': 'Electronics',
  'monitor': 'Electronics',
  'router': 'Electronics',

  // Accessories
  'headphones': 'Accessories',
  'earbuds': 'Accessories',
  'keyboard': 'Accessories',
  'mouse': 'Accessories',
  'hard_drive': 'Accessories',
  'pen_drive': 'Accessories',
  'power_bank': 'Accessories',
  'phone_charger': 'Accessories',

  // Fashion
  'men_tshirt': 'Fashion',
  'women_dress': 'Fashion',
  'men_shoes': 'Fashion',
  'women_shoes': 'Fashion',
  'backpack': 'Fashion',
  'sunglasses': 'Fashion',

  // Home & Kitchen
  'air_conditioner': 'Home & Kitchen',
  'refrigerator': 'Home & Kitchen',
  'washing_machine': 'Home & Kitchen',
  'microwave': 'Home & Kitchen',
  'mixer_grinder': 'Home & Kitchen',
  'ceiling_fan': 'Home & Kitchen',
  'water_purifier': 'Home & Kitchen',
  'air_purifier': 'Home & Kitchen',
  'office_chair': 'Home & Kitchen',
  'desk': 'Home & Kitchen',

  // Beauty & Grooming
  'face_cream': 'Beauty & Grooming',
  'shampoo': 'Beauty & Grooming',
  'perfume': 'Beauty & Grooming',
  'electric_toothbrush': 'Beauty & Grooming',

  // Sports & Fitness
  'yoga_mat': 'Sports & Fitness',
  'cricket_bat': 'Sports & Fitness',
  'fitness_tracker': 'Sports & Fitness',

  // Books & Toys
  'books_bestseller': 'Books & Toys',
  'toys': 'Books & Toys',

  // Grocery
  'dry_fruits': 'Grocery',
  'protein_powder': 'Grocery',

  // Automotive
  'car_accessories': 'Automotive',
  'helmet': 'Automotive',
};

const INDIAN_NAMES = [
  'Aarav Sharma', 'Vivaan Patel', 'Aditya Iyer', 'Vihaan Rao', 'Sai Krishnan',
  'Arjun Verma', 'Ananya Gupta', 'Diya Sen', 'Pari Mukherjee', 'Sanya Joshi',
  'Kabir Malhotra', 'Meera Nair', 'Rohan Reddy', 'Ishaan Chawla', 'Neha Kapoor',
  'Rahul Bhatia', 'Pooja Deshmukh', 'Amit Singhal', 'Vikram Chaudhary', 'Shreya Saxena'
];

const REVIEWS_POOL: { [key: string]: string[] } = {
  'Electronics': [
    'Excellent build quality and very fast delivery from Flipkart! Fully satisfied.',
    'Amazing value for money. The performance is top-notch and battery lasts long.',
    'Good display and camera, performs well. Recommended product.',
    'Decent product. Meets expectations but the packing could have been better.',
    'Stunning performance! Absolutely loved the display and speed.'
  ],
  'Accessories': [
    'Great audio quality and highly responsive. Fits comfortably.',
    'Super fast charging and high quality build. Worth every rupee.',
    'Best accessory bought this year! Premium texture and works perfectly.',
    'Good features and standard materials. Happy with the purchase.'
  ],
  'Fashion': [
    'Very comfortable and fits perfectly. The material is very soft and premium!',
    'Vibrant colors and excellent design. Got many compliments!',
    'Perfect fit, standard stitching, and high quality fabric. Value for money.',
    'Styling is great, exactly as shown in the catalog photos.'
  ],
  'Home & Kitchen': [
    'Highly energy efficient and quiet. Beautiful design fits my home perfectly.',
    'Flipkart delivery was very fast. Installation was smooth and runs great.',
    'Superb utility, extremely useful and durable construction. Highly recommended!',
    'Works like a charm. Makes kitchen tasks incredibly easy.'
  ],
  'general': [
    'Excellent product! Happy with the purchase and fast delivery.',
    'Highly recommended. Flipkart offered a great deal on this product.',
    'Value for money, premium build, and very useful features.',
    'Satisfied with the overall experience. Will buy again!'
  ]
};

function getRandomReviews(category: string): any[] {
  const reviewsCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 reviews
  const reviewsList = REVIEWS_POOL[category] || REVIEWS_POOL['general'];
  const generatedReviews = [];

  const shuffledNames = [...INDIAN_NAMES].sort(() => 0.5 - Math.random());
  const shuffledReviews = [...reviewsList].sort(() => 0.5 - Math.random());

  for (let i = 0; i < reviewsCount; i++) {
    generatedReviews.push({
      user: new mongoose.Types.ObjectId(),
      name: shuffledNames[i % shuffledNames.length],
      rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
      comment: shuffledReviews[i % shuffledReviews.length],
    });
  }

  return generatedReviews;
}

// Check which image file actually exists locally
function getLocalImage(asin: string, rawSubcategory: string, remoteUrl: string | null): string {
  const extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  for (const ext of extensions) {
    const localPath = path.join(IMAGES_DIR, rawSubcategory, `${asin}${ext}`);
    if (fs.existsSync(localPath)) {
      return `/images/${rawSubcategory}/${asin}${ext}`;
    }
  }
  // Fallback to remote image URL or a default thumbnail if null
  return remoteUrl || 'https://via.placeholder.com/300?text=Product+Image';
}

async function seedDatabase() {
  console.log('Starting seed process...');
  const { default: dbConnect } = await import('../lib/mongodb');
  const { default: Product } = await import('../models/Product');
  await dbConnect();

  try {
    if (!fs.existsSync(SCRAPER_JSON_PATH)) {
      throw new Error(`Scraper JSON file not found at: ${SCRAPER_JSON_PATH}. Run Amazon scraper first.`);
    }

    console.log('Reading scraper JSON data...');
    const rawData = fs.readFileSync(SCRAPER_JSON_PATH, 'utf-8');
    const scrapedProducts = JSON.parse(rawData);

    console.log(`Found ${scrapedProducts.length} raw scraped products.`);

    console.log('Clearing existing product catalog in MongoDB...');
    await (Product as any).deleteMany({});
    console.log('Existing products cleared.');

    console.log('Formatting product documents...');
    const formattedProducts: any[] = [];
    let skippedCount = 0;

    for (const p of scrapedProducts) {
      const price = p.price_inr || p.orig_price;
      // Skip products with invalid names, categories, or missing price
      if (!p.title || !p.category || !price) {
        skippedCount++;
        continue;
      }

      const highLevelCat = CATEGORY_MAP[p.category] || 'Electronics';
      const localImgPath = getLocalImage(p.asin, p.category, p.img_url);

      // Clean rating
      const rating = p.rating || (Math.random() * 0.9 + 4.0); // Default random 4.0 - 4.9 rating

      // Subtitle or descriptions
      const desc = `Experience the premium quality of the all-new ${p.title.split('|')[0]}. Built with high-grade components and featuring advanced specifications tailored for your convenience. Rated ${rating.toFixed(1)} stars by verified buyers on our platform. Fully backed by our Assured delivery promise.`;

      formattedProducts.push({
        name: p.title.trim(),
        description: desc,
        price: Number(price),
        images: [localImgPath],
        category: highLevelCat,
        subcategory: p.category,
        stock: Math.floor(Math.random() * 90) + 10, // 10 to 100 stock
        ratings: Number(rating.toFixed(1)),
        reviews: getRandomReviews(highLevelCat),
      });
    }

    console.log(`Formatted ${formattedProducts.length} products (Skipped ${skippedCount} items due to missing price/details).`);

    // Bulk insert in chunks
    const CHUNK_SIZE = 1000;
    console.log(`Uploading products in chunks of ${CHUNK_SIZE}...`);
    
    for (let i = 0; i < formattedProducts.length; i += CHUNK_SIZE) {
      const chunk = formattedProducts.slice(i, i + CHUNK_SIZE);
      await (Product as any).insertMany(chunk);
      console.log(`  ✓ Inserted chunk ${Math.floor(i / CHUNK_SIZE) + 1} (${chunk.length} items)...`);
    }

    console.log('━━━ DATABASE SEED SUCCESSFUL ━━━');
    console.log(`Successfully seeded ${formattedProducts.length} products into AI-Commerce MongoDB!`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

seedDatabase();
