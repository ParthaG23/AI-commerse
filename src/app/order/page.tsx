'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import MainLayout from '../components/MainLayout';
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  ChevronRight,
  Clock,
  ShoppingBag,
  MapPin,
  CreditCard,
  RefreshCw,
  AlertCircle,
  Loader2,
  Truck,
  Sparkles,
  Receipt,
  Calendar,
  Hash,
} from 'lucide-react';

/* ─── Types ─── */
interface OrderItem {
  name: string;
  quantity: number;
  image: string;
  price: number;
  product: string;
}

interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface Order {
  _id: string;
  createdAt: string;
  status: string;
  totalPrice: number;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
}

/* ─── Status config ─── */
type StatusKey = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

const statusConfig: Record<StatusKey, { label: string; color: string; bg: string; border: string; dot: string }> = {
  Processing: {
    label: 'Processing',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/25',
    dot: 'bg-amber-500',
  },
  Shipped: {
    label: 'Shipped',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    border: 'border-blue-200 dark:border-blue-500/25',
    dot: 'bg-blue-500',
  },
  Delivered: {
    label: 'Delivered',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/25',
    dot: 'bg-emerald-500',
  },
  Cancelled: {
    label: 'Cancelled',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-500/10',
    border: 'border-red-200 dark:border-red-500/25',
    dot: 'bg-red-500',
  },
};

function getStatusConfig(status: string) {
  return statusConfig[status as StatusKey] ?? statusConfig['Processing'];
}

/* ─── Step definitions for progress tracker ─── */
const STEPS = ['Ordered', 'Shipped', 'Delivered'] as const;
type Step = typeof STEPS[number];

function getStepIndex(status: string): number {
  if (status === 'Delivered') return 2;
  if (status === 'Shipped') return 1;
  return 0;
}

/* ─── Progress Tracker ─── */
function ProgressTracker({ status }: { status: string }) {
  const activeIdx = getStepIndex(status);
  const cancelled = status === 'Cancelled';

  if (cancelled) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
        <AlertCircle size={13} className="text-red-500 flex-shrink-0" />
        <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Order Cancelled</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 select-none">
      {STEPS.map((step, i) => {
        const done = i <= activeIdx;
        const active = i === activeIdx;
        return (
          <div key={step} className="flex items-center gap-1">
            <div className="flex flex-col items-center gap-1">
              <div className={`
                h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300
                ${done
                  ? 'bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-md shadow-indigo-500/25'
                  : 'bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1]'
                }
                ${active ? 'ring-2 ring-indigo-400/40 ring-offset-1 ring-offset-white dark:ring-offset-transparent' : ''}
              `}>
                {done ? (
                  <CheckCircle2 size={13} className="text-white" />
                ) : (
                  <Clock size={11} className="text-slate-400 dark:text-white/30" />
                )}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-wider whitespace-nowrap ${done ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-white/25'}`}>
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-8 h-0.5 rounded-full mb-3.5 transition-all duration-500 flex-shrink-0">
                <div className={`h-full rounded-full transition-all duration-500 ${i < activeIdx ? 'bg-gradient-to-r from-indigo-500 to-cyan-500' : 'bg-slate-200 dark:bg-white/[0.08]'}`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Skeleton loader ─── */
function OrderSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="p-5 rounded-2xl border border-slate-100 dark:border-white/[0.07] space-y-4 bg-white dark:bg-white/[0.02]">
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className="skeleton h-3 w-40 rounded-full" />
              <div className="skeleton h-2.5 w-28 rounded-full" />
            </div>
            <div className="skeleton h-6 w-20 rounded-full" />
          </div>
          <div className="flex gap-3">
            <div className="skeleton h-14 w-14 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="skeleton h-2.5 w-48 rounded-full" />
              <div className="skeleton h-2 w-24 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Component ─── */
export default function OrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error(`Failed to fetch orders (${response.status})`);
      const data = await response.json();
      setOrders(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="skeleton h-8 w-8 rounded-xl" />
            <div className="skeleton h-4 w-32 rounded-full" />
          </div>
          <OrderSkeleton />
        </div>
      </MainLayout>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 max-w-sm text-center space-y-5">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center">
            <AlertCircle size={28} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-800 dark:text-white">Failed to Load Orders</h2>
            <p className="text-xs text-slate-500 dark:text-white/40 font-medium mt-1">{error}</p>
          </div>
          <Button
            onClick={fetchOrders}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 text-white font-black text-xs px-5 h-9 rounded-xl shadow-md shadow-indigo-500/20 border-none transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw size={13} /> Try Again
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50/60 dark:bg-transparent transition-colors duration-300">
        <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">

          {/* ── Top bar ── */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              asChild
              className="flex items-center gap-2 text-slate-500 dark:text-white/40 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] font-black text-[10px] uppercase tracking-widest rounded-xl h-9 px-3 transition-all"
            >
              <Link href="/shop">
                <ArrowLeft size={14} /> Back to Shop
              </Link>
            </Button>

            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              {orders.length} Order{orders.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* ── Page header card ── */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/[0.07] shadow-xl shadow-slate-200/50 dark:shadow-black/30 bg-white dark:bg-[#0d1035]/80 backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.07),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.14),transparent)] pointer-events-none" />
            <div className="relative px-6 py-5 flex items-center gap-4">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                <Package size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-base font-black uppercase tracking-wide text-slate-900 dark:text-white">My Orders</h1>
                <p className="text-[10px] text-slate-500 dark:text-white/40 font-medium mt-0.5">Track shipments and download Nuvix-verified invoices</p>
              </div>
              <div className="ml-auto hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                <Sparkles size={10} className="text-indigo-500 dark:text-indigo-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-300">AI Tracked</span>
              </div>
            </div>
          </div>

          {/* ── Orders list ── */}
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => {
                const sc = getStatusConfig(order.status);
                return (
                  <div
                    key={order._id}
                    className="group relative rounded-2xl border border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-white/[0.02] hover:border-indigo-200 dark:hover:border-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/[0.06] transition-all duration-300 overflow-hidden"
                  >
                    {/* Left accent bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${sc.dot} opacity-60 group-hover:opacity-100 transition-opacity`} />

                    <div className="p-5 pl-6 space-y-4">

                      {/* ── Order meta row ── */}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Hash size={10} className="text-slate-400 dark:text-white/25" />
                            <span className="text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-wider">Order ID</span>
                          </div>
                          <p className="text-xs font-black text-slate-800 dark:text-white font-mono tracking-tight">{order._id}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-white/30 font-medium">
                            <Calendar size={10} />
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Status badge */}
                          <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${sc.color} ${sc.bg} ${sc.border}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${sc.dot} ${order.status !== 'Delivered' && order.status !== 'Cancelled' ? 'animate-pulse' : ''}`} />
                            {sc.label}
                          </span>

                          {/* Total */}
                          <div className="text-right">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25">Total</p>
                            <p className="text-base font-black text-slate-900 dark:text-white leading-none">
                              ₹{order.totalPrice.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* ── Items + tracker + action ── */}
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center pt-3 border-t border-slate-100 dark:border-white/[0.05]">

                        {/* Items */}
                        <div className="flex-1 space-y-2.5 min-w-0">
                          {order.orderItems.map((item) => (
                            <div key={item.product} className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/[0.07] p-1.5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-contain mix-blend-multiply dark:mix-blend-normal"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 dark:text-white/90 leading-snug truncate">{item.name}</p>
                                <p className="text-[10px] text-slate-400 dark:text-white/30 font-semibold">
                                  Qty {item.quantity} · ₹{item.price.toLocaleString('en-IN')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Progress tracker */}
                        <div className="flex-shrink-0">
                          <ProgressTracker status={order.status} />
                        </div>

                        {/* Details button */}
                        <Button
                          variant="outline"
                          onClick={() => handleViewDetails(order)}
                          className="flex-shrink-0 flex items-center gap-1.5 border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-white/60 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/[0.08] font-black text-[10px] uppercase tracking-widest h-8 px-3 rounded-xl transition-all duration-200 cursor-pointer"
                        >
                          Details <ChevronRight size={12} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── Empty state ── */
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-5">
              <div className="relative">
                <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-white/[0.06] dark:to-white/[0.02] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center shadow-lg shadow-slate-200/60 dark:shadow-black/20">
                  <ShoppingBag size={32} className="text-slate-300 dark:text-white/20" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/30">
                  <Sparkles size={12} className="text-white" />
                </div>
              </div>
              <div className="space-y-1.5 max-w-xs">
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-700 dark:text-white/80">No Orders Yet</h3>
                <p className="text-[11px] text-slate-400 dark:text-white/30 font-medium leading-relaxed">
                  Your order history is empty. Start exploring and place your first Nuvix order!
                </p>
              </div>
              <Link href="/shop">
                <Button className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 text-white font-black text-[10px] uppercase tracking-widest px-5 h-9 rounded-xl shadow-md shadow-indigo-500/20 border-none transition-all active:scale-95 cursor-pointer">
                  <ShoppingBag size={13} /> Browse Shop
                </Button>
              </Link>
            </div>
          )}

        </div>
      </div>

      {/* ── Invoice Dialog ── */}
      {selectedOrder && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg w-full bg-white dark:bg-[#0d1035] border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-white rounded-2xl shadow-2xl dark:shadow-[0_8px_40px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-200 overflow-hidden">

            {/* Top glow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

            <DialogHeader className="border-b border-slate-100 dark:border-white/[0.07] pb-4">
              <DialogTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">
                <div className="h-7 w-7 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-100 dark:border-indigo-500/25 flex items-center justify-center">
                  <Receipt size={13} className="text-indigo-500 dark:text-indigo-400" />
                </div>
                Invoice Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 py-1 max-h-[70vh] overflow-y-auto pr-1">

              {/* Order summary pill */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.07]">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest">
                    <Hash size={9} /> Order ID
                  </div>
                  <p className="text-xs font-black text-slate-800 dark:text-white font-mono">{selectedOrder._id}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-white/30 font-medium">
                    <Calendar size={10} />
                    {new Date(selectedOrder.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>
                {(() => {
                  const sc = getStatusConfig(selectedOrder.status);
                  return (
                    <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${sc.color} ${sc.bg} ${sc.border}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  );
                })()}
              </div>

              {/* Shipping + Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.07] space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center">
                      <MapPin size={11} className="text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">Shipping To</span>
                  </div>
                  <div className="space-y-0.5 pl-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-white/90">{selectedOrder.shippingAddress.address}</p>
                    <p className="text-xs font-bold text-slate-600 dark:text-white/60">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</p>
                    <p className="text-xs font-bold text-slate-600 dark:text-white/60">{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.07] space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 flex items-center justify-center">
                      <CreditCard size={11} className="text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">Payment</span>
                  </div>
                  <div className="pl-1 space-y-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-white/90">{selectedOrder.paymentMethod}</p>
                    <div className="flex items-center gap-1.5">
                      <Truck size={10} className="text-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Free Delivery</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items breakdown */}
              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 px-1">Items</span>
                <div className="rounded-2xl border border-slate-100 dark:border-white/[0.07] overflow-hidden divide-y divide-slate-100 dark:divide-white/[0.05]">
                  {selectedOrder.orderItems.map((item) => (
                    <div key={item.product} className="flex items-center gap-3 p-3.5 bg-white dark:bg-white/[0.01] hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                      <div className="h-10 w-10 rounded-lg bg-slate-50 dark:bg-white/[0.05] border border-slate-100 dark:border-white/[0.07] p-1 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img src={item.image} alt={item.name} className="h-full w-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-white/90 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-white/30 font-semibold">Qty {item.quantity}</p>
                      </div>
                      <p className="text-xs font-black text-slate-900 dark:text-white flex-shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grand total */}
              <div className="flex items-baseline justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-500/10 dark:to-cyan-500/5 border border-indigo-100 dark:border-indigo-500/20">
                <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-white/60">Grand Total</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  ₹{selectedOrder.totalPrice.toLocaleString('en-IN')}
                </span>
              </div>

            </div>
          </DialogContent>
        </Dialog>
      )}
    </MainLayout>
  );
}