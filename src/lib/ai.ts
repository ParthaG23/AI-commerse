import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API });

const VALID_CATEGORIES = [
  "Electronics",
  "Accessories",
  "Wearables",
  "Home & Kitchen",
  "Fashion",
  "Beauty",
  "Sports",
  "Toys",
  "Grocery",
  "Books",
] as const;

type ValidCategory = (typeof VALID_CATEGORIES)[number];

const QUERY_SYNONYMS: Array<{
  pattern: RegExp;
  canonical: string;
  category: ValidCategory;
  features?: string[];
}> = [
  // ── Phones ───────────────────────────────────────
  {
    pattern: /\b(?:smart\s*phones?|mobile\s*phones?|mobiles?|cell\s*phones?|android\s*phones?|android\s*mobiles?|iphones?|smartphones?)\b/,
    canonical: "phone",
    category: "Electronics",
  },
  {
    pattern: /\b(?:gaming\s*phones?|gaming\s*mobiles?|gaming\s*smartphones?)\b/,
    canonical: "phone",
    category: "Electronics",
    features: ["gaming"],
  },
  {
    pattern: /\b(?:5g\s*phones?|5g\s*mobiles?|5g\s*smartphones?)\b/,
    canonical: "phone",
    category: "Electronics",
    features: ["5G"],
  },
  {
    pattern: /\b(?:camera\s*phones?|best\s*camera\s*phones?)\b/,
    canonical: "phone",
    category: "Electronics",
    features: ["camera"],
  },
  // ── Phone brands (✅ removed standalone 'android' — too broad) ──────────
  {
    pattern: /\b(?:samsung|oneplus|redmi|poco|realme|vivo|oppo|motorola|nokia|iqoo|lava|micromax|nothing\s*phone)\b/,
    canonical: "phone",
    category: "Electronics",
  },
  // ── Laptops ──────────────────────────────────────
  {
    pattern: /\b(?:gaming\s*laptops?|gaming\s*notebooks?|gaming\s*pcs?)\b/,
    canonical: "laptop",
    category: "Electronics",
    features: ["gaming"],
  },
  {
    pattern: /\b(?:laptops?|notebooks?|ultrabooks?|chromebooks?|netbooks?|macbooks?|mac\s*books?)\b/,
    canonical: "laptop",
    category: "Electronics",
  },
  {
    pattern: /\b(?:business\s*laptops?|office\s*laptops?|work\s*laptops?)\b/,
    canonical: "laptop",
    category: "Electronics",
    features: ["business"],
  },
  // ── Tablets ──────────────────────────────────────
  {
    pattern: /\b(?:tablets?|ipads?|i\s*pads?|android\s*tablets?|kindles?|e[\s-]?readers?)\b/,
    canonical: "tablet",
    category: "Electronics",
  },
  // ── Audio ─────────────────────────────────────────
  {
    pattern: /\b(?:wireless\s*earphones?|bluetooth\s*earphones?|true\s*wireless|tws|earphones?|in[\s-]?ears?)\b/,
    canonical: "earphone",
    category: "Accessories",
    features: ["wireless"],
  },
  {
    pattern: /\b(?:wireless\s*headphones?|bluetooth\s*headphones?|over[\s-]?ears?|on[\s-]?ears?|headphones?)\b/,
    canonical: "headphone",
    category: "Accessories",
  },
  {
    pattern: /\b(?:noise[\s-]?cancell?ing|anc\s*headphones?|anc\s*earphones?)\b/,
    canonical: "headphone",
    category: "Accessories",
    features: ["ANC", "noise cancelling"],
  },
  {
    pattern: /\b(?:earbuds?|airpods?|galaxy\s*buds?|boat\s*airdopes?)\b/,
    canonical: "earphone",
    category: "Accessories",
  },
  {
    pattern: /\b(?:bluetooth\s*speakers?|portable\s*speakers?|wireless\s*speakers?|jbl|bose\s*speakers?|boat\s*speakers?)\b/,
    canonical: "speaker",
    category: "Accessories",
  },
  // ── Watches ──────────────────────────────────────
  {
    pattern: /\b(?:smart\s*watches?|smartwatches?|fitness\s*watches?|fitness\s*trackers?|fitness\s*bands?|mi\s*bands?|galaxy\s*watches?|apple\s*watches?|noise\s*watches?)\b/,
    canonical: "smartwatch",
    category: "Wearables",
  },
  // ── TVs ───────────────────────────────────────────
  {
    pattern: /\b(?:smart\s*tvs?|4k\s*tvs?|oled\s*tvs?|qled\s*tvs?|led\s*tvs?|televisions?|tvs?)\b/,
    canonical: "tv",
    category: "Electronics",
  },
  // ── Cameras ──────────────────────────────────────
  {
    pattern: /\b(?:dslr|mirrorless\s*camera|action\s*camera|gopro|webcam|digital\s*camera|camera)\b/,
    canonical: "camera",
    category: "Electronics",
  },
  // ── Fashion ──────────────────────────────────────
  {
    pattern: /\b(?:t[\s-]?shirt|tshirt|polo\s*shirt|shirt)\b/,
    canonical: "shirt",
    category: "Fashion",
  },
  {
    pattern: /\b(?:kurta|kurti|ethnic\s*wear|salwar\s*suit|anarkali)\b/,
    canonical: "kurta",
    category: "Fashion",
  },
  {
    pattern: /\b(?:jeans|denim|slim\s*fit\s*jeans|cargo\s*pants|trousers|chinos)\b/,
    canonical: "jeans",
    category: "Fashion",
  },
  {
    pattern: /\b(?:saree|sari|silk\s*saree|cotton\s*saree)\b/,
    canonical: "saree",
    category: "Fashion",
  },
  {
    pattern: /\b(?:dress|maxi\s*dress|western\s*dress|floral\s*dress)\b/,
    canonical: "dress",
    category: "Fashion",
  },
  {
    pattern: /\b(?:sneakers|shoes|running\s*shoes|sports\s*shoes|formal\s*shoes|sandals|slippers|heels)\b/,
    canonical: "shoes",
    category: "Fashion",
  },
  // ── Beauty ───────────────────────────────────────
  {
    pattern: /\b(?:lipstick|lip\s*gloss|lip\s*balm)\b/,
    canonical: "lipstick",
    category: "Beauty",
  },
  {
    pattern: /\b(?:face\s*serum|vitamin\s*c\s*serum|niacinamide|serum)\b/,
    canonical: "serum",
    category: "Beauty",
  },
  {
    pattern: /\b(?:sunscreen|spf|sun\s*protection|sunblock)\b/,
    canonical: "sunscreen",
    category: "Beauty",
  },
  {
    pattern: /\b(?:moisturizer|face\s*cream|night\s*cream|day\s*cream)\b/,
    canonical: "moisturizer",
    category: "Beauty",
  },
  // ── Sports ───────────────────────────────────────
  {
    pattern: /\b(?:dumbbell|barbell|weight|gym\s*equipment)\b/,
    canonical: "dumbbell",
    category: "Sports",
  },
  {
    pattern: /\b(?:yoga\s*mat|exercise\s*mat)\b/,
    canonical: "yoga mat",
    category: "Sports",
  },
  {
    pattern: /\b(?:cricket\s*bat|cricket\s*kit|cricket\s*ball)\b/,
    canonical: "cricket",
    category: "Sports",
  },
  // ── Home ─────────────────────────────────────────
  {
    pattern: /\b(?:pressure\s*cooker|air\s*fryer|mixer|blender|microwave|oven|induction)\b/,
    canonical: "kitchen appliance",
    category: "Home & Kitchen",
  },
  {
    pattern: /\b(?:sofa|couch|recliner)\b/,
    canonical: "sofa",
    category: "Home & Kitchen",
  },
  {
    pattern: /\b(?:mattress|bed|pillow|bedsheet|blanket)\b/,
    canonical: "bedding",
    category: "Home & Kitchen",
  },
];

const instructionSet: Record<string, string> = {
  extractSearchParams: `
You are a structured-data extractor for an Indian e-commerce search engine called Nuvix.
Given a natural-language query, return ONLY a valid JSON object (no markdown, no prose, no explanation).

Keys (all optional — only include if clearly present):
  "query"      — string  — the core product keyword for DB text search.
                           Use the most searchable single word or short phrase.
                           Examples: "phone" not "smartphone", "laptop" not "gaming laptop",
                           "earphone" not "wireless earphone", "headphone" not "noise cancelling headphone".
                           NEVER leave empty when a product is mentioned.
  "category"   — string  — one of: ${VALID_CATEGORIES.map((c) => `"${c}"`).join(", ")}
  "price_min"  — number  — minimum price in INR. Use ONLY for: above, over, more than, starting from, minimum, at least
  "price_max"  — number  — maximum price in INR. Use ONLY for: under, below, less than, within, upto, maximum, budget, cheaper than
  "features"   — string[] — specific attributes: ["gaming"], ["5G"], ["ANC"], ["wireless"], ["256GB"], etc.

PRICE RULES (critical — never swap these):
  "under 15000"             → { "price_max": 15000 }
  "below 70000"             → { "price_max": 70000 }
  "above 20000"             → { "price_min": 20000 }
  "between 10000 and 20000" → { "price_min": 10000, "price_max": 20000 }
  "around 50000"            → { "price_min": 45000, "price_max": 55000 }
  "₹70k" = 70000, "1.5 lakh" = 150000, "2L" = 200000

QUERY NORMALIZATION RULES:
  "smart phone"    → "phone"
  "mobile phone"   → "phone"
  "cell phone"     → "phone"
  "gaming laptop"  → query:"laptop", features:["gaming"]
  "wireless earphone" → query:"earphone", features:["wireless"]
  "noise cancelling headphone" → query:"headphone", features:["ANC","noise cancelling"]
  "smart watch"    → "smartwatch"
  "bluetooth speaker" → query:"speaker", features:["bluetooth"]
  "4K TV"          → query:"tv", features:["4K"]

CATEGORY RULES:
  phone/mobile/smartphone/samsung/oneplus/redmi → Electronics
  laptop/macbook/chromebook/notebook → Electronics
  headphone/earphone/speaker/buds/airpod → Accessories
  smartwatch/fitness band/mi band → Wearables
  shirt/kurta/dress/jeans/saree → Fashion
  lipstick/serum/sunscreen/moisturizer → Beauty
  dumbbell/yoga mat/cricket/sports → Sports
  sofa/mattress/pressure cooker/kitchen → Home & Kitchen

Output ONLY the JSON. Example:
{"query":"phone","category":"Electronics","price_max":15000}
`.trim(),

  classifyQuery: `
Classify the user query into exactly one of:
"general question" | "product description" | "review" | "product comparison" | "product recommendation"
Respond with ONLY the category name. No punctuation. No explanation.
`.trim(),

  generalAnswer: `
You are a helpful assistant for Nuvix, an Indian AI-powered e-commerce platform.
Answer concisely. If the question could be product-related, suggest they search on Nuvix.
`.trim(),
};

function extractJSON(raw: string): string {
  let s = raw.replace(/```(?:json)?\s*([\s\S]*?)```/gi, "$1").trim();
  const start = s.indexOf("{");
  const end   = s.lastIndexOf("}");
  if (start !== -1 && end > start) s = s.slice(start, end + 1);
  return s;
}

function parseIndianNumber(raw: string | number): number {
  if (typeof raw === "number") return Math.round(raw);
  const s = String(raw).replace(/[₹,\s]/g, "").toLowerCase();
  const crore = s.match(/^([\d.]+)\s*(?:cr|crore)$/);   if (crore) return Math.round(parseFloat(crore[1]) * 1_00_00_000);
  const lakh  = s.match(/^([\d.]+)\s*(?:l|lakh|lac)$/); if (lakh)  return Math.round(parseFloat(lakh[1])  * 1_00_000);
  const k     = s.match(/^([\d.]+)\s*k$/);               if (k)     return Math.round(parseFloat(k[1])     * 1_000);
  return Math.round(parseFloat(s)) || 0;
}

function sanitize(raw: Record<string, unknown>): SearchParams {
  const out: SearchParams = {};

  if (typeof raw.query === "string" && raw.query.trim())
    out.query = raw.query.trim().toLowerCase();

  if (typeof raw.category === "string") {
    const cat = VALID_CATEGORIES.find(
      (c) => c.toLowerCase() === String(raw.category).toLowerCase()
    );
    if (cat) out.category = cat;
  }

  if (raw.price_max != null) {
    const v = parseIndianNumber(raw.price_max as string | number);
    if (v > 0) out.price_max = v;
  }
  if (raw.price_min != null) {
    const v = parseIndianNumber(raw.price_min as string | number);
    if (v > 0) out.price_min = v;
  }

  // Auto-swap if AI reversed them
  if (out.price_min && out.price_max && out.price_min >= out.price_max)
    [out.price_min, out.price_max] = [out.price_max, out.price_min];

  if (Array.isArray(raw.features)) {
    const feats = (raw.features as unknown[])
      .filter((f): f is string => typeof f === "string" && f.trim() !== "")
      .map((f) => f.trim());
    if (feats.length) out.features = [...new Set(feats)];
  }

  return out;
}

function normalizeInput(q: string): string {
  return q
    .toLowerCase()
    .replace(/[₹,]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveSynonyms(q: string): Partial<SearchParams> & { _matched: boolean } {
  for (const entry of QUERY_SYNONYMS) {
    if (entry.pattern.test(q)) {
      return {
        _matched:  true,
        query:     entry.canonical,
        category:  entry.category,
        features:  entry.features,
      };
    }
  }
  return { _matched: false };
}

function extractPrice(q: string): Pick<SearchParams, "price_min" | "price_max"> {
  const result: Pick<SearchParams, "price_min" | "price_max"> = {};

  // between X and Y
  const between = q.match(
    /between\s*([\d.]+\s*(?:k|lakh|lac|l)?)\s*(?:and|to|-)\s*([\d.]+\s*(?:k|lakh|lac|l)?)/
  );
  if (between) {
    const a = parseIndianNumber(between[1]);
    const b = parseIndianNumber(between[2]);
    result.price_min = Math.min(a, b);
    result.price_max = Math.max(a, b);
    return result;
  }

  // price_max
  const maxMatch =
    q.match(/(?:under|below|upto|up\s*to|within|less\s*than|not\s*more\s*than|cheaper\s*than|maximum|max|budget\s*of|budget)\s*([\d.]+\s*(?:k|lakh|lac|l|cr|crore)?)/) ||
    q.match(/([\d.]+\s*(?:k|lakh|lac|l|cr|crore)?)\s*(?:budget|max|maximum)/);
  if (maxMatch) {
    const v = parseIndianNumber(maxMatch[1]);
    if (v > 0) result.price_max = v;
  }

  // price_min
  const minMatch =
    q.match(/(?:above|over|more\s*than|starting\s*from|minimum|min|at\s*least|greater\s*than)\s*([\d.]+\s*(?:k|lakh|lac|l|cr|crore)?)/) ||
    q.match(/([\d.]+\s*(?:k|lakh|lac|l|cr|crore)?)\s*(?:and\s*above|and\s*over|onwards)/);
  if (minMatch) {
    const v = parseIndianNumber(minMatch[1]);
    if (v > 0) result.price_min = v;
  }

  // around X → ±10%
  if (!result.price_max && !result.price_min) {
    const around = q.match(
      /(?:around|approximately|about|nearly|roughly)\s*([\d.]+\s*(?:k|lakh|lac|l)?)/
    );
    if (around) {
      const v = parseIndianNumber(around[1]);
      if (v > 0) {
        result.price_min = Math.round(v * 0.9);
        result.price_max = Math.round(v * 1.1);
      }
    }
  }

  return result;
}

async function groqai(action: string, prompt: string): Promise<string> {
  if (!action) throw new Error("groqai: action cannot be empty");
  if (!prompt) throw new Error("groqai: prompt cannot be empty");
  const instruction = instructionSet[action];
  if (!instruction) throw new Error(`groqai: unknown action "${action}"`);

  const completion = await groq.chat.completions.create({
    model:       "llama-3.1-8b-instant",
    temperature: 0,
    max_tokens:  256,
    messages: [
      { role: "system", content: instruction },
      { role: "user",   content: prompt },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() ?? "";
}

export interface SearchParams {
  category?: string;
  price_min?: number;
  price_max?: number;
  features?: string[];
  query?: string;
}

export async function getSearchParamsFromAI(query: string): Promise<SearchParams> {
  const normalized = normalizeInput(query);

  const synonymResult = resolveSynonyms(normalized);
  const priceResult   = extractPrice(normalized);

  const baseline: SearchParams = {
    ...(synonymResult._matched && synonymResult.query    ? { query:    synonymResult.query }    : {}),
    ...(synonymResult._matched && synonymResult.category ? { category: synonymResult.category } : {}),
    ...(synonymResult._matched && synonymResult.features ? { features: synonymResult.features } : {}),
    ...priceResult,
  };

  try {
    const aiRaw    = await groqai("extractSearchParams", normalized);
    const aiJSON   = extractJSON(aiRaw);
    const aiParsed = JSON.parse(aiJSON) as Record<string, unknown>;
    const aiResult = sanitize(aiParsed);

    const merged: SearchParams = {
      query: aiResult.query || (synonymResult._matched
        ? synonymResult.query
        : (normalized
            .replace(/(?:under|below|above|over|upto|within|less than|more than|starting from|around|budget of|between|and)\s*[\d.,]+\s*(?:k|lakh|lac|l|cr|crore)?/g, "")
            .trim() ||
          normalized)),

      category: aiResult.category || (synonymResult._matched ? synonymResult.category : undefined),

      ...(priceResult.price_max !== undefined
        ? { price_max: priceResult.price_max }
        : aiResult.price_max !== undefined
        ? { price_max: aiResult.price_max }
        : {}),
      ...(priceResult.price_min !== undefined
        ? { price_min: priceResult.price_min }
        : aiResult.price_min !== undefined
        ? { price_min: aiResult.price_min }
        : {}),

      features: [
        ...(synonymResult.features ?? []),
        ...(aiResult.features ?? []),
      ].filter((v, i, a) => a.indexOf(v) === i && v.trim() !== ""),
    };

    if (merged.features && merged.features.length === 0) delete merged.features;

    return sanitize(merged as Record<string, unknown>);

  } catch (error) {
    console.warn("[Nuvix] AI extraction failed, using baseline:", error);

    if (!baseline.query) {
      baseline.query = normalized
        .replace(/(?:under|below|above|over|upto|within|less\s*than|more\s*than|starting\s*from|around|budget\s*of|between|and)\s*[\d.,]+\s*(?:k|lakh|lac|l|cr|crore)?/g, "")
        .replace(/\s+/g, " ")
        .trim() || normalized;
    }

    return baseline;
  }
}

type QueryClass =
  | "general question"
  | "product description"
  | "review"
  | "product comparison"
  | "product recommendation";

export async function classifyQuery(query: string): Promise<QueryClass> {
  try {
    const result  = await groqai("classifyQuery", normalizeInput(query));
    const cleaned = result.trim().toLowerCase().replace(/['"`.]/g, "") as QueryClass;
    const valid: QueryClass[] = [
      "general question", "product description", "review",
      "product comparison", "product recommendation",
    ];
    return valid.includes(cleaned) ? cleaned : "product recommendation";
  } catch {
    return "product recommendation";
  }
}

export { groqai };