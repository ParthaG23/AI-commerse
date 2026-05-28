import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';

const groq = new Groq({ apiKey: process.env.GROQ_API });

const SUBCATEGORY_GENERIC_WORDS: { [key: string]: string[] } = {
  men_tshirt: ['tshirt', 't-shirt', 'tees', 'tee', 'polo'],
  men_shirt: ['shirt', 'shirts', 'formal', 'casual'],
  men_jeans: ['jeans', 'pant', 'pants', 'denim', 'trouser', 'trousers'],
  men_shorts: ['shorts', 'short', 'cargo', 'half-pant'],
  women_dress: ['dress', 'dresses', 'gown', 'gowns', 'salwar', 'suit', 'suits', 'lehenga'],
  women_saree: ['saree', 'sari', 'sarees', 'traditional'],
  women_kurta: ['kurta', 'kurti', 'kurtis', 'kurtas'],
  men_shoes: ['shoes', 'shoe', 'sneakers', 'sneaker', 'boots', 'boot', 'sandals', 'sandal', 'slippers', 'slipper'],
  women_shoes: ['shoes', 'shoe', 'heels', 'heel', 'flats', 'flat', 'boots', 'boot', 'sandals', 'sandal', 'wedges', 'wedge'],
  backpack: ['backpack', 'backpacks', 'bag', 'bags', 'travel'],
  sunglasses: ['sunglasses', 'sunglass', 'goggles', 'goggle', 'glass', 'glasses', 'eyewear'],
  smartphone: ['phone', 'phones', 'mobile', 'mobiles', 'smartphone', 'smartphones', 'cellphone', 'cellphones'],
  laptop: ['laptop', 'laptops', 'notebook', 'notebooks'],
  gaming_laptop: ['laptop', 'laptops', 'gaming'],
  tablet: ['tablet', 'tablets', 'ipad', 'ipads'],
  smartwatch: ['watch', 'watches', 'smartwatch', 'smartwatches', 'band', 'bands'],
  smart_tv: ['tv', 'tvs', 'television', 'televisions', 'led', 'leds'],
  headphones: ['headphones', 'headphone', 'headfone', 'headfones'],
  earbuds: ['earbuds', 'earbud', 'airpods', 'airpod', 'tws'],
  face_cream: ['cream', 'creams', 'moisturizer', 'moisturizers', 'serum', 'serums', 'facecream'],
  shampoo: ['shampoo', 'shampoos', 'conditioner', 'conditioners', 'hair'],
  perfume: ['perfume', 'perfumes', 'scent', 'scents', 'cologne', 'colognes'],
  electric_toothbrush: ['toothbrush', 'toothbrushes', 'electric'],
  yoga_mat: ['mat', 'mats', 'yoga'],
  cricket_bat: ['bat', 'bats', 'cricket'],
  fitness_tracker: ['tracker', 'trackers', 'fitness', 'band', 'bands'],
  books_bestseller: ['books', 'book', 'bestseller'],
  toys: ['toys', 'toy'],
  dry_fruits: ['dry', 'fruits', 'fruit', 'almond', 'almonds', 'cashew', 'cashews'],
  protein_powder: ['protein', 'powder', 'whey'],
  car_accessories: ['car', 'accessories', 'accessory'],
  helmet: ['helmet', 'helmets', 'driving']
};

const systemPrompt1 = `You are the Intent Extractor for Nuvix, an advanced Indian e-commerce platform.
Given a user query (which might have spelling mistakes, mixed Indian languages like Hindi/Hinglish/Tamil/Telugu/Bengali, or vague descriptions), extract structured search parameters.

Spelling Corrections & Language:
- "mobail", "fone", "mobil" -> "phone"
- "leptop", "laptoop", "laaptop" -> "laptop"
- "shrit", "shert" -> "shirt"
- "hedfone", "hedphone", "headfone" -> "headphone"
- "ghadi", "ghady" -> "watch"
- "sasta" -> budget/low price
- "mehenga", "mehnga" -> premium/high price
- "accha", "acha" -> good quality
- "shos", "shoos", "chappal" -> "shoes"

Detailed Category & Subcategory Tree (Critical for precise catalog matching):
1. Fashion:
   - "men_tshirt": for men's t-shirts, polo, tees, etc.
   - "men_shirt": for men's formal shirts, casual shirts, etc.
   - "men_jeans": for men's jeans, denim, trousers, pants, etc.
   - "men_shorts": for men's shorts, cargo shorts, etc.
   - "women_dress": for women's dresses, gowns, salwars, suits, etc.
   - "women_saree": for women's sarees, traditional wear, etc.
   - "women_kurta": for women's kurtas, kurtis, etc.
   - "men_shoes": for men's sneakers, formal shoes, sandals, boots, etc.
   - "women_shoes": for women's heels, flats, boots, etc.
   - "backpack": for backpacks, travel bags.
   - "sunglasses": for sunglasses, eyewear.
2. Electronics:
   - "smartphone": for mobile phones, cellphones.
   - "laptop": for standard laptops, notebooks.
   - "gaming_laptop": for gaming laptops.
   - "tablet": for iPads, tablets.
   - "smartwatch": for smartwatches, fitness bands.
   - "smart_tv": for TVs, smart televisions, LEDs.
   - "camera": for cameras, DSLRs, mirrorless.
   - "router": for Wi-Fi routers.
   - "monitor": for external displays.
3. Accessories:
   - "headphones": for over-ear headphones.
   - "earbuds": for wireless earbuds, AirPods, TWS.
   - "keyboard": for computer keyboards.
   - "mouse": for computer mice.
   - "hard_drive": for external hard drives, SSDs.
   - "power_bank": for portable chargers.
   - "phone_charger": for cables, chargers, adapters.
4. Home & Kitchen:
   - "air_conditioner": for ACs.
   - "refrigerator": for fridges.
   - "washing_machine": for washers.
   - "microwave": for microwave ovens.
   - "mixer_grinder": for blenders, mixers, grinders.
   - "office_chair": for office chairs.
   - "desk": for study desks, computer tables.
5. Beauty & Grooming:
   - "face_cream": for face creams, serums, moisturizers.
   - "shampoo": for shampoo, hair care.
   - "perfume": for perfumes, colognes.
   - "electric_toothbrush": for toothbrushes.
6. Sports & Fitness:
   - "yoga_mat": for yoga mats.
   - "cricket_bat": for cricket bats, kits.
   - "fitness_tracker": for fitness bands.
7. Books & Toys:
   - "books_bestseller": for books.
   - "toys": for kids' toys.
8. Grocery:
   - "dry_fruits": for almonds, cashews, dry fruits.
   - "protein_powder": for whey protein, health powders.
9. Automotive:
   - "car_accessories": for car accessories.
   - "helmet": for driving helmets.

Follow-up Queries & Conversation Context:
- The user might send a short follow-up query (e.g. "under 1000", "in black", "Peter England", "show me more"). 
- In such cases, look at the recent conversation turns in the chat history. Carry over the active search context (the parent category, subcategory, brand, etc.) from the previous turns.
- For example, if the user previously searched for "shirt" (subcategory: men_shirt) and now says "under 1000", the subcategory remains "men_shirt", the category remains "Fashion", and you must add "price_max": 1000.

You MUST respond with valid JSON ONLY. No markdown wrappers (no \`\`\`json), no pre-text, no post-text.
Format:
{
  "queryType": "product search" | "general question" | "greeting" | "comparison",
  "detectedLanguage": "en" | "hi" | "ta" | "te" | "mr" | "bn" | "gu" | "kn" | "ml" | "pa",
  "searchParams": {
    "query": "normalized search keyword in English (e.g. 'laptop', 'phone', 'shirt')",
    "category": "Electronics" | "Accessories" | "Wearables" | "Home & Kitchen" | "Fashion" | "Beauty & Grooming" | "Sports & Fitness" | "Books & Toys" | "Grocery" | "Automotive" (or null),
    "subcategory": "exact_subcategory_key_from_the_tree_above_or_null",
    "price_min": number (or 0),
    "price_max": number (or 0),
    "brand": "brand name in English or null",
    "color": "color in English or null",
    "features": ["feature1", "feature2"],
    "sort": "price_asc" | "price_desc" | "rating" | null,
    "fuzzy_terms": ["related synonym term 1 in English", "related synonym term 2 in English"]
  }
}`;

const systemPrompt2 = `You are Nuvix AI, the supreme shopping assistant for Nuvix E-Commerce.
Your job is to write a highly friendly, natural, and engaging conversational response to the user's request.
You must respond in the user's detected language (even if it's Hinglish, Tamil, Telugu, Hindi, Bengali, etc.).

You will be given:
1. The user's original query.
2. The number of products found in our catalog matching their criteria.
3. A list of products found (titles and prices).
4. The extracted search parameters.

Guidelines for response:
- Respond in the user's preferred language/script (e.g. if they asked in Hinglish like "sasta leptop dikhao", reply in friendly Hinglish like "Sure! Maine aapke liye budget laptops dhoonde hain. Dekhiye yeh options:").
- If products are found, summarize briefly and encourage them to look at the cards on the right.
- DO NOT HALLUCINATE OR CALL A PRODUCT SOMETHING IT IS NOT! Read the product's actual title in the list of products found. If the database returned a product that is clearly a different type of clothing or category (e.g. it returned a long gown or dress like "BLACK TEETAR" when the user asked for a "t-shirt"), you must explain conversationally that we don't have the exact item in stock, but show the closest match you found instead. NEVER call a dress a t-shirt! Be honest and accurate about what the products actually are.
- If ZERO products are found, DO NOT just say "no products found". Instead:
  * Apologize politely in their language.
  * Suggest that we don't have that exact item/price in stock right now.
  * Recommend checking out related items (e.g. if they searched for 'shirt' and we have 't-shirts', suggest looking at the t-shirts, or suggest broadening their budget or keywords).
- If it's a general question or greeting, give a helpful, concise answer.
- If it's a comparison query, write a smart comparison of the requested items.

Be warm, professional, and extremely helpful. Output ONLY the plain text response. No JSON, no markdown wrappers outside normal text.`;

function sanitizeParams(sp: any) {
  const clean: any = {};
  if (!sp) return clean;

  const isInvalid = (val: any) => {
    if (val === null || val === undefined) return true;
    if (typeof val === 'string') {
      const lower = val.trim().toLowerCase();
      return lower === '' || lower === 'null' || lower === 'none' || lower === 'undefined' || lower === 'empty';
    }
    return false;
  };

  if (!isInvalid(sp.query)) clean.query = String(sp.query).trim();
  if (!isInvalid(sp.category)) clean.category = String(sp.category).trim();
  if (Number(sp.price_min) > 0) clean.price_min = Number(sp.price_min);
  if (Number(sp.price_max) > 0) clean.price_max = Number(sp.price_max);
  if (!isInvalid(sp.brand)) clean.brand = String(sp.brand).trim();
  if (!isInvalid(sp.color)) clean.color = String(sp.color).trim();
  if (sp.features && Array.isArray(sp.features)) {
    clean.features = sp.features.filter((f: any) => !isInvalid(f));
  }
  if (!isInvalid(sp.sort)) clean.sort = String(sp.sort).trim();
  if (!isInvalid(sp.subcategory)) clean.subcategory = String(sp.subcategory).trim();
  if (sp.fuzzy_terms && Array.isArray(sp.fuzzy_terms)) {
    clean.fuzzy_terms = sp.fuzzy_terms.filter((t: any) => !isInvalid(t));
  }

  return clean;
}

function mapCategory(cat: string): string | null {
  if (!cat) return null;
  const lower = cat.toLowerCase().trim();

  if (lower.includes('electronics') || lower.includes('appliance')) return 'Electronics';
  if (lower.includes('accessory') || lower.includes('accessories')) return 'Accessories';
  if (lower.includes('wearable') || lower.includes('watch') || lower.includes('ghadi')) return 'Wearables';
  if (lower.includes('home') || lower.includes('kitchen') || lower.includes('furniture')) return 'Home & Kitchen';
  if (lower.includes('fashion') || lower.includes('clothing') || lower.includes('footwear') || lower.includes('shoe') || lower.includes('cloth') || lower.includes('shrit') || lower.includes('shirt')) return 'Fashion';
  if (lower.includes('beauty') || lower.includes('grooming') || lower.includes('makeup')) return 'Beauty & Grooming';
  if (lower.includes('sports') || lower.includes('fitness') || lower.includes('gym')) return 'Sports & Fitness';
  if (lower.includes('books') || lower.includes('toys') || lower.includes('book')) return 'Books & Toys';
  if (lower.includes('grocery') || lower.includes('food')) return 'Grocery';
  if (lower.includes('automotive') || lower.includes('car') || lower.includes('auto')) return 'Automotive';

  return null;
}

async function queryCatalog(rawSp: any, userId?: string | null) {
  await dbConnect();
  const sp = sanitizeParams(rawSp);
  const filter: any = {};

  // Retrieve user preferences for AI-driven personalization and budget predictions
  let userPrefs: any = null;
  if (userId) {
    try {
      const userObj = await User.findById(userId).lean();
      if (userObj && userObj.preferences) {
        userPrefs = userObj.preferences;
      }
    } catch (e) {
      console.error('Error fetching user preferences:', e);
    }
  }

  // Category
  const dbCategory = mapCategory(sp.category);
  if (dbCategory) {
    filter.category = dbCategory;
  }

  // Subcategory
  if (sp.subcategory) {
    filter.subcategory = { $regex: new RegExp(`^${sp.subcategory}$`, 'i') };
  }

  // Price range - support predictive preference constraints
  if (sp.price_min || sp.price_max) {
    const priceFilter: any = {};
    if (sp.price_min) priceFilter.$gte = Number(sp.price_min);
    if (sp.price_max) priceFilter.$lte = Number(sp.price_max);
    filter.price = priceFilter;
  } else if (userPrefs && userPrefs.budgetMax && Number(userPrefs.budgetMax) > 0) {
    // Apply user's historical budget ceiling predictively if they didn't specify one
    filter.price = { $lte: Number(userPrefs.budgetMax) };
  }

  // Brand / Color
  if (sp.brand) {
    filter.name = { $regex: new RegExp(sp.brand, 'i') };
  }
  if (sp.color) {
    filter.$or = [
      { name: { $regex: new RegExp(`\\b${sp.color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i') } },
      { description: { $regex: new RegExp(`\\b${sp.color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i') } }
    ];
  }

  // Search keyword (query) - split and match all words separately with word boundaries
  if (sp.query) {
    const stopWords = new Set(['for', 'with', 'under', 'above', 'in', 'of', 'and', 'a', 'an', 'the', 'ke', 'ka', 'ki', 'se', 'kam', 'zyada']);
    const genderGenericWords = new Set([
      'men', 'mens', 'women', 'womens', 'man', 'mans', 'woman', 'womans',
      'boy', 'boys', 'girl', 'girls', 'kid', 'kids', 'unisex', 'adult', 'adults'
    ]);
    let words = sp.query.split(/\s+/)
      .map((w: string) => w.toLowerCase().trim())
      .filter((w: string) => w !== '' && !stopWords.has(w) && !genderGenericWords.has(w));

    // Strip generic subcategory terms so they don't block queries when product titles only contain brand names
    if (sp.subcategory) {
      const subcatLower = sp.subcategory.toLowerCase();
      const genericWords = SUBCATEGORY_GENERIC_WORDS[subcatLower] || [];
      words = words.filter((w: string) => !genericWords.includes(w));
    }

    if (words.length > 0) {
      if (!filter.$and) filter.$and = [];
      words.forEach((w: string) => {
        filter.$and.push({
          $or: [
            { name: new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i') },
            { description: new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i') }
          ]
        });
      });
    }
  }

  let sortOption: any = { ratings: -1, price: 1 };
  if (sp.sort === 'price_asc') sortOption = { price: 1 };
  if (sp.sort === 'price_desc') sortOption = { price: -1 };
  if (sp.sort === 'rating') sortOption = { ratings: -1 };

  let products = await Product.find(filter).sort(sortOption).limit(40).lean();

  // Fallback 1: Relax word boundaries to simple substring matches on product name (no \b required)
  if (products.length === 0 && sp.query) {
    const broadFilter: any = {};
    if (dbCategory) broadFilter.category = dbCategory;
    
    const stopWords = new Set(['for', 'with', 'under', 'above', 'in', 'of', 'and', 'a', 'an', 'the', 'ke', 'ka', 'ki', 'se', 'kam', 'zyada']);
    const genderGenericWords = new Set([
      'men', 'mens', 'women', 'womens', 'man', 'mans', 'woman', 'womans',
      'boy', 'boys', 'girl', 'girls', 'kid', 'kids', 'unisex', 'adult', 'adults'
    ]);
    let words = sp.query.split(/\s+/)
      .map((w: string) => w.toLowerCase().trim())
      .filter((w: string) => w !== '' && !stopWords.has(w) && !genderGenericWords.has(w));

    if (sp.subcategory) {
      const subcatLower = sp.subcategory.toLowerCase();
      const genericWords = SUBCATEGORY_GENERIC_WORDS[subcatLower] || [];
      words = words.filter((w: string) => !genericWords.includes(w));
    }

    if (words.length > 0) {
      broadFilter.$and = [];
      words.forEach((w: string) => {
        broadFilter.$and.push({
          name: new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
        });
      });
      products = await Product.find(broadFilter).sort(sortOption).limit(20).lean();
    }
  }

  // Fallback 2: Try fuzzy terms with strict word boundaries to avoid substring issues like "tee" matching "TEETAR"
  if (products.length === 0 && sp.fuzzy_terms && sp.fuzzy_terms.length > 0) {
    const fuzzyFilter: any = {};
    if (dbCategory) fuzzyFilter.category = dbCategory;
    const regexTerms = sp.fuzzy_terms
      .map((t: string) => t.toLowerCase().trim())
      .filter((t: string) => t !== '')
      .map((t: string) => `\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`)
      .join('|');

    if (regexTerms) {
      fuzzyFilter.name = { $regex: new RegExp(`(${regexTerms})`, 'i') };
      products = await Product.find(fuzzyFilter).sort(sortOption).limit(20).lean();
    }
  }

  // Fallback 3: Subcategory fallback (drop name keywords if 0 items found, query purely by subcategory + price/brand)
  if (products.length === 0 && sp.subcategory) {
    const subcatFilter: any = {
      subcategory: { $regex: new RegExp(`^${sp.subcategory}$`, 'i') }
    };
    if (dbCategory) subcatFilter.category = dbCategory;

    if (sp.price_min || sp.price_max) {
      const priceFilter: any = {};
      if (sp.price_min) priceFilter.$gte = Number(sp.price_min);
      if (sp.price_max) priceFilter.$lte = Number(sp.price_max);
      subcatFilter.price = priceFilter;
    } else if (userPrefs && userPrefs.budgetMax && Number(userPrefs.budgetMax) > 0) {
      subcatFilter.price = { $lte: Number(userPrefs.budgetMax) };
    }

    if (sp.brand) {
      subcatFilter.name = { $regex: new RegExp(sp.brand, 'i') };
    }

    products = await Product.find(subcatFilter).sort(sortOption).limit(20).lean();
  }

  // Fallback 4: Category fallback (drop subcategory if still 0 items found, query purely by category + price/brand)
  if (products.length === 0 && dbCategory) {
    const catFilter: any = { category: dbCategory };

    if (sp.price_min || sp.price_max) {
      const priceFilter: any = {};
      if (sp.price_min) priceFilter.$gte = Number(sp.price_min);
      if (sp.price_max) priceFilter.$lte = Number(sp.price_max);
      catFilter.price = priceFilter;
    } else if (userPrefs && userPrefs.budgetMax && Number(userPrefs.budgetMax) > 0) {
      catFilter.price = { $lte: Number(userPrefs.budgetMax) };
    }

    if (sp.brand) {
      catFilter.name = { $regex: new RegExp(sp.brand, 'i') };
    }

    products = await Product.find(catFilter).sort(sortOption).limit(20).lean();
  }

  // Personalization Brand Boost: Put the user's favorite brands first in the catalog feed
  if (userPrefs && userPrefs.likedBrands && userPrefs.likedBrands.length > 0) {
    const likedSet = new Set(userPrefs.likedBrands.map((b: string) => b.toLowerCase().trim()));
    const preferred: any[] = [];
    const others: any[] = [];

    products.forEach((p: any) => {
      const nameLower = p.name.toLowerCase();
      const isPreferred = Array.from(likedSet).some((brand: string) => nameLower.includes(brand));
      if (isPreferred) {
        preferred.push(p);
      } else {
        others.push(p);
      }
    });
    products = [...preferred, ...others];
  }

  return products;
}

export async function POST(req: Request) {
  try {
    const { query, originalQuery, lang, userId, history } = await req.json();
    const userQuery = query || originalQuery;
    if (!userQuery) {
      return NextResponse.json({ message: 'Query is required' }, { status: 400 });
    }

    // Construct the LLM messages list with full conversational history context
    const llmMessages: any[] = [{ role: 'system', content: systemPrompt1 }];

    if (history && Array.isArray(history)) {
      // Inject the last 6 messages to keep it fast, highly context-aware, and precise
      const recentHistory = history.slice(-6);
      recentHistory.forEach((msg: any) => {
        if (msg.sender === 'user') {
          llmMessages.push({ role: 'user', content: msg.content });
        } else if (msg.sender === 'ai') {
          if (msg.content && msg.type !== 'search') {
            llmMessages.push({ role: 'assistant', content: msg.content });
          }
        }
      });
    }

    // Append the current active user query
    llmMessages.push({ role: 'user', content: userQuery });

    // Step 1: Call Llama model to extract structured parameters
    let aiResponse;
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        temperature: 0,
        max_tokens: 1000,
        messages: llmMessages,
      });
      aiResponse = completion.choices[0]?.message?.content?.trim() || '{}';
    } catch (e) {
      // Fallback model if Llama 70b is rate-limited
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        temperature: 0,
        max_tokens: 1000,
        messages: llmMessages,
      });
      aiResponse = completion.choices[0]?.message?.content?.trim() || '{}';
    }

    // Parse JSON safely
    let parsed: any = {};
    try {
      const cleanJSON = aiResponse.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(cleanJSON);
    } catch {
      // Manual fallback regex parse if JSON is broken
      parsed = {
        queryType: 'product search',
        detectedLanguage: lang?.split('-')[0] || 'en',
        searchParams: { query: userQuery },
      };
    }

    const qType = (parsed.queryType || '').toLowerCase();
    let products: any[] = [];

    // Step 2: Database Catalog Search (if it's a product search query)
    if (qType.includes('search') || qType.includes('recommend') || qType.includes('comparison') || !qType) {
      try {
        products = await queryCatalog(parsed.searchParams || {}, userId);

        // Dynamically learn & update user preferences in the background!
        if (userId && parsed.searchParams) {
          const sp = parsed.searchParams;
          const userObj = await User.findById(userId);
          if (userObj) {
            if (!userObj.preferences) {
              userObj.preferences = { budgetMin: 0, budgetMax: 0, likedBrands: [], dislikedBrands: [], useCases: [] };
            }

            let updated = false;
            // 1. Learn brand preference
            if (sp.brand) {
              const brandClean = sp.brand.trim();
              if (brandClean && !userObj.preferences.likedBrands.some((b: string) => b.toLowerCase() === brandClean.toLowerCase())) {
                userObj.preferences.likedBrands.push(brandClean);
                updated = true;
              }
            }
            // 2. Learn budget preference predictively
            if (sp.price_max && Number(sp.price_max) > 0) {
              const currentMax = Number(sp.price_max);
              if (userObj.preferences.budgetMax) {
                userObj.preferences.budgetMax = Math.round((userObj.preferences.budgetMax + currentMax) / 2);
              } else {
                userObj.preferences.budgetMax = currentMax;
              }
              updated = true;
            }

            if (updated) {
              await userObj.save();
            }
          }
        }
      } catch (err) {
        console.error('Database query failed:', err);
      }
    }

    // Step 3: LLM Conversational Response Generation
    const foundProductSummaries = products.map(p => `- ${p.name}: ₹${p.price}`).join('\n');
    const step3Prompt = `User Query: "${userQuery}"
Extracted Language: ${parsed.detectedLanguage}
Extracted Params: ${JSON.stringify(parsed.searchParams)}
Number of Products Found: ${products.length}
Products Found in Database:
${foundProductSummaries || 'None'}`;

    let generalAnswer = '';
    try {
      const responseGen = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 800,
        messages: [
          { role: 'system', content: systemPrompt2 },
          { role: 'user', content: step3Prompt },
        ],
      });
      generalAnswer = responseGen.choices[0]?.message?.content?.trim() || '';
    } catch {
      const responseGen = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        temperature: 0.3,
        max_tokens: 800,
        messages: [
          { role: 'system', content: systemPrompt2 },
          { role: 'user', content: step3Prompt },
        ],
      });
      generalAnswer = responseGen.choices[0]?.message?.content?.trim() || '';
    }

    return NextResponse.json({
      queryType: parsed.queryType || 'product search',
      detectedLanguage: parsed.detectedLanguage || 'en',
      searchParams: parsed.searchParams || {},
      generalAnswer,
      products,
    }, { status: 200 });

  } catch (error: any) {
    console.error('[/api/ai-search] Error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
