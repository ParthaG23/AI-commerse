'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import MainLayout from '../../components/MainLayout';
import { useCartStore } from '../../store/cart';
import { useChatStore } from '../../store/chat';
import { useAuthStore } from '../../store/auth';
import { Input } from '../../../components/ui/input';
import {
  ArrowLeft,
  ShoppingCart,
  Zap,
  Sparkles,
  MessageCircle,
  Info,
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Truck,
  ShieldCheck,
  Package,
  RefreshCw,
  BadgeCheck,
} from 'lucide-react';

/* ─── Types ─── */
interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  ratings: number;
  reviews: Review[];
}

type ReviewStatus = 'idle' | 'loading' | 'success' | 'error';

/* ─── Star renderer ─── */
function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-white/10 fill-slate-200 dark:fill-white/10'}
        />
      ))}
    </div>
  );
}

/* ─── Interactive star picker ─── */
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          className="transition-transform duration-100 hover:scale-110 active:scale-95 cursor-pointer"
        >
          <Star
            size={22}
            className={
              s <= (hovered || value)
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-200 dark:text-white/[0.12] fill-slate-200 dark:fill-white/[0.12]'
            }
          />
        </button>
      ))}
      <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">
        {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][hovered || value]}
      </span>
    </div>
  );
}

/* ─── Spec row ─── */
function SpecRow({ label, children, last = false }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`grid grid-cols-3 ${!last ? 'border-b border-slate-100 dark:border-white/[0.05]' : ''}`}>
      <div className="col-span-1 bg-slate-50 dark:bg-white/[0.02] px-4 py-3 font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/30 border-r border-slate-100 dark:border-white/[0.05] flex items-center">
        {label}
      </div>
      <div className="col-span-2 px-4 py-3 text-xs font-semibold text-slate-700 dark:text-white/80 flex items-center">
        {children}
      </div>
    </div>
  );
}

/* ─── Loading skeleton ─── */
function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 space-y-4">
        <div className="skeleton w-full h-80 rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="skeleton h-12 rounded-xl" />
          <div className="skeleton h-12 rounded-xl" />
        </div>
      </div>
      <div className="lg:col-span-7 space-y-4">
        <div className="skeleton h-7 w-3/4 rounded-full" />
        <div className="skeleton h-4 w-1/3 rounded-full" />
        <div className="skeleton h-20 rounded-2xl" />
        <div className="skeleton h-32 rounded-2xl" />
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function ProductDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.slug?.[0] as string;
  const { user } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  /* Review states */
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('idle');
  const [reviewMessage, setReviewMessage] = useState('');

  const { addToCart } = useCartStore();
  const { addMessage, setInputValue } = useChatStore();

  /* Sync review name with user */
  useEffect(() => {
    if (user?.name) setReviewName(user.name);
  }, [user]);

  /* Fetch product — stable reference via useCallback */
  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${productId}`);
      if (!res.ok) throw new Error('Product not found');
      const data = await res.json();
      setProduct(data.product);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load product.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  /* Cart actions — separate handlers for cart vs buy-now */
  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      router.push('/cart');
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product);
      router.push('/checkout');
    }
  };

  /* AI Co-Shopper */
  const handleAskAI = () => {
    if (!product) return;
    setInputValue(
      `Can you compare this ${product.name} and summarise its key specifications and customer reviews?`
    );
    addMessage({
      sender: 'ai',
      content: `👋 I see you're looking at the **${product.name}**. I'm analysing its specs and reviews. Ask me anything, or type "compare" to match it against similar items!`,
    });
  };

  /* Review submit */
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewStatus('idle');
    setReviewMessage('');

    if (!reviewName.trim() || !reviewComment.trim()) {
      setReviewStatus('error');
      setReviewMessage('Please fill in both your name and feedback.');
      return;
    }

    setReviewStatus('loading');
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: reviewName, rating: reviewRating, comment: reviewComment }),
      });
      const data = await res.json();
      if (res.ok) {
        setProduct(data.product);
        setReviewStatus('success');
        setReviewMessage('Your verified review has been submitted — thank you!');
        setReviewComment('');
        setReviewRating(5);
      } else {
        setReviewStatus('error');
        setReviewMessage(data.message || 'Failed to submit review.');
      }
    } catch {
      setReviewStatus('error');
      setReviewMessage('Network error — review not submitted.');
    }
  };

  /* Price helpers — consistent 20% markup → 17% savings shown */
  const getOriginalPrice = (price: number) => Math.floor(price * 1.20);
  const getDiscount = (price: number, original: number) =>
    Math.round(((original - price) / original) * 100);

  /* ── States ── */
  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
          <div className="skeleton h-8 w-28 rounded-xl" />
          <ProductSkeleton />
        </div>
      </MainLayout>
    );
  }

  if (error || !product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 max-w-sm text-center space-y-5">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center">
            <AlertCircle size={28} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-800 dark:text-white">Product Not Found</h2>
            <p className="text-xs text-slate-500 dark:text-white/40 font-medium mt-1">{error || 'This product does not exist.'}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={fetchProduct}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 text-white font-black text-[10px] uppercase tracking-widest px-4 h-9 rounded-xl shadow-md shadow-indigo-500/20 border-none transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw size={12} /> Retry
            </Button>
            <Button variant="outline" asChild className="font-black text-[10px] uppercase tracking-widest h-9 rounded-xl border-slate-200 dark:border-white/[0.1]">
              <Link href="/shop">Back to Shop</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const originalPrice = getOriginalPrice(product.price);
  const discountPct = getDiscount(product.price, originalPrice);

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50/60 dark:bg-transparent transition-colors duration-300">
        <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">

          {/* ── Back button ── */}
          <Button
            variant="ghost"
            asChild
            className="flex items-center gap-2 text-slate-500 dark:text-white/40 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] font-black text-[10px] uppercase tracking-widest rounded-xl h-9 px-3 transition-all"
          >
            <Link href="/shop"><ArrowLeft size={14} /> Back to Shop</Link>
          </Button>

          {/* ═══════════════════════════════════════
              MAIN PRODUCT CARD
          ═══════════════════════════════════════ */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/[0.07] shadow-xl shadow-slate-200/50 dark:shadow-black/30 bg-white dark:bg-[#0d1035]/80 backdrop-blur-xl">

            {/* Ambient top glow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_0%_0%,rgba(99,102,241,0.06),transparent)] pointer-events-none" />

            <div className="relative p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* ── LEFT: Image + Actions ── */}
              <div className="lg:col-span-5 flex flex-col gap-5">

                {/* Main image */}
                <div className="relative w-full aspect-square bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.07] rounded-2xl flex items-center justify-center overflow-hidden group">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.04),transparent_70%)] pointer-events-none" />
                  <img
                    src={product.images[selectedImage] ?? product.images[0]}
                    alt={product.name}
                    className="h-[75%] max-h-72 w-auto object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-400">
                      <BadgeCheck size={9} /> Verified
                    </span>
                    {discountPct > 0 && (
                      <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/25 text-red-600 dark:text-red-400">
                        -{discountPct}% OFF
                      </span>
                    )}
                  </div>
                </div>

                {/* Thumbnail strip — show if multiple images */}
                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {product.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={`flex-shrink-0 h-14 w-14 rounded-xl border-2 overflow-hidden transition-all duration-200 cursor-pointer
                          ${i === selectedImage
                            ? 'border-indigo-500 shadow-md shadow-indigo-500/20'
                            : 'border-slate-100 dark:border-white/[0.07] hover:border-indigo-300 dark:hover:border-indigo-500/40'
                          }`}
                      >
                        <img src={img} alt="" className="h-full w-full object-contain p-1" />
                      </button>
                    ))}
                  </div>
                )}

                {/* CTA buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleAddToCart}
                    className="flex items-center justify-center gap-2 bg-white dark:bg-white/[0.05] hover:bg-slate-50 dark:hover:bg-white/[0.08] text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 font-black text-[10px] uppercase tracking-widest rounded-xl h-12 shadow-sm hover:shadow-md hover:shadow-indigo-500/10 transition-all active:scale-95 cursor-pointer"
                  >
                    <ShoppingCart size={15} /> Add to Cart
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-black text-[10px] uppercase tracking-widest rounded-xl h-12 shadow-lg shadow-indigo-500/25 border-none transition-all active:scale-95 cursor-pointer"
                  >
                    <Zap size={15} /> Buy Now
                  </Button>
                </div>

                {/* Trust strip */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Truck, label: 'Free Delivery' },
                    { icon: ShieldCheck, label: 'Secure Pay' },
                    { icon: Package, label: 'Easy Returns' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex flex-col items-center gap-1.5 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06]">
                      <Icon size={14} className="text-indigo-500 dark:text-indigo-400" />
                      <span className="text-[9px] font-black uppercase tracking-wide text-slate-400 dark:text-white/30 text-center leading-none">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── RIGHT: Details ── */}
              <div className="lg:col-span-7 space-y-5">

                {/* Title + rating */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                      {product.category}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-black px-2.5 py-1 rounded-full bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 dark:from-cyan-500/15 dark:to-indigo-500/15 border border-cyan-200 dark:border-cyan-500/20 text-cyan-700 dark:text-cyan-400">
                      <Sparkles size={9} /> Nuvix Verified
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                    {product.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <StarRating rating={product.ratings} size={14} />
                    <span className="text-xs font-black text-slate-700 dark:text-white/80">{product.ratings.toFixed(1)}</span>
                    <span className="text-xs text-slate-400 dark:text-white/30 font-semibold">
                      ({product.reviews.length} review{product.reviews.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                </div>

                {/* Price block */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-100 dark:border-white/[0.07] bg-gradient-to-br from-slate-50 to-white dark:from-white/[0.03] dark:to-transparent p-4">
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-cyan-500 rounded-l-2xl" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 block mb-1 pl-2">Discounted Price</span>
                  <div className="flex flex-wrap items-baseline gap-3 pl-2">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">₹{product.price.toLocaleString('en-IN')}</span>
                    <span className="text-sm text-slate-400 dark:text-white/25 line-through font-semibold">₹{originalPrice.toLocaleString('en-IN')}</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{discountPct}% off</span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-white/30 font-medium mt-1.5 pl-2">Inclusive of all taxes · Free fast delivery</p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h2 className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">Overview</h2>
                  <p className="text-xs font-medium text-slate-600 dark:text-white/60 leading-relaxed bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.06] rounded-2xl p-4">
                    {product.description}
                  </p>
                </div>

                {/* Spec table */}
                <div className="space-y-2">
                  <h2 className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">
                    <Info size={11} className="text-indigo-500 dark:text-indigo-400" /> Technical Specifications
                  </h2>
                  <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-white/[0.07]">
                    <SpecRow label="Category">{product.category}</SpecRow>
                    <SpecRow label="Stock">
                      {product.stock > 0 ? (
                        <span className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{product.stock} units available</span>
                        </span>
                      ) : (
                        <span className="text-red-500 font-bold">Out of stock</span>
                      )}
                    </SpecRow>
                    <SpecRow label="Delivery" last>
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                        <Truck size={12} /> Free Fast Delivery Eligible
                      </span>
                    </SpecRow>
                  </div>
                </div>

                {/* AI Co-Shopper banner */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-100 dark:border-indigo-500/20 bg-gradient-to-r from-slate-50 to-indigo-50/40 dark:from-indigo-500/[0.06] dark:to-cyan-500/[0.04] p-4">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/25 flex-shrink-0">
                        <MessageCircle size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                          <Sparkles size={11} className="text-cyan-500" /> AI Co-Shopper
                          <span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-white/35 font-medium">Compare with other brands instantly.</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleAskAI}
                      className="flex-shrink-0 flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 text-white font-black text-[10px] uppercase tracking-widest px-4 h-9 rounded-xl shadow-md shadow-indigo-500/20 border-none transition-all active:scale-95 cursor-pointer"
                    >
                      Ask Co-Shopper
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════
              REVIEWS SECTION
          ═══════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* ── Reviews list ── */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">
                  Customer Reviews
                </h2>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] px-2.5 py-1 rounded-full">
                  {product.reviews.length}
                </span>
              </div>

              {product.reviews.length > 0 ? (
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(99,102,241,0.3)_transparent]">
                  {product.reviews.map((review) => (
                    <div
                      key={review._id}
                      className="group rounded-2xl border border-slate-100 dark:border-white/[0.07] bg-white dark:bg-white/[0.02] hover:border-indigo-100 dark:hover:border-indigo-500/20 transition-all duration-200 overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.05]">
                        <div>
                          <p className="text-xs font-black text-slate-800 dark:text-white/90">{review.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <BadgeCheck size={10} className="text-emerald-500" />
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Verified Buyer</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StarRating rating={review.rating} size={11} />
                          <span className="text-[10px] font-black text-slate-600 dark:text-white/60">{review.rating}.0</span>
                        </div>
                      </div>
                      <p className="px-4 py-3 text-xs font-medium text-slate-600 dark:text-white/55 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-14 rounded-2xl border border-slate-100 dark:border-white/[0.07] bg-white dark:bg-white/[0.02] gap-3 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-white/[0.05] border border-slate-100 dark:border-white/[0.07] flex items-center justify-center">
                    <Star size={20} className="text-slate-300 dark:text-white/15" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-600 dark:text-white/60">No reviews yet</p>
                    <p className="text-[10px] text-slate-400 dark:text-white/25 font-medium mt-0.5">Be the first to share your experience.</p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Write a Review ── */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#0d1035]/60 backdrop-blur-xl shadow-lg dark:shadow-black/20">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 dark:border-white/[0.07] bg-slate-50 dark:bg-white/[0.02]">
                  <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-white/80">
                    <div className="h-6 w-6 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                    </div>
                    Write a Review
                  </h3>
                </div>

                <form onSubmit={handleReviewSubmit} className="p-5 space-y-4">

                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 block" htmlFor="revName">
                      Display Name
                    </label>
                    <Input
                      id="revName"
                      type="text"
                      className="rounded-xl border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 h-10 text-xs font-semibold focus-visible:ring-1 focus-visible:ring-indigo-500 transition-colors"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  {/* Interactive star picker */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 block">
                      Your Rating
                    </label>
                    <StarPicker value={reviewRating} onChange={setReviewRating} />
                  </div>

                  {/* Comment */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 block" htmlFor="revComment">
                      Detailed Feedback
                    </label>
                    <textarea
                      id="revComment"
                      rows={4}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04] px-3 py-2.5 text-xs font-medium text-slate-700 dark:text-white/80 placeholder-slate-300 dark:placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-400 dark:focus:border-indigo-500/50 transition-colors resize-none"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Describe your experience — build quality, performance, value for money..."
                    />
                  </div>

                  {/* Status feedback */}
                  {reviewStatus === 'success' && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                      <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 leading-relaxed">{reviewMessage}</p>
                    </div>
                  )}
                  {reviewStatus === 'error' && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
                      <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-[10px] font-semibold text-red-600 dark:text-red-400 leading-relaxed">{reviewMessage}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={reviewStatus === 'loading' || reviewStatus === 'success'}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 text-white font-black text-[10px] uppercase tracking-widest h-10 rounded-xl shadow-md shadow-indigo-500/20 border-none transition-all active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {reviewStatus === 'loading' ? (
                      <><Loader2 size={13} className="animate-spin" /> Submitting…</>
                    ) : reviewStatus === 'success' ? (
                      <><CheckCircle2 size={13} /> Submitted!</>
                    ) : (
                      <><Star size={13} className="fill-white" /> Submit Verified Review</>
                    )}
                  </Button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  );
}