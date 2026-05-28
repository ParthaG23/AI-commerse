'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import NuvixLogo from './NuvixLogo';
import { useAuthStore } from '../store/auth';
import { useProductStore } from '../store/product';
import { Button } from '../../components/ui/button';
import { useIsMounted } from '../hooks/useIsMounted';
import { Input } from '../../components/ui/input';
import { useCartStore } from '../store/cart';
import { useState, useEffect } from 'react';
import {
  ShoppingBag,
  User,
  Package,
  LogOut,
  Search,
  Menu,
  X,
  ChevronDown,
  ShoppingCart,
  LogIn,
  Sparkles,
  Sun,
  Moon,
  Zap,
} from 'lucide-react';

export default function Header() {
  const { isAuthenticated, logout } = useAuthStore();
  const { items } = useCartStore();
  const { searchQuery, setSearchQuery, setProducts, setLoading } = useProductStore();
  const router = useRouter();
  const isMounted = useIsMounted();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchFocused, setSearchFocused] = useState(false);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'light';
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products?search=${searchQuery}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
    router.push('/shop');
  };

  if (!isMounted) return null;

  return (
    <>
      <header className="sticky top-0 z-50 transition-all duration-300">
        <div className="
          bg-white/80 dark:bg-[#07091a]/90
          backdrop-blur-xl
          border-b border-slate-200/60 dark:border-white/[0.06]
          shadow-[0_1px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_32px_rgba(0,0,0,0.4)]
          transition-colors duration-300
        ">
          {/* Top ambient glow line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent dark:via-indigo-400/30" />

          {/* ── MAIN ROW: three-column layout ── */}
          <div className="container mx-auto px-4 lg:px-8 py-3 flex items-center justify-between gap-4">

            {/* ═══ LEFT: burger + logo ═══ */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Mobile burger */}
              <button
                className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] text-slate-600 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-90"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-4.5 w-4.5" />
              </button>

              {/* Logo */}
              <Link href="/" className="flex items-center group">
                <div className="
                  flex items-center gap-2.5 px-3 py-1.5 rounded-full
                  bg-slate-50/50 dark:bg-white/[0.02]
                  border border-slate-200/50 dark:border-white/[0.05]
                  shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]
                  backdrop-blur-md
                  transition-all duration-300
                  group-hover:border-indigo-500/30 dark:group-hover:border-indigo-500/20
                  group-hover:bg-slate-100/60 dark:group-hover:bg-white/[0.04]
                  group-hover:shadow-[0_4px_16px_rgba(99,102,241,0.12)] dark:group-hover:shadow-[0_6px_24px_rgba(99,102,241,0.25)]
                  active:scale-95
                ">
                  {/* Glowing Vector Logo Icon */}
                  <div className="flex-shrink-0 transition-transform duration-300 group-hover:rotate-[6deg] group-hover:scale-110">
                    <NuvixLogo size={32} glow={true} />
                  </div>
                  
                  {/* Branding text inside the capsule badge */}
                  <div className="flex flex-col leading-none pr-1">
                    <span className="text-[12px] font-black tracking-[0.25em] bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 dark:from-indigo-400 dark:via-violet-400 dark:to-cyan-300 bg-clip-text text-transparent uppercase select-none">
                      NUVIX
                    </span>
                    <span className="text-[7.5px] font-bold text-slate-400 dark:text-white/30 tracking-[0.15em] uppercase select-none mt-0.5">
                      AI Commerce
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* ═══ CENTER: search bar (truly centered) ═══ */}
            <div className="hidden md:flex flex-1 max-w-lg relative">
              {/* Focus glow border */}
              <div className={`absolute -inset-[1px] rounded-full transition-opacity duration-300 ${searchFocused ? 'opacity-100' : 'opacity-0'} bg-gradient-to-r from-indigo-500/40 via-violet-500/30 to-cyan-500/40 blur-[2px]`} />
              <div className="relative w-full flex items-center bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-full pl-4 pr-1.5 py-1 transition-all duration-300 hover:border-slate-300 dark:hover:border-white/15">
                <Search className="h-3.5 w-3.5 text-slate-400 dark:text-white/30 mr-2.5 flex-shrink-0" />
                <Input
                  type="text"
                  placeholder="Search gadgets, brands, and more..."
                  className="w-full text-slate-900 dark:text-white h-7 border-none focus-visible:ring-0 placeholder-slate-400 dark:placeholder-white/25 text-xs pl-0 shadow-none bg-transparent font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
                <button
                  className="h-7 w-7 bg-gradient-to-br from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md shadow-indigo-500/20 active:scale-90 flex-shrink-0"
                  onClick={handleSearch}
                >
                  <Search className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* ═══ RIGHT: desktop nav ═══ */}
            <nav className="hidden lg:flex items-center gap-1.5 flex-shrink-0">

              {/* Shop */}
              <Link
                href="/shop"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-white/50 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-white/[0.05] transition-all duration-200"
              >
                <ShoppingBag size={14} />
                <span>Shop</span>
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-white/50 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-white/[0.05] transition-all duration-200"
              >
                <div className="relative">
                  <ShoppingCart size={15} />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-br from-indigo-600 to-cyan-500 text-white text-[8px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center shadow-md shadow-indigo-500/30 animate-pulse">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span>Cart</span>
              </Link>

              {/* Divider */}
              <div className="h-5 w-px bg-slate-200 dark:bg-white/[0.08] mx-1" />

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                className="relative h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] text-slate-600 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-indigo-600 dark:hover:text-white transition-all active:scale-90 cursor-pointer overflow-hidden group"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.15)_0%,_transparent_70%)] transition-opacity duration-300" />
                <span className="relative">
                  {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
                </span>
              </button>

              {/* Divider */}
              <div className="h-5 w-px bg-slate-200 dark:bg-white/[0.08] mx-1" />

              {/* Auth */}
              {!isAuthenticated ? (
                <Link href="/login">
                  <button
                    className="relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider text-white overflow-hidden group cursor-pointer active:scale-95 transition-all shadow-md shadow-indigo-500/20"
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1, #06b6d4)' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <LogIn size={13} className="relative" />
                    <span className="relative">Join Nuvix</span>
                  </button>
                </Link>
              ) : (
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-white/60 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-white/[0.05] transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-white/[0.08]">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-sm">
                      <User size={12} className="text-white" />
                    </div>
                    <span>Account</span>
                    <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-200 text-slate-400 dark:text-white/30" />
                  </button>

                  {/* Dropdown */}
                  <div className="absolute top-full right-0 mt-2 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-50">
                    <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-indigo-500/20 via-transparent to-cyan-500/10 blur-[1px]" />
                    <div className="relative bg-white dark:bg-[#0d1035] border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-2xl dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden">
                      <div className="px-4 py-3 bg-slate-50 dark:bg-white/[0.03] border-b border-slate-100 dark:border-white/[0.06]">
                        <p className="text-[9px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest">Signed In</p>
                        <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5 truncate">
                          {useAuthStore.getState().user?.name}
                        </p>
                      </div>
                      <div className="py-1.5">
                        <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-white/[0.04] text-[11px] font-bold text-slate-700 dark:text-white/70 hover:text-indigo-600 dark:hover:text-white transition-colors group/item">
                          <div className="h-6 w-6 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center group-hover/item:bg-indigo-100 dark:group-hover/item:bg-indigo-500/20 transition-colors">
                            <User size={12} className="text-indigo-500 dark:text-indigo-400" />
                          </div>
                          <span>My Profile</span>
                        </Link>
                        <Link href="/order" className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-white/[0.04] text-[11px] font-bold text-slate-700 dark:text-white/70 hover:text-indigo-600 dark:hover:text-white transition-colors group/item">
                          <div className="h-6 w-6 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center group-hover/item:bg-indigo-100 dark:group-hover/item:bg-indigo-500/20 transition-colors">
                            <Package size={12} className="text-indigo-500 dark:text-indigo-400" />
                          </div>
                          <span>My Orders</span>
                        </Link>
                        <div className="mx-3 my-1 h-px bg-slate-100 dark:bg-white/[0.06]" />
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-[11px] font-bold text-red-500 dark:text-red-400 transition-colors cursor-pointer group/item"
                        >
                          <div className="h-6 w-6 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center group-hover/item:bg-red-100 dark:group-hover/item:bg-red-500/20 transition-colors">
                            <LogOut size={12} className="text-red-500 dark:text-red-400" />
                          </div>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </nav>

            {/* ═══ RIGHT mobile actions ═══ */}
            <div className="flex items-center gap-2 lg:hidden flex-shrink-0">
              <button
                onClick={toggleTheme}
                className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] text-slate-600 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-90 cursor-pointer"
              >
                {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
              </button>

              <Link href="/cart" className="relative h-8 w-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                <ShoppingCart size={15} />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-indigo-600 to-cyan-500 text-white text-[8px] font-black rounded-full h-4 min-w-4 px-0.5 flex items-center justify-center shadow-md">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>

          </div>{/* end main row */}

          {/* ── Mobile search bar ── */}
          <div className="md:hidden px-4 pb-3">
            <div className="w-full flex items-center bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-full pl-4 pr-1.5 py-1 transition-all">
              <Search className="h-3.5 w-3.5 text-slate-400 dark:text-white/30 mr-2 flex-shrink-0" />
              <Input
                type="text"
                placeholder="Search products..."
                className="w-full text-slate-900 dark:text-white h-7 border-none focus-visible:ring-0 placeholder-slate-400 dark:placeholder-white/25 text-xs pl-0 shadow-none bg-transparent font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                className="h-7 w-7 bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 flex-shrink-0"
                onClick={handleSearch}
              >
                <Search className="h-3 w-3" />
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* ══════════════════════════════════════
          MOBILE SIDE DRAWER
      ══════════════════════════════════════ */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="relative flex flex-col w-4/5 max-w-xs h-full shadow-2xl">
            <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-indigo-500/30 to-transparent" />

            <div className="flex flex-col h-full bg-white dark:bg-[#07091a] border-r border-slate-100 dark:border-white/[0.06] transition-colors duration-300">

              {/* Drawer header */}
              <div className="relative px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent dark:from-indigo-500/10 pointer-events-none" />
                <div className="relative flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 dark:from-indigo-500/30 dark:to-cyan-500/20 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center">
                    <User size={16} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest">
                      {isAuthenticated ? 'Signed In' : 'Guest User'}
                    </p>
                    <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5">
                      {isAuthenticated ? useAuthStore.getState().user?.name?.split(' ')[0] : 'Welcome!'}
                    </p>
                  </div>
                </div>
                <button
                  className="relative h-8 w-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] text-slate-500 dark:text-white/50 hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-90"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Nav items */}
              <div className="flex-1 overflow-y-auto py-3">
                {/* AI badge */}
                <div className="mx-4 mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                  <Zap size={12} className="text-indigo-500 dark:text-indigo-400" />
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">AI Co-Shopper Active</span>
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                </div>

                <ul className="space-y-0.5 px-3">
                  {[
                    { href: '/shop', icon: <ShoppingBag size={15} />, label: 'Shop with AI', badge: null },
                    { href: '/cart', icon: <ShoppingCart size={15} />, label: 'My Cart', badge: totalItems > 0 ? totalItems : null },
                  ].map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-white/60 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-white/[0.05] transition-all"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="text-slate-400 dark:text-white/30">{item.icon}</span>
                        <span className="uppercase tracking-wider">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto h-5 min-w-5 px-1 bg-gradient-to-br from-indigo-600 to-cyan-500 text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-sm">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}

                  <li className="my-2 mx-1 h-px bg-slate-100 dark:bg-white/[0.06]" />

                  {isAuthenticated ? (
                    <>
                      {[
                        { href: '/profile', icon: <User size={15} />, label: 'My Profile' },
                        { href: '/order', icon: <Package size={15} />, label: 'My Orders' },
                      ].map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-white/60 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-white/[0.05] transition-all"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <span className="text-slate-400 dark:text-white/30">{item.icon}</span>
                            <span className="uppercase tracking-wider">{item.label}</span>
                          </Link>
                        </li>
                      ))}
                      <li className="my-2 mx-1 h-px bg-slate-100 dark:bg-white/[0.06]" />
                      <li>
                        <button
                          onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
                        >
                          <LogOut size={15} />
                          <span className="uppercase tracking-wider">Sign Out</span>
                        </button>
                      </li>
                    </>
                  ) : (
                    <li>
                      <Link
                        href="/login"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <LogIn size={15} />
                        <span className="uppercase tracking-wider">Login / Register</span>
                      </Link>
                    </li>
                  )}
                </ul>
              </div>

              {/* Drawer footer */}
              <div className="px-5 py-4 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  <span className="text-[9px] font-black text-slate-400 dark:text-white/25 uppercase tracking-widest">100% Secure · AI Powered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}