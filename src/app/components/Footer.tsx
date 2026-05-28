import { Separator } from '../../components/ui/separator';
import { HelpCircle, Shield, Sparkles, CheckCircle, Mail, Phone, MapPin, Linkedin, Twitter, Instagram, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import NuvixLogo from './NuvixLogo';

export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 pt-16 pb-8 text-xs mt-auto border-t border-slate-200/60 dark:border-slate-900 transition-colors duration-300">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Top Section: Brand & Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 pb-12">
          
          {/* Brand Info Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center group">
              <div className="
                flex items-center gap-2.5 px-3.5 py-1.5 rounded-full
                bg-slate-100/50 dark:bg-slate-900/50
                border border-slate-200/60 dark:border-slate-800/80
                shadow-sm transition-all duration-300
                group-hover:border-indigo-500/30 dark:group-hover:border-indigo-500/20
                group-hover:bg-slate-200/50 dark:group-hover:bg-slate-900/80
                group-hover:shadow-[0_2px_12px_rgba(99,102,241,0.1)] dark:group-hover:shadow-[0_4px_20px_rgba(99,102,241,0.2)]
              ">
                <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <NuvixLogo size={24} glow={true} />
                </div>
                <span className="text-sm font-black tracking-widest bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent uppercase">
                  Nuvix
                </span>
              </div>
            </Link>
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium max-w-sm">
              An AI-powered smart commerce ecosystem. Discover, compare, and unlock hyper-personalized recommendations with our active conversational co-shopper assistant.
            </p>
            {/* Social Icons */}
            <div className="flex items-center space-x-3.5 pt-2">
              <a href="#" className="h-8 w-8 rounded-full bg-slate-200/50 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all cursor-pointer shadow-sm">
                <Twitter size={14} />
              </a>
              <a href="#" className="h-8 w-8 rounded-full bg-slate-200/50 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all cursor-pointer shadow-sm">
                <Linkedin size={14} />
              </a>
              <a href="#" className="h-8 w-8 rounded-full bg-slate-200/50 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all cursor-pointer shadow-sm">
                <Instagram size={14} />
              </a>
            </div>
          </div>

          {/* Column 2: Shop Catalog */}
          <div>
            <h3 className="text-slate-900 dark:text-slate-200 font-black mb-4 tracking-widest uppercase text-[10px]">
              Explore
            </h3>
            <ul className="space-y-2.5 font-bold text-[11px]">
              <li>
                <Link href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center group transition-colors">
                  <ChevronRight size={10} className="mr-1 opacity-0 group-hover:opacity-100 transition-all -ml-2 group-hover:ml-0" />
                  Mobiles & Tech
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center group transition-colors">
                  <ChevronRight size={10} className="mr-1 opacity-0 group-hover:opacity-100 transition-all -ml-2 group-hover:ml-0" />
                  Gaming Laptops
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center group transition-colors">
                  <ChevronRight size={10} className="mr-1 opacity-0 group-hover:opacity-100 transition-all -ml-2 group-hover:ml-0" />
                  Audio & Sound
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center group transition-colors">
                  <ChevronRight size={10} className="mr-1 opacity-0 group-hover:opacity-100 transition-all -ml-2 group-hover:ml-0" />
                  Wearables & Smartwatches
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Features */}
          <div>
            <h3 className="text-slate-900 dark:text-slate-200 font-black mb-4 tracking-widest uppercase text-[10px]">
              AI Capabilities
            </h3>
            <ul className="space-y-2.5 font-bold text-[11px]">
              <li>
                <Link href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center group transition-colors">
                  <ChevronRight size={10} className="mr-1 opacity-0 group-hover:opacity-100 transition-all -ml-2 group-hover:ml-0" />
                  AI Co-Shopper Chat
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center group transition-colors">
                  <ChevronRight size={10} className="mr-1 opacity-0 group-hover:opacity-100 transition-all -ml-2 group-hover:ml-0" />
                  Product Comparison Matrix
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center group transition-colors">
                  <ChevronRight size={10} className="mr-1 opacity-0 group-hover:opacity-100 transition-all -ml-2 group-hover:ml-0" />
                  Escrow Protection
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center group transition-colors">
                  <ChevronRight size={10} className="mr-1 opacity-0 group-hover:opacity-100 transition-all -ml-2 group-hover:ml-0" />
                  Nuvix Verified Seals
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Headquarters */}
          <div className="lg:border-l lg:border-slate-200 dark:lg:border-slate-900 lg:pl-6">
            <h3 className="text-slate-900 dark:text-slate-200 font-black mb-4 tracking-widest uppercase text-[10px] flex items-center gap-1.5">
              <MapPin size={12} className="text-indigo-600 dark:text-indigo-400" /> HQ Offices
            </h3>
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
              Nuvix Smart Commerce Ltd.<br />
              Infinity Tower A, 8th Floor,<br />
              DLF CyberCity, Phase 2,<br />
              Gurugram, 122002,<br />
              Haryana, India
            </p>
          </div>

          {/* Column 5: Support Details */}
          <div>
            <h3 className="text-slate-900 dark:text-slate-200 font-black mb-4 tracking-widest uppercase text-[10px]">
              Direct Contact
            </h3>
            <ul className="space-y-3 font-semibold text-[11px] text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <Phone size={12} className="text-cyan-500" />
                <span>1800-419-5432 (Toll Free)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={12} className="text-cyan-500" />
                <a href="mailto:support@nuvix.com" className="hover:underline hover:text-indigo-600 dark:hover:text-indigo-400">support@nuvix.com</a>
              </li>
              <li className="flex items-center gap-1.5 pt-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider">AI Assistant Online</span>
              </li>
            </ul>
          </div>

        </div>

        <Separator className="bg-slate-200 dark:bg-slate-900 my-4" />

        {/* Bottom Section: Trust Badges & Payments */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pt-6 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
          
          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-5">
            <div className="flex items-center space-x-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors select-none cursor-default">
              <Shield size={14} className="text-indigo-500" />
              <span>Secure Transactions</span>
            </div>
            <div className="flex items-center space-x-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors select-none cursor-default">
              <CheckCircle size={14} className="text-cyan-500" />
              <span>Nuvix Quality Guarantee</span>
            </div>
            <div className="flex items-center space-x-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors select-none cursor-default">
              <Sparkles size={14} className="text-purple-500" />
              <span>Hyper-Personalized Shopping</span>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p>&copy; {new Date().getFullYear()} Nuvix Inc. Designed for Next-Gen E-Commerce.</p>
          </div>

          {/* Premium styled SVGs for payments (gray hover to colored) */}
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] text-slate-400 mr-1.5 select-none font-bold uppercase tracking-wider">Safe Checkout:</span>
            <div className="h-6.5 w-10.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 flex items-center justify-center font-black text-[9px] text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-default shadow-sm select-none">
              VISA
            </div>
            <div className="h-6.5 w-10.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 flex items-center justify-center font-black text-[9px] text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-default shadow-sm select-none">
              MC
            </div>
            <div className="h-6.5 w-10.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 flex items-center justify-center font-black text-[9px] text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-default shadow-sm select-none">
              UPI
            </div>
            <div className="h-6.5 w-10.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 flex items-center justify-center font-black text-[9px] text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-default shadow-sm select-none">
              GPAY
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
}

