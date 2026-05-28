import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkSubcatPrices() {
  const { default: dbConnect } = await import('../lib/mongodb');
  const { default: Product } = await import('../models/Product');

  await dbConnect();
  try {
    const subcats = ['men_tshirt', 'men_shirt', 'men_jeans', 'men_shorts', 'sunglasses'];
    for (const sub of subcats) {
      const total = await Product.countDocuments({ subcategory: sub });
      const under2000 = await Product.countDocuments({ subcategory: sub, price: { $lte: 2000 } });
      console.log(`Subcategory: "${sub}"`);
      console.log(`  Total products: ${total}`);
      console.log(`  Products under ₹2000: ${under2000}`);
      
      if (total > 0) {
        const samples = await Product.find({ subcategory: sub }).limit(2).lean();
        console.log('  Samples:');
        samples.forEach(s => console.log(`    - Name: ${s.name}, Price: ₹${s.price}`));
      }
      console.log('-----------------------------');
    }
  } catch (error) {
    console.error('Error running check:', error);
  } finally {
    const mongoose = await import('mongoose');
    mongoose.connection.close();
  }
}

checkSubcatPrices();
