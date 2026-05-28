import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const KEYWORD_EXPANSIONS: Record<string, string[]> = {
  // ✅ Removed 'android' — too generic, matches smartwatch/tablet descriptions
  phone:       ['phone', 'smartphone', 'mobile', 'iphone'],
  smartphone:  ['phone', 'smartphone', 'mobile'],
  mobile:      ['mobile', 'phone', 'smartphone'],
  laptop:      ['laptop', 'notebook', 'macbook', 'chromebook', 'ultrabook'],
  notebook:    ['laptop', 'notebook'],
  earphone:    ['earphone', 'earbud', 'airpod', 'tws', 'in-ear'],
  headphone:   ['headphone', 'headset'],
  speaker:     ['speaker', 'soundbar'],
  smartwatch:  ['smartwatch', 'smart watch', 'fitness band', 'fitness tracker'],
  watch:       ['watch', 'smartwatch'],
  tv:          ['tv', 'television', 'smart tv'],
  tablet:      ['tablet', 'ipad'],
  camera:      ['camera', 'dslr', 'mirrorless'],
  shirt:       ['shirt', 't-shirt', 'tshirt', 'polo'],
  kurta:       ['kurta', 'kurti'],
  shoes:       ['shoes', 'sneakers', 'footwear', 'sandals'],
  dumbbell:    ['dumbbell', 'barbell', 'weight'],
  router:      ['router', 'wi-fi', 'wifi'],
};

const KEYWORD_SUBCATEGORIES: Record<string, string[]> = {
  phone:       ['smartphone'],
  smartphone:  ['smartphone'],
  mobile:      ['smartphone'],
  laptop:      ['laptop', 'gaming_laptop'],
  notebook:    ['laptop'],
  tablet:      ['tablet'],
  smartwatch:  ['smartwatch', 'fitness_tracker'],
  watch:       ['smartwatch'],
  tv:          ['smart_tv'],
  television:  ['smart_tv'],
  camera:      ['camera'],
  router:      ['router'],
  earphone:    ['headphones', 'earbuds'],
  headphone:   ['headphones'],
  keyboard:    ['keyboard'],
  mouse:       ['mouse'],
  shirt:       ['men_tshirt'],
  kurta:       ['kurta'],
  shoes:       ['men_shoes', 'women_shoes'],
  backpack:    ['backpack'],
  sunglasses:  ['sunglasses'],
};

const KEYWORD_EXCLUSIONS: Record<string, string[]> = {
  phone: [
    'router', 'monitor', 'tv', 'television', 'controller', 'gamepad', 'joystick',
    'adapter', 'dongle', 'ups', 'game stick', 'stand', 'mount', 'holder',
    'case', 'cover', 'glass', 'protector', 'cable', 'charger', 'lens',
    'headphone', 'earphone', 'headset', 'mic', 'microphone', 'speaker', 'watch', 'smartwatch'
  ],
  smartphone: [
    'router', 'monitor', 'tv', 'television', 'controller', 'gamepad', 'joystick',
    'adapter', 'dongle', 'ups', 'game stick', 'stand', 'mount', 'holder',
    'case', 'cover', 'glass', 'protector', 'cable', 'charger', 'lens',
    'headphone', 'earphone', 'headset', 'mic', 'microphone', 'speaker', 'watch', 'smartwatch'
  ],
  mobile: [
    'router', 'monitor', 'tv', 'television', 'controller', 'gamepad', 'joystick',
    'adapter', 'dongle', 'ups', 'game stick', 'stand', 'mount', 'holder',
    'case', 'cover', 'glass', 'protector', 'cable', 'charger', 'lens',
    'headphone', 'earphone', 'headset', 'mic', 'microphone', 'speaker', 'watch', 'smartwatch'
  ],
  laptop: [
    'router', 'monitor', 'tv', 'television', 'controller', 'gamepad', 'joystick',
    'adapter', 'dongle', 'ups', 'game stick', 'stand', 'mount', 'holder',
    'bag', 'sleeve', 'case', 'cover', 'dock', 'hub', 'cooling', 'keyboard', 'mouse'
  ],
  notebook: [
    'router', 'monitor', 'tv', 'television', 'controller', 'gamepad', 'joystick',
    'adapter', 'dongle', 'ups', 'game stick', 'stand', 'mount', 'holder',
    'bag', 'sleeve', 'case', 'cover', 'dock', 'hub', 'cooling', 'keyboard', 'mouse'
  ],
};

function buildSearchOr(rawSearch: string): object[] {
  const term = rawSearch.trim().toLowerCase();
  const expansions = KEYWORD_EXPANSIONS[term] ?? [term];

  // ✅ Word boundaries prevent 'phone' matching 'headphone', 'earphone' etc.
  const combined = expansions
    .map((k) => `\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`)
    .join('|');
  const regex = new RegExp(`(${combined})`, 'i');

  const conditions: Record<string, any> = { name: { $regex: regex } };

  const exclusionsSet = new Set<string>();
  const termsToCheck = [term, ...expansions];
  for (const t of termsToCheck) {
    const exc = KEYWORD_EXCLUSIONS[t];
    if (exc) {
      exc.forEach(e => exclusionsSet.add(e));
    }
  }

  if (exclusionsSet.size > 0) {
    const exclPattern = Array.from(exclusionsSet)
      .map(e => `\\b${e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`)
      .join('|');
    const exclRegex = new RegExp(`(${exclPattern})`, 'i');
    conditions.name.$not = exclRegex;
  }

  return [conditions];
}

export async function GET(req: Request) {
  await dbConnect();

  try {
    const url = new URL(req.url);
    const sp  = url.searchParams;

    const category  = sp.get('category')?.trim() || null;
    const price_max = sp.get('price_max')         || null;
    const price_min = sp.get('price_min')         || null;
    const limit     = Math.min(parseInt(sp.get('limit') || '40', 10), 100);
    const sortParam = sp.get('sort') || 'relevance';

    // Accept both "query" and "search" param names
    const search = (sp.get('query') || sp.get('search') || '').trim();

    const filter: Record<string, unknown> = {};

    // Category — strict exact match
    if (category) {
      filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    // Price range
    if (price_min || price_max) {
      const priceFilter: Record<string, number> = {};
      if (price_min) priceFilter.$gte = Number(price_min);
      if (price_max) priceFilter.$lte = Number(price_max);
      filter.price = priceFilter;
    }

    // ✅ Search — wrapped in $and so it is strictly required
    if (search) {
      const term = search.toLowerCase();
      
      // Let's see if the term matches any exact subcategory keyword
      let subcats: string[] = [];
      
      if (KEYWORD_SUBCATEGORIES[term]) {
        subcats = KEYWORD_SUBCATEGORIES[term];
      } else {
        // Check if any subcategory keyword is contained as a distinct word in the search query
        const words = term.split(/\s+/);
        for (const w of words) {
          if (KEYWORD_SUBCATEGORIES[w]) {
            subcats = KEYWORD_SUBCATEGORIES[w];
            break;
          }
        }
      }

      if (subcats.length > 0) {
        // Strictly filter by subcategory!
        filter.subcategory = { $in: subcats };
        
        // If there are other words (e.g. brand "samsung" in "samsung phone"), search for them in name!
        const words = search.split(/\s+/).filter(w => {
          const lower = w.toLowerCase();
          return !KEYWORD_SUBCATEGORIES[lower] && lower !== 'under' && lower !== 'below' && lower !== 'above' && lower !== 'for';
        });
        if (words.length > 0) {
          const brandRegex = new RegExp(words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');
          filter.name = { $regex: brandRegex };
        }
      } else {
        // Fallback to name regex search
        filter.$and = [
          { $or: buildSearchOr(search) },
        ];
      }
    }

    let sortOption: Record<string, 1 | -1> = {};
    switch (sortParam) {
      case 'price_asc':  sortOption = { price: 1 };     break;
      case 'price_desc': sortOption = { price: -1 };    break;
      case 'rating':     sortOption = { ratings: -1 };  break;
      default:           sortOption = { ratings: -1, price: 1 }; break;
    }

    const products = await Product.find(filter)
      .sort(sortOption)
      .limit(limit)
      .lean();

    return NextResponse.json(
      {
        products,
        total:  products.length,
        filter: {
          category:  category  || null,
          search:    search    || null,
          price_min: price_min ? Number(price_min) : null,
          price_max: price_max ? Number(price_max) : null,
        },
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('[/api/products] Error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}