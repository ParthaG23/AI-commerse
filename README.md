# Nuvix AI-Commerce Platform

An intelligent, AI-powered e-commerce marketplace designed for hyper-personalized shopping experiences, natural-language micro-interactions, and side-by-side product comparisons. Built with Next.js (App Router), React, MongoDB, and powered by Groq AI (Llama-3.1).

---

## 🌟 Key Features

### 🤖 Intelligent Co-Shopper (AI Chatbot)
- **Natural Language Understanding**: Parse complex multi-intent requests (e.g., *"Find smartphones under 15k with 5G"*, *"Laptops under 70k for gaming"*).
- **Automated Parameter Extraction**: Extracts category, subcategory, minimum/maximum budgets, and specific feature sets on the fly.
- **Smart Synonym Processing**: Seamlessly maps slang and regional specifications to canonical terms (e.g., *"₹15k"*, *"70k"*, *"1.5 lakh"*, *"wireless earphones"*, *"true wireless"*).
- **Voice Search Integration**: Fully hands-free search experience utilizing native Web Speech Recognition APIs (`SpeechRecognition` / `webkitSpeechRecognition`).

### 🔍 Strict Semantic Search Engine
- **Zero False-Positives**: Leverages a two-tiered categorization pipeline (`category` and `subcategory`) to isolate products precisely.
- **Feature & Brand Intersection**: Prevents accessories, routers, portable monitors, and compatibility mentions from polluting main product searches (e.g., searching for "phones" returns only actual smartphones, completely excluding TV sticks or router dongles).
- **Dynamic Caching Control**: Built-in server-side endpoint dynamic configuration ensures live catalog search results without Next.js query caching latency.

### 📊 Premium Shopping Experience
- **Interactive Side-by-Side Comparison**: Select up to two products and compare their price, ratings, stock, and features instantly in a clean side-by-side modal.
- **Deep AI Comparison**: Automatically analyze compared products with the AI co-shopper to highlight value-for-money metrics and get direct purchase recommendations.
- **Adaptive Design System**: Stunning glassmorphism UI designed for both light and dark modes, utilizing standard Tailwind CSS styles and modern micro-animations.

---

## 🛠 Tech Stack & Architecture

- **Frontend Core**: [Next.js 16 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Lucide Icons](https://lucide.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (highly scalable, lightweight client stores)
- **Database & Modeling**: [MongoDB](https://www.mongodb.com/) & [Mongoose ORM](https://mongoosejs.com/)
- **AI Core**: [Groq SDK](https://groq.com/) (Llama-3.1-8B-Instant engine with structured extraction JSON outputs)

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v20` or higher
- **MongoDB Atlas** database cluster (or local MongoDB URI instance)
- **Groq API Key** (obtain free from [console.groq.com](https://console.groq.com/))

### 2. Environment Variables Configuration
Create a `.env.local` file in the root directory and specify the following keys:

```ini
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?appName=<cluster-name>
PORT=5000
JWT_SECRET=d0f7570676cb723aeJKIKlofbee58be7ea126437d9220a8272c27050ff0ec223fe470afd0272c29fb785e6a3f832215d5f8e30ef6
GROQ_API=gsk_your_groq_api_key_here
```

### 3. Installation
Install the project dependencies using your package manager:

```bash
npm install
```

### 4. Database Seeding
To populate the database with Nuvix's complete premium catalog (6,790+ pre-formatted products with subcategory indices, real images, and generated buyer reviews), run the scraper-seeding script:

```bash
npm run seed-scraped
```

### 5. Running in Development
Start the local development server:

```bash
npm run dev
```

Your server will be running live on [http://localhost:3000](http://localhost:3000).

### 6. Production Builds
Compile and build the application for optimized production serving:

```bash
npm run build
npm run start
```

---

## 📂 Project Structure

```text
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai-search/    # AI parameter extraction endpoint
│   │   │   └── products/     # Strict database filtering search API
│   │   ├── components/       # Main layout, chatbot panels, header navigation
│   │   ├── shop/             # Product catalog grid, list views, comparisons
│   │   ├── store/            # Client state stores (Zustand) for auth, cart, chat
│   │   ├── globals.css       # Core Tailwind CSS directives & theme configurations
│   │   └── page.tsx          # Homepage with category showcases
│   ├── lib/
│   │   ├── ai.ts             # Groq API configuration & synonym parsers
│   │   └── mongodb.ts        # Database connection state helper
│   ├── models/
│   │   └── Product.ts        # Mongoose schema definitions (indexed category fields)
│   └── scripts/
│       └── seedScraped.ts    # Automated premium Amazon scraped data uploader
```

---

## 🛡 Production & Performance Best Practices

- **Strict Subcategory Indexes**: The MongoDB schema enforces a text index on `name` and a single-field index on `subcategory` to deliver sub-millisecond lookups on search queries.
- **Dynamic Headers**: The `/api/products` endpoint forces dynamic execution (`export const dynamic = 'force-dynamic'`) to eliminate stale cache state in serverless runtime environments.
- **Debounced Input handlers**: Inputs are optimally designed inside React components to focus dynamically and avoid losing cursor alignment during rapid-fire keystroke processes.
