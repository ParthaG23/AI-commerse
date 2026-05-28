"""
Amazon Product Scraper — Mini Catalogue Builder
================================================
Scrapes publicly visible product listing data from Amazon (amazon.in)
for 6 consumer electronics categories.

Target categories: smartphones, laptops, tv, fridge, earphones, smartwatch

OUTPUT:
  - amazon_products.csv   : flat CSV with all products
  - amazon_products.json  : structured JSON nested by category

USAGE:
  pip install requests beautifulsoup4
  python amazon_scraper.py

DISCLAIMER:
  This script is for educational/research purposes only.
  Amazon's ToS prohibits commercial scraping. Use Amazon PA-API
  for production-grade data collection.
"""

import requests
from bs4 import BeautifulSoup
import json
import csv
import time
import random
import re
from datetime import datetime, timezone

# ─── Configuration ────────────────────────────────────────────────────────────

CATEGORIES = {
    "smartphone":  "s?k=smartphones&i=electronics",
    "laptop":      "s?k=laptops&i=computers",
    "tv":          "s?k=smart+tv+4k&i=electronics",
    "fridge":      "s?k=refrigerator&i=kitchen",
    "earphones":   "s?k=wireless+earphones&i=electronics",
    "smartwatch":  "s?k=smartwatch&i=electronics",
}

BASE_URL = "https://www.amazon.in/"
PAGES_PER_CATEGORY = 10          # scrape up to 10 pages (≈30 products/page)
DELAY_MIN = 2.5                 # seconds between requests (min)
DELAY_MAX = 4.5                 # seconds between requests (max)
OUTPUT_CSV  = "amazon_products.csv"
OUTPUT_JSON = "amazon_products.json"

HEADERS_POOL = [
    {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                      "AppleWebKit/537.36 (KHTML, like Gecko) "
                      "Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "en-IN,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "DNT": "1",
    },
    {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) "
                      "AppleWebKit/605.1.15 (KHTML, like Gecko) "
                      "Version/17.2 Safari/605.1.15",
        "Accept-Language": "en-GB,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Connection": "keep-alive",
    },
    {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) "
                      "AppleWebKit/537.36 (KHTML, like Gecko) "
                      "Chrome/121.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.8",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Connection": "keep-alive",
    },
]

# ─── Helpers ──────────────────────────────────────────────────────────────────

def get_headers():
    return random.choice(HEADERS_POOL)

def parse_price(price_str):
    if not price_str:
        return None
    cleaned = re.sub(r"[^\d]", "", price_str)
    return int(cleaned) if cleaned else None

def parse_rating(rating_str):
    if not rating_str:
        return None
    match = re.search(r"([\d.]+)", rating_str)
    return float(match.group(1)) if match else None

def parse_reviews(review_str):
    if not review_str:
        return None
    cleaned = re.sub(r"[^\d]", "", review_str)
    return int(cleaned) if cleaned else None

def extract_asin(url):
    match = re.search(r"/dp/([A-Z0-9]{10})", url)
    return match.group(1) if match else None

# ─── Core scraper ─────────────────────────────────────────────────────────────

def scrape_page(category_key, path, page=1):
    """Scrape one Amazon search results page. Returns list of product dicts."""
    products = []
    url = f"{BASE_URL}{path}&page={page}"
    print(f"  → Fetching {category_key} page {page}: {url}")

    try:
        session = requests.Session()
        resp = session.get(url, headers=get_headers(), timeout=15)
        if resp.status_code != 200:
            print(f"    ✗ HTTP {resp.status_code} — skipping page")
            return products

        soup = BeautifulSoup(resp.text, "html.parser")

        # Amazon product cards — multiple possible selectors
        cards = soup.select("div[data-component-type='s-search-result']")
        if not cards:
            # Fallback selector
            cards = soup.select("div.s-result-item[data-asin]")

        if not cards:
            print(f"    ✗ No product cards found (possible block or layout change)")
            return products

        print(f"    ✓ Found {len(cards)} cards")

        for card in cards:
            asin = card.get("data-asin", "")
            if not asin or asin == "AdHolder":
                # continue
                print('asin', asin)
                pass

            # Title
            title_el = (
                card.select_one("h2 span") or
                card.select_one("span.a-size-medium.a-color-base.a-text-normal") or
                card.select_one("span.a-size-base-plus.a-color-base.a-text-normal")
            )
            title = title_el.get_text(strip=True) if title_el else None
            if not title:
                continue

            # Price
            price_el = (
                card.select_one("span.a-price > span.a-offscreen") or
                card.select_one("span.a-price-whole")
            )
            price_raw = price_el.get_text(strip=True) if price_el else None
            price_inr = parse_price(price_raw)

            # Rating
            rating_el = card.select_one("span.a-size-small.a-color-base")
            rating = parse_rating(rating_el.get_text(strip=True) if rating_el else None)

            # Reviews
            reviews_el = (
                card.select_one("span.a-size-mini.puis-normal-weight-text.s-underline-text") or
                card.select_one("a.a-link-normal span.a-size-base")
            )
            num_reviews = parse_reviews(reviews_el.get_text(strip=True) if reviews_el else None)

            # URL
            link_el = card.select_one("a.a-link-normal.s-line-clamp-2")
            relative_url = link_el.get("href", "") if link_el else ""
            product_url = f"https://www.amazon.in{relative_url}" if relative_url else None

            # Image
            img_el = card.select_one("img.s-image")
            img_url = img_el.get("src", "")


            products.append({
                "category": category_key,
                "title": title,
                "price_inr": price_inr,
                "rating": rating,
                "num_reviews": num_reviews,
                "asin": asin,
                "url": product_url,
                "img": img_url,
                "scraped_at": datetime.now(timezone.utc).isoformat() + "Z",
            })

    except requests.exceptions.RequestException as e:
        print(f"    ✗ Request error: {e}")
    except Exception as e:
        print(f"    ✗ Parse error: {e}")

    print(len(products))
    return products


def scrape_category(category_key, path):
    """Scrape multiple pages for one category."""
    all_products = []
    for page in range(1, PAGES_PER_CATEGORY + 1):
        products = scrape_page(category_key, path, page)
        all_products.extend(products)
        if page < PAGES_PER_CATEGORY:
            delay = random.uniform(DELAY_MIN, DELAY_MAX)
            print(f"    ⏳ Waiting {delay:.1f}s before next page...")
            time.sleep(delay)
    return all_products


# ─── Output writers ───────────────────────────────────────────────────────────

def save_csv(products, filepath):
    if not products:
        print("⚠  No products to save to CSV")
        return
    fieldnames = ["category", "title", "price_inr", "rating", "num_reviews", "asin", "url", "img", "scraped_at"]
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(products)
    print(f"✅ CSV saved: {filepath} ({len(products)} records)")


def save_json(products, filepath):
    if not products:
        print("⚠  No products to save to JSON")
        return
    # Nest by category
    nested = {}
    for p in products:
        cat = p["category"]
        if cat not in nested:
            nested[cat] = []
        nested[cat].append(p)

    output = {
        "metadata": {
            "scraped_at": datetime.now(timezone.utc).isoformat() + "Z",
            "source": "amazon.in",
            "categories": list(nested.keys()),
            "total_products": len(products),
        },
        "products_by_category": nested,
        "all_products": products,
    }
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"✅ JSON saved: {filepath} ({len(products)} records)")


# ─── Demo data fallback ───────────────────────────────────────────────────────
# If Amazon blocks all requests, use this realistic demo data so downstream
# applications still have something to work with.

DEMO_PRODUCTS = [
    {"category":"smartphone","title":"Samsung Galaxy S24 Ultra 5G (Titanium Black, 256GB)","price_inr":109999,"rating":4.4,"num_reviews":12843,"asin":"B0CMDV8GJ3","url":"https://www.amazon.in/dp/B0CMDV8GJ3","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},#
    {"category":"smartphone","title":"Apple iPhone 16 Pro (Natural Titanium, 128GB)","price_inr":119900,"rating":4.6,"num_reviews":8721,"asin":"B0D78NZBYH","url":"https://www.amazon.in/dp/B0D78NZBYH","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"smartphone","title":"OnePlus 12 5G (Silky Black, 256GB)","price_inr":64999,"rating":4.3,"num_reviews":23156,"asin":"B0CQNK89DB","url":"https://www.amazon.in/dp/B0CQNK89DB","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"smartphone","title":"Xiaomi 14 5G (Black, 512GB)","price_inr":69999,"rating":4.2,"num_reviews":5402,"asin":"B0CV3H2TMS","url":"https://www.amazon.in/dp/B0CV3H2TMS","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"smartphone","title":"Realme GT 6T 5G (Fluid Silver, 256GB)","price_inr":29999,"rating":4.1,"num_reviews":7834,"asin":"B0D3FGKRS7","url":"https://www.amazon.in/dp/B0D3FGKRS7","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"laptop","title":"Apple MacBook Air M3 13-inch (Space Grey, 16GB RAM, 512GB SSD)","price_inr":119900,"rating":4.7,"num_reviews":3412,"asin":"B0CX24VBLX","url":"https://www.amazon.in/dp/B0CX24VBLX","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"laptop","title":"ASUS ROG Strix G16 (2024) Core i7-14650HX, RTX 4070, 16GB, 512GB SSD","price_inr":134990,"rating":4.3,"num_reviews":1923,"asin":"B0CW77XNKB","url":"https://www.amazon.in/dp/B0CW77XNKB","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"laptop","title":"Lenovo IdeaPad Slim 3 Core i5-1235U 16GB RAM 512GB SSD","price_inr":42990,"rating":4.2,"num_reviews":8721,"asin":"B0BXK5VD1S","url":"https://www.amazon.in/dp/B0BXK5VD1S","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"laptop","title":"HP Pavilion 15 Core i5-13500H 16GB 512GB SSD NVIDIA RTX 2050","price_inr":67990,"rating":4.1,"num_reviews":4502,"asin":"B0CHW5PSCF","url":"https://www.amazon.in/dp/B0CHW5PSCF","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"laptop","title":"Dell Inspiron 15 Core i5-1335U 16GB 512GB SSD Intel Iris Xe","price_inr":56990,"rating":4.3,"num_reviews":6103,"asin":"B0C4S7V5RS","url":"https://www.amazon.in/dp/B0C4S7V5RS","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"tv","title":"Samsung 139cm (55\") Crystal iSmart 4K Ultra HD Smart LED TV (2024 Edition)","price_inr":54990,"rating":4.3,"num_reviews":9812,"asin":"B0CNR3VC4D","url":"https://www.amazon.in/dp/B0CNR3VC4D","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"tv","title":"LG 139 cm (55 inches) 4K Ultra HD Smart OLED evo TV AI ThinQ","price_inr":139999,"rating":4.5,"num_reviews":3201,"asin":"B0C79HLCYL","url":"https://www.amazon.in/dp/B0C79HLCYL","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"tv","title":"Sony Bravia 139 cm (55 inches) XR 4K OLED Smart Google TV","price_inr":199990,"rating":4.6,"num_reviews":1402,"asin":"B0BW5LWFVL","url":"https://www.amazon.in/dp/B0BW5LWFVL","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"tv","title":"Redmi 108 cm (43 inches) 4K Ultra HD Android Smart LED TV X43","price_inr":24999,"rating":4.1,"num_reviews":34512,"asin":"B09FG5BNBF","url":"https://www.amazon.in/dp/B09FG5BNBF","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"tv","title":"OnePlus 139 cm (55 inches) Y Series 4K Ultra HD Smart Android LED TV","price_inr":39999,"rating":4.2,"num_reviews":12034,"asin":"B09G14KNSW","url":"https://www.amazon.in/dp/B09G14KNSW","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"fridge","title":"Samsung 653L Frost Free Side-by-Side Refrigerator with SpaceMax Technology","price_inr":99990,"rating":4.4,"num_reviews":2134,"asin":"B09YBK4MG3","url":"https://www.amazon.in/dp/B09YBK4MG3","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"fridge","title":"LG 272L Frost Free Double Door 3 Star Refrigerator (Shiny Steel)","price_inr":32990,"rating":4.3,"num_reviews":8934,"asin":"B09HGVNCK3","url":"https://www.amazon.in/dp/B09HGVNCK3","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"fridge","title":"Haier 195L 4 Star Direct Cool Single Door Refrigerator","price_inr":15290,"rating":4.2,"num_reviews":18432,"asin":"B08WS66ZRW","url":"https://www.amazon.in/dp/B08WS66ZRW","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"fridge","title":"Whirlpool 340L Frost Free Triple Door Refrigerator (Alpha Steel)","price_inr":44990,"rating":4.1,"num_reviews":5123,"asin":"B09KHTJWR5","url":"https://www.amazon.in/dp/B09KHTJWR5","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"fridge","title":"Godrej 190L 5 Star Inverter Direct-Cool Single Door Refrigerator","price_inr":16490,"rating":4.3,"num_reviews":12045,"asin":"B08GWVQZGK","url":"https://www.amazon.in/dp/B08GWVQZGK","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"earphones","title":"Sony WF-1000XM5 True Wireless Noise Cancelling Earbuds (Black)","price_inr":19990,"rating":4.4,"num_reviews":7832,"asin":"B0C33XXPZB","url":"https://www.amazon.in/dp/B0C33XXPZB","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"earphones","title":"boAt Airdopes 131 Bluetooth Truly Wireless Earbuds with 8HRS Playback","price_inr":999,"rating":4.1,"num_reviews":89432,"asin":"B07QGMZ7CS","url":"https://www.amazon.in/dp/B07QGMZ7CS","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"earphones","title":"Samsung Galaxy Buds2 Pro (Bora Purple) True Wireless Earbuds","price_inr":14999,"rating":4.3,"num_reviews":13401,"asin":"B0B2LKGP3Y","url":"https://www.amazon.in/dp/B0B2LKGP3Y","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"earphones","title":"Apple AirPods Pro (2nd Generation) with USB-C MagSafe Case","price_inr":24900,"rating":4.6,"num_reviews":5423,"asin":"B0BDHB9Y8H","url":"https://www.amazon.in/dp/B0BDHB9Y8H","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"earphones","title":"OnePlus Buds 3 ANC True Wireless Earbuds (Harmonic White)","price_inr":4999,"rating":4.2,"num_reviews":23012,"asin":"B0CQ19GMZC","url":"https://www.amazon.in/dp/B0CQ19GMZC","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"smartwatch","title":"Apple Watch Series 10 GPS 42mm Jet Black Aluminium Case","price_inr":41900,"rating":4.6,"num_reviews":2134,"asin":"B0D4RH2N9C","url":"https://www.amazon.in/dp/B0D4RH2N9C","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"smartwatch","title":"Samsung Galaxy Watch 7 44mm (Green) Bluetooth Smart Watch","price_inr":22999,"rating":4.3,"num_reviews":6821,"asin":"B0D1ZC3ZCF","url":"https://www.amazon.in/dp/B0D1ZC3ZCF","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"smartwatch","title":"boAt Wave Sigma 1.85\" Display Bluetooth Calling Smartwatch","price_inr":1199,"rating":4.0,"num_reviews":45032,"asin":"B0BVXR8PM4","url":"https://www.amazon.in/dp/B0BVXR8PM4","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"smartwatch","title":"Noise ColorFit Pro 5 Max 1.85\" AMOLED Display Bluetooth Calling Smartwatch","price_inr":2499,"rating":4.1,"num_reviews":31245,"asin":"B0C8M4XFLS","url":"https://www.amazon.in/dp/B0C8M4XFLS","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
    {"category":"smartwatch","title":"Garmin Forerunner 265 Running Smartwatch AMOLED Display HR","price_inr":45990,"rating":4.5,"num_reviews":1823,"asin":"B0BVH3YCGB","url":"https://www.amazon.in/dp/B0BVH3YCGB","scraped_at":datetime.now(timezone.utc).isoformat()+"Z"},
]


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("Amazon Product Scraper — Mini Catalogue Builder")
    print("=" * 60)

    all_products = []

    for cat_key, path in CATEGORIES.items():
        print(f"\n📦 Category: {cat_key.upper()}")
        products = scrape_category(cat_key, path)
        all_products.extend(products)
        print(f"   ✓ Collected {len(products)} products for {cat_key}")

        # Delay between categories
        if cat_key != list(CATEGORIES.keys())[-1]:
            delay = random.uniform(3.0, 5.0)
            print(f"   ⏳ Waiting {delay:.1f}s before next category...")
            time.sleep(delay)

    # If scraping returned nothing (blocked), fall back to demo data
    if not all_products:
        print("\n⚠  Live scraping returned no results (Amazon may have blocked requests).")
        print("   Using representative demo dataset instead.")
        all_products = DEMO_PRODUCTS

    print(f"\n{'=' * 60}")
    print(f"Total products collected: {len(all_products)}")
    print(f"{'=' * 60}\n")

    # Save outputs
    save_csv(all_products, OUTPUT_CSV)
    save_json(all_products, OUTPUT_JSON)

    # Summary by category
    print("\n📊 Summary by Category:")
    from collections import Counter
    counts = Counter(p["category"] for p in all_products)
    for cat, count in counts.items():
        print(f"  {cat:<15} {count:>3} products")

    print("\n✅ Done! Check amazon_products.csv and amazon_products.json")


if __name__ == "__main__":
    main()
