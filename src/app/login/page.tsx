'use client';

import { useAuthStore } from '../store/auth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Sparkles, ArrowLeft, MessageSquare, ShieldCheck, Cpu, Watch, Star, Zap } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuthStore();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user);
        router.push('/shop');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-[#050810] text-slate-800 dark:text-white overflow-hidden transition-colors duration-300">

      {/* ══════════════════════════════════════
          LEFT PANEL
      ══════════════════════════════════════ */}
      <div className="relative w-full md:w-[48%] lg:w-[52%] flex flex-col justify-between p-8 md:p-12 lg:p-16 overflow-hidden shrink-0">

        {/* ── LIGHT MODE background ── */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-cyan-600 dark:hidden" />

        {/* ── DARK MODE background ── */}
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-[#0a0f2e] via-[#0d1235] to-[#050810]" />

        {/* Light mode grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:32px_32px] dark:hidden" />

        {/* Dark mode grid */}
        <div className="absolute inset-0 hidden dark:block bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:32px_32px]" />

        {/* Light mode orbs */}
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-white/10 blur-[130px] animate-pulse dark:hidden" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-cyan-300/20 blur-[120px] animate-pulse dark:hidden" style={{ animationDuration: '8s', animationDelay: '2s' }} />

        {/* Dark mode orbs */}
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[130px] animate-pulse hidden dark:block" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-cyan-500/15 blur-[120px] animate-pulse hidden dark:block" style={{ animationDuration: '8s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-violet-600/10 blur-[100px] animate-pulse hidden dark:block" style={{ animationDuration: '10s', animationDelay: '1s' }} />

        {/* Right edge accent */}
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-white/20 to-transparent" />

        {/* ── Brand Header ── */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-white/20 dark:bg-gradient-to-br dark:from-indigo-500 dark:to-cyan-400 flex items-center justify-center shadow-[0_0_24px_rgba(255,255,255,0.25)] dark:shadow-[0_0_24px_rgba(99,102,241,0.6)] backdrop-blur-sm border border-white/30 dark:border-transparent">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-[0.25em] text-white uppercase select-none">NUVIX</span>
          <div className="ml-2 px-2.5 py-0.5 rounded-full bg-white/15 dark:bg-white/5 border border-white/25 dark:border-white/10 text-[9px] font-black text-white dark:text-cyan-300 tracking-widest uppercase backdrop-blur-sm">
            Premium
          </div>
        </div>

        {/* ── Central Mockup ── */}
        <div className="relative z-10 my-auto py-8 md:py-0 flex flex-col items-center">

          {/* Floating stats row */}
          <div className="flex items-center gap-3 mb-8 flex-wrap justify-center">
            {[
              { icon: <Star size={10} className="text-amber-300 dark:text-amber-400" />, label: '4.9 Rating' },
              { icon: <Zap size={10} className="text-cyan-200 dark:text-cyan-400" />, label: 'AI Powered' },
              { icon: <ShieldCheck size={10} className="text-emerald-300 dark:text-emerald-400" />, label: 'Verified' },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-sm">
                {badge.icon}
                <span className="text-[9px] font-bold text-white/80 tracking-wider">{badge.label}</span>
              </div>
            ))}
          </div>

          {/* Main glass card */}
          <div className="w-full max-w-[340px] relative">
            {/* Light mode glow border */}
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-white/40 via-transparent to-cyan-300/30 blur-[2px] dark:hidden" />
            {/* Dark mode glow border */}
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-indigo-500/50 via-transparent to-cyan-500/30 blur-[2px] hidden dark:block" />

            <div className="relative bg-white/10 dark:bg-white/[0.04] border border-white/20 dark:border-white/[0.08] rounded-2xl p-5 backdrop-blur-xl shadow-2xl">

              {/* Card header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/15 dark:border-white/[0.07]">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-300 dark:bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                  <span className="text-[9px] font-black text-white/90 uppercase tracking-widest">Co-Shopper Active</span>
                </div>
                <Cpu size={13} className="text-cyan-200 dark:text-cyan-400" style={{ animation: 'spin 4s linear infinite' }} />
              </div>

              {/* User bubble */}
              <div className="flex justify-end mb-3">
                <div className="bg-white/15 dark:bg-indigo-600/30 border border-white/20 dark:border-indigo-500/20 text-[11px] font-semibold py-2 px-3.5 rounded-2xl rounded-tr-sm text-white max-w-[85%] leading-relaxed shadow-lg">
                  "Find me a smart watch under ₹8k"
                </div>
              </div>

              {/* AI bubble */}
              <div className="flex justify-start mb-4">
                <div className="bg-white/10 dark:bg-gradient-to-br dark:from-indigo-600/40 dark:to-cyan-600/20 border border-white/15 dark:border-white/10 text-[11px] font-semibold py-2.5 px-3.5 rounded-2xl rounded-tl-sm text-white max-w-[90%] leading-relaxed shadow-lg">
                  <div className="flex items-start space-x-2">
                    <MessageSquare size={12} className="text-cyan-200 dark:text-cyan-300 mt-0.5 flex-shrink-0" />
                    <span>Here's the best match for you!</span>
                  </div>
                  {/* Product card */}
                  <div className="mt-3 p-2.5 bg-white/10 dark:bg-white/[0.06] rounded-xl border border-white/15 dark:border-white/[0.08] flex items-center gap-3">
                    <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                      <Watch className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-white leading-none truncate">Nuvix Pro Watch X1</p>
                      <p className="text-[9px] text-cyan-200 dark:text-cyan-300 font-bold mt-1">₹7,499</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="h-1 w-1 rounded-full bg-emerald-300 dark:bg-emerald-400" />
                        <p className="text-[8px] text-emerald-200 dark:text-emerald-400 font-bold">Verified Deal · Free Delivery</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Typing indicator */}
              <div className="flex items-center gap-2 px-1">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="h-1.5 w-1.5 rounded-full bg-white/40 dark:bg-indigo-400/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <span className="text-[9px] text-white/50 dark:text-white/30 font-medium">Nuvix is thinking…</span>
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div className="text-center mt-8 space-y-2 max-w-xs">
            <h3 className="text-lg font-extrabold text-white tracking-tight leading-snug">
              Your AI Shopping{' '}
              <span className="text-cyan-200 dark:bg-gradient-to-r dark:from-indigo-400 dark:to-cyan-300 dark:bg-clip-text dark:text-transparent">
                Co-Pilot
              </span>
            </h3>
            <p className="text-[11px] text-white/55 dark:text-white/40 font-medium leading-relaxed">
              Describe what you want. Compare specs. Let Nuvix plan your perfect cart.
            </p>
          </div>
        </div>

        {/* Trust footer */}
        <div className="relative z-10 hidden md:flex items-center space-x-2.5">
          <ShieldCheck size={14} className="text-cyan-200 dark:text-cyan-400" />
          <span className="text-[10px] text-white/50 font-semibold tracking-wider uppercase">100% Buyer Protection · Guaranteed Quality</span>
        </div>
      </div>

      {/* ══════════════════════════════════════
          RIGHT PANEL
      ══════════════════════════════════════ */}
      <div className="flex-1 flex flex-col relative bg-white dark:bg-[#07091a] transition-colors duration-300">

        {/* Light mode subtle texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.05)_0%,_transparent_60%)] dark:hidden" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(6,182,212,0.04)_0%,_transparent_60%)] dark:hidden" />

        {/* Dark mode texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.07)_0%,_transparent_60%)] hidden dark:block" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(6,182,212,0.05)_0%,_transparent_60%)] hidden dark:block" />

        {/* Top bar */}
        <div className="relative z-10 px-6 py-5 flex items-center justify-between border-b border-slate-100 dark:border-white/[0.04] transition-colors duration-300">
          <Button
            variant="ghost"
            asChild
            className="text-slate-500 dark:text-white/40 font-bold hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white/80 rounded-full transition-all text-xs"
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
          </Button>

          {/* Live indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] transition-colors duration-300">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span className="text-[9px] font-black text-slate-400 dark:text-white/50 tracking-widest uppercase">System Online</span>
          </div>
        </div>

        {/* Form area */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">

            {/* Heading */}
            <div className="mb-10 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 mb-5 transition-colors duration-300">
                <Sparkles size={10} className="text-indigo-500 dark:text-indigo-400" />
                <span className="text-[9px] font-black text-indigo-500 dark:text-indigo-300 tracking-widest uppercase">Secure Login</span>
              </div>
              <h2 className="text-3xl font-black tracking-tight leading-none mb-3 text-slate-900 dark:text-white">
                Welcome<br />
                <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-500 dark:from-indigo-400 dark:via-violet-400 dark:to-cyan-300 bg-clip-text text-transparent">
                  back.
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-white/35 font-medium leading-relaxed max-w-sm transition-colors duration-300">
                Sign in to access your cart, orders, and the Nuvix AI Co-Shopper experience.
              </p>
            </div>

            {/* Form card */}
            <div className="relative">
              {/* Light mode card border */}
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-indigo-200/60 via-transparent to-cyan-200/40 blur-[1px] dark:hidden" />
              {/* Dark mode card border */}
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-indigo-500/20 via-transparent to-cyan-500/10 blur-[1px] hidden dark:block" />

              <div className="relative bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07] rounded-2xl p-7 shadow-xl dark:shadow-none backdrop-blur-sm transition-colors duration-300">

                <form onSubmit={handleLogin} className="space-y-5">

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-[0.15em] block" htmlFor="email">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 h-11 text-xs font-semibold px-4 focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:border-indigo-400 transition-all duration-200 hover:border-slate-300 dark:hover:border-white/15 dark:hover:bg-white/[0.06]"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-[0.15em] block" htmlFor="password">
                        Password
                      </label>
                      <Link href="/forgot-password" className="text-[10px] text-indigo-500/70 dark:text-indigo-400/70 hover:text-indigo-600 dark:hover:text-indigo-300 font-bold transition-colors">
                        Forgot?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="w-full rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 h-11 text-xs font-semibold px-4 focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:border-indigo-400 transition-all duration-200 hover:border-slate-300 dark:hover:border-white/15 dark:hover:bg-white/[0.06]"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 transition-colors duration-300">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500 dark:bg-red-400 flex-shrink-0" />
                      <p className="text-red-600 dark:text-red-400 text-[11px] font-bold">{error}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full h-11 rounded-xl font-black text-xs tracking-[0.2em] uppercase text-white overflow-hidden transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2 group cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1, #06b6d4)' }}
                  >
                    {/* Shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    {/* Hover glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.1)_0%,_transparent_70%)]" />
                    <span className="relative">
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Authenticating…
                        </span>
                      ) : 'Sign In to Nuvix'}
                    </span>
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-slate-100 dark:bg-white/[0.06] transition-colors duration-300" />
                  <span className="text-[9px] text-slate-300 dark:text-white/20 font-bold uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-slate-100 dark:bg-white/[0.06] transition-colors duration-300" />
                </div>

                {/* Sign up */}
                <div className="text-center">
                  <p className="text-xs text-slate-500 dark:text-white/30 font-medium transition-colors duration-300">
                    New to Nuvix?{' '}
                    <Link href="/signup" className="text-indigo-600 dark:text-indigo-400 font-black hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
                      Create an account →
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 mt-8">
              {[
                { icon: <ShieldCheck size={12} className="text-emerald-500 dark:text-emerald-400" />, label: 'Secure SSL' },
                { icon: <Zap size={12} className="text-amber-500 dark:text-amber-400" />, label: 'Instant Access' },
                { icon: <Star size={12} className="text-indigo-500 dark:text-indigo-400" />, label: 'Premium UX' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  {item.icon}
                  <span className="text-[9px] text-slate-400 dark:text-white/25 font-bold tracking-wider uppercase transition-colors duration-300">{item.label}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}