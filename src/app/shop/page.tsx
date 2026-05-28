'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import MainLayout from '../components/MainLayout';
import { useProductStore } from '../store/product';
import { useCartStore } from '../store/cart';
import {
  ShoppingCart, Eye, Tag, Scale, X, Sparkles,
  Star, TrendingUp, Zap, Bot, SlidersHorizontal,
  ChevronDown, ArrowUpDown, CheckCircle2, Package,
  ShoppingBag,
} from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useChatStore } from '../store/chat';

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

type SortKey = 'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
type ViewMode = 'grid' | 'list';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'featured',   label: 'Featured'       },
  { key: 'price_asc',  label: 'Price: Low → High' },
  { key: 'price_desc', label: 'Price: High → Low' },
  { key: 'rating',     label: 'Top Rated'      },
  { key: 'newest',     label: 'Newest First'   },
];

/* ─────────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────────── */
function CardSkeleton({ list }: { list?: boolean }) {
  if (list) {
    return (
      <div className="flex gap-5 p-4 bg-white dark:bg-white/[0.025] border border-slate-100 dark:border-white/[0.06] rounded-2xl animate-pulse">
        <div className="h-28 w-28 flex-shrink-0 skeleton rounded-xl" />
        <div className="flex-1 space-y-3 py-1">
          <div className="h-3 skeleton rounded w-1/4" />
          <div className="h-5 skeleton rounded w-3/4" />
          <div className="h-3 skeleton rounded w-1/3" />
          <div className="h-4 skeleton rounded w-1/4" />
        </div>
        <div className="flex flex-col gap-2 justify-center w-32">
          <div className="h-9 skeleton rounded-xl" />
          <div className="h-9 skeleton rounded-xl" />
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-white/[0.06] bg-white dark:bg-white/[0.025] animate-pulse">
      <div className="h-52 skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-3 skeleton rounded w-1/3" />
        <div className="h-4 skeleton rounded w-5/6" />
        <div className="h-3 skeleton rounded w-1/2" />
        <div className="h-5 skeleton rounded w-2/5" />
        <div className="flex gap-2 pt-1">
          <div className="h-9 skeleton rounded-xl flex-1" />
          <div className="h-9 skeleton rounded-xl flex-1" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   SORT DROPDOWN
───────────────────────────────────────────────── */
function SortDropdown({ value, onChange }: { value: SortKey; onChange: (k: SortKey) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = SORT_OPTIONS.find(o => o.key === value)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] text-[11px] font-black tracking-wide uppercase text-slate-600 dark:text-white/60 hover:border-slate-300 dark:hover:border-white/15 transition-all duration-200"
      >
        <ArrowUpDown className="h-3 w-3" />
        {current.label}
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-48 z-50 bg-white dark:bg-[#0d1035] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl shadow-2xl dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => { onChange(opt.key); setOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-bold text-left transition-colors
                ${opt.key === value
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                  : 'text-slate-700 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                }`}
            >
              {opt.label}
              {opt.key === value && <CheckCircle2 className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   PRODUCT CARD — GRID
───────────────────────────────────────────────── */
function GridCard({
  product, inCompare, onToggleCompare, onAddToCart,
}: {
  product: Product;
  inCompare: boolean;
  onToggleCompare: () => void;
  onAddToCart: () => void;
}) {
  const originalPrice = Math.floor(product.price * 1.38);
  const discount      = Math.round(((originalPrice - product.price) / originalPrice) * 100);
  const stockLow      = product.stock <= 5;

  return (
    <article className="group relative flex flex-col bg-white dark:bg-white/[0.025] border border-slate-100 dark:border-white/[0.06] hover:border-indigo-200/60 dark:hover:border-indigo-500/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.35)] transition-all duration-300">

      {/* ── Top badges ── */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-500 text-white text-[9px] font-black tracking-wider uppercase shadow-sm">
          {discount}% OFF
        </span>
        {stockLow && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-orange-500 text-white text-[9px] font-black tracking-wider uppercase shadow-sm">
            Only {product.stock} left
          </span>
        )}
      </div>

      {/* ── Compare checkbox (top-right) ── */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={onToggleCompare}
          title={inCompare ? 'Remove from compare' : 'Add to compare'}
          className={`h-7 w-7 rounded-lg flex items-center justify-center border text-[9px] font-black transition-all duration-200 ${
            inCompare
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/30'
              : 'bg-white/80 dark:bg-white/10 border-slate-200/80 dark:border-white/[0.12] text-slate-400 dark:text-white/40 hover:border-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 backdrop-blur-sm'
          }`}
        >
          <Scale className="h-3 w-3" />
        </button>
      </div>

      {/* ── Image ── */}
      <div className="relative h-52 bg-slate-50 dark:bg-white/[0.02] flex items-center justify-center p-6 border-b border-slate-100 dark:border-white/[0.04] overflow-hidden">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.07) 0%, transparent 70%)' }} />
        <img
          src={product.images[0] || '/placeholder.png'}
          alt={product.name}
          className="relative max-h-40 max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">
        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-white/40">
            {product.category}
          </span>
          <span className="inline-flex items-center gap-0.5 text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded uppercase text-white shadow-sm bg-gradient-to-r from-indigo-500 to-cyan-500">
            Nuvix ✔
          </span>
        </div>

        {/* Name */}
        <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors duration-200">
          {product.name}
        </h3>

        {/* Rating + Stock */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">
              {(product.ratings ?? 4.1).toFixed(1)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-white/30 font-medium">
            ({Math.floor((product.ratings ?? 4) * 6)} reviews)
          </span>
          <span className="ml-auto text-[10px] font-bold text-slate-400 dark:text-white/30">
            Stock: {product.stock}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-slate-400 dark:text-white/30 line-through">
            ₹{originalPrice.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">{discount}% off</span>
        </div>

        {/* CTA Row */}
        <div className="flex gap-2 mt-auto pt-1">
          <button
            onClick={onAddToCart}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase text-white shadow-md active:scale-[0.98] transition-all duration-150 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500"
            style={{ boxShadow: '0 4px 14px rgba(79,70,229,0.25)' }}
          >
            <ShoppingCart className="h-3 w-3" />
            Add to Cart
          </button>
          <Link
            href={`/products/${product._id}`}
            className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase text-slate-600 dark:text-white/60 bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/10 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
          >
            <Eye className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────
   PRODUCT CARD — LIST
───────────────────────────────────────────────── */
function ListCard({
  product, inCompare, onToggleCompare, onAddToCart,
}: {
  product: Product;
  inCompare: boolean;
  onToggleCompare: () => void;
  onAddToCart: () => void;
}) {
  const originalPrice = Math.floor(product.price * 1.38);
  const discount      = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  return (
    <article className="group flex gap-5 p-4 bg-white dark:bg-white/[0.025] border border-slate-100 dark:border-white/[0.06] hover:border-indigo-200/60 dark:hover:border-indigo-500/20 rounded-2xl shadow-sm hover:shadow-xl dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300">
      {/* Image */}
      <div className="relative h-32 w-32 flex-shrink-0 bg-slate-50 dark:bg-white/[0.02] rounded-xl flex items-center justify-center p-3 border border-slate-100 dark:border-white/[0.04] overflow-hidden">
        <div className="absolute top-1.5 left-1.5">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[8px] font-black uppercase">
            {discount}%
          </span>
        </div>
        <img
          src={product.images[0] || '/placeholder.png'}
          alt={product.name}
          className="max-h-24 max-w-full object-contain transition-transform duration-400 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-white/40">
              {product.category}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded uppercase text-white bg-gradient-to-r from-indigo-500 to-cyan-500">
              Nuvix ✔
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors duration-200 mb-1.5">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">{(product.ratings ?? 4.1).toFixed(1)}</span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-white/30">({Math.floor((product.ratings ?? 4) * 6)} reviews)</span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-white/30 ml-2">Stock: {product.stock}</span>
          </div>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-lg font-black text-slate-900 dark:text-white">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-slate-400 dark:text-white/30 line-through">
            ₹{originalPrice.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">{discount}% off</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 justify-center flex-shrink-0 w-36">
        <button
          onClick={onAddToCart}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 shadow-md active:scale-[0.98] transition-all duration-150"
          style={{ boxShadow: '0 4px 14px rgba(79,70,229,0.25)' }}
        >
          <ShoppingCart className="h-3 w-3" />Add to Cart
        </button>
        <Link href={`/products/${product._id}`}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase text-slate-600 dark:text-white/60 bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/10 transition-all duration-150">
          <Eye className="h-3 w-3" />View
        </Link>
        <button
          onClick={onToggleCompare}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-black tracking-wide uppercase border transition-all duration-150 ${
            inCompare
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
              : 'border-slate-200/80 dark:border-white/[0.08] text-slate-500 dark:text-white/40 hover:border-indigo-400 hover:text-indigo-500'
          }`}
        >
          <Scale className="h-3 w-3" />{inCompare ? 'Remove' : 'Compare'}
        </button>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────
   COMPARE TRAY (floating bottom bar)
───────────────────────────────────────────────── */
function CompareTray({
  list, onClear, onRemove, onOpenModal,
}: {
  list: Product[];
  onClear: () => void;
  onRemove: (id: string) => void;
  onOpenModal: () => void;
}) {
  if (list.length === 0) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,560px)]">
      {/* Glow */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500/30 via-violet-500/20 to-cyan-500/30 blur-xl pointer-events-none" />
      <div className="relative bg-white/90 dark:bg-[#0d1035]/95 backdrop-blur-xl border border-slate-200/70 dark:border-white/[0.10] rounded-2xl shadow-2xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] px-4 py-3.5 flex items-center gap-4">
        {/* Label */}
        <div className="flex-shrink-0">
          <p className="text-[9px] font-black tracking-widest uppercase text-slate-400 dark:text-white/30 mb-0.5">Comparing</p>
          <p className="text-xs font-black text-slate-700 dark:text-white">{list.length}/2 selected</p>
        </div>

        {/* Thumbnails */}
        <div className="flex-1 flex gap-2">
          {[0, 1].map(i => (
            <div key={i}
              className={`relative flex-1 h-12 rounded-xl flex items-center justify-center border overflow-hidden transition-all duration-200 ${
                list[i]
                  ? 'bg-slate-50 dark:bg-white/[0.04] border-indigo-200 dark:border-indigo-500/30'
                  : 'border-dashed border-slate-200 dark:border-white/[0.08] bg-transparent'
              }`}
            >
              {list[i] ? (
                <>
                  <img src={list[i].images[0]} alt={list[i].name} className="max-h-9 max-w-full object-contain px-2" />
                  <button
                    onClick={() => onRemove(list[i]._id)}
                    className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-slate-200 dark:bg-white/20 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-500/30 transition-colors"
                  >
                    <X className="h-2 w-2 text-slate-500 dark:text-white/60" />
                  </button>
                </>
              ) : (
                <span className="text-[9px] font-bold text-slate-300 dark:text-white/20 tracking-wider">Add Item</span>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={onClear}
            className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] text-slate-400 dark:text-white/40 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all duration-200">
            <X className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onOpenModal}
            disabled={list.length < 2}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-black tracking-wide uppercase text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 shadow-md disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-150"
          >
            <Scale className="h-3 w-3" />Compare
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   COMPARE MODAL
───────────────────────────────────────────────── */
function CompareModal({
  list, onClose, onAddToCart, onAICompare,
}: {
  list: Product[];
  onClose: () => void;
  onAddToCart: (p: Product) => void;
  onAICompare: () => void;
}) {
  if (list.length < 2) return null;

  const [a, b]  = list;
  const orgA    = Math.floor(a.price * 1.38);
  const orgB    = Math.floor(b.price * 1.38);
  const cheaper = a.price < b.price ? 'a' : 'b';

  const rows: { label: string; a: React.ReactNode; b: React.ReactNode }[] = [
    {
      label: 'Preview',
      a: (
        <div className="h-28 flex items-center justify-center p-3 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/[0.06]">
          <img src={a.images[0]} alt={a.name} className="max-h-20 max-w-full object-contain" />
        </div>
      ),
      b: (
        <div className="h-28 flex items-center justify-center p-3 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/[0.06]">
          <img src={b.images[0]} alt={b.name} className="max-h-20 max-w-full object-contain" />
        </div>
      ),
    },
    {
      label: 'Price',
      a: (
        <div className="text-center">
          <div className={`text-xl font-black ${cheaper === 'a' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
            ₹{a.price.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400 dark:text-white/30 line-through">₹{orgA.toLocaleString('en-IN')}</div>
          {cheaper === 'a' && <div className="text-[10px] font-black text-emerald-500 mt-0.5">✓ Best Price</div>}
        </div>
      ),
      b: (
        <div className="text-center">
          <div className={`text-xl font-black ${cheaper === 'b' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
            ₹{b.price.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400 dark:text-white/30 line-through">₹{orgB.toLocaleString('en-IN')}</div>
          {cheaper === 'b' && <div className="text-[10px] font-black text-emerald-500 mt-0.5">✓ Best Price</div>}
        </div>
      ),
    },
    {
      label: 'Rating',
      a: (
        <div className="flex flex-col items-center gap-1">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-sm font-black text-amber-600 dark:text-amber-400">{(a.ratings ?? 4.1).toFixed(1)}</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-white/30">{Math.floor((a.ratings ?? 4) * 6)} reviews</span>
        </div>
      ),
      b: (
        <div className="flex flex-col items-center gap-1">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-sm font-black text-amber-600 dark:text-amber-400">{(b.ratings ?? 4.1).toFixed(1)}</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-white/30">{Math.floor((b.ratings ?? 4) * 6)} reviews</span>
        </div>
      ),
    },
    {
      label: 'Stock',
      a: (
        <div className="text-center">
          <span className={`text-xs font-black ${a.stock <= 5 ? 'text-orange-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {a.stock <= 5 ? `⚠ Only ${a.stock} left` : `✓ In Stock (${a.stock})`}
          </span>
        </div>
      ),
      b: (
        <div className="text-center">
          <span className={`text-xs font-black ${b.stock <= 5 ? 'text-orange-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {b.stock <= 5 ? `⚠ Only ${b.stock} left` : `✓ In Stock (${b.stock})`}
          </span>
        </div>
      ),
    },
    {
      label: 'Category',
      a: <div className="text-center text-xs font-bold text-indigo-600 dark:text-indigo-400">{a.category}</div>,
      b: <div className="text-center text-xs font-bold text-indigo-600 dark:text-indigo-400">{b.category}</div>,
    },
    {
      label: 'Verified',
      a: <div className="text-center text-xs font-black text-cyan-600 dark:text-cyan-400">Nuvix Verified ✔</div>,
      b: <div className="text-center text-xs font-black text-cyan-600 dark:text-cyan-400">Nuvix Verified ✔</div>,
    },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0d1035] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl shadow-2xl dark:shadow-[0_30px_80px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* Header */}
        <div className="relative px-6 py-4 border-b border-slate-100 dark:border-white/[0.06] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center">
                <Scale className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-[9px] font-black tracking-widest uppercase text-slate-400 dark:text-white/30">Side-by-Side</p>
                <h2 className="text-sm font-black text-slate-900 dark:text-white">Product Comparison</h2>
              </div>
            </div>
            <button onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] text-slate-400 dark:text-white/40 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all duration-200">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto max-h-[65vh] px-6 py-5">
          {/* Column headers */}
          <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-4">
            <div />
            {[a, b].map((p, i) => (
              <div key={i} className="text-center px-2 py-2 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/[0.06]">
                <p className="text-[9px] font-black tracking-widest uppercase text-slate-400 dark:text-white/30 mb-0.5">Product {i + 1}</p>
                <p className="text-xs font-bold text-slate-800 dark:text-white line-clamp-2 leading-snug">{p.name}</p>
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="space-y-2">
            {rows.map((row, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-[120px_1fr_1fr] gap-3 items-center rounded-xl p-3 transition-colors ${idx % 2 === 0 ? 'bg-slate-50/60 dark:bg-white/[0.02]' : ''}`}
              >
                <div className="text-[10px] font-black tracking-wider uppercase text-slate-400 dark:text-white/30">
                  {row.label}
                </div>
                <div>{row.a}</div>
                <div>{row.b}</div>
              </div>
            ))}
          </div>

          {/* Buy buttons row */}
          <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-white/[0.06]">
            <div className="text-[10px] font-black tracking-wider uppercase text-slate-400 dark:text-white/30 flex items-center">
              Buy Now
            </div>
            {[a, b].map((p) => (
              <button key={p._id}
                onClick={() => { onAddToCart(p); onClose(); }}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 shadow-md active:scale-[0.98] transition-all duration-150">
                <ShoppingCart className="h-3 w-3" />Add to Cart
              </button>
            ))}
          </div>

          {/* AI Compare CTA */}
          <button
            onClick={onAICompare}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black tracking-wide uppercase text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 hover:opacity-90 shadow-xl shadow-indigo-500/25 active:scale-[0.99] transition-all duration-150"
          >
            <Sparkles className="h-4 w-4 text-cyan-200" />
            Deep Compare with AI Co-Shopper
            <Zap className="h-3.5 w-3.5 text-yellow-200" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────── */
function EmptyState({ query }: { query: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 gap-5">
      <div className="h-20 w-20 rounded-3xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center">
        <Package className="h-9 w-9 text-slate-300 dark:text-white/20" />
      </div>
      <div className="text-center">
        <h3 className="text-base font-black text-slate-700 dark:text-white mb-2">
          {query ? `No results for "${query}"` : 'No products found'}
        </h3>
        <p className="text-sm text-slate-400 dark:text-white/30 font-medium max-w-xs mx-auto leading-relaxed">
          Try different keywords, or ask the AI co-shopper for personalized recommendations.
        </p>
      </div>
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
        <Bot className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
        <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-300 tracking-wide">
          Ask AI: "Find me the best laptop under ₹50,000"
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────── */
export default function ShopPage() {
  const { products, loading, searchQuery } = useProductStore();
  const { addToCart }                      = useCartStore();
  const { addMessage, setInputValue }      = useChatStore();

  const [compareList, setCompareList]       = useState<Product[]>([]);
  const [isCompareModalOpen, setModalOpen]  = useState(false);
  const [sortKey, setSortKey]               = useState<SortKey>('featured');
  const [viewMode, setViewMode]             = useState<ViewMode>('grid');

  /* ── Sort ── */
  const sortedProducts = useMemo(() => {
    const arr = [...products];
    switch (sortKey) {
      case 'price_asc':  return arr.sort((a, b) => a.price - b.price);
      case 'price_desc': return arr.sort((a, b) => b.price - a.price);
      case 'rating':     return arr.sort((a, b) => (b.ratings ?? 0) - (a.ratings ?? 0));
      case 'newest':     return arr.reverse();
      default:           return arr;
    }
  }, [products, sortKey]);

  /* ── Compare ── */
  const toggleCompare = (product: Product) => {
    setCompareList(prev => {
      if (prev.some(i => i._id === product._id)) return prev.filter(i => i._id !== product._id);
      if (prev.length >= 2) return prev; // silent cap — tray shows state
      return [...prev, product];
    });
  };

  /* ── AI Compare ── */
  const handleAICompare = () => {
    if (compareList.length < 2) return;
    const prompt = `Compare "${compareList[0].name}" vs "${compareList[1].name}" — highlight specs, value for money, ratings, and give a final recommendation.`;
    setInputValue(prompt);
    addMessage({
      sender: 'ai',
      content: `📊 Starting AI comparison:\n\n1. **${compareList[0].name}**\n2. **${compareList[1].name}**\n\nAnalysing price, ratings, specs and value. Ask me anything!`,
    });
    setModalOpen(false);
  };

  const skeletonCount = viewMode === 'grid' ? 6 : 4;

  return (
    <MainLayout>
      {/* ── TOOLBAR ── */}
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        {/* Left: result count / query label */}
        <div>
          {searchQuery && !loading ? (
            <div className="flex items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
              <span className="text-sm font-bold text-slate-700 dark:text-white">
                Results for{' '}
                <span className="text-indigo-600 dark:text-indigo-300">"{searchQuery}"</span>
              </span>
              <span className="text-xs font-bold text-slate-400 dark:text-white/30">
                — {products.length} items
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
              <span className="text-sm font-bold text-slate-700 dark:text-white">
                All Products
                <span className="text-xs font-bold text-slate-400 dark:text-white/30 ml-1.5">
                  {!loading && `(${products.length})`}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Right: sort + view toggles */}
        <div className="flex items-center gap-2">
          <SortDropdown value={sortKey} onChange={setSortKey} />

          {/* View mode toggle */}
          <div className="flex items-center bg-white dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-xl overflow-hidden p-0.5 gap-0.5">
            {(['grid', 'list'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                title={`${mode} view`}
                className={`h-8 w-8 flex items-center justify-center rounded-lg text-[10px] font-black transition-all duration-200 ${
                  viewMode === mode
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                }`}
              >
                {mode === 'grid'
                  ? <SlidersHorizontal className="h-3.5 w-3.5" />
                  : <ArrowUpDown className="h-3.5 w-3.5" />
                }
              </button>
            ))}
          </div>

          {/* Compare count pill */}
          {compareList.length > 0 && (
            <div className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-[11px] font-black text-indigo-600 dark:text-indigo-300">
              <Scale className="h-3 w-3" />
              {compareList.length}/2
            </div>
          )}
        </div>
      </div>

      {/* ── PRODUCT GRID / LIST ── */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? Array.from({ length: skeletonCount }).map((_, i) => <CardSkeleton key={i} />)
            : sortedProducts.length > 0
              ? sortedProducts.map(product => (
                  <GridCard
                    key={product._id}
                    product={product}
                    inCompare={compareList.some(i => i._id === product._id)}
                    onToggleCompare={() => toggleCompare(product)}
                    onAddToCart={() => addToCart(product)}
                  />
                ))
              : <EmptyState query={searchQuery} />
          }
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {loading
            ? Array.from({ length: skeletonCount }).map((_, i) => <CardSkeleton key={i} list />)
            : sortedProducts.length > 0
              ? sortedProducts.map(product => (
                  <ListCard
                    key={product._id}
                    product={product}
                    inCompare={compareList.some(i => i._id === product._id)}
                    onToggleCompare={() => toggleCompare(product)}
                    onAddToCart={() => addToCart(product)}
                  />
                ))
              : <EmptyState query={searchQuery} />
          }
        </div>
      )}

      {/* ── COMPARE TRAY ── */}
      <CompareTray
        list={compareList}
        onClear={() => setCompareList([])}
        onRemove={id => setCompareList(prev => prev.filter(i => i._id !== id))}
        onOpenModal={() => setModalOpen(true)}
      />

      {/* ── COMPARE MODAL ── */}
      {isCompareModalOpen && (
        <CompareModal
          list={compareList}
          onClose={() => setModalOpen(false)}
          onAddToCart={addToCart}
          onAICompare={handleAICompare}
        />
      )}
    </MainLayout>
  );
}