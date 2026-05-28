'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../store/auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  User,
  ShoppingBag,
  Settings,
  LifeBuoy,
  Mail,
  Pencil,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Package,
  ChevronRight,
  Shield,
  Star,
  Zap,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../../components/ui/dialog';
import ContentLayout from '../components/ContentLayout';

/* ─── Types ─── */
type SaveStatus = 'idle' | 'loading' | 'success' | 'error';

/* ─── Hub card data ─── */
const hubCards = [
  {
    href: '/order',
    icon: ShoppingBag,
    accent: 'indigo',
    label: 'Order History',
    description: 'Track active shipments, review past orders, and download Nuvix-verified invoices.',
    badge: null,
    clickable: true,
  },
  {
    href: null,
    icon: Settings,
    accent: 'violet',
    label: 'Settings',
    description: 'Manage credentials, API keys, sync preferences, and AI assistant configuration.',
    badge: 'Soon',
    clickable: false,
  },
  {
    href: null,
    icon: LifeBuoy,
    accent: 'cyan',
    label: 'Support Hub',
    description: 'Connect with customer care or consult the Nuvix Co-Shopper AI — online 24/7.',
    badge: 'AI',
    clickable: false,
  },
];

const accentMap: Record<string, { bg: string; border: string; icon: string; badge: string; glow: string }> = {
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
    border: 'border-indigo-100 dark:border-indigo-500/20',
    icon: 'text-indigo-600 dark:text-indigo-400',
    badge: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300',
    glow: 'group-hover:shadow-indigo-500/10',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    border: 'border-violet-100 dark:border-violet-500/20',
    icon: 'text-violet-600 dark:text-violet-400',
    badge: 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300',
    glow: 'group-hover:shadow-violet-500/10',
  },
  cyan: {
    bg: 'bg-cyan-50 dark:bg-cyan-500/10',
    border: 'border-cyan-100 dark:border-cyan-500/20',
    icon: 'text-cyan-600 dark:text-cyan-400',
    badge: 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300',
    glow: 'group-hover:shadow-cyan-500/10',
  },
};

/* ─── Stat pill ─── */
function StatPill({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-5 py-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/[0.06]">
      <Icon size={14} className="text-indigo-500 dark:text-indigo-400" />
      <span className="text-base font-black text-slate-800 dark:text-white leading-none">{value}</span>
      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">{label}</span>
    </div>
  );
}

/* ─── Hub Card ─── */
function HubCard({ card }: { card: typeof hubCards[number] }) {
  const a = accentMap[card.accent];
  const Icon = card.icon;

  const inner = (
    <div
      className={`
        group relative flex flex-col gap-3 p-5 h-full rounded-2xl border transition-all duration-300
        ${card.clickable
          ? 'border-slate-100 dark:border-white/[0.07] hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/[0.07] hover:-translate-y-0.5 cursor-pointer bg-white dark:bg-white/[0.02]'
          : 'border-slate-100 dark:border-white/[0.06] cursor-default bg-white dark:bg-white/[0.02] opacity-80'
        }
      `}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${a.bg} border ${a.border} transition-transform duration-300 group-hover:scale-110`}>
          <Icon size={16} className={a.icon} />
        </div>
        {card.badge && (
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${a.badge}`}>
            {card.badge}
          </span>
        )}
        {card.clickable && (
          <ChevronRight size={14} className="text-slate-300 dark:text-white/20 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-200 mt-0.5" />
        )}
      </div>

      {/* Text */}
      <div>
        <p className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-white/80 mb-1">{card.label}</p>
        <p className="text-[10px] text-slate-500 dark:text-white/40 font-medium leading-relaxed">{card.description}</p>
      </div>
    </div>
  );

  if (card.href && card.clickable) {
    return <Link href={card.href} className="h-full block">{inner}</Link>;
  }
  return inner;
}

/* ─── Main Component ─── */
export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [editUser, setEditUser] = useState(user);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  /* Sync edit state with auth store changes */
  useEffect(() => {
    setEditUser(user);
  }, [user]);

  /* Reset edit form to current user on dialog close */
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setEditUser(user);
      setSaveStatus('idle');
      setErrorMessage('');
    }
    setIsDialogOpen(open);
  };

  const handleSave = async () => {
    if (!editUser) return;
    if (!editUser.name.trim()) {
      setSaveStatus('error');
      setErrorMessage('Display name cannot be empty.');
      return;
    }
    if (!editUser.email.trim() || !/\S+@\S+\.\S+/.test(editUser.email)) {
      setSaveStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setSaveStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUser),
      });

      if (response.ok) {
        const { data } = await response.json();
        setUser(data);
        setSaveStatus('success');
        setTimeout(() => {
          setIsDialogOpen(false);
          setSaveStatus('idle');
        }, 900);
      } else {
        const err = await response.json().catch(() => ({}));
        setSaveStatus('error');
        setErrorMessage(err?.message || 'Failed to update profile. Please try again.');
      }
    } catch {
      setSaveStatus('error');
      setErrorMessage('Network error. Please check your connection.');
    }
  };

  /* ── Not logged in ── */
  if (!user) {
    return (
      <ContentLayout>
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center space-y-4 max-w-sm">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center">
              <User size={28} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wide">Access Required</h2>
              <p className="text-xs text-slate-500 dark:text-white/40 font-medium mt-1">Sign in to view your Nuvix profile.</p>
            </div>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 text-white font-black text-xs px-6 h-9 rounded-xl shadow-md shadow-indigo-500/20 transition-all">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </ContentLayout>
    );
  }

  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();

  return (
    <ContentLayout>
      <div className="min-h-screen bg-slate-50/60 dark:bg-transparent transition-colors duration-300">
        <div className="container mx-auto py-10 px-4 max-w-3xl space-y-6">

          {/* ── Hero Card ── */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/[0.07] shadow-xl shadow-slate-200/60 dark:shadow-black/30 bg-white dark:bg-[#0d1035]/80 backdrop-blur-xl">

            {/* Ambient top glow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

            {/* Background mesh */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />

            <div className="relative px-6 pt-8 pb-6 space-y-6">

              {/* Avatar + name row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">

                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <span className="text-2xl font-black text-white tracking-tight select-none">{initials}</span>
                  </div>
                  {/* Online dot */}
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0d1035] shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                </div>

                {/* Name + email + badges */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wide truncate">{user.name}</h1>
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/25">
                      <Sparkles size={9} /> Nuvix Member
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-white/40">
                    <Mail size={12} />
                    <span className="text-xs font-semibold truncate">{user.email}</span>
                  </div>
                </div>

                {/* Edit button */}
                <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                  <DialogTrigger asChild>
                    <Button
                      className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 text-white font-black text-[10px] uppercase tracking-widest px-4 h-9 rounded-xl shadow-md shadow-indigo-500/25 transition-all duration-200 active:scale-95 border-none cursor-pointer"
                    >
                      <Pencil size={12} />
                      Edit Profile
                    </Button>
                  </DialogTrigger>

                  {/* ── Edit Dialog ── */}
                  <DialogContent className="bg-white dark:bg-[#0d1035] border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-white rounded-2xl shadow-2xl dark:shadow-[0_8px_40px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-200 max-w-sm w-full">
                    {/* Top glow */}
                    <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

                    <DialogHeader className="border-b border-slate-100 dark:border-white/[0.07] pb-4">
                      <DialogTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">
                        <div className="h-6 w-6 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-100 dark:border-indigo-500/25 flex items-center justify-center">
                          <Pencil size={11} className="text-indigo-500 dark:text-indigo-400" />
                        </div>
                        Edit Profile
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                      {/* Name field */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest block" htmlFor="edit-name">
                          Display Name
                        </label>
                        <Input
                          id="edit-name"
                          className="rounded-xl border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 h-10 text-xs font-semibold focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:border-indigo-400 dark:focus-visible:border-indigo-500/50 transition-colors duration-200"
                          placeholder="Your name"
                          value={editUser?.name || ''}
                          onChange={(e) =>
                            setEditUser(editUser ? { ...editUser, name: e.target.value } : null)
                          }
                        />
                      </div>

                      {/* Email field */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest block" htmlFor="edit-email">
                          Email Address
                        </label>
                        <Input
                          id="edit-email"
                          type="email"
                          className="rounded-xl border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 h-10 text-xs font-semibold focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:border-indigo-400 dark:focus-visible:border-indigo-500/50 transition-colors duration-200"
                          placeholder="you@example.com"
                          value={editUser?.email || ''}
                          onChange={(e) =>
                            setEditUser(editUser ? { ...editUser, email: e.target.value } : null)
                          }
                        />
                      </div>

                      {/* Status feedback */}
                      {saveStatus === 'error' && (
                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
                          <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                          <p className="text-[10px] font-semibold text-red-600 dark:text-red-400 leading-relaxed">{errorMessage}</p>
                        </div>
                      )}
                      {saveStatus === 'success' && (
                        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                          <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                          <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Profile updated successfully!</p>
                        </div>
                      )}
                    </div>

                    <DialogFooter className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-xl h-10 text-[10px] font-black uppercase tracking-widest"
                        onClick={() => handleDialogChange(false)}
                        disabled={saveStatus === 'loading'}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 text-white font-black h-10 rounded-xl shadow-md shadow-indigo-500/25 border-none text-[10px] uppercase tracking-widest transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={handleSave}
                        disabled={saveStatus === 'loading' || saveStatus === 'success'}
                      >
                        {saveStatus === 'loading' ? (
                          <span className="flex items-center gap-1.5">
                            <Loader2 size={12} className="animate-spin" /> Saving…
                          </span>
                        ) : saveStatus === 'success' ? (
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 size={12} /> Saved!
                          </span>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* ── Stats row ── */}
              <div className="grid grid-cols-3 gap-3">
                <StatPill icon={Package} label="Orders" value="0" />
                <StatPill icon={Star} label="Reviews" value="0" />
                <StatPill icon={Zap} label="AI Searches" value="0" />
              </div>
            </div>
          </div>

          {/* ── Account Hub ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Shield size={12} className="text-indigo-400" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">Account Hub</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {hubCards.map((card) => (
                <HubCard key={card.label} card={card} />
              ))}
            </div>
          </div>

          {/* ── Footer note ── */}
          <div className="flex items-center justify-center gap-2 py-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-white/20">
              100% Secure · Nuvix AI Commerce
            </span>
          </div>

        </div>
      </div>
    </ContentLayout>
  );
}