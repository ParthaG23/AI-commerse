'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useChatStore } from '../store/chat';
import { useProductStore } from '../store/product';
import { useAuthStore } from '../store/auth';
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
  Search,
  Package,
  Volume2,
  VolumeX,
  Languages,
  Loader2,
} from 'lucide-react';
import { useIsMounted } from '../hooks/useIsMounted';

// ─── Suggestion chips ───────────────────────────────────────────────────────
const SUGGESTION_CHIPS = [
  { text: 'Smartphones ₹15k', query: 'smartphones under 15000', icon: '📱' },
  { text: 'Gaming Laptops', query: 'gaming laptops with good graphics', icon: '🎮' },
  { text: 'Noise-Cancelling', query: 'headphones under 5000 with noise cancelling', icon: '🎧' },
  { text: 'Smartwatches', query: 'fitness trackers with heart rate monitor', icon: '⌚' },
];

// ─── Supported languages for display ────────────────────────────────────────
const SUPPORTED_LANGS = [
  { code: 'en-IN', label: 'EN' },
  { code: 'hi-IN', label: 'हिं' },
  { code: 'ta-IN', label: 'த' },
  { code: 'te-IN', label: 'తె' },
  { code: 'mr-IN', label: 'म' },
  { code: 'bn-IN', label: 'বাং' },
  { code: 'gu-IN', label: 'ગુ' },
  { code: 'kn-IN', label: 'ಕ' },
  { code: 'ml-IN', label: 'മ' },
  { code: 'pa-IN', label: 'ਪੰ' },
];

// ─── Fuzzy / synonym map for common misspellings and related terms ───────────
const SYNONYM_MAP: Record<string, string[]> = {
  'mobile': ['phone', 'smartphone', 'cellphone', 'iphone', 'android', 'mobail', 'mobil', 'fone', 'phon'],
  'laptop': ['computer', 'notebook', 'laptoop', 'leptop', 'pc', 'laaptop', 'computar'],
  'headphone': ['earphone', 'headset', 'earbuds', 'earbud', 'headfone', 'hedphone', 'hedfone', 'airpods', 'headfon'],
  'television': ['tv', 'tele', 'televison', 'telvision', 'smart tv', 'led tv', 'monitor'],
  'camera': ['camra', 'camara', 'dslr', 'mirrorless', 'camerra'],
  'shirt': ['t-shirt', 'tshirt', 'tee', 'top', 'polo', 'kurta', 'casual wear', 'shrit', 'shert'],
  'trouser': ['pant', 'jeans', 'jean', 'pants', 'trousers', 'chino', 'trousar'],
  'shoes': ['footwear', 'sneaker', 'sneakers', 'sandal', 'sandals', 'chappal', 'boot', 'boots', 'shoos', 'shos'],
  'watch': ['smartwatch', 'timepiece', 'wrist watch', 'wach', 'ghadi', 'watch'],
  'refrigerator': ['fridge', 'fridg', 'refregerator', 'refregerater', 'freezer', 'cool box'],
  'washing machine': ['washer', 'washing macheen', 'washin machine', 'laundry machine'],
  'air conditioner': ['ac', 'a.c', 'airconditioner', 'air conditoner', 'cooler'],
};

// ─── Language detection heuristic (script-based) ────────────────────────────
function detectScript(text: string): string {
  if (/[\u0900-\u097F]/.test(text)) return 'hi-IN'; // Devanagari (Hindi/Marathi)
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN'; // Tamil
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te-IN'; // Telugu
  if (/[\u0980-\u09FF]/.test(text)) return 'bn-IN'; // Bengali
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu-IN'; // Gujarati
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn-IN'; // Kannada
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml-IN'; // Malayalam
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa-IN'; // Punjabi
  return 'en-IN';
};

// ─── Normalize query: fix common misspellings & expand synonyms ──────────────
function normalizeQuery(query: string): string {
  let normalized = query.toLowerCase().trim();
  // Remove extra spaces
  normalized = normalized.replace(/\s+/g, ' ');
  // Common phonetic corrections for Indian accent misspellings
  const corrections: [RegExp, any][] = [
    [/\bfone\b/g, 'phone'],
    [/\bphon\b/g, 'phone'],
    [/\bmobail\b/g, 'mobile'],
    [/\bmobil\b/g, 'mobile'],
    [/\bleptop\b/g, 'laptop'],
    [/\blaptoop\b/g, 'laptop'],
    [/\blaaptop\b/g, 'laptop'],
    [/\bcomputar\b/g, 'computer'],
    [/\bhedfone\b/g, 'headphone'],
    [/\bhedphone\b/g, 'headphone'],
    [/\bheadfone\b/g, 'headphone'],
    [/\bearfone\b/g, 'earphone'],
    [/\bcamra\b/g, 'camera'],
    [/\bcamara\b/g, 'camera'],
    [/\bshrit\b/g, 'shirt'],
    [/\bshert\b/g, 'shirt'],
    [/\bprise\b/g, 'price'],
    [/\bpric\b/g, 'price'],
    [/\bprice\b/g, 'price'],
    [/\bcheap\b/g, 'budget'],
    [/\bsasta\b/g, 'budget low price'],
    [/\bmehenga\b/g, 'premium high price'],
    [/\bacha\b/g, 'good quality'],
    [/\baccha\b/g, 'good quality'],
    [/\bbest wala\b/g, 'best'],
    [/\bsabse\b/g, 'most'],
    [/\bunder\b/g, 'under'],
    [/\bse kam\b/g, 'under'],
    [/\bse zyada\b/g, 'above'],
    [/\bke neeche\b/g, 'under'],
    [/\bk niche\b/g, 'under'],
    [/\brupee\b/g, '₹'],
    [/\brupees\b/g, '₹'],
    [/\brupiya\b/g, '₹'],
    [/\brs\b/g, '₹'],
    [/\bk\b(?=\s*\d|\d)/g, '000'], // 15k → 15000
    [/(\d+)\s*k\b/g, (m: any, n: any) => String(parseInt(n) * 1000)],
    [/(\d+)\s*lakh\b/g, (m: any, n: any) => String(parseInt(n) * 100000)],
    [/(\d+)\s*lac\b/g, (m: any, n: any) => String(parseInt(n) * 100000)],
  ];
  for (const [pattern, replacement] of corrections) {
    normalized = normalized.replace(pattern, replacement as string);
  }
  return normalized;
}

// ─── Build enhanced system prompt ────────────────────────────────────────────
function buildSystemPrompt(): string {
  return `You are Nuvix AI, a supreme shopping assistant for an Indian e-commerce platform. You are expert at understanding customer needs even with:
- Spelling mistakes (mobail = mobile, leptop = laptop, hedfone = headphone, shrit = shirt)
- Hindi/Indian language words mixed in (sasta = cheap, mehnga = expensive, accha = good)
- Vague descriptions ("woh wala phone" = that phone, "gaming wala" = gaming)
- Price in different formats (15k = 15000, 2 lakh = 200000, rs 500 = ₹500)
- Partial names and abbreviations (AC = air conditioner, TV = television)
- Related/similar products (shirt → also include t-shirt, kurta; shoes → also sneakers, sandals)

SYNONYM EXPANSIONS you must apply:
- shirt/shrt → include t-shirt, polo, kurta
- phone/mobile/fone → smartphone category
- laptop/leptop/computer → laptop category
- headphone/earbud/airpod → headphones category
- shoes/chappal/sandal → footwear category
- watch/ghadi → watches category

Your job is to extract structured search parameters AND respond in the SAME LANGUAGE the user used.

You MUST respond with valid JSON only (no markdown, no explanation outside JSON):
{
  "queryType": "product search" | "general question" | "greeting" | "comparison",
  "detectedLanguage": "en" | "hi" | "ta" | "te" | "mr" | "bn" | "gu" | "kn" | "ml" | "pa",
  "generalAnswer": "string (only for general/greeting/comparison queries, respond in detected language)",
  "confidence": 0.0-1.0,
  "searchParams": {
    "query": "normalized english search terms with synonyms expanded",
    "category": "electronics|clothing|footwear|appliances|accessories|beauty|sports|home|auto",
    "price_min": number_or_0,
    "price_max": number_or_0,
    "brand": "brand name or empty",
    "color": "color or empty",
    "features": ["feature1", "feature2"],
    "rating": number_or_0,
    "sort": "price_asc|price_desc|rating|newest|popular",
    "fuzzy_terms": ["alternative search terms for fuzzy matching"]
  }
}

Examples:
- "15k ke andar accha smartphone chahiye" → query:"smartphone", price_max:15000, category:"electronics"
- "saste gaming wale laptop" → query:"gaming laptop", sort:"price_asc", category:"electronics"  
- "lal rang ka shirt" → query:"shirt t-shirt kurta", color:"red", category:"clothing"
- "noise cancelling headfone under 5000" → query:"headphone earphone", features:["noise cancelling"], price_max:5000
- "best camera under 2 lakh" → query:"camera dslr mirrorless", price_max:200000, sort:"rating"

IMPORTANT: For clothing searches, ALWAYS expand to related items. For shirt, include t-shirt, polo, kurta in fuzzy_terms. Never return empty results intent — always find the closest match.`;
}

// ─── Types ──────────────────────────────────────────────────────────────────
type SearchParams = Record<string, string | number | string[]>;

interface ChatMessage {
  sender: 'user' | 'ai';
  content: string;
  type?: 'text' | 'search';
  searchParams?: SearchParams;
  resultCount?: number;
  language?: string;
}

// ─── Typing indicator ────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="nv-typing-dots" aria-label="AI is typing">
      <span /><span /><span />
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatParamLabel(key: string): string {
  const labels: Record<string, string> = {
    category: 'Category', price_min: 'Min price', price_max: 'Max price',
    features: 'Features', query: 'Search', brand: 'Brand',
    rating: 'Min rating', sort: 'Sort by', color: 'Color',
    fuzzy_terms: 'Also checking',
  };
  return labels[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatParamValue(key: string, value: string | number | string[]): string {
  if (Array.isArray(value)) return value.slice(0, 3).join(', ');
  if ((key === 'price_min' || key === 'price_max') && typeof value === 'number') {
    return value === 0 ? '₹0' : `₹${value.toLocaleString('en-IN')}`;
  }
  return String(value);
}

// ─── Search card ──────────────────────────────────────────────────────────────
function SearchCard({ params, query }: { params: SearchParams; query: string }) {
  const showKeys = ['category', 'price_min', 'price_max', 'color', 'brand', 'features', 'sort'];
  const entries = Object.entries(params).filter(([k, v]) => {
    if (!showKeys.includes(k)) return false;
    if (Array.isArray(v)) return v.length > 0;
    return v !== '' && v !== null && v !== undefined && v !== 0;
  });

  return (
    <div className="nv-search-card">
      <div className="nv-search-card__header">
        <div className="nv-search-card__icon-wrap"><Search size={13} /></div>
        <div>
          <p className="nv-search-card__title">Searching catalog</p>
          <p className="nv-search-card__query">"{query}"</p>
        </div>
        <div className="nv-search-card__spinner" />
      </div>
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
      <div className="nv-search-card__footer">
        <Package size={10} /><span>Fetching matching products…</span>
      </div>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({
  message, index, isCopied, onCopy, onSpeak, isSpeaking,
}: {
  message: ChatMessage; index: number; isCopied: boolean;
  onCopy: (text: string, i: number) => void;
  onSpeak: (text: string, lang: string) => void;
  isSpeaking: boolean;
}) {
  const isUser = message.sender === 'user';
  const isSearch = message.type === 'search' && message.searchParams;

  return (
    <div className={`nv-msg-row ${isUser ? 'nv-msg-row--user' : 'nv-msg-row--ai'}`}>
      {!isUser && <div className="nv-msg-avatar nv-msg-avatar--ai"><Bot size={12} /></div>}
      {isSearch ? (
        <SearchCard params={message.searchParams!} query={message.content} />
      ) : (
        <div className={`nv-msg-bubble ${isUser ? 'nv-msg-bubble--user' : 'nv-msg-bubble--ai'}`}>
          <p className="nv-msg-text">{message.content}</p>
          <div className="nv-bubble-actions">
            {!isUser && (
              <button
                className={`nv-action-btn${isSpeaking ? ' nv-action-btn--active' : ''}`}
                onClick={() => onSpeak(message.content, message.language || 'en-IN')}
                aria-label={isSpeaking ? 'Stop speaking' : 'Listen to message'}
                title={isSpeaking ? 'Stop' : 'Listen'}
              >
                {isSpeaking ? <VolumeX size={9} /> : <Volume2 size={9} />}
              </button>
            )}
            <button
              className="nv-action-btn"
              onClick={() => onCopy(message.content, index)}
              aria-label={isCopied ? 'Copied!' : 'Copy message'}
            >
              {isCopied ? <Check size={9} className="nv-copy-icon--done" /> : <Clipboard size={9} />}
            </button>
          </div>
        </div>
      )}
      {isUser && <div className="nv-msg-avatar nv-msg-avatar--user"><User size={12} /></div>}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { conversations, inputValue, addMessage, setInputValue } = useChatStore() as any;
  const { user } = useAuthStore();
  const userKey = user?.email || 'anonymous';
  const messages = conversations[userKey] || [{ sender: 'ai', content: 'Hi there! What are you looking for today?' }];
  const { setProducts, setSearchQuery } = useProductStore();

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processingVoice, setProcessingVoice] = useState(false);

  const isMounted = useIsMounted();

  // Auto-scroll
  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isThinking, isMobileChatOpen]);

  // Init voice + TTS
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) setVoiceSupported(true);
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      setTtsSupported(true);
    }
  }, []);

  // Build recognition instance per language
  const buildRecognition = useCallback((lang: string) => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return null;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = lang;
    rec.onstart = () => { setIsListening(true); setTranscript(''); };
    rec.onresult = (e: any) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      const detected = detectScript(final || interim);
      if (detected !== 'en-IN' && detected !== selectedLang) setSelectedLang(detected);
      setTranscript(final || interim);
      if (final) setInputValue(final);
    };
    rec.onerror = () => { setIsListening(false); setTranscript(''); };
    rec.onend = () => {
      setIsListening(false);
      if (isVoiceMode) setProcessingVoice(true);
    };
    return rec;
  }, [selectedLang, isVoiceMode, setInputValue]);

  // Auto-send after voice in voice-mode
  useEffect(() => {
    if (processingVoice && inputValue.trim()) {
      setProcessingVoice(false);
      handleSendMessage(inputValue);
    } else if (processingVoice) {
      setProcessingVoice(false);
    }
  }, [processingVoice]);

  const startListening = useCallback(() => {
    if (isListening) { recognitionRef.current?.stop(); return; }
    const rec = buildRecognition(selectedLang);
    if (!rec) return;
    recognitionRef.current = rec;
    try { rec.start(); } catch {}
  }, [isListening, buildRecognition, selectedLang]);

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setSpeakingIndex(null);
  }, []);

  const speakMessage = useCallback((text: string, lang: string, index?: number) => {
    if (!ttsSupported) return;
    if (speakingIndex !== null) { stopSpeaking(); return; }
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang.includes('-') ? lang : lang + '-IN';
    utt.rate = 0.95;
    utt.pitch = 1.0;
    utt.onend = () => setSpeakingIndex(null);
    utt.onerror = () => setSpeakingIndex(null);
    utteranceRef.current = utt;
    if (index !== undefined) setSpeakingIndex(index);
    synthRef.current?.speak(utt);
  }, [ttsSupported, speakingIndex, stopSpeaking]);

  const handleCopy = useCallback((text: string, index: number) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, []);

  // ─── Core send logic ────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(async (textToSend?: string) => {
    const rawQuery = textToSend || inputValue;
    if (!rawQuery.trim() || isThinking) return;

    const normalizedQuery = normalizeQuery(rawQuery);
    const detectedLang = detectScript(rawQuery);

    addMessage({ sender: 'user', content: rawQuery, type: 'text', language: detectedLang }, userKey);
    setInputValue('');
    setIsThinking(true);

    try {
      // Call the secure, supremely intelligent backend route directly to bypass CORS
      const aiRes = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: rawQuery, normalizedQuery, lang: detectedLang }),
      });

      if (aiRes.ok) {
        const d = await aiRes.json();
        const qType = (d.queryType || '').toLowerCase();
        const respLang = d.detectedLanguage || detectedLang.split('-')[0];
        const fullLang = respLang + '-IN';

        if (qType.includes('general') || qType.includes('greeting') || qType.includes('comparison')) {
          const answer = d.generalAnswer || 'I can help you find products. What are you looking for?';
          addMessage({ sender: 'ai', content: answer, type: 'text', language: fullLang }, userKey);

          // Auto-speak in voice mode
          if (isVoiceMode && ttsSupported) {
            setTimeout(() => speakMessage(answer, fullLang), 300);
          }
        } else {
          // Product search
          const sp = d.searchParams || {};
          addMessage({ sender: 'ai', content: rawQuery, type: 'search', searchParams: sp, language: fullLang }, userKey);

          const products = d.products || [];
          setProducts(products);
          setSearchQuery('');

          // Voice-friendly conversational answer
          const answer = d.generalAnswer || `Found ${products.length} products for you.`;
          addMessage({ sender: 'ai', content: answer, type: 'text', language: fullLang }, userKey);

          if (isVoiceMode && ttsSupported) {
            setTimeout(() => speakMessage(answer, fullLang), 300);
          }
        }
      } else {
        addMessage({ sender: 'ai', content: 'Sorry, I had trouble understanding that. Please try again.', type: 'text', language: 'en' }, userKey);
      }
    } catch {
      const err = 'Connection error. Please check your network.';
      addMessage({ sender: 'ai', content: err, type: 'text' }, userKey);
    } finally {
      setIsThinking(false);
      inputRef.current?.focus();
    }
  }, [inputValue, isThinking, addMessage, setInputValue, setProducts, setSearchQuery, isVoiceMode, ttsSupported, speakMessage, userKey]);

  if (!isMounted) return null;

  // ─── Sub-components ──────────────────────────────────────────────────────────
  const renderPanelHeader = (onClose?: () => void) => (
    <div className="nv-panel-header">
      <div className="nv-panel-header__glow" />
      <div className="nv-panel-header__left">
        <div className="nv-status-orb"><span className="nv-status-orb__ring" /></div>
        <div>
          <div className="nv-panel-header__title">
            <Sparkles size={12} className="nv-sparkle-icon" />
            <span>Nuvix AI</span>
          </div>
          <div className="nv-panel-header__sub">Co-Shopper · Active</div>
        </div>
      </div>
      <div className="nv-panel-header__right">
        {/* Language indicator */}
        <div className="nv-lang-indicator" title="Detected language">
          <Languages size={9} />
          <span>{SUPPORTED_LANGS.find(l => l.code === selectedLang)?.label || 'EN'}</span>
        </div>
        <div className="nv-model-badge"><Zap size={9} /><span>v3</span></div>
        {onClose && (
          <button className="nv-close-btn" onClick={onClose} aria-label="Close chat"><X size={16} /></button>
        )}
      </div>
    </div>
  );

  const renderMessageList = () => (
    <div ref={chatContainerRef} className="nv-messages" role="log" aria-live="polite">
      {messages.length === 0 && (
        <div className="nv-empty-state">
          <div className="nv-empty-state__icon"><Bot size={22} /></div>
          <p className="nv-empty-state__title">What can I find for you?</p>
          <p className="nv-empty-state__sub">Ask in English, Hindi, Tamil, Telugu, or any Indian language. Spelling mistakes are fine!</p>
          <div className="nv-lang-pills">
            {['हिंदी', 'தமிழ்', 'తెలుగు', 'मराठी', 'বাংলা'].map(l => (
              <span key={l} className="nv-lang-pill">{l}</span>
            ))}
          </div>
        </div>
      )}
      {messages.map((msg: ChatMessage, i: number) => (
        <MessageBubble
          key={i} message={msg} index={i}
          isCopied={copiedIndex === i}
          onCopy={handleCopy}
          onSpeak={(text, lang) => speakMessage(text, lang, i)}
          isSpeaking={speakingIndex === i}
        />
      ))}
      {isThinking && (
        <div className="nv-msg-row nv-msg-row--ai">
          <div className="nv-msg-avatar nv-msg-avatar--ai"><Bot size={12} /></div>
          <div className="nv-msg-bubble nv-msg-bubble--ai nv-msg-bubble--thinking"><TypingDots /></div>
        </div>
      )}
    </div>
  );

  const renderInputFooter = () => (
    <div className="nv-footer">
      {/* Suggestion chips */}
      <div className="nv-chips" role="group" aria-label="Quick suggestions">
        {SUGGESTION_CHIPS.map((chip, i) => (
          <button key={i} className="nv-chip" onClick={() => handleSendMessage(chip.query)} disabled={isThinking}>
            <span className="nv-chip__icon">{chip.icon}</span>
            <span>{chip.text}</span>
            <ChevronRight size={9} className="nv-chip__arrow" />
          </button>
        ))}
      </div>

      {/* Voice mode toggle */}
      {voiceSupported && (
        <div className="nv-voice-mode-bar">
          <button
            className={`nv-voice-mode-btn${isVoiceMode ? ' nv-voice-mode-btn--active' : ''}`}
            onClick={() => { setIsVoiceMode(v => !v); if (speakingIndex !== null) stopSpeaking(); }}
          >
            {isVoiceMode ? <Volume2 size={11} /> : <VolumeX size={11} />}
            <span>{isVoiceMode ? 'Voice Mode ON — tap mic to speak' : 'Enable Voice Mode'}</span>
          </button>

          {/* Language picker */}
          <div className="nv-lang-picker-wrap">
            <button className="nv-lang-picker-btn" onClick={() => setShowLangPicker(p => !p)}>
              <Languages size={11} />
              <span>{SUPPORTED_LANGS.find(l => l.code === selectedLang)?.label}</span>
            </button>
            {showLangPicker && (
              <div className="nv-lang-dropdown">
                {SUPPORTED_LANGS.map(l => (
                  <button
                    key={l.code}
                    className={`nv-lang-option${selectedLang === l.code ? ' nv-lang-option--active' : ''}`}
                    onClick={() => { setSelectedLang(l.code); setShowLangPicker(false); }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Composer */}
      <div className={`nv-composer${isListening ? ' nv-composer--listening' : ''}`}>
        {voiceSupported && (
          <button
            className={`nv-voice-btn${isListening ? ' nv-voice-btn--active' : ''}`}
            onClick={startListening}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? <MicOff size={14} /> : <Mic size={14} />}
            {isListening && <span className="nv-voice-ring" />}
          </button>
        )}

        <div className="nv-input-wrap">
          {isListening && transcript && (
            <span className="nv-interim-text">{transcript}</span>
          )}
          {isListening && !transcript && (
            <span className="nv-listening-badge">Listening…</span>
          )}
          {processingVoice && (
            <span className="nv-listening-badge"><Loader2 size={10} className="nv-spin-icon" /> Processing…</span>
          )}
          <Input
            ref={inputRef}
            type="text"
            className="nv-input"
            placeholder={isListening ? '' : 'Ask in any language… (mobail, leptop, sasta)'}
            value={isListening ? '' : inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isThinking || isListening}
            aria-label="Chat input"
          />
        </div>

        <button
          className="nv-send-btn"
          onClick={() => handleSendMessage()}
          disabled={(!inputValue.trim() && !transcript) || isThinking}
          aria-label="Send message"
        >
          <Send size={14} />
        </button>
      </div>

      <p className="nv-footer__note">Supports 10+ Indian languages · Spelling mistakes OK · AI results may vary</p>
    </div>
  );

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
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
          --nv-shadow-panel:0 8px 48px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3);
        }
        .nv-root { display:flex; flex-direction:column; height:calc(100vh - 68px); overflow:hidden; background:var(--nv-bg); font-family:var(--nv-font-body); }
        @media(min-width:1024px){.nv-root{flex-direction:row;}}
        .nv-panel { display:none; flex-direction:column; width:320px; background:var(--nv-panel-bg); border-right:1px solid var(--nv-border); box-shadow:var(--nv-shadow-panel); position:relative; overflow:hidden; flex-shrink:0; }
        @media(min-width:1024px){.nv-panel{display:flex;}}
        @media(min-width:1280px){.nv-panel{width:390px;}}
        .nv-panel::before { content:''; position:absolute; inset:0; background-image:linear-gradient(rgba(99,102,241,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.03) 1px,transparent 1px); background-size:32px 32px; pointer-events:none; z-index:0; }

        /* Header */
        .nv-panel-header { position:relative; display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border-bottom:1px solid var(--nv-border); background:linear-gradient(135deg,var(--nv-brand) 0%,#7c3aed 50%,var(--nv-cyan) 100%); flex-shrink:0; z-index:1; }
        .nv-panel-header__glow { position:absolute; inset:0; background:radial-gradient(ellipse at 50% -20%,rgba(255,255,255,0.15) 0%,transparent 65%); pointer-events:none; }
        .nv-panel-header__left { display:flex; align-items:center; gap:10px; position:relative; }
        .nv-panel-header__title { display:flex; align-items:center; gap:5px; font-size:13px; font-weight:700; color:#fff; letter-spacing:0.03em; }
        .nv-sparkle-icon { color:#a5f3fc; animation:nv-sparkle 2.5s ease-in-out infinite; }
        @keyframes nv-sparkle { 0%,100%{opacity:1;transform:scale(1) rotate(0deg);}50%{opacity:0.7;transform:scale(1.15) rotate(15deg);} }
        .nv-panel-header__sub { font-size:9px; font-weight:600; color:rgba(255,255,255,0.65); letter-spacing:0.08em; text-transform:uppercase; margin-top:1px; }
        .nv-panel-header__right { display:flex; align-items:center; gap:6px; position:relative; }
        .nv-lang-indicator { display:flex; align-items:center; gap:3px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2); border-radius:var(--nv-radius-full); padding:3px 7px; font-size:9px; font-weight:700; color:rgba(255,255,255,0.9); }
        .nv-model-badge { display:flex; align-items:center; gap:3px; background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.2); border-radius:var(--nv-radius-full); padding:3px 8px; font-size:9px; font-weight:700; color:rgba(255,255,255,0.9); letter-spacing:0.06em; text-transform:uppercase; }
        .nv-close-btn { background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.18); border-radius:var(--nv-radius-sm); color:#fff; width:30px; height:30px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:var(--nv-transition); }
        .nv-close-btn:hover { background:rgba(255,255,255,0.22); }

        /* Status orb */
        .nv-status-orb { position:relative; width:8px; height:8px; background:#34d399; border-radius:50%; box-shadow:0 0 6px #34d399; }
        .nv-status-orb__ring { position:absolute; inset:-3px; border-radius:50%; border:1.5px solid rgba(52,211,153,0.5); animation:nv-pulse-ring 2s ease-out infinite; }
        @keyframes nv-pulse-ring { 0%{opacity:1;transform:scale(1);}100%{opacity:0;transform:scale(2.2);} }

        /* Messages */
        .nv-messages { flex:1; overflow-y:auto; padding:20px 14px; display:flex; flex-direction:column; gap:12px; position:relative; z-index:1; scroll-behavior:smooth; }
        .nv-messages::-webkit-scrollbar { width:3px; }
        .nv-messages::-webkit-scrollbar-thumb { background:var(--nv-border-md); border-radius:var(--nv-radius-full); }

        /* Empty state */
        .nv-empty-state { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 20px; text-align:center; opacity:0; animation:nv-fade-up 0.5s 0.1s forwards; }
        .nv-empty-state__icon { width:52px; height:52px; border-radius:16px; background:linear-gradient(135deg,rgba(79,70,229,0.1),rgba(6,182,212,0.1)); border:1px solid var(--nv-border-md); display:flex; align-items:center; justify-content:center; color:var(--nv-brand-light); margin-bottom:14px; }
        .nv-empty-state__title { font-size:14px; font-weight:600; color:var(--nv-text-1); margin-bottom:6px; }
        .nv-empty-state__sub { font-size:11px; color:var(--nv-text-3); line-height:1.6; max-width:220px; margin-bottom:12px; }
        .nv-lang-pills { display:flex; flex-wrap:wrap; gap:5px; justify-content:center; }
        .nv-lang-pill { font-size:10px; font-weight:600; color:var(--nv-brand); background:rgba(79,70,229,0.07); border:1px solid var(--nv-border-md); border-radius:var(--nv-radius-full); padding:3px 9px; }

        /* Message row */
        .nv-msg-row { display:flex; align-items:flex-end; gap:8px; opacity:0; animation:nv-fade-up 0.25s forwards; }
        .nv-msg-row--user { justify-content:flex-end; }
        .nv-msg-row--ai { justify-content:flex-start; }
        @keyframes nv-fade-up { from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);} }

        /* Avatars */
        .nv-msg-avatar { width:26px; height:26px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-bottom:2px; }
        .nv-msg-avatar--ai { background:linear-gradient(135deg,var(--nv-brand),var(--nv-cyan)); color:#fff; box-shadow:0 2px 8px rgba(79,70,229,0.3); }
        .nv-msg-avatar--user { background:rgba(79,70,229,0.08); border:1px solid var(--nv-border-md); color:var(--nv-brand-light); }

        /* Bubbles */
        .nv-msg-bubble { position:relative; max-width:82%; border-radius:14px; padding:10px 42px 10px 13px; box-shadow:var(--nv-shadow-sm); }
        .nv-msg-bubble--user { background:var(--nv-panel-bg); border:1px solid var(--nv-border-md); border-bottom-right-radius:4px; color:var(--nv-text-1); }
        .nv-msg-bubble--ai { background:linear-gradient(135deg,var(--nv-brand) 0%,#5b52f0 60%,#4338ca 100%); border:none; border-bottom-left-radius:4px; color:#fff; box-shadow:0 4px 16px rgba(79,70,229,0.25); }
        .nv-msg-bubble--thinking { padding:12px 16px; background:linear-gradient(135deg,rgba(79,70,229,0.08),rgba(6,182,212,0.06)); border:1px solid var(--nv-border); box-shadow:none; }
        .nv-msg-text { font-size:12px; font-weight:500; line-height:1.6; word-break:break-word; }

        /* Bubble action buttons */
        .nv-bubble-actions { position:absolute; top:7px; right:7px; display:flex; gap:3px; opacity:0; transition:var(--nv-transition); }
        .nv-msg-bubble:hover .nv-bubble-actions { opacity:1; }
        .nv-action-btn { width:20px; height:20px; border-radius:5px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.1); cursor:pointer; transition:var(--nv-transition); color:rgba(255,255,255,0.7); border:none; }
        .nv-action-btn:hover { background:rgba(255,255,255,0.22); }
        .nv-action-btn--active { background:rgba(52,211,153,0.2); color:#34d399; }
        .nv-copy-icon--done { color:#34d399; }
        .nv-msg-bubble--user .nv-action-btn { color:var(--nv-text-3); }

        /* Typing dots */
        .nv-typing-dots { display:flex; align-items:center; gap:5px; }
        .nv-typing-dots span { display:block; width:6px; height:6px; border-radius:50%; background:var(--nv-brand-light); animation:nv-bounce 1.3s ease-in-out infinite; }
        .nv-typing-dots span:nth-child(2){animation-delay:0.2s;}
        .nv-typing-dots span:nth-child(3){animation-delay:0.4s;}
        @keyframes nv-bounce { 0%,60%,100%{transform:translateY(0);opacity:0.5;}30%{transform:translateY(-5px);opacity:1;} }

        /* Footer */
        .nv-footer { border-top:1px solid var(--nv-border); background:var(--nv-panel-bg); padding:10px 14px 10px; display:flex; flex-direction:column; gap:8px; flex-shrink:0; position:relative; z-index:1; }

        /* Chips */
        .nv-chips { display:flex; gap:6px; overflow-x:auto; padding-bottom:2px; scrollbar-width:none; }
        .nv-chips::-webkit-scrollbar{display:none;}
        .nv-chip { flex-shrink:0; display:flex; align-items:center; gap:5px; padding:5px 10px 5px 8px; border-radius:var(--nv-radius-full); background:rgba(79,70,229,0.06); border:1px solid var(--nv-border-md); font-size:10px; font-weight:600; color:var(--nv-brand); cursor:pointer; transition:var(--nv-transition); white-space:nowrap; }
        .nv-chip:hover:not(:disabled) { background:rgba(79,70,229,0.12); border-color:var(--nv-brand); transform:translateY(-1px); }
        .nv-chip:disabled { opacity:0.5; cursor:not-allowed; }
        .nv-chip__icon { font-size:12px; }
        .nv-chip__arrow { color:var(--nv-brand-light); transition:transform 0.15s; }
        .nv-chip:hover .nv-chip__arrow{transform:translateX(2px);}

        /* Voice mode bar */
        .nv-voice-mode-bar { display:flex; align-items:center; justify-content:space-between; gap:6px; }
        .nv-voice-mode-btn { flex:1; display:flex; align-items:center; gap:6px; padding:6px 10px; border-radius:var(--nv-radius-sm); background:rgba(79,70,229,0.05); border:1px solid var(--nv-border-md); font-size:10px; font-weight:600; color:var(--nv-text-2); cursor:pointer; transition:var(--nv-transition); }
        .nv-voice-mode-btn--active { background:rgba(16,185,129,0.08); border-color:rgba(16,185,129,0.3); color:var(--nv-emerald); }
        .nv-voice-mode-btn:hover { background:rgba(79,70,229,0.1); }

        /* Lang picker */
        .nv-lang-picker-wrap { position:relative; }
        .nv-lang-picker-btn { display:flex; align-items:center; gap:4px; padding:6px 10px; border-radius:var(--nv-radius-sm); background:rgba(79,70,229,0.05); border:1px solid var(--nv-border-md); font-size:10px; font-weight:700; color:var(--nv-brand); cursor:pointer; transition:var(--nv-transition); }
        .nv-lang-picker-btn:hover { background:rgba(79,70,229,0.1); }
        .nv-lang-dropdown { position:absolute; bottom:calc(100% + 6px); right:0; background:var(--nv-panel-bg); border:1px solid var(--nv-border-md); border-radius:var(--nv-radius-sm); padding:4px; box-shadow:var(--nv-shadow-md); display:flex; flex-wrap:wrap; gap:3px; width:160px; z-index:20; }
        .nv-lang-option { padding:4px 8px; border-radius:5px; font-size:11px; font-weight:600; color:var(--nv-text-2); background:transparent; border:none; cursor:pointer; transition:var(--nv-transition); }
        .nv-lang-option:hover { background:rgba(79,70,229,0.07); color:var(--nv-brand); }
        .nv-lang-option--active { background:rgba(79,70,229,0.12); color:var(--nv-brand); }

        /* Composer */
        .nv-composer { display:flex; align-items:center; gap:8px; background:rgba(79,70,229,0.04); border:1px solid var(--nv-border-md); border-radius:var(--nv-radius); padding:5px 5px 5px 8px; transition:var(--nv-transition); }
        .nv-composer:focus-within { border-color:var(--nv-brand); box-shadow:0 0 0 3px rgba(79,70,229,0.1); }
        .nv-composer--listening { border-color:rgba(239,68,68,0.4); box-shadow:0 0 0 3px rgba(239,68,68,0.08); }

        /* Voice button */
        .nv-voice-btn { position:relative; width:32px; height:32px; border-radius:var(--nv-radius-sm); background:transparent; border:1px solid var(--nv-border-md); color:var(--nv-text-2); display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; transition:var(--nv-transition); }
        .nv-voice-btn:hover { background:rgba(79,70,229,0.07); color:var(--nv-brand); }
        .nv-voice-btn--active { background:rgba(239,68,68,0.1); border-color:rgba(239,68,68,0.4); color:var(--nv-red); animation:nv-voice-pulse 1.2s ease-in-out infinite; }
        @keyframes nv-voice-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.3);}50%{box-shadow:0 0 0 5px rgba(239,68,68,0);} }
        .nv-voice-ring { position:absolute; inset:-4px; border:1.5px solid rgba(239,68,68,0.35); border-radius:10px; animation:nv-ring-expand 1s ease-out infinite; }
        @keyframes nv-ring-expand { from{opacity:1;transform:scale(1);}to{opacity:0;transform:scale(1.5);} }

        /* Input */
        .nv-input-wrap { flex:1; position:relative; overflow:hidden; }
        .nv-listening-badge { position:absolute; left:0; top:50%; transform:translateY(-50%); font-size:10px; font-weight:600; color:var(--nv-red); pointer-events:none; animation:nv-blink 1s ease-in-out infinite; display:flex; align-items:center; gap:4px; }
        .nv-interim-text { position:absolute; left:0; top:50%; transform:translateY(-50%); font-size:11px; font-weight:500; color:var(--nv-text-2); pointer-events:none; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; }
        @keyframes nv-blink { 0%,100%{opacity:1;}50%{opacity:0.5;} }
        .nv-spin-icon { animation:nv-spin 0.7s linear infinite; }
        @keyframes nv-spin { to{transform:rotate(360deg);} }
        .nv-input { width:100%; border:none!important; background:transparent!important; box-shadow:none!important; font-size:12px!important; font-weight:500; color:var(--nv-text-1); height:32px; padding:0!important; outline:none; }
        .nv-input::placeholder { color:var(--nv-text-3); font-size:11px; }

        /* Send button */
        .nv-send-btn { width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg,var(--nv-brand),var(--nv-brand-mid)); color:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; transition:var(--nv-transition); border:none; box-shadow:0 2px 8px rgba(79,70,229,0.35); }
        .nv-send-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 4px 14px rgba(79,70,229,0.4); }
        .nv-send-btn:active:not(:disabled) { transform:scale(0.95); }
        .nv-send-btn:disabled { opacity:0.4; cursor:not-allowed; box-shadow:none; }

        /* Footer note */
        .nv-footer__note { font-size:9px; color:var(--nv-text-3); text-align:center; letter-spacing:0.02em; }

        /* Content */
        .nv-content { flex:1; overflow-y:auto; padding:20px 16px; background:var(--nv-bg); }
        @media(min-width:1024px){.nv-content{padding:28px;}}

        /* FAB */
        .nv-fab { position:fixed; bottom:24px; right:24px; z-index:40; display:flex; }
        @media(min-width:1024px){.nv-fab{display:none;}}
        .nv-fab__btn { position:relative; width:56px; height:56px; border-radius:18px; background:linear-gradient(135deg,var(--nv-brand) 0%,#7c3aed 50%,var(--nv-cyan) 100%); color:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 8px 32px rgba(79,70,229,0.45); transition:var(--nv-transition); border:none; }
        .nv-fab__btn:hover { transform:scale(1.06); }
        .nv-fab__badge { position:absolute; top:-4px; right:-4px; background:var(--nv-cyan); color:#0f172a; font-size:8px; font-weight:800; border-radius:var(--nv-radius-full); padding:2px 5px; border:2px solid var(--nv-bg); letter-spacing:0.05em; text-transform:uppercase; }

        /* Drawer */
        .nv-drawer-backdrop { position:fixed; inset:0; background:rgba(7,9,26,0.65); backdrop-filter:blur(6px); z-index:50; display:flex; align-items:flex-end; }
        @media(min-width:1024px){.nv-drawer-backdrop{display:none;}}
        .nv-drawer { position:relative; width:100%; background:var(--nv-panel-bg); border-radius:20px 20px 0 0; border-top:1px solid var(--nv-border-md); overflow:hidden; display:flex; flex-direction:column; height:85vh; box-shadow:0 -12px 48px rgba(79,70,229,0.15); animation:nv-slide-up 0.3s cubic-bezier(0.16,1,0.3,1); }
        @keyframes nv-slide-up { from{transform:translateY(100%);opacity:0.5;}to{transform:translateY(0);opacity:1;} }
        .nv-drawer__handle { width:36px; height:4px; background:var(--nv-border-md); border-radius:var(--nv-radius-full); margin:10px auto 0; flex-shrink:0; }

        /* Search card */
        .nv-search-card { max-width:90%; border-radius:14px; border-bottom-left-radius:4px; overflow:hidden; background:var(--nv-panel-bg); border:1px solid var(--nv-border-md); box-shadow:var(--nv-shadow-md); opacity:0; animation:nv-fade-up 0.25s forwards; }
        .nv-search-card__header { display:flex; align-items:center; gap:10px; padding:11px 13px 10px; background:linear-gradient(135deg,rgba(79,70,229,0.07) 0%,rgba(6,182,212,0.04) 100%); border-bottom:1px solid var(--nv-border); }
        .nv-search-card__icon-wrap { width:28px; height:28px; border-radius:8px; background:linear-gradient(135deg,var(--nv-brand),var(--nv-brand-mid)); color:#fff; display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 2px 8px rgba(79,70,229,0.3); }
        .nv-search-card__title { font-size:11px; font-weight:700; color:var(--nv-text-1); margin:0; }
        .nv-search-card__query { font-size:10px; color:var(--nv-brand); font-weight:600; margin:1px 0 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:160px; }
        .nv-search-card__spinner { margin-left:auto; width:16px; height:16px; border-radius:50%; border:2px solid rgba(79,70,229,0.15); border-top-color:var(--nv-brand); animation:nv-spin 0.7s linear infinite; flex-shrink:0; }
        .nv-search-card__params { padding:9px 13px; display:flex; flex-direction:column; gap:5px; }
        .nv-search-card__param { display:flex; align-items:baseline; justify-content:space-between; gap:8px; }
        .nv-search-card__param-key { font-size:10px; font-weight:600; color:var(--nv-text-3); white-space:nowrap; text-transform:uppercase; letter-spacing:0.05em; flex-shrink:0; }
        .nv-search-card__param-val { font-size:11px; font-weight:600; color:var(--nv-text-1); text-align:right; word-break:break-word; }
        .nv-search-card__footer { display:flex; align-items:center; gap:6px; padding:7px 13px; background:rgba(79,70,229,0.04); border-top:1px solid var(--nv-border); font-size:9px; font-weight:600; color:var(--nv-text-3); letter-spacing:0.04em; text-transform:uppercase; }
      `}</style>

      <div className="nv-root">
        <aside className="nv-panel" role="complementary" aria-label="AI shopping assistant">
          {renderPanelHeader()}
          {renderMessageList()}
          {renderInputFooter()}
        </aside>

        <main className="nv-content" id="main-content">{children}</main>

        <div className="nv-fab">
          <button className="nv-fab__btn" onClick={() => setIsMobileChatOpen(true)} aria-label="Open AI assistant">
            <MessageCircle size={22} />
            <span className="nv-fab__badge">AI</span>
          </button>
        </div>

        {isMobileChatOpen && (
          <div
            className="nv-drawer-backdrop"
            role="dialog" aria-modal="true"
            onClick={(e) => { if (e.target === e.currentTarget) setIsMobileChatOpen(false); }}
          >
            <div className="nv-drawer">
              <div className="nv-drawer__handle" />
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