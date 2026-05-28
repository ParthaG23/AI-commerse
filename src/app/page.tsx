'use client';

import Link from 'next/link';
import { useAuthStore } from './store/auth';
import ShopPage from './shop/page';
import { useIsMounted } from './hooks/useIsMounted';
import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Smartphone, Laptop, Headphones, Watch, Tv, Camera,
  ChevronLeft, ChevronRight, Zap, ShieldCheck, Truck,
  Sparkles, ArrowRight, Star, TrendingUp, Bot,
  Flame, Clock, BadgePercent, Shirt, Sofa, Dumbbell,
  Baby, ShoppingBasket, BookOpen, Palette, Gem,
} from 'lucide-react';

/* ─────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────── */
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  ratings: number;
}

/* ─────────────────────────────────────────────────
   MOCK DATA — non-electronic categories
   (shown while real API has no such data yet)
───────────────────────────────────────────────── */
const FASHION_MOCK: Product[] = [
  { _id: 'f1', name: 'Classic Slim Fit Oxford Shirt — Navy Blue', description: '', price: 899,  images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80'], category: 'Fashion', stock: 50, ratings: 4.3 },
  { _id: 'f2', name: 'Women\'s Floral Kurta Set with Dupatta', description: '', price: 1199, images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&q=80'], category: 'Fashion', stock: 30, ratings: 4.5 },
  { _id: 'f3', name: 'Men\'s Cargo Jogger Pants — Olive Green', description: '', price: 749,  images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80'], category: 'Fashion', stock: 45, ratings: 4.1 },
  { _id: 'f4', name: 'Women\'s Printed Maxi Dress — Boho Summer', description: '', price: 1349, images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80'], category: 'Fashion', stock: 20, ratings: 4.6 },
];

const BEAUTY_MOCK: Product[] = [
  { _id: 'b1', name: 'Lakme Absolute Matte Lipstick — Rose Bud', description: '', price: 599,  images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80'], category: 'Beauty', stock: 100, ratings: 4.4 },
  { _id: 'b2', name: 'Minimalist 10% Niacinamide Face Serum 30ml', description: '', price: 399,  images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80'], category: 'Beauty', stock: 80,  ratings: 4.7 },
  { _id: 'b3', name: 'Mamaearth Vitamin C Sunscreen SPF 50 PA+++', description: '', price: 299,  images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80'], category: 'Beauty', stock: 120, ratings: 4.2 },
  { _id: 'b4', name: 'Forest Essentials Facial Tonic Mist — Rose', description: '', price: 1250, images: ['https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80'], category: 'Beauty', stock: 35,  ratings: 4.5 },
];

const HOME_MOCK: Product[] = [
  { _id: 'h1', name: 'Wakefit Orthopaedic Memory Foam Pillow (Set of 2)', description: '', price: 1299, images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80'], category: 'Home', stock: 60,  ratings: 4.4 },
  { _id: 'h2', name: 'Prestige Stainless Steel 5-Litre Pressure Cooker', description: '', price: 1849, images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80'], category: 'Home', stock: 45,  ratings: 4.6 },
  { _id: 'h3', name: 'Philips LED Smart Bulb 9W — Works with Alexa', description: '', price: 499,  images: ['https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&q=80'], category: 'Home', stock: 200, ratings: 4.3 },
  { _id: 'h4', name: 'Wooden 6-Seater Dining Table with Cushioned Chairs', description: '', price: 24999, images: ['https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=400&q=80'], category: 'Home', stock: 8,   ratings: 4.7 },
];

const SPORTS_MOCK: Product[] = [
  { _id: 's1', name: 'Cosco Durable Leather Football — Size 5', description: '', price: 699,  images: ['https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400&q=80'], category: 'Sports', stock: 80,  ratings: 4.3 },
  { _id: 's2', name: 'Strauss Adjustable Dumbbell Set 2–10 kg', description: '', price: 2499, images: ['https://images.unsplash.com/photo-1584466977773-e625c37cdd50?w=400&q=80'], category: 'Sports', stock: 30,  ratings: 4.5 },
  { _id: 's3', name: 'Nivia Storm Basketball — Official Size', description: '', price: 899,  images: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&q=80'], category: 'Sports', stock: 55,  ratings: 4.2 },
  { _id: 's4', name: 'Boldfit Pro Yoga Mat 6mm Non-Slip with Carry Bag', description: '', price: 599,  images: ['https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=400&q=80'], category: 'Sports', stock: 90,  ratings: 4.4 },
];

/* ─────────────────────────────────────────────────
   CATEGORY SHOWCASE CONFIG
───────────────────────────────────────────────── */
const CATEGORY_SECTIONS = [
  /* ── ELECTRONICS ── */
  {
    id: 'mobiles', label: 'Top Mobiles', eyebrow: 'Trending Now', query: 'Electronics',
    filter: (p: Product) => !!p.name.toLowerCase().match(/phone|poco|redmi|samsung|iphone|nothing|motorola|realme|oneplus|vivo|oppo/),
    accent: '#4f46e5', accentBg: 'rgba(79,70,229,0.08)', icon: Smartphone,
    badge: { icon: Flame, label: 'Hot Deals', color: '#ef4444', bg: 'rgba(239,68,68,0.10)' },
    mockData: null as Product[] | null,
  },
  {
    id: 'laptops', label: 'Best Laptops', eyebrow: 'Work & Play', query: 'Electronics',
    filter: (p: Product) => !!p.name.toLowerCase().match(/laptop|macbook|book|chromebook|vivobook|inspiron|thinkpad|pavilion/),
    accent: '#0891b2', accentBg: 'rgba(8,145,178,0.08)', icon: Laptop,
    badge: { icon: TrendingUp, label: 'Best Sellers', color: '#0891b2', bg: 'rgba(8,145,178,0.10)' },
    mockData: null as Product[] | null,
  },
  {
    id: 'audio', label: 'Audio & Sound', eyebrow: 'Hear the Difference', query: 'Accessories',
    filter: (p: Product) => !!p.name.toLowerCase().match(/headphone|earphone|speaker|buds|airpod|sound|audio|bose|sony|jbl|boat|skullcandy/),
    accent: '#7c3aed', accentBg: 'rgba(124,58,237,0.08)', icon: Headphones,
    badge: { icon: BadgePercent, label: 'Extra 5% Off', color: '#7c3aed', bg: 'rgba(124,58,237,0.10)' },
    mockData: null as Product[] | null,
  },
  {
    id: 'wearables', label: 'Wearables', eyebrow: 'Smart on Your Wrist', query: 'Wearables',
    filter: (_p: Product) => true,
    accent: '#059669', accentBg: 'rgba(5,150,105,0.08)', icon: Watch,
    badge: { icon: Clock, label: 'New Arrivals', color: '#059669', bg: 'rgba(5,150,105,0.10)' },
    mockData: null as Product[] | null,
  },
  /* ── LIFESTYLE ── */
  {
    id: 'fashion', label: 'Fashion', eyebrow: 'Style & Trends', query: 'Fashion',
    filter: (_p: Product) => true,
    accent: '#db2777', accentBg: 'rgba(219,39,119,0.08)', icon: Shirt,
    badge: { icon: Sparkles, label: 'New Season', color: '#db2777', bg: 'rgba(219,39,119,0.10)' },
    mockData: FASHION_MOCK,
  },
  {
    id: 'beauty', label: 'Beauty & Skincare', eyebrow: 'Glow Up', query: 'Beauty',
    filter: (_p: Product) => true,
    accent: '#e11d48', accentBg: 'rgba(225,29,72,0.08)', icon: Palette,
    badge: { icon: Gem, label: 'Premium Picks', color: '#e11d48', bg: 'rgba(225,29,72,0.10)' },
    mockData: BEAUTY_MOCK,
  },
  {
    id: 'home', label: 'Home & Furniture', eyebrow: 'For Your Space', query: 'Home',
    filter: (_p: Product) => true,
    accent: '#d97706', accentBg: 'rgba(217,119,6,0.08)', icon: Sofa,
    badge: { icon: Flame, label: 'Flash Sale', color: '#d97706', bg: 'rgba(217,119,6,0.10)' },
    mockData: HOME_MOCK,
  },
  {
    id: 'sports', label: 'Sports & Fitness', eyebrow: 'Stay Active', query: 'Sports',
    filter: (_p: Product) => true,
    accent: '#16a34a', accentBg: 'rgba(22,163,74,0.08)', icon: Dumbbell,
    badge: { icon: TrendingUp, label: 'Top Rated', color: '#16a34a', bg: 'rgba(22,163,74,0.10)' },
    mockData: SPORTS_MOCK,
  },
] as const;

const CATEGORIES = [
  { name: 'Mobiles',    icon: Smartphone,   accent: '#6366f1' },
  { name: 'Laptops',   icon: Laptop,        accent: '#4f46e5' },
  { name: 'Audio',     icon: Headphones,    accent: '#7c3aed' },
  { name: 'Wearables', icon: Watch,         accent: '#0891b2' },
  { name: 'Smart TVs', icon: Tv,            accent: '#e11d48' },
  { name: 'Cameras',   icon: Camera,        accent: '#0284c7' },
  { name: 'Fashion',   icon: Shirt,         accent: '#db2777' },
  { name: 'Beauty',    icon: Palette,       accent: '#e11d48' },
  { name: 'Home',      icon: Sofa,          accent: '#d97706' },
  { name: 'Sports',    icon: Dumbbell,      accent: '#16a34a' },
  { name: 'Toys',      icon: Baby,          accent: '#f59e0b' },
  { name: 'Grocery',   icon: ShoppingBasket, accent: '#10b981' },
  { name: 'Books',     icon: BookOpen,      accent: '#6366f1' },
];

const SLIDES = [
  {
    eyebrow: 'Limited Time · AI Picks',
    headline: ['Super Deals on', 'Smart Electronics'],
    body: 'High-performance laptops, mobiles & 4K TVs handpicked by our AI co-shopper.',
    badge: 'Up to 80% Off',
    cta: 'Shop Now',
    href: '/signup',
    palette: {
      light: { bg: '#f8faff', accent: '#4f46e5', tag: '#e0e7ff', tagText: '#4338ca' },
      dark:  { bg: '#07091a', accent: '#818cf8', tag: '#1e1b4b', tagText: '#a5b4fc' },
    },
    image: '/images/showcase_electronics.jpg',
  },
  {
    eyebrow: 'New Season · Just Landed',
    headline: ['Top Fashion Picks', 'for Every Style'],
    body: 'Kurtas, western wear, athleisure & accessories — curated for every occasion.',
    badge: 'Min 50% Off',
    cta: 'Explore Fashion',
    href: '/signup',
    palette: {
      light: { bg: '#fff0f6', accent: '#db2777', tag: '#fce7f3', tagText: '#9d174d' },
      dark:  { bg: '#1a0510', accent: '#f472b6', tag: '#500724', tagText: '#fbcfe8' },
    },
    image: '/images/showcase_fashion.jpg',
  },
  {
    eyebrow: 'AI-Powered · Only on Nuvix',
    headline: ['Your Intelligent', 'Shopping Partner'],
    body: 'Describe what you need — our AI Agent plans your perfect cart in seconds.',
    badge: 'Try AI Co-Shopper',
    cta: 'Chat with AI',
    href: '/signup',
    palette: {
      light: { bg: '#f0fdff', accent: '#0891b2', tag: '#cffafe', tagText: '#0e7490' },
      dark:  { bg: '#060f18', accent: '#22d3ee', tag: '#083344', tagText: '#67e8f9' },
    },
    image: '/images/showcase_co_shopper.jpg',
  },
];

const TRUST_PILLARS = [
  { icon: ShieldCheck, color: '#4f46e5', bg: 'rgba(79,70,229,0.08)',  title: '100% Secure Checkout',  body: 'Enterprise-grade encryption on every transaction.' },
  { icon: Zap,         color: '#0891b2', bg: 'rgba(8,145,178,0.08)', title: 'Nuvix AI Co-Shopper',   body: 'Conversational intelligence that finds deals for you.' },
  { icon: Truck,       color: '#059669', bg: 'rgba(5,150,105,0.08)', title: 'Verified Fast Shipping', body: 'Real-time parcel tracking with delivery guarantees.' },
];

/* ─────────────────────────────────────────────────
   DEAL OF THE DAY BANNER (new)
───────────────────────────────────────────────── */
function DealOfDayBanner() {
  const [timeLeft, setTimeLeft] = useState({ h: 5, m: 44, s: 21 });
  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-3 sm:gap-5 px-4 sm:px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 shadow-lg shadow-orange-500/20 overflow-hidden relative">
      <div className="pointer-events-none absolute inset-0 opacity-10"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg,rgba(255,255,255,.15) 0,rgba(255,255,255,.15) 1px,transparent 1px,transparent 12px)' }} />
      <div className="flex items-center gap-2 flex-shrink-0">
        <Flame className="h-5 w-5 text-white" />
        <span className="text-sm font-black text-white uppercase tracking-widest hidden sm:inline">Deal of the Day</span>
        <span className="text-sm font-black text-white uppercase tracking-widest sm:hidden">Deals</span>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {[pad(timeLeft.h), pad(timeLeft.m), pad(timeLeft.s)].map((v, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className="bg-white/20 text-white font-black text-sm px-2 py-0.5 rounded-lg min-w-[34px] text-center">{v}</span>
            {i < 2 && <span className="text-white/70 font-black text-sm">:</span>}
          </span>
        ))}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white/90 text-xs font-medium truncate">Hurry! Offers expire soon on top Electronics, Fashion & more</p>
      </div>
      <Link href="/login" className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-orange-600 text-xs font-black tracking-wide uppercase hover:bg-orange-50 active:scale-95 transition-all">
        Shop <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   AMBIENT MESH
───────────────────────────────────────────────── */
function AmbientMesh() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full opacity-[0.07] dark:opacity-[0.12]"
        style={{ background: 'radial-gradient(circle, #4f46e5, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute -top-20 right-0 h-[500px] w-[500px] rounded-full opacity-[0.05] dark:opacity-[0.09]"
        style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[400px] w-[800px] rounded-full opacity-[0.04] dark:opacity-[0.07]"
        style={{ background: 'radial-gradient(ellipse, #7c3aed, transparent 70%)', filter: 'blur(80px)' }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────
   HERO CAROUSEL
───────────────────────────────────────────────── */
function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((dir: 'next' | 'prev') => {
    setActive(p => dir === 'next' ? (p + 1) % SLIDES.length : (p - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => go('next'), 5500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, go]);

  const slide = SLIDES[active];

  return (
    <section
      aria-label="Feature highlights"
      className="relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-white/[0.06] shadow-2xl dark:shadow-[0_20px_80px_rgba(0,0,0,0.5)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative">
        {SLIDES.map((s, idx) => (
          <div
            key={idx}
            aria-hidden={idx !== active}
            className={`transition-all duration-700 ease-in-out ${idx === active ? 'opacity-100 scale-100 z-10 relative' : 'opacity-0 scale-[0.99] z-0 pointer-events-none absolute inset-0'}`}
            style={{ background: `linear-gradient(135deg, ${s.palette.light.bg} 0%, color-mix(in srgb, ${s.palette.light.bg} 82%, ${s.palette.light.accent}) 100%)` }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:min-h-[320px]">
              <div className="relative z-10 flex flex-col justify-center w-full md:w-[58%] md:order-1 px-6 sm:px-8 md:px-12 lg:px-14 pt-5 pb-4 md:py-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase"
                    style={{ background: s.palette.light.tag, color: s.palette.light.tagText }}>
                    <Sparkles className="h-2.5 w-2.5" />{s.eyebrow}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[2.2rem] font-black leading-[1.15] tracking-tight text-slate-900 mb-2 md:mb-3">
                  {s.headline[0]}<br />
                  <span className="bg-clip-text text-transparent"
                    style={{ backgroundImage: `linear-gradient(90deg, ${s.palette.light.accent}, ${s.palette.dark.accent})` }}>
                    {s.headline[1]}
                  </span>
                </h1>
                <p className="hidden sm:block text-sm text-slate-500 font-medium leading-relaxed max-w-sm mb-4 md:mb-6">{s.body}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <Link href={s.href}
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase text-white shadow-lg active:scale-95 transition-all duration-150"
                    style={{ background: `linear-gradient(135deg, ${s.palette.light.accent}, ${s.palette.dark.accent})`, boxShadow: `0 8px 24px ${s.palette.light.accent}40` }}>
                    {s.cta}<ArrowRight className="h-3 w-3" />
                  </Link>
                  <span className="text-[11px] font-black px-3 py-1.5 rounded-lg"
                    style={{ background: s.palette.light.tag, color: s.palette.light.tagText }}>{s.badge}</span>
                </div>
              </div>
              <div className="relative z-10 flex items-center justify-center w-full md:w-[42%] md:order-2 px-6 md:px-8 lg:px-10 pt-6 md:pt-10 pb-10 md:pb-10">
                <div className="relative w-full max-w-[200px] sm:max-w-[260px] md:max-w-none rounded-2xl md:rounded-3xl overflow-hidden border border-white/60 shadow-2xl flex items-center justify-center p-4 md:p-6"
                  style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)', aspectRatio: '4/3' }}>
                  <div className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: 'repeating-linear-gradient(0deg,#000 0,#000 1px,transparent 1px,transparent 20px),repeating-linear-gradient(90deg,#000 0,#000 1px,transparent 1px,transparent 20px)' }} />
                  <img src={s.image} alt={s.headline.join(' ')} className="relative max-w-full max-h-full object-contain drop-shadow-2xl" loading="eager" />
                </div>
              </div>
            </div>
            <div className="absolute inset-0 dark:bg-[#07091a]/60 pointer-events-none transition-colors duration-300" />
          </div>
        ))}
      </div>
      <button onClick={() => go('prev')} aria-label="Previous"
        className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 h-9 w-9 items-center justify-center rounded-full bg-white/70 dark:bg-white/10 backdrop-blur-md border border-slate-200/60 dark:border-white/[0.12] text-slate-700 dark:text-white/70 shadow-md transition-all duration-200 active:scale-90">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button onClick={() => go('next')} aria-label="Next"
        className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 h-9 w-9 items-center justify-center rounded-full bg-white/70 dark:bg-white/10 backdrop-blur-md border border-slate-200/60 dark:border-white/[0.12] text-slate-700 dark:text-white/70 shadow-md transition-all duration-200 active:scale-90">
        <ChevronRight className="h-4 w-4" />
      </button>
      <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((_, idx) => (
          <button key={idx} onClick={() => setActive(idx)} aria-label={`Slide ${idx + 1}`}
            className="transition-all duration-300 rounded-full"
            style={{ height: 5, width: idx === active ? 20 : 5, background: idx === active ? slide.palette.light.accent : 'rgba(100,116,139,0.35)' }} />
        ))}
      </div>
      {!paused && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/5 dark:bg-white/5 z-20 overflow-hidden">
          <div key={active} className="h-full rounded-full"
            style={{ background: slide.palette.light.accent, animation: 'progressBar 5.5s linear forwards' }} />
        </div>
      )}
      <style>{`@keyframes progressBar { from { width:0% } to { width:100% } }`}</style>
    </section>
  );
}

/* ─────────────────────────────────────────────────
   PRODUCT CARD — standard electronics style
───────────────────────────────────────────────── */
function ProductCard({ product, accent, isAiPick }: { product: Product; accent: string; isAiPick: boolean }) {
  const originalPrice = Math.floor(product.price * 1.38);
  const discount      = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  return (
    <article className="group relative flex flex-col bg-white dark:bg-white/[0.025] border border-slate-100 dark:border-white/[0.06] hover:border-slate-200/80 dark:hover:border-white/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.35)] transition-all duration-300">
      <div className="absolute top-3 left-3 z-10">
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-500 text-white text-[9px] font-black tracking-wider uppercase shadow-sm">{discount}% OFF</span>
      </div>
      {isAiPick && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-white text-[9px] font-black tracking-wider uppercase shadow-sm" style={{ background: accent }}>
            <TrendingUp className="h-2.5 w-2.5" />AI Pick
          </span>
        </div>
      )}
      <div className="relative h-44 bg-slate-50 dark:bg-white/[0.02] flex items-center justify-center p-6 border-b border-slate-100 dark:border-white/[0.04] overflow-hidden">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `radial-gradient(ellipse at center, ${accent}10 0%, transparent 70%)` }} />
        <img src={product.images[0]} alt={product.name} className="relative max-h-36 max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-105" loading="lazy" />
      </div>
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-white/40">{product.category}</span>
          <span className="inline-flex items-center gap-0.5 text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded uppercase text-white shadow-sm"
            style={{ background: `linear-gradient(90deg, ${accent}, #06b6d4)` }}>Nuvix ✔</span>
        </div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-snug line-clamp-2 flex-1">{product.name}</h3>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">{(product.ratings ?? 4.1).toFixed(1)}</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-white/30 font-medium">25 reviews</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">₹{product.price.toLocaleString('en-IN')}</span>
          <span className="text-xs text-slate-400 dark:text-white/30 line-through">₹{originalPrice.toLocaleString('en-IN')}</span>
        </div>
        <Link href="/login"
          className="mt-auto flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-black tracking-wide uppercase text-white shadow-md active:scale-[0.98] transition-all duration-150"
          style={{ background: `linear-gradient(135deg, ${accent}, #06b6d4)`, boxShadow: `0 4px 16px ${accent}30` }}>
          <Bot className="h-3 w-3" />Unlock with AI
        </Link>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────
   FASHION CARD — tall portrait image style
───────────────────────────────────────────────── */
function FashionCard({ product, accent, isAiPick }: { product: Product; accent: string; isAiPick: boolean }) {
  const originalPrice = Math.floor(product.price * 1.65);
  const discount      = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  return (
    <article className="group relative flex flex-col bg-white dark:bg-white/[0.025] border border-slate-100 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.35)] transition-all duration-300">
      <div className="absolute top-3 left-3 z-10">
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-white text-[9px] font-black tracking-wider uppercase shadow-sm" style={{ background: accent }}>{discount}% OFF</span>
      </div>
      {isAiPick && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-white text-[9px] font-black tracking-wider uppercase shadow-sm bg-slate-800">
            <Sparkles className="h-2.5 w-2.5" />Trending
          </span>
        </div>
      )}
      {/* Portrait image — taller for fashion */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
        <img src={product.images[0]} alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="flex flex-col flex-1 p-3 gap-2">
        <h3 className="text-xs font-bold text-slate-800 dark:text-white leading-snug line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 w-fit">
          <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
          <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">{product.ratings.toFixed(1)}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-black text-slate-900 dark:text-white">₹{product.price.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-slate-400 dark:text-white/30 line-through">₹{originalPrice.toLocaleString('en-IN')}</span>
        </div>
        <Link href="/login"
          className="flex items-center justify-center gap-1 w-full py-2 rounded-xl text-[10px] font-black tracking-wide uppercase text-white active:scale-[0.98] transition-all"
          style={{ background: accent }}>
          <Shirt className="h-2.5 w-2.5" />Add to Bag
        </Link>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────
   BEAUTY CARD — square image with glow ring
───────────────────────────────────────────────── */
function BeautyCard({ product, accent }: { product: Product; accent: string }) {
  const originalPrice = Math.floor(product.price * 1.5);
  const discount      = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  return (
    <article className="group relative flex flex-col bg-white dark:bg-white/[0.025] border border-slate-100 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.35)] transition-all duration-300">
      <div className="absolute top-3 left-3 z-10">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-white text-[9px] font-black tracking-wider uppercase" style={{ background: accent }}>{discount}% OFF</span>
      </div>
      <div className="relative bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 flex items-center justify-center p-6" style={{ aspectRatio: '1/1' }}>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `radial-gradient(ellipse at center, ${accent}15 0%, transparent 65%)` }} />
        <img src={product.images[0]} alt={product.name}
          className="relative max-h-32 max-w-full object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-lg" loading="lazy" />
      </div>
      <div className="flex flex-col flex-1 p-3.5 gap-2">
        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full w-fit text-white" style={{ background: accent }}>Beauty</span>
        <h3 className="text-xs font-bold text-slate-800 dark:text-white leading-snug line-clamp-2">{product.name}</h3>
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-black text-slate-900 dark:text-white">₹{product.price.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-slate-400 dark:text-white/30 line-through">₹{originalPrice.toLocaleString('en-IN')}</span>
        </div>
        <Link href="/login"
          className="flex items-center justify-center gap-1 w-full py-2 rounded-xl text-[10px] font-black tracking-wide uppercase text-white active:scale-[0.98] transition-all"
          style={{ background: `linear-gradient(135deg, ${accent}, #f472b6)` }}>
          <Gem className="h-2.5 w-2.5" />Shop Now
        </Link>
      </div>
    </article>
  );
}

function ProductSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-white/[0.06] bg-white dark:bg-white/[0.025]">
      <div className="h-44 skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-3 skeleton rounded w-1/3" />
        <div className="h-4 skeleton rounded w-5/6" />
        <div className="h-4 skeleton rounded w-2/3" />
        <div className="h-3 skeleton rounded w-1/4" />
        <div className="h-5 skeleton rounded w-2/5" />
        <div className="h-9 skeleton rounded-xl" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   CATEGORY SECTION
───────────────────────────────────────────────── */
function CategorySection({
  section, products, loading,
}: {
  section: typeof CATEGORY_SECTIONS[number];
  products: Product[];
  loading: boolean;
}) {
  const SectionIcon = section.icon;
  const BadgeIcon   = section.badge.icon;

  // Use mock data if provided (lifestyle categories), else filter from API pool
  const allProducts = section.mockData ?? products;
  const filtered    = section.mockData
    ? allProducts
    : allProducts.filter(section.filter as (p: Product) => boolean).slice(0, 4);
  const display     = filtered.length >= 2 ? filtered.slice(0, 4) : allProducts.slice(0, 4);

  if (!loading && display.length === 0) return null;

  const isFashion = section.id === 'fashion';
  const isBeauty  = section.id === 'beauty';

  return (
    <section aria-labelledby={`section-${section.id}`}>
      <div className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.06] rounded-3xl overflow-hidden shadow-sm hover:shadow-md dark:hover:shadow-[0_8px_40px_rgba(0,0,0,0.2)] transition-shadow duration-300">
        {/* Header */}
        <div className="relative px-4 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-5 border-b border-slate-100 dark:border-white/[0.05] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: `linear-gradient(90deg, ${section.accent}, #06b6d4, transparent)` }} />
          <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${section.accent}18, transparent 70%)`, filter: 'blur(20px)' }} />
          <div className="relative flex items-center justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: section.accentBg }}>
                <SectionIcon className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: section.accent }} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-1 w-4 rounded-full flex-shrink-0" style={{ background: section.accent }} />
                  <span className="text-[10px] font-black tracking-widest uppercase truncate" style={{ color: section.accent }}>{section.eyebrow}</span>
                </div>
                <h2 id={`section-${section.id}`} className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">{section.label}</h2>
                <div className="mt-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase"
                    style={{ background: section.badge.bg, color: section.badge.color }}>
                    <BadgeIcon className="h-2.5 w-2.5 flex-shrink-0" />{section.badge.label}
                  </span>
                </div>
              </div>
            </div>
            <Link href="/login"
              className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-[11px] font-black tracking-wider uppercase border transition-all duration-200 flex-shrink-0 hover:opacity-80 whitespace-nowrap"
              style={{ color: section.accent, background: section.accentBg, borderColor: `${section.accent}25` }}>
              <span className="hidden xs:inline">View All</span>
              <span className="xs:hidden">All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Products grid — different layout per category type */}
        <div className="p-4 sm:p-6">
          {isFashion ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
                : display.map((product, idx) => (
                    <FashionCard key={product._id} product={product} accent={section.accent} isAiPick={idx < 2} />
                  ))
              }
            </div>
          ) : isBeauty ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
                : display.map((product) => (
                    <BeautyCard key={product._id} product={product} accent={section.accent} />
                  ))
              }
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
                : display.map((product, idx) => (
                    <ProductCard key={product._id} product={product} accent={section.accent} isAiPick={idx < 2} />
                  ))
              }
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────
   QUICK CATEGORY GRID (Flipkart-style icon grid)
───────────────────────────────────────────────── */
function QuickCategoryGrid() {
  const items = [
    { name: 'Mobiles',    icon: Smartphone,    accent: '#4f46e5', bg: 'rgba(79,70,229,0.08)' },
    { name: 'Laptops',   icon: Laptop,         accent: '#0891b2', bg: 'rgba(8,145,178,0.08)' },
    { name: 'Fashion',   icon: Shirt,          accent: '#db2777', bg: 'rgba(219,39,119,0.08)' },
    { name: 'Beauty',    icon: Palette,        accent: '#e11d48', bg: 'rgba(225,29,72,0.08)' },
    { name: 'Home',      icon: Sofa,           accent: '#d97706', bg: 'rgba(217,119,6,0.08)' },
    { name: 'Sports',    icon: Dumbbell,       accent: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
    { name: 'Toys',      icon: Baby,           accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
    { name: 'Grocery',   icon: ShoppingBasket, accent: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    { name: 'Books',     icon: BookOpen,       accent: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
    { name: 'Cameras',   icon: Camera,         accent: '#0284c7', bg: 'rgba(2,132,199,0.08)' },
    { name: 'Smart TVs', icon: Tv,             accent: '#e11d48', bg: 'rgba(225,29,72,0.08)' },
    { name: 'Wearables', icon: Watch,          accent: '#059669', bg: 'rgba(5,150,105,0.08)' },
  ];

  return (
    <section aria-label="Shop by category" className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.06] rounded-3xl p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Shop by Category</h2>
        <Link href="/login" className="text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
          All Categories <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 sm:gap-3">
        {items.map((item) => (
          <Link key={item.name} href="/login"
            className="group flex flex-col items-center gap-2 p-2 sm:p-3 rounded-2xl border border-slate-100 dark:border-white/[0.06] hover:border-slate-200 dark:hover:border-white/10 hover:shadow-md dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all duration-200 active:scale-95">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-0.5"
              style={{ background: item.bg }}>
              <item.icon className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: item.accent }} />
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold text-center text-slate-500 dark:text-white/50 leading-tight">{item.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────── */
export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const isMounted           = useIsMounted();

  const [pools, setPools]     = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) return;
    (async () => {
      try {
        const [elecRes, accRes, wearRes] = await Promise.all([
          fetch('/api/products?category=Electronics&limit=50'),
          fetch('/api/products?category=Accessories&limit=20'),
          fetch('/api/products?category=Wearables&limit=20'),
        ]);
        const elecData = elecRes.ok ? (await elecRes.json()).products : [];
        const accData  = accRes.ok  ? (await accRes.json()).products  : [];
        const wearData = wearRes.ok ? (await wearRes.json()).products : [];
        setPools({ Electronics: elecData, Accessories: accData, Wearables: wearData });
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated]);

  if (!isMounted) return null;
  if (isAuthenticated) return <ShopPage />;

  return (
    <>
      <AmbientMesh />

      <div className="min-h-screen bg-slate-50/80 dark:bg-[#07091a]/95 text-slate-800 dark:text-white transition-colors duration-300">

        {/* ── CATEGORY NAV ── */}
        <nav
          aria-label="Product categories"
          className="sticky top-[60px] z-30 bg-white/80 dark:bg-[#07091a]/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/[0.05] shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_20px_rgba(0,0,0,0.3)] transition-colors duration-300"
        >
          <div className="container mx-auto px-3 sm:px-4 lg:px-8">
            <ul className="flex items-center gap-2 py-2.5 overflow-x-auto list-none m-0 p-0"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {CATEGORIES.map((item) => (
                <li key={item.name} className="flex-shrink-0">
                  <Link href="/login"
                    className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200/70 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.07] hover:-translate-y-px active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
                    <span className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                      style={{ background: `${item.accent}18` }}>
                      <item.icon className="h-3 w-3 transition-colors duration-150" style={{ color: item.accent }} />
                    </span>
                    <span className="text-[11px] font-semibold whitespace-nowrap text-slate-500 dark:text-white/40 group-hover:text-slate-800 dark:group-hover:text-white/80 transition-colors duration-150">
                      {item.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <style>{`nav ul::-webkit-scrollbar { display: none; }`}</style>
        </nav>

        {/* ── MAIN ── */}
        <div className="container mx-auto px-4 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-10">

          {/* Hero */}
          <HeroCarousel />

          {/* Deal of the Day */}
          <DealOfDayBanner />

          {/* Quick Category Grid */}
          <QuickCategoryGrid />

          {/* Trust pillars */}
          <section aria-label="Why Nuvix" className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {TRUST_PILLARS.map((p) => (
              <div key={p.title}
                className="group flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.06] hover:border-slate-200 dark:hover:border-white/10 hover:shadow-lg dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300">
                <div className="h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-0.5"
                  style={{ background: p.bg }}>
                  <p.icon className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: p.color }} />
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-wider uppercase text-slate-800 dark:text-white mb-1">{p.title}</h3>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-white/40 leading-relaxed">{p.body}</p>
                </div>
              </div>
            ))}
          </section>

          {/* ── ALL CATEGORY SECTIONS ── */}
          {CATEGORY_SECTIONS.map((section) => (
            <CategorySection
              key={section.id}
              section={section}
              products={pools[section.query] ?? []}
              loading={section.mockData ? false : loading}
            />
          ))}

          {/* AI CTA Banner */}
          <section aria-label="Try AI Co-Shopper"
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-cyan-600 p-6 sm:p-8 lg:p-12 shadow-2xl shadow-indigo-500/30">
            <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-cyan-400/20 blur-2xl" />
            <div className="pointer-events-none absolute inset-0 opacity-10"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 12px)' }} />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs font-black tracking-widest uppercase text-white/70">AI Co-Shopper</span>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight mb-2">
                  Just describe it.<br /><span className="text-cyan-200">We'll find it.</span>
                </h2>
                <p className="text-sm text-white/70 font-medium max-w-md leading-relaxed">
                  Tell our AI what you need — budget, use case, brand — and it builds your perfect cart in seconds.
                </p>
              </div>
              <div className="flex-shrink-0 w-full sm:w-auto">
                <Link href="/signup"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl text-sm font-black tracking-wide uppercase bg-white text-indigo-700 hover:bg-cyan-50 shadow-xl shadow-black/20 active:scale-95 transition-all duration-150">
                  <Bot className="h-4 w-4" />Start for Free<ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <p className="text-[10px] text-white/50 font-bold text-center mt-2 tracking-wider">No credit card required</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}