'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useChatStore } from '../store/chat';
import { useProductStore } from '../store/product';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Clipboard,
  Check,
  Sparkles,
  Send,
  MessageCircle,
  X,
  Mic,
  MicOff,
  Bot,
  User,
  Zap,
  ChevronRight,
  WifiOff,
  Search,
  Tag,
  SlidersHorizontal,
  Package,
  ArrowRight,
} from 'lucide-react';
import { useIsMounted } from '../hooks/useIsMounted';

const SUGGESTION_CHIPS = [
  { text: 'Smartphones ₹15k', query: 'smartphones under 15000', icon: '📱' },
  { text: 'Gaming Laptops', query: 'gaming laptops with good graphics', icon: '🎮' },
  { text: 'Noise-Cancelling', query: 'headphones under 5000 with noise cancelling', icon: '🎧' },
  { text: 'Smartwatches', query: 'fitness trackers with heart rate monitor', icon: '⌚' },
];

// ─── Typing indicator ───────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="nv-typing-dots" aria-label="AI is typing">
      <span /><span /><span />
    </div>
  );
}

// ─── Types ──────────────────────────────────────────────────────────────────
type SearchParams = Record<string, string | number | string[]>;

interface ChatMessage {
  sender: 'user' | 'ai';
  content: string;
  type?: 'text' | 'search';
  searchParams?: SearchParams;
  resultCount?: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatParamLabel(key: string): string {
  const labels: Record<string, string> = {
    category: 'Category',
    price_min: 'Min price',
    price_max: 'Max price',
    features: 'Features',
    query: 'Search',
    brand: 'Brand',
    rating: 'Min rating',
    sort: 'Sort by',
  };
  return labels[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatParamValue(key: string, value: string | number | string[]): string {
  if (Array.isArray(value)) return value.join(', ');
  if ((key === 'price_min' || key === 'price_max') && typeof value === 'number') {
    return value === 0 ? '₹0' : `₹${value.toLocaleString('en-IN')}`;
  }
  return String(value);
}

// ─── Search result card ──────────────────────────────────────────────────────
function SearchCard({ params, query }: { params: SearchParams; query: string }) {
  const entries = Object.entries(params).filter(([, v]) => {
    if (Array.isArray(v)) return v.length > 0;
    return v !== '' && v !== null && v !== undefined;
  });

  return (
    <div className="nv-search-card">
      {/* Header */}
      <div className="nv-search-card__header">
        <div className="nv-search-card__icon-wrap" aria-hidden="true">
          <Search size={13} />
        </div>
        <div>
          <p className="nv-search-card__title">Searching catalog</p>
          <p className="nv-search-card__query">"{query}"</p>
        </div>
        <div className="nv-search-card__spinner" aria-hidden="true" />
      </div>

      {/* Params grid */}
      {entries.length > 0 && (
        <div className="nv-search-card__params">
          {entries.map(([k, v]) => (
            <div key={k} className="nv-search-card__param">
              <span className="nv-search-card__param-key">{formatParamLabel(k)}</span>
              <span className="nv-search-card__param-val">{formatParamValue(k, v)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="nv-search-card__footer">
        <Package size={10} aria-hidden="true" />
        <span>Fetching matching products…</span>
      </div>
    </div>
  );
}

// ─── Single message bubble ───────────────────────────────────────────────────
function MessageBubble({
  message,
  index,
  isCopied,
  onCopy,
}: {
  message: ChatMessage;
  index: number;
  isCopied: boolean;
  onCopy: (text: string, index: number) => void;
}) {
  const isUser = message.sender === 'user';
  const isSearch = message.type === 'search' && message.searchParams;

  return (
    <div className={`nv-msg-row ${isUser ? 'nv-msg-row--user' : 'nv-msg-row--ai'}`}>
      {!isUser && (
        <div className="nv-msg-avatar nv-msg-avatar--ai" aria-hidden="true">
          <Bot size={12} />
        </div>
      )}

      {isSearch ? (
        <SearchCard params={message.searchParams!} query={message.content} />
      ) : (
        <div className={`nv-msg-bubble ${isUser ? 'nv-msg-bubble--user' : 'nv-msg-bubble--ai'}`}>
          <p className="nv-msg-text">{message.content}</p>
          <button
            className="nv-copy-btn"
            onClick={() => onCopy(message.content, index)}
            aria-label={isCopied ? 'Copied!' : 'Copy message'}
            title={isCopied ? 'Copied!' : 'Copy'}
          >
            {isCopied
              ? <Check size={10} className="nv-copy-icon nv-copy-icon--done" />
              : <Clipboard size={10} className="nv-copy-icon" />}
          </button>
        </div>
      )}

      {isUser && (
        <div className="nv-msg-avatar nv-msg-avatar--user" aria-hidden="true">
          <User size={12} />
        </div>
      )}
    </div>
  );
}

// ─── Main export ────────────────────────────────────────────────────────────
export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { messages, inputValue, addMessage, setInputValue } = useChatStore() as {
    messages: ChatMessage[];
    inputValue: string;
    addMessage: (msg: ChatMessage) => void;
    setInputValue: (v: string) => void;
  };
  const { setProducts, setSearchQuery } = useProductStore();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const isMounted = useIsMounted();

  // Auto-scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isThinking, isMobileChatOpen]);

  // Voice recognition setup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setVoiceSupported(false); return; }

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-IN';
    rec.onstart = () => setIsListening(true);
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      if (t) setInputValue(t);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
  }, [setInputValue]);

  const toggleVoice = useCallback(() => {
    if (!recognitionRef.current) return;
    isListening ? recognitionRef.current.stop() : recognitionRef.current.start();
  }, [isListening]);

  const handleCopy = useCallback((text: string, index: number) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, []);

  const handleSendMessage = useCallback(async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim() || isThinking) return;

    addMessage({ sender: 'user', content: query, type: 'text' });
    setInputValue('');
    setIsThinking(true);

    try {
      const aiRes = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (aiRes.ok) {
        const { queryType, generalAnswer, searchParams } = await aiRes.json();

        if (queryType.toLowerCase().includes('general question')) {
          addMessage({ sender: 'ai', content: generalAnswer, type: 'text' });
        } else {
          // Show clean search card instead of raw params dump
          addMessage({
            sender: 'ai',
            content: query,
            type: 'search',
            searchParams: searchParams as SearchParams,
          });

          const prodRes = await fetch(`/api/products?${new URLSearchParams(searchParams as any)}`);
          if (prodRes.ok) {
            const { products } = await prodRes.json();
            setProducts(products);
            setSearchQuery('');
            // Replace search card with success message
            addMessage({
              sender: 'ai',
              content: `Found ${products.length} result${products.length !== 1 ? 's' : ''} — scroll right to browse ✦`,
              type: 'text',
            });
          } else {
            addMessage({ sender: 'ai', content: 'No products matched your criteria. Try a different search.', type: 'text' });
          }
        }
      } else {
        addMessage({ sender: 'ai', content: 'Something went wrong. Please try again.', type: 'text' });
      }
    } catch {
      addMessage({ sender: 'ai', content: 'Connection error. Please check your network.', type: 'text' });
    } finally {
      setIsThinking(false);
      inputRef.current?.focus();
    }
  }, [inputValue, isThinking, addMessage, setInputValue, setProducts, setSearchQuery]);

  if (!isMounted) return null;

  // ─── Sub-components ────────────────────────────────────────────────────────
  const renderPanelHeader = (onClose?: () => void) => (
    <div className="nv-panel-header">
      <div className="nv-panel-header__glow" aria-hidden="true" />
      <div className="nv-panel-header__left">
        <div className="nv-status-orb" aria-hidden="true">
          <span className="nv-status-orb__ring" />
        </div>
        <div>
          <div className="nv-panel-header__title">
            <Sparkles size={12} className="nv-sparkle-icon" aria-hidden="true" />
            <span>Nuvix AI</span>
          </div>
          <div className="nv-panel-header__sub">Co-Shopper · Active</div>
        </div>
      </div>
      <div className="nv-panel-header__right">
        <div className="nv-model-badge">
          <Zap size={9} aria-hidden="true" />
          <span>v2</span>
        </div>
        {onClose && (
          <button className="nv-close-btn" onClick={onClose} aria-label="Close chat">
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );

  const renderMessageList = () => (
    <div ref={chatContainerRef} className="nv-messages" role="log" aria-live="polite" aria-label="Chat messages">
      {messages.length === 0 && (
        <div className="nv-empty-state">
          <div className="nv-empty-state__icon" aria-hidden="true">
            <Bot size={22} />
          </div>
          <p className="nv-empty-state__title">What can I find for you?</p>
          <p className="nv-empty-state__sub">Ask me anything about gadgets, prices, or comparisons.</p>
        </div>
      )}

      {messages.map((msg: ChatMessage, i: number) => (
        <MessageBubble
          key={i}
          message={msg}
          index={i}
          isCopied={copiedIndex === i}
          onCopy={handleCopy}
        />
      ))}

      {isThinking && (
        <div className="nv-msg-row nv-msg-row--ai">
          <div className="nv-msg-avatar nv-msg-avatar--ai" aria-hidden="true">
            <Bot size={12} />
          </div>
          <div className="nv-msg-bubble nv-msg-bubble--ai nv-msg-bubble--thinking">
            <TypingDots />
          </div>
        </div>
      )}
    </div>
  );

  const renderInputFooter = () => (
    <div className="nv-footer">
      {/* Suggestion chips */}
      <div className="nv-chips" role="group" aria-label="Quick suggestions">
        {SUGGESTION_CHIPS.map((chip, i) => (
          <button
            key={i}
            className="nv-chip"
            onClick={() => handleSendMessage(chip.query)}
            disabled={isThinking}
            aria-label={`Search for ${chip.text}`}
          >
            <span className="nv-chip__icon" aria-hidden="true">{chip.icon}</span>
            <span>{chip.text}</span>
            <ChevronRight size={9} className="nv-chip__arrow" aria-hidden="true" />
          </button>
        ))}
      </div>

      {/* Composer */}
      <div className="nv-composer">
        {voiceSupported && (
          <button
            className={`nv-voice-btn${isListening ? ' nv-voice-btn--active' : ''}`}
            onClick={toggleVoice}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            title={isListening ? 'Stop' : 'Voice search'}
          >
            {isListening ? <MicOff size={14} /> : <Mic size={14} />}
            {isListening && <span className="nv-voice-ring" aria-hidden="true" />}
          </button>
        )}

        <div className="nv-input-wrap">
          {isListening && (
            <span className="nv-listening-badge" aria-live="polite">Listening…</span>
          )}
          <Input
            ref={inputRef}
            type="text"
            className="nv-input"
            placeholder={isListening ? '' : 'Ask about any product…'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isThinking}
            aria-label="Chat input"
          />
        </div>

        <button
          className="nv-send-btn"
          onClick={() => handleSendMessage()}
          disabled={!inputValue.trim() || isThinking}
          aria-label="Send message"
        >
          <Send size={14} />
        </button>
      </div>

      <p className="nv-footer__note">AI results may not be 100% accurate · Verify before purchase</p>
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Scoped styles */}
      <style>{`
        /* ── Tokens ────────────────────────────────────── */
        :root {
          --nv-bg:          #f4f6fb;
          --nv-panel-bg:    #ffffff;
          --nv-border:      rgba(99,102,241,0.10);
          --nv-border-md:   rgba(99,102,241,0.18);

          --nv-brand:       #4f46e5;
          --nv-brand-mid:   #6366f1;
          --nv-brand-light: #818cf8;
          --nv-cyan:        #06b6d4;
          --nv-emerald:     #10b981;
          --nv-red:         #ef4444;

          --nv-text-1:      #0f172a;
          --nv-text-2:      #475569;
          --nv-text-3:      #94a3b8;

          --nv-shadow-sm:   0 1px 4px rgba(79,70,229,0.06), 0 4px 16px rgba(79,70,229,0.06);
          --nv-shadow-md:   0 4px 24px rgba(79,70,229,0.10), 0 1px 4px rgba(0,0,0,0.04);
          --nv-shadow-panel:0 8px 48px rgba(79,70,229,0.12), 0 2px 8px rgba(0,0,0,0.06);

          --nv-radius:      14px;
          --nv-radius-sm:   8px;
          --nv-radius-full: 999px;

          --nv-font-body:   'DM Sans', 'Instrument Sans', system-ui, sans-serif;
          --nv-font-mono:   'JetBrains Mono', monospace;

          --nv-transition:  all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .dark {
          --nv-bg:          #07091a;
          --nv-panel-bg:    #0d1027;
          --nv-border:      rgba(99,102,241,0.12);
          --nv-border-md:   rgba(99,102,241,0.22);
          --nv-text-1:      #f1f5f9;
          --nv-text-2:      #94a3b8;
          --nv-text-3:      #475569;
          --nv-shadow-sm:   0 1px 4px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2);
          --nv-shadow-md:   0 4px 24px rgba(0,0,0,0.35), 0 1px 4px rgba(0,0,0,0.2);
          --nv-shadow-panel:0 8px 48px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3);
        }

        /* ── Layout ────────────────────────────────────── */
        .nv-root {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 68px);
          overflow: hidden;
          background: var(--nv-bg);
          font-family: var(--nv-font-body);
        }
        @media (min-width: 1024px) {
          .nv-root { flex-direction: row; }
        }

        /* ── Side panel ────────────────────────────────── */
        .nv-panel {
          display: none;
          flex-direction: column;
          width: 320px;
          background: var(--nv-panel-bg);
          border-right: 1px solid var(--nv-border);
          box-shadow: var(--nv-shadow-panel);
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
          transition: var(--nv-transition);
        }
        @media (min-width: 1024px) {
          .nv-panel { display: flex; }
        }
        @media (min-width: 1280px) {
          .nv-panel { width: 380px; }
        }

        /* subtle grid texture on panel */
        .nv-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
          z-index: 0;
        }

        /* ── Panel Header ───────────────────────────────── */
        .nv-panel-header {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid var(--nv-border);
          background: linear-gradient(135deg, var(--nv-brand) 0%, #7c3aed 50%, var(--nv-cyan) 100%);
          flex-shrink: 0;
          z-index: 1;
        }
        .nv-panel-header__glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% -20%, rgba(255,255,255,0.15) 0%, transparent 65%);
          pointer-events: none;
        }
        .nv-panel-header__left {
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
        }
        .nv-panel-header__title {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.03em;
        }
        .nv-sparkle-icon {
          color: #a5f3fc;
          animation: nv-sparkle 2.5s ease-in-out infinite;
        }
        @keyframes nv-sparkle {
          0%,100% { opacity: 1; transform: scale(1) rotate(0deg); }
          50%      { opacity: 0.7; transform: scale(1.15) rotate(15deg); }
        }
        .nv-panel-header__sub {
          font-size: 9px;
          font-weight: 600;
          color: rgba(255,255,255,0.65);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-top: 1px;
        }
        .nv-panel-header__right {
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
        }
        .nv-model-badge {
          display: flex;
          align-items: center;
          gap: 3px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: var(--nv-radius-full);
          padding: 3px 8px;
          font-size: 9px;
          font-weight: 700;
          color: rgba(255,255,255,0.9);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          backdrop-filter: blur(8px);
        }
        .nv-close-btn {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: var(--nv-radius-sm);
          color: #fff;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--nv-transition);
        }
        .nv-close-btn:hover { background: rgba(255,255,255,0.22); }

        /* ── Status orb ─────────────────────────────────── */
        .nv-status-orb {
          position: relative;
          width: 8px;
          height: 8px;
          background: #34d399;
          border-radius: 50%;
          box-shadow: 0 0 6px #34d399;
        }
        .nv-status-orb__ring {
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 1.5px solid rgba(52,211,153,0.5);
          animation: nv-pulse-ring 2s ease-out infinite;
        }
        @keyframes nv-pulse-ring {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(2.2); }
        }

        /* ── Messages ───────────────────────────────────── */
        .nv-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          z-index: 1;
          scroll-behavior: smooth;
        }
        .nv-messages::-webkit-scrollbar { width: 3px; }
        .nv-messages::-webkit-scrollbar-track { background: transparent; }
        .nv-messages::-webkit-scrollbar-thumb {
          background: var(--nv-border-md);
          border-radius: var(--nv-radius-full);
        }

        /* ── Empty state ───────────────────────────────── */
        .nv-empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
          opacity: 0;
          animation: nv-fade-up 0.5s 0.1s forwards;
        }
        .nv-empty-state__icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(79,70,229,0.1), rgba(6,182,212,0.1));
          border: 1px solid var(--nv-border-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--nv-brand-light);
          margin-bottom: 14px;
        }
        .nv-empty-state__title {
          font-size: 14px;
          font-weight: 600;
          color: var(--nv-text-1);
          margin-bottom: 6px;
        }
        .nv-empty-state__sub {
          font-size: 11px;
          color: var(--nv-text-3);
          line-height: 1.6;
          max-width: 200px;
        }

        /* ── Message row ───────────────────────────────── */
        .nv-msg-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          opacity: 0;
          animation: nv-fade-up 0.25s forwards;
        }
        .nv-msg-row--user { justify-content: flex-end; }
        .nv-msg-row--ai   { justify-content: flex-start; }

        @keyframes nv-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Avatar ───────────────────────────────────── */
        .nv-msg-avatar {
          width: 26px;
          height: 26px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-bottom: 2px;
        }
        .nv-msg-avatar--ai {
          background: linear-gradient(135deg, var(--nv-brand), var(--nv-cyan));
          color: #fff;
          box-shadow: 0 2px 8px rgba(79,70,229,0.3);
        }
        .nv-msg-avatar--user {
          background: rgba(79,70,229,0.08);
          border: 1px solid var(--nv-border-md);
          color: var(--nv-brand-light);
        }

        /* ── Bubble ────────────────────────────────────── */
        .nv-msg-bubble {
          position: relative;
          max-width: 82%;
          border-radius: 14px;
          padding: 10px 36px 10px 13px;
          box-shadow: var(--nv-shadow-sm);
        }
        .nv-msg-bubble--user {
          background: var(--nv-panel-bg);
          border: 1px solid var(--nv-border-md);
          border-bottom-right-radius: 4px;
          color: var(--nv-text-1);
        }
        .nv-msg-bubble--ai {
          background: linear-gradient(135deg, var(--nv-brand) 0%, #5b52f0 60%, #4338ca 100%);
          border: none;
          border-bottom-left-radius: 4px;
          color: #fff;
          box-shadow: 0 4px 16px rgba(79,70,229,0.25);
        }
        .nv-msg-bubble--thinking {
          padding: 12px 16px;
          background: linear-gradient(135deg, rgba(79,70,229,0.08), rgba(6,182,212,0.06));
          border: 1px solid var(--nv-border);
          box-shadow: none;
        }
        .nv-msg-text {
          font-size: 12px;
          font-weight: 500;
          line-height: 1.6;
          word-break: break-word;
        }

        /* ── Copy button ───────────────────────────────── */
        .nv-copy-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 20px;
          height: 20px;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.1);
          opacity: 0;
          transition: var(--nv-transition);
          cursor: pointer;
        }
        .nv-msg-bubble:hover .nv-copy-btn { opacity: 1; }
        .nv-copy-btn:hover { background: rgba(255,255,255,0.2); }
        .nv-copy-icon { color: rgba(255,255,255,0.7); }
        .nv-copy-icon--done { color: #34d399; }
        .nv-msg-bubble--user .nv-copy-icon { color: var(--nv-text-3); }

        /* ── Typing dots ───────────────────────────────── */
        .nv-typing-dots {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .nv-typing-dots span {
          display: block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--nv-brand-light);
          animation: nv-bounce 1.3s ease-in-out infinite;
        }
        .nv-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .nv-typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes nv-bounce {
          0%,60%,100% { transform: translateY(0); opacity: 0.5; }
          30%          { transform: translateY(-5px); opacity: 1; }
        }

        /* ── Footer ────────────────────────────────────── */
        .nv-footer {
          border-top: 1px solid var(--nv-border);
          background: var(--nv-panel-bg);
          padding: 12px 14px 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }

        /* ── Chips ─────────────────────────────────────── */
        .nv-chips {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 2px;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .nv-chips::-webkit-scrollbar { display: none; }
        .nv-chip {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px 5px 8px;
          border-radius: var(--nv-radius-full);
          background: rgba(79,70,229,0.06);
          border: 1px solid var(--nv-border-md);
          font-size: 10px;
          font-weight: 600;
          color: var(--nv-brand);
          cursor: pointer;
          transition: var(--nv-transition);
          white-space: nowrap;
        }
        .nv-chip:hover:not(:disabled) {
          background: rgba(79,70,229,0.12);
          border-color: var(--nv-brand);
          transform: translateY(-1px);
        }
        .nv-chip:disabled { opacity: 0.5; cursor: not-allowed; }
        .nv-chip__icon { font-size: 12px; }
        .nv-chip__arrow { color: var(--nv-brand-light); transition: transform 0.15s; }
        .nv-chip:hover .nv-chip__arrow { transform: translateX(2px); }

        /* ── Composer ──────────────────────────────────── */
        .nv-composer {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(79,70,229,0.04);
          border: 1px solid var(--nv-border-md);
          border-radius: var(--nv-radius);
          padding: 5px 5px 5px 8px;
          transition: var(--nv-transition);
        }
        .nv-composer:focus-within {
          border-color: var(--nv-brand);
          box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
        }

        /* ── Voice button ─────────────────────────────── */
        .nv-voice-btn {
          position: relative;
          width: 32px;
          height: 32px;
          border-radius: var(--nv-radius-sm);
          background: transparent;
          border: 1px solid var(--nv-border-md);
          color: var(--nv-text-2);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: var(--nv-transition);
        }
        .nv-voice-btn:hover { background: rgba(79,70,229,0.07); color: var(--nv-brand); }
        .nv-voice-btn--active {
          background: rgba(239,68,68,0.1);
          border-color: rgba(239,68,68,0.4);
          color: var(--nv-red);
          animation: nv-voice-pulse 1.2s ease-in-out infinite;
        }
        @keyframes nv-voice-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.3); }
          50%      { box-shadow: 0 0 0 5px rgba(239,68,68,0); }
        }
        .nv-voice-ring {
          position: absolute;
          inset: -4px;
          border: 1.5px solid rgba(239,68,68,0.35);
          border-radius: 10px;
          animation: nv-ring-expand 1s ease-out infinite;
        }
        @keyframes nv-ring-expand {
          from { opacity: 1; transform: scale(1); }
          to   { opacity: 0; transform: scale(1.5); }
        }

        /* ── Input wrap ───────────────────────────────── */
        .nv-input-wrap { flex: 1; position: relative; }
        .nv-listening-badge {
          position: absolute;
          left: 0; top: 50%;
          transform: translateY(-50%);
          font-size: 10px;
          font-weight: 600;
          color: var(--nv-red);
          pointer-events: none;
          animation: nv-blink 1s ease-in-out infinite;
        }
        @keyframes nv-blink {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.5; }
        }
        .nv-input {
          width: 100%;
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
          font-size: 12px !important;
          font-weight: 500;
          color: var(--nv-text-1);
          height: 32px;
          padding: 0 !important;
          outline: none;
        }
        .nv-input::placeholder { color: var(--nv-text-3); }
        .nv-input:focus-visible { ring: none !important; box-shadow: none !important; }

        /* ── Send button ──────────────────────────────── */
        .nv-send-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--nv-brand), var(--nv-brand-mid));
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: var(--nv-transition);
          border: none;
          box-shadow: 0 2px 8px rgba(79,70,229,0.35);
        }
        .nv-send-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #4338ca, var(--nv-brand));
          box-shadow: 0 4px 14px rgba(79,70,229,0.4);
          transform: translateY(-1px);
        }
        .nv-send-btn:active:not(:disabled) { transform: scale(0.95); }
        .nv-send-btn:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }

        /* ── Footer note ──────────────────────────────── */
        .nv-footer__note {
          font-size: 9px;
          color: var(--nv-text-3);
          text-align: center;
          letter-spacing: 0.02em;
        }

        /* ── Main content area ─────────────────────────── */
        .nv-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px 16px;
          background: var(--nv-bg);
          transition: var(--nv-transition);
        }
        @media (min-width: 1024px) {
          .nv-content { padding: 28px 28px; }
        }

        /* ── Mobile FAB ────────────────────────────────── */
        .nv-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 40;
          display: flex;
        }
        @media (min-width: 1024px) {
          .nv-fab { display: none; }
        }
        .nv-fab__btn {
          position: relative;
          width: 56px;
          height: 56px;
          border-radius: 18px;
          background: linear-gradient(135deg, var(--nv-brand) 0%, #7c3aed 50%, var(--nv-cyan) 100%);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(79,70,229,0.45), 0 2px 8px rgba(0,0,0,0.1);
          transition: var(--nv-transition);
          border: none;
        }
        .nv-fab__btn:hover { transform: scale(1.06); box-shadow: 0 12px 40px rgba(79,70,229,0.55); }
        .nv-fab__btn:active { transform: scale(0.95); }
        .nv-fab__badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: var(--nv-cyan);
          color: #0f172a;
          font-size: 8px;
          font-weight: 800;
          border-radius: var(--nv-radius-full);
          padding: 2px 5px;
          border: 2px solid var(--nv-bg);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        /* ── Mobile drawer ─────────────────────────────── */
        .nv-drawer-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(7,9,26,0.65);
          backdrop-filter: blur(6px);
          z-index: 50;
          display: flex;
          align-items: flex-end;
        }
        @media (min-width: 1024px) { .nv-drawer-backdrop { display: none; } }
        .nv-drawer {
          position: relative;
          width: 100%;
          background: var(--nv-panel-bg);
          border-radius: 20px 20px 0 0;
          border-top: 1px solid var(--nv-border-md);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 85vh;
          box-shadow: 0 -12px 48px rgba(79,70,229,0.15);
          animation: nv-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes nv-slide-up {
          from { transform: translateY(100%); opacity: 0.5; }
          to   { transform: translateY(0); opacity: 1; }
        }
        .nv-drawer__handle {
          width: 36px;
          height: 4px;
          background: var(--nv-border-md);
          border-radius: var(--nv-radius-full);
          margin: 10px auto 0;
          flex-shrink: 0;
        }
        /* ── Search card ───────────────────────────────── */
        .nv-search-card {
          max-width: 90%;
          border-radius: 14px;
          border-bottom-left-radius: 4px;
          overflow: hidden;
          background: var(--nv-panel-bg);
          border: 1px solid var(--nv-border-md);
          box-shadow: var(--nv-shadow-md);
          opacity: 0;
          animation: nv-fade-up 0.25s forwards;
        }

        .nv-search-card__header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 13px 10px;
          background: linear-gradient(135deg, rgba(79,70,229,0.07) 0%, rgba(6,182,212,0.04) 100%);
          border-bottom: 1px solid var(--nv-border);
        }

        .nv-search-card__icon-wrap {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: linear-gradient(135deg, var(--nv-brand), var(--nv-brand-mid));
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(79,70,229,0.3);
        }

        .nv-search-card__title {
          font-size: 11px;
          font-weight: 700;
          color: var(--nv-text-1);
          margin: 0;
          letter-spacing: 0.01em;
        }

        .nv-search-card__query {
          font-size: 10px;
          color: var(--nv-brand);
          font-weight: 600;
          margin: 1px 0 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 160px;
        }

        .nv-search-card__spinner {
          margin-left: auto;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid rgba(79,70,229,0.15);
          border-top-color: var(--nv-brand);
          animation: nv-spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes nv-spin {
          to { transform: rotate(360deg); }
        }

        .nv-search-card__params {
          padding: 9px 13px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .nv-search-card__param {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 8px;
        }

        .nv-search-card__param-key {
          font-size: 10px;
          font-weight: 600;
          color: var(--nv-text-3);
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          flex-shrink: 0;
        }

        .nv-search-card__param-val {
          font-size: 11px;
          font-weight: 600;
          color: var(--nv-text-1);
          text-align: right;
          word-break: break-word;
        }

        .nv-search-card__footer {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 13px;
          background: rgba(79,70,229,0.04);
          border-top: 1px solid var(--nv-border);
          font-size: 9px;
          font-weight: 600;
          color: var(--nv-text-3);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

      `}</style>

      <div className="nv-root">
        {/* Desktop side panel */}
        <aside className="nv-panel" role="complementary" aria-label="AI shopping assistant">
          {renderPanelHeader()}
          {renderMessageList()}
          {renderInputFooter()}
        </aside>

        {/* Main content */}
        <main className="nv-content" id="main-content">
          {children}
        </main>

        {/* Mobile FAB */}
        <div className="nv-fab">
          <button
            className="nv-fab__btn"
            onClick={() => setIsMobileChatOpen(true)}
            aria-label="Open AI shopping assistant"
            aria-haspopup="dialog"
            aria-expanded={isMobileChatOpen}
          >
            <MessageCircle size={22} />
            <span className="nv-fab__badge">AI</span>
          </button>
        </div>

        {/* Mobile drawer */}
        {isMobileChatOpen && (
          <div
            className="nv-drawer-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="AI shopping assistant"
            onClick={(e) => { if (e.target === e.currentTarget) setIsMobileChatOpen(false); }}
          >
            <div className="nv-drawer">
              <div className="nv-drawer__handle" aria-hidden="true" />
              {renderPanelHeader(() => setIsMobileChatOpen(false))}
              {renderMessageList()}
              {renderInputFooter()}
            </div>
          </div>
        )}
      </div>
    </>
  );
}