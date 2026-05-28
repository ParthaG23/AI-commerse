import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

const groq = new Groq({ apiKey: process.env.GROQ_API });

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
   - "men_tshirt": for men's shirts, t-shirts, polo, tees, etc.
   - "women_dress": for women's dresses, sarees, kurtas, gowns, etc.
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

async function queryCatalog(rawSp: any) {
  await dbConnect();
  const sp = sanitizeParams(rawSp);
  const filter: any = {};

  // Category
  const dbCategory = mapCategory(sp.category);
  if (dbCategory) {
    filter.category = dbCategory;
  }

  // Subcategory
  if (sp.subcategory) {
    filter.subcategory = { $regex: new RegExp(`^${sp.subcategory}$`, 'i') };
  }

  // Price range
  if (sp.price_min || sp.price_max) {
    const priceFilter: any = {};
    if (sp.price_min) priceFilter.$gte = Number(sp.price_min);
    if (sp.price_max) priceFilter.$lte = Number(sp.price_max);
    filter.price = priceFilter;
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
    const words = sp.query.split(/\s+/)
      .map((w: string) => w.toLowerCase().trim())
      .filter((w: string) => w !== '' && !stopWords.has(w));

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

  // Fallback 1: Relax word boundaries to simple substring matches (no \b required)
  if (products.length === 0 && sp.query) {
    const broadFilter: any = {};
    if (dbCategory) broadFilter.category = dbCategory;
    
    const stopWords = new Set(['for', 'with', 'under', 'above', 'in', 'of', 'and', 'a', 'an', 'the', 'ke', 'ka', 'ki', 'se', 'kam', 'zyada']);
    const words = sp.query.split(/\s+/)
      .map((w: string) => w.toLowerCase().trim())
      .filter((w: string) => w !== '' && !stopWords.has(w));

    if (words.length > 0) {
      broadFilter.$and = [];
      words.forEach((w: string) => {
        broadFilter.$and.push({
          $or: [
            { name: new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
            { description: new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
          ]
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

  return products;
}

export async function POST(req: Request) {
  try {
    const { query, originalQuery, lang } = await req.json();
    const userQuery = query || originalQuery;
    if (!userQuery) {
      return NextResponse.json({ message: 'Query is required' }, { status: 400 });
    }

    // Step 1: Call Llama model to extract structured parameters
    let aiResponse;
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        temperature: 0,
        max_tokens: 1000,
        messages: [
          { role: 'system', content: systemPrompt1 },
          { role: 'user', content: userQuery },
        ],
      });
      aiResponse = completion.choices[0]?.message?.content?.trim() || '{}';
    } catch (e) {
      // Fallback model if Llama 70b is rate-limited
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        temperature: 0,
        max_tokens: 1000,
        messages: [
          { role: 'system', content: systemPrompt1 },
          { role: 'user', content: userQuery },
        ],
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
        products = await queryCatalog(parsed.searchParams || {});
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
