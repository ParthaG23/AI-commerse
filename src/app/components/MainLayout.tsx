"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useChatStore, Message } from "../store/chat";
import { useProductStore } from "../store/product";
import { useAuthStore } from "../store/auth";
import { useCartStore } from "../store/cart";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Clipboard,
  Check,
  Sparkles,
  Send,
  MessageCircle,
  X,
  Mic,
  Mic2,
  MicOff,
  Bot,
  User,
  Zap,
  ChevronRight,
  Search,
  Package,
  Volume2,
  VolumeX,
  Headphones,
  Languages,
  Loader2,
  Plus,
  Trash2,
  Menu,
  LogOut,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeft,
  PanelRightClose,
  PanelRight,
  ShoppingCart,
  Eye,
  Star,
  ShoppingBag,
} from "lucide-react";
import { useIsMounted } from "../hooks/useIsMounted";
import NuvixLogo from "./NuvixLogo";


// ─── Suggestion chips ───────────────────────────────────────────────────────
const SUGGESTION_CHIPS = [
  { text: "Smartphones ₹15k", query: "smartphones under 15000", icon: "📱" },
  {
    text: "Gaming Laptops",
    query: "gaming laptops with good graphics",
    icon: "🎮",
  },
  {
    text: "Noise-Cancelling",
    query: "headphones under 5000 with noise cancelling",
    icon: "🎧",
  },
  {
    text: "Smartwatches",
    query: "fitness trackers with heart rate monitor",
    icon: "⌚",
  },
];

// ─── Supported languages for display ────────────────────────────────────────
const SUPPORTED_LANGS = [
  { code: "en-IN", label: "EN" },
  { code: "hi-IN", label: "हिं" },
  { code: "ta-IN", label: "த" },
  { code: "te-IN", label: "తె" },
  { code: "mr-IN", label: "म" },
  { code: "bn-IN", label: "বাং" },
  { code: "gu-IN", label: "ગુ" },
  { code: "kn-IN", label: "ಕ" },
  { code: "ml-IN", label: "മ" },
  { code: "pa-IN", label: "ਪੰ" },
];

// ─── Synonym map for common misspellings and related terms ───────────────────
const SYNONYM_MAP: Record<string, string[]> = {
  mobile: [
    "phone",
    "smartphone",
    "cellphone",
    "iphone",
    "android",
    "mobail",
    "mobil",
    "fone",
    "phon",
  ],
  laptop: [
    "computer",
    "notebook",
    "laptoop",
    "leptop",
    "pc",
    "laaptop",
    "computar",
  ],
  headphone: [
    "earphone",
    "headset",
    "earbuds",
    "earbud",
    "headfone",
    "hedphone",
    "hedfone",
    "airpods",
    "headfon",
  ],
  television: [
    "tv",
    "tele",
    "televison",
    "telvision",
    "smart tv",
    "led tv",
    "monitor",
  ],
  camera: ["camra", "camara", "dslr", "mirrorless", "camerra"],
  shirt: [
    "t-shirt",
    "tshirt",
    "tee",
    "top",
    "polo",
    "kurta",
    "casual wear",
    "shrit",
    "shert",
  ],
  trouser: ["pant", "jeans", "jean", "pants", "trousers", "chino", "trousar"],
  shoes: [
    "footwear",
    "sneaker",
    "sneakers",
    "sandal",
    "sandals",
    "chappal",
    "boot",
    "boots",
    "shoos",
    "shos",
  ],
  watch: ["smartwatch", "timepiece", "wrist watch", "wach", "ghadi", "watch"],
  refrigerator: [
    "fridge",
    "fridg",
    "refregerator",
    "refregerater",
    "freezer",
    "cool box",
  ],
  "washing machine": [
    "washer",
    "washing macheen",
    "washin machine",
    "laundry machine",
  ],
  "air conditioner": [
    "ac",
    "a.c",
    "airconditioner",
    "air conditoner",
    "cooler",
  ],
};

// ─── Language detection heuristic (script-based) ────────────────────────────
function detectScript(text: string): string {
  if (/[\u0900-\u097F]/.test(text)) return "hi-IN"; // Devanagari (Hindi/Marathi)
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta-IN"; // Tamil
  if (/[\u0C00-\u0C7F]/.test(text)) return "te-IN"; // Telugu
  if (/[\u0980-\u09FF]/.test(text)) return "bn-IN"; // Bengali
  if (/[\u0A80-\u0AFF]/.test(text)) return "gu-IN"; // Gujarati
  if (/[\u0C80-\u0CFF]/.test(text)) return "kn-IN"; // Kannada
  if (/[\u0D00-\u0D7F]/.test(text)) return "ml-IN"; // Malayalam
  if (/[\u0A00-\u0A7F]/.test(text)) return "pa-IN"; // Punjabi
  return "en-IN";
}

// ─── Normalize query: fix common misspellings & expand synonyms ──────────────
function normalizeQuery(query: string): string {
  let normalized = query.toLowerCase().trim();
  normalized = normalized.replace(/\s+/g, " ");
  const corrections: [RegExp, any][] = [
    [/\bfone\b/g, "phone"],
    [/\bphon\b/g, "phone"],
    [/\bmobail\b/g, "mobile"],
    [/\bmobil\b/g, "mobile"],
    [/\bleptop\b/g, "laptop"],
    [/\blaptoop\b/g, "laptop"],
    [/\blaaptop\b/g, "laptop"],
    [/\bcomputar\b/g, "computer"],
    [/\bhedfone\b/g, "headphone"],
    [/\bhedphone\b/g, "headphone"],
    [/\bheadfone\b/g, "headphone"],
    [/\bearfone\b/g, "earphone"],
    [/\bcamra\b/g, "camera"],
    [/\bcamara\b/g, "camera"],
    [/\bshrit\b/g, "shirt"],
    [/\bshert\b/g, "shirt"],
    [/\bprise\b/g, "price"],
    [/\bpric\b/g, "price"],
    [/\bprice\b/g, "price"],
    [/\bcheap\b/g, "budget"],
    [/\bsasta\b/g, "budget low price"],
    [/\bmehenga\b/g, "premium high price"],
    [/\bacha\b/g, "good quality"],
    [/\baccha\b/g, "good quality"],
    [/\bbest wala\b/g, "best"],
    [/\bsabse\b/g, "most"],
    [/\bunder\b/g, "under"],
    [/\bse kam\b/g, "under"],
    [/\bse zyada\b/g, "above"],
    [/\bke neeche\b/g, "under"],
    [/\bk niche\b/g, "under"],
    [/\brupee\b/g, "₹"],
    [/\brupees\b/g, "₹"],
    [/\brupiya\b/g, "₹"],
    [/\brs\b/g, "₹"],
    [/\bk\b(?=\s*\d|\d)/g, "000"],
    [/(\d+)\s*k\b/g, (m: any, n: any) => String(parseInt(n) * 1000)],
    [/(\d+)\s*lakh\b/g, (m: any, n: any) => String(parseInt(n) * 100000)],
    [/(\d+)\s*lac\b/g, (m: any, n: any) => String(parseInt(n) * 100000)],
  ];
  for (const [pattern, replacement] of corrections) {
    normalized = normalized.replace(pattern, replacement as string);
  }
  return normalized;
}

// ─── TTS Summary: extract clean 1-2 sentence digest for audio reading ─────────
function getTTSSummary(text: string, maxChars = 180): string {
  // Strip markdown symbols, currency signs, emojis, URLs, bullet chars
  let clean = text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*_`#>~|\-\[\]()]/g, "")
    .replace(/[₹$€£¥]/g, "")
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

  // Split into sentences
  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];

  // Take first 2 sentences, ensure within maxChars
  let summary = "";
  for (let i = 0; i < Math.min(2, sentences.length); i++) {
    const next = summary + sentences[i].trim() + " ";
    if (next.trim().length <= maxChars) {
      summary = next;
    } else {
      break;
    }
  }

  summary = summary.trim();

  // If still too long, hard truncate at word boundary
  if (summary.length > maxChars) {
    summary = summary.substring(0, maxChars).replace(/\s\S*$/, "") + "…";
  }

  return summary || clean.substring(0, maxChars);
}

// ─── Types ──────────────────────────────────────────────────────────────────
type SearchParams = Record<string, string | number | string[]>;

// ─── Typing indicator ────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="nv-typing-dots" aria-label="AI is thinking">
      <span />
      <span />
      <span />
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatParamLabel(key: string): string {
  const labels: Record<string, string> = {
    category: "Category",
    price_min: "Min price",
    price_max: "Max price",
    features: "Features",
    query: "Search",
    brand: "Brand",
    rating: "Min rating",
    sort: "Sort by",
    color: "Color",
    fuzzy_terms: "Also checking",
  };
  return (
    labels[key] ??
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function formatParamValue(
  key: string,
  value: string | number | string[],
): string {
  if (Array.isArray(value)) return value.slice(0, 3).join(", ");
  if (
    (key === "price_min" || key === "price_max") &&
    typeof value === "number"
  ) {
    return value === 0 ? "₹0" : `₹${value.toLocaleString("en-IN")}`;
  }
  return String(value);
}

// ─── Search card ──────────────────────────────────────────────────────────────
function SearchCard({
  params,
  query,
  loading,
}: {
  params: SearchParams;
  query: string;
  loading: boolean;
}) {
  const showKeys = [
    "category",
    "price_min",
    "price_max",
    "color",
    "brand",
    "features",
    "sort",
  ];
  const entries = Object.entries(params).filter(([k, v]) => {
    if (!showKeys.includes(k)) return false;
    if (Array.isArray(v)) return v.length > 0;
    return v !== "" && v !== null && v !== undefined && v !== 0;
  });

  return (
    <div className="nv-search-card">
      <div className="nv-search-card__header">
        <div className="nv-search-card__icon-wrap">
          <Search size={13} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="nv-search-card__title">Searching Nuvix Catalog</p>
          <p className="nv-search-card__query" title={query}>
            "{query}"
          </p>
        </div>
        {loading ? (
          <div className="nv-search-card__spinner animate-spin" />
        ) : (
          <div className="nv-search-card__checked-badge">
            <Check size={9} strokeWidth={3} />
          </div>
        )}
      </div>
      {entries.length > 0 && (
        <div className="nv-search-card__params">
          {entries.map(([k, v]) => (
            <div key={k} className="nv-search-card__param">
              <span className="nv-search-card__param-key">
                {formatParamLabel(k)}
              </span>
              <span className="nv-search-card__param-val">
                {formatParamValue(k, v)}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="nv-search-card__footer">
        {loading ? (
          <>
            <Package size={10} className="animate-pulse" />
            <span>Fetching matching products…</span>
          </>
        ) : (
          <>
            <Check size={10} className="text-emerald-500" />
            <span style={{ color: "#10b981", fontWeight: 600 }}>
              Query executed successfully
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({
  message,
  index,
  isCopied,
  onCopy,
  onSpeak,
  isSpeaking,
  loading,
  onAddToCart,
}: {
  message: Message;
  index: number;
  isCopied: boolean;
  onCopy: (text: string, i: number) => void;
  onSpeak: (text: string, lang: string) => void;
  isSpeaking: boolean;
  loading: boolean;
  onAddToCart: (p: any) => void;
}) {
  const isUser = message.sender === "user";
  const isSearch = message.type === "search" && message.searchParams;
  // Generate a short TTS-friendly summary (1-2 sentences)
  const ttsSummary = getTTSSummary(message.content);
  const isLongMessage = message.content.length > ttsSummary.length + 10;

  return (
    <div
      className={`nv-msg-row ${isUser ? "nv-msg-row--user animate-slide-right" : "nv-msg-row--ai animate-slide-left"}`}
    >
      {!isUser && (
        <div className="nv-msg-avatar nv-msg-avatar--ai glow-brand">
          <div className="nv-brand-icon nv-brand-icon--sm">
            <Sparkles size={11} className="text-white" />
          </div>
        </div>
      )}
      {isSearch ? (
        <div className="nv-search-card-wrapper">
          <SearchCard
            params={message.searchParams!}
            query={message.content}
            loading={loading}
          />

          {/* Snapped horizontal product carousel directly inside message bubble */}
          {message.products && message.products.length > 0 && (
            <div className="nv-inline-carousel-wrapper animate-fade-up">
              <div className="nv-inline-carousel scrollbar-hide">
                {message.products.map((p: any) => {
                  const originalPrice = Math.floor(p.price * 1.38);
                  const discount = Math.round(
                    ((originalPrice - p.price) / originalPrice) * 100,
                  );
                  return (
                    <div
                      key={p._id}
                      className="nv-carousel-card surface surface-hover"
                    >
                      <div className="nv-carousel-card__img-wrap">
                        <img
                          src={p.images[0] || "/placeholder.png"}
                          alt={p.name}
                          className="nv-carousel-card__img"
                          loading="lazy"
                        />
                        <span className="nv-carousel-card__discount">
                          {discount}% OFF
                        </span>
                      </div>
                      <div className="nv-carousel-card__content">
                        <h4 className="nv-carousel-card__title" title={p.name}>
                          {p.name}
                        </h4>
                        <div className="nv-carousel-card__price-row">
                          <span className="nv-carousel-card__price">
                            ₹{p.price.toLocaleString("en-IN")}
                          </span>
                          <span className="nv-carousel-card__price-old">
                            ₹{originalPrice.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="nv-carousel-card__actions">
                          <button
                            onClick={() => onAddToCart(p)}
                            className="nv-carousel-card__btn nv-carousel-card__btn--buy"
                          >
                            <ShoppingCart size={9} />
                            <span>Add</span>
                          </button>
                          <Link
                            href={`/products/${p._id}`}
                            className="nv-carousel-card__btn nv-carousel-card__btn--view"
                          >
                            <Eye size={10} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`nv-msg-bubble ${isUser ? "nv-msg-bubble--user" : "nv-msg-bubble--ai"}`}
        >
          <p className="nv-msg-text">{message.content}</p>
          <div className="nv-bubble-actions">
            {!isUser && (
              <button
                className={`nv-action-btn${isSpeaking ? " nv-action-btn--active" : ""}`}
                onClick={() =>
                  onSpeak(ttsSummary, message.language || "en-IN")
                }
                aria-label={isSpeaking ? "Stop speaking" : "Listen to summary"}
                title={isSpeaking ? "Stop" : isLongMessage ? "Listen (summary)" : "Listen"}
              >
                {isSpeaking ? <VolumeX size={9} /> : <Volume2 size={9} />}
              </button>
            )}
            <button
              className="nv-action-btn"
              onClick={() => onCopy(message.content, index)}
              aria-label={isCopied ? "Copied!" : "Copy message"}
              title="Copy"
            >
              {isCopied ? (
                <Check size={9} className="nv-copy-icon--done" />
              ) : (
                <Clipboard size={9} />
              )}
            </button>
          </div>
          {/* Summary indicator badge for long messages */}
          {!isUser && isSpeaking && isLongMessage && (
            <div className="nv-tts-badge">🔊 Playing summary</div>
          )}
        </div>
      )}
      {isUser && (
        <div className="nv-msg-avatar nv-msg-avatar--user">
          <User size={13} />
        </div>
      )}
    </div>
  );
}

// ChatMessage type replaced by imported Message type from store

// ─── Main export ──────────────────────────────────────────────────────────────
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    threads,
    activeThreadId,
    inputValue,
    addMessage,
    setInputValue,
    createThread,
    switchThread,
    deleteThread,
    updateActiveThreadProducts,
    clearMessages,
    sidebarCollapsed,
    toggleSidebar,
  } = useChatStore();
  const { user, logout } = useAuthStore();
  const { addToCart } = useCartStore();
  const userKey = user?.email || "anonymous";

  // Load threads
  const currentThreads = threads[userKey] || [];
  const activeId = activeThreadId[userKey];
  const activeThread =
    currentThreads.find((t) => t.id === activeId) || currentThreads[0];
  const messages = activeThread
    ? activeThread.messages
    : ([
        { sender: "ai", content: "Hi there! What are you looking for today?" },
      ] as Message[]);

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
  const [selectedLang, setSelectedLang] = useState("en-IN");
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [processingVoice, setProcessingVoice] = useState(false);

  // Expanded layouts & ratios
  const pathname = usePathname();
  const isProductDetailPage = pathname?.startsWith("/products/");
  const [showShelf, setShowShelf] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [prevProductCount, setPrevProductCount] = useState(0);

  // ChatGPT-style Continuous Voice Conversation Overlay states
  const [isVoiceConvOpen, setIsVoiceConvOpen] = useState(false);
  const [voiceConvState, setVoiceConvState] = useState<
    "listening" | "thinking" | "speaking" | "paused"
  >("listening");
  const [voiceConvTranscript, setVoiceConvTranscript] = useState("");

  const isMounted = useIsMounted();
  const router = useRouter();

  // Initialize theme tracking
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Auto-create thread if none exists on load
  useEffect(() => {
    if (currentThreads.length === 0) {
      createThread(userKey);
    }
  }, [userKey, currentThreads.length, createThread]);

  // Sync right shelf products when active thread changes
  useEffect(() => {
    if (activeThread) {
      setProducts(activeThread.products || []);
    } else {
      setProducts([]);
    }
  }, [activeThread?.id]);

  // Slide open Right Shelf automatically when new product searches complete
  useEffect(() => {
    const activeProducts = activeThread?.products || [];
    if (activeProducts.length > prevProductCount && activeProducts.length > 0) {
      setShowShelf(true);
    }
    setPrevProductCount(activeProducts.length);
  }, [activeThread?.products]);

  // Auto-scroll chat
  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isThinking, isMobileChatOpen]);

  // Speech service initialization
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SR) setVoiceSupported(true);
    if ("speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
      setTtsSupported(true);
    }
  }, []);

  const buildRecognition = useCallback(
    (lang: string) => {
      const SR =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (!SR) return null;
      const rec = new SR();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = lang;
      rec.onstart = () => {
        setIsListening(true);
        setTranscript("");
      };
      rec.onresult = (e: any) => {
        let interim = "";
        let final = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) final += t;
          else interim += t;
        }
        const detected = detectScript(final || interim);
        if (detected !== "en-IN" && detected !== selectedLang)
          setSelectedLang(detected);
        setTranscript(final || interim);
        if (final) setInputValue(final);
      };
      rec.onerror = () => {
        setIsListening(false);
        setTranscript("");
      };
      rec.onend = () => {
        setIsListening(false);
        if (isVoiceMode) setProcessingVoice(true);
      };
      return rec;
    },
    [selectedLang, isVoiceMode, setInputValue],
  );

  useEffect(() => {
    if (processingVoice && inputValue.trim()) {
      setProcessingVoice(false);
      handleSendMessage(inputValue);
    } else if (processingVoice) {
      setProcessingVoice(false);
    }
  }, [processingVoice]);

  const startListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const rec = buildRecognition(selectedLang);
    if (!rec) return;
    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {}
  }, [isListening, buildRecognition, selectedLang]);

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setSpeakingIndex(null);
  }, []);

  const speakMessage = useCallback(
    (text: string, lang: string, index?: number) => {
      if (!ttsSupported || !synthRef.current) return;
      // If already speaking, stop and return (toggle off)
      if (speakingIndex !== null) {
        stopSpeaking();
        return;
      }
      // Cancel any previous pending speech
      synthRef.current.cancel();

      const doSpeak = () => {
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = lang.includes("-") ? lang : lang + "-IN";
        utt.rate = 0.92;
        utt.pitch = 1.0;
        utt.volume = 1.0;
        utt.onstart = () => {
          if (index !== undefined) setSpeakingIndex(index);
        };
        utt.onend = () => setSpeakingIndex(null);
        utt.onerror = (e) => {
          if (e.error !== "interrupted") setSpeakingIndex(null);
        };
        utteranceRef.current = utt;
        if (index !== undefined) setSpeakingIndex(index);
        synthRef.current?.speak(utt);
      };

      // Ensure voices are loaded before speaking
      const voices = synthRef.current.getVoices();
      if (voices.length > 0) {
        doSpeak();
      } else {
        synthRef.current.onvoiceschanged = () => {
          doSpeak();
        };
      }
    },
    [ttsSupported, speakingIndex, stopSpeaking],
  );

  const handleCopy = useCallback((text: string, index: number) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, []);

  // ─── Multi-thread Thread Handlers ──────────────────────────────────────────
  const handleNewChat = () => {
    createThread(userKey);
    setProducts([]);
    stopSpeaking();
  };

  const handleSwitchThread = (id: string) => {
    switchThread(id, userKey);
    const targetThread = currentThreads.find((t) => t.id === id);
    if (targetThread) {
      setProducts(targetThread.products || []);
    } else {
      setProducts([]);
    }
    stopSpeaking();
  };

  const handleDeleteThread = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteThread(id, userKey);
    setTimeout(() => {
      const remainingThreads = useChatStore.getState().threads[userKey] || [];
      const newActiveId = useChatStore.getState().activeThreadId[userKey];
      const newActiveThread = remainingThreads.find(
        (t) => t.id === newActiveId,
      );
      if (newActiveThread) {
        setProducts(newActiveThread.products || []);
      } else {
        setProducts([]);
      }
    }, 50);
  };

  // ─── ChatGPT-style Continuous Voice Conversation Loop Logic ─────────────────
  const startVoiceConversation = () => {
    setIsVoiceConvOpen(true);
    setVoiceConvState("listening");
    setVoiceConvTranscript("");
    stopSpeaking();
    setIsVoiceMode(true); // Engages auto-speech synthesis responses

    // Trigger continuous recording loop after brief mount
    setTimeout(() => {
      triggerVoiceConvListen();
    }, 400);
  };

  const triggerVoiceConvListen = () => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return;

    stopSpeaking();
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = selectedLang;

    let finalVoiceConvTranscript = "";

    rec.onstart = () => {
      setVoiceConvState("listening");
      setVoiceConvTranscript("");
      finalVoiceConvTranscript = "";
    };

    rec.onresult = (e: any) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      finalVoiceConvTranscript = final || interim;
      setVoiceConvTranscript(finalVoiceConvTranscript);
    };

    rec.onerror = (err: any) => {
      console.error("Continuous voice loop error:", err);
    };

    rec.onend = () => {
      const finalQuery = finalVoiceConvTranscript.trim();
      // If user spoke something, compile and send to search API
      if (finalQuery) {
        setVoiceConvState("thinking");
        handleSendVoiceConvMessage(finalQuery);
      } else {
        // If user remained silent, check overlay state and restart listening
        if (useChatStore.getState().isOpen !== undefined) {
          setTimeout(() => {
            triggerVoiceConvListen();
          }, 1200);
        }
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {}
  };

  const handleSendVoiceConvMessage = async (text: string) => {
    if (!text.trim() || isThinking) return;

    const normalizedQuery = normalizeQuery(text);
    const detectedLang = detectScript(text);

    addMessage(
      { sender: "user", content: text, type: "text", language: detectedLang },
      userKey,
    );
    setIsThinking(true);

    try {
      const activeMsgs =
        useChatStore
          .getState()
          .threads[
            userKey
          ]?.find((t) => t.id === useChatStore.getState().activeThreadId[userKey])
          ?.messages || [];
      const rawHistory = activeMsgs.map((m: any) => ({
        sender: m.sender,
        content: m.content,
        type: m.type || "text",
      }));

      const aiRes = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
          normalizedQuery,
          lang: detectedLang,
          userId: user?._id || null,
          history: rawHistory,
        }),
      });

      if (aiRes.ok) {
        const d = await aiRes.json();
        const qType = (d.queryType || "").toLowerCase();
        const respLang = d.detectedLanguage || detectedLang.split("-")[0];
        const fullLang = respLang + "-IN";

        let answer = "";
        if (
          qType.includes("general") ||
          qType.includes("greeting") ||
          qType.includes("comparison")
        ) {
          answer = d.generalAnswer || "I found some information for you.";
          addMessage(
            { sender: "ai", content: answer, type: "text", language: fullLang },
            userKey,
          );
        } else {
          const sp = d.searchParams || {};
          const products = d.products || [];
          setProducts(products);
          setSearchQuery("");

          updateActiveThreadProducts(products, userKey);
          addMessage(
            {
              sender: "ai",
              content: text,
              type: "search",
              searchParams: sp,
              products,
              language: fullLang,
            },
            userKey,
          );

          answer =
            d.generalAnswer ||
            `I discovered ${products.length} matching products in the Nuvix catalog.`;
          addMessage(
            { sender: "ai", content: answer, type: "text", language: fullLang },
            userKey,
          );
        }

        // Advance to speaking synthesis
        setVoiceConvState("speaking");
        setVoiceConvTranscript(answer);
        speakVoiceConvResponse(answer, fullLang);
      } else {
        const err = "Sorry, Nuvix AI had trouble handling that request.";
        addMessage({ sender: "ai", content: err, type: "text" }, userKey);
        setVoiceConvState("speaking");
        setVoiceConvTranscript(err);
        speakVoiceConvResponse(err, "en-IN");
      }
    } catch {
      const err = "Network connection dropped. Please try again.";
      addMessage({ sender: "ai", content: err, type: "text" }, userKey);
      setVoiceConvState("speaking");
      setVoiceConvTranscript(err);
      speakVoiceConvResponse(err, "en-IN");
    } finally {
      setIsThinking(false);
    }
  };

  const speakVoiceConvResponse = (text: string, lang: string) => {
    if (!ttsSupported || !synthRef.current) {
      // Fall back to just restarting listening loop
      setVoiceConvState("listening");
      setVoiceConvTranscript("");
      setTimeout(() => triggerVoiceConvListen(), 800);
      return;
    }

    synthRef.current.cancel();

    const doSpeak = () => {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = lang.includes("-") ? lang : lang + "-IN";
      utt.rate = 0.92;
      utt.pitch = 1.0;
      utt.volume = 1.0;

      utt.onend = () => {
        // Loop back to continuous hands-free listening!
        setVoiceConvState("listening");
        setVoiceConvTranscript("");
        triggerVoiceConvListen();
      };

      utt.onerror = (e) => {
        if (e.error === "interrupted") return;
        setVoiceConvState("listening");
        setVoiceConvTranscript("");
        setTimeout(() => triggerVoiceConvListen(), 800);
      };

      utteranceRef.current = utt;
      synthRef.current?.speak(utt);
    };

    // Ensure voices are loaded before speaking
    const voices = synthRef.current.getVoices();
    if (voices.length > 0) {
      doSpeak();
    } else {
      synthRef.current.onvoiceschanged = () => {
        doSpeak();
      };
    }
  };

  const endVoiceConversation = () => {
    stopSpeaking();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {}
    }
    setIsVoiceConvOpen(false);
    setVoiceConvTranscript("");
    setIsVoiceMode(false);
  };

  // ─── Core send logic ────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(
    async (textToSend?: string) => {
      const rawQuery = textToSend || inputValue;
      if (!rawQuery.trim() || isThinking) return;

      const normalizedQuery = normalizeQuery(rawQuery);
      const detectedLang = detectScript(rawQuery);

      addMessage(
        {
          sender: "user",
          content: rawQuery,
          type: "text",
          language: detectedLang,
        },
        userKey,
      );
      setInputValue("");
      setIsThinking(true);

      try {
        const activeMsgs =
          useChatStore
            .getState()
            .threads[
              userKey
            ]?.find((t) => t.id === useChatStore.getState().activeThreadId[userKey])
            ?.messages || [];
        const rawHistory = activeMsgs.map((m: any) => ({
          sender: m.sender,
          content: m.content,
          type: m.type || "text",
        }));

        const aiRes = await fetch("/api/ai-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: rawQuery,
            normalizedQuery,
            lang: detectedLang,
            userId: user?._id || null,
            history: rawHistory,
          }),
        });

        if (aiRes.ok) {
          const d = await aiRes.json();
          const qType = (d.queryType || "").toLowerCase();
          const respLang = d.detectedLanguage || detectedLang.split("-")[0];
          const fullLang = respLang + "-IN";

          if (
            qType.includes("general") ||
            qType.includes("greeting") ||
            qType.includes("comparison")
          ) {
            const answer =
              d.generalAnswer ||
              "I can help you find products. What are you looking for?";
            addMessage(
              {
                sender: "ai",
                content: answer,
                type: "text",
                language: fullLang,
              },
              userKey,
            );

            if (isVoiceMode && ttsSupported) {
              setTimeout(() => speakMessage(answer, fullLang), 300);
            }
          } else {
            // Product search
            const sp = d.searchParams || {};
            const products = d.products || [];
            setProducts(products);
            setSearchQuery("");

            updateActiveThreadProducts(products, userKey);
            addMessage(
              {
                sender: "ai",
                content: rawQuery,
                type: "search",
                searchParams: sp,
                products,
                language: fullLang,
              },
              userKey,
            );

            const answer =
              d.generalAnswer || `Found ${products.length} products for you.`;
            addMessage(
              {
                sender: "ai",
                content: answer,
                type: "text",
                language: fullLang,
              },
              userKey,
            );

            if (isVoiceMode && ttsSupported) {
              setTimeout(() => speakMessage(answer, fullLang), 300);
            }
          }
        } else {
          addMessage(
            {
              sender: "ai",
              content:
                "Sorry, I had trouble understanding that. Please try again.",
              type: "text",
              language: "en",
            },
            userKey,
          );
        }
      } catch {
        const err = "Connection error. Please check your network.";
        addMessage({ sender: "ai", content: err, type: "text" }, userKey);
      } finally {
        setIsThinking(false);
        inputRef.current?.focus();
      }
    },
    [
      inputValue,
      isThinking,
      addMessage,
      setInputValue,
      setProducts,
      setSearchQuery,
      isVoiceMode,
      ttsSupported,
      speakMessage,
      userKey,
    ],
  );

  if (!isMounted) return null;

  const isNewChat = messages.length <= 1;

  // ─── Rendering segments ─────────────────────────────────────────────────────
  const renderSidebar = () => (
    <div className="nv-sidebar__inner">
      {/* Top Brand Logo */}
      <div className="nv-sidebar__logo-area">
        <div className="nv-brand-icon">
          <Sparkles size={14} className="text-white" />
        </div>
        <span className="nv-sidebar__logo-text font-black tracking-widest uppercase">
          NUVIX AI
        </span>
      </div>

      {/* Glowing New Chat Trigger */}
      <button
        onClick={handleNewChat}
        className="nv-sidebar__new-chat-btn animate-pulse-soft"
        title="Start a fresh shopping session"
      >
        <Plus size={14} />
        <span>New Chat</span>
      </button>

      {/* Saved Conversations list */}
      <div className="nv-sidebar__threads scrollbar-hide">
        <div className="nv-sidebar__threads-label">Previous Chats</div>
        {currentThreads.length === 0 ? (
          <div className="nv-sidebar__threads-empty">No active threads</div>
        ) : (
          <div className="nv-sidebar__threads-list">
            {currentThreads.map((t) => {
              const isActive = t.id === activeThread?.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSwitchThread(t.id)}
                  className={`nv-sidebar__thread-item group ${isActive ? "nv-sidebar__thread-item--active" : ""}`}
                >
                  <MessageCircle size={13} className="nv-thread-icon" />
                  <span className="nv-thread-title">{t.title}</span>
                  <button
                    onClick={(e) => handleDeleteThread(e, t.id)}
                    className="nv-thread-delete-btn"
                    title="Delete conversation"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom User Card */}
      <div className="nv-sidebar__footer">
        <div className="nv-sidebar__profile">
          <div className="nv-profile-avatar">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="nv-profile-info min-w-0">
            <div className="nv-profile-name truncate">
              {user?.name || "Shopper"}
            </div>
            <div className="nv-profile-email truncate">
              {user?.email || "Guest Mode"}
            </div>
          </div>
        </div>

        {/* Action button row */}
        <div className="nv-sidebar__actions">
          {user && (
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="nv-sidebar__action-btn nv-sidebar__action-btn--logout"
              title="Logout"
            >
              <LogOut size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        /* Immerse fullpage dashboard wrapper */
        .nv-root {
          display: flex;
          height: calc(100vh - 60px);
          overflow: hidden;
          background: var(--nv-bg);
          font-family: var(--nv-font-body);
          position: relative;
        }

        /* Immersion: hide landing footer when inside the smart workspace */
        .nv-root ~ footer, body:has(.nv-root) footer {
          display: none !important;
        }

        /* ── Theme Adaptable Left Sidebar (ChatGPT-style) ── */
        .nv-sidebar {
          width: 260px;
          background: #f8fafc;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 30;
          flex-shrink: 0;
          height: 100%;
        }
        
        /* Dark mode override for Left Sidebar */
        .dark .nv-sidebar {
          background: #080916;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
        }

        .nv-sidebar--collapsed {
          width: 0px;
          transform: translateX(-260px);
          opacity: 0;
          border-right: none;
        }
        .nv-sidebar__inner {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 16px;
          box-sizing: border-box;
          overflow: hidden;
        }
        .nv-sidebar__logo-area {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 18px;
          padding: 0 4px;
        }
        .nv-sidebar__logo-text {
          font-size: 11px;
          font-weight: 900;
          color: var(--foreground);
          letter-spacing: 0.1em;
          background: linear-gradient(90deg, var(--nv-indigo-light), var(--nv-indigo));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .dark .nv-sidebar__logo-text {
          background: linear-gradient(90deg, #a5f3fc, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Rounded brand icon */
        .nv-brand-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
        }
        .nv-brand-icon--sm {
          width: 24px;
          height: 24px;
          border-radius: 8px;
        }

        .nv-sidebar__new-chat-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 10px;
          border-radius: 12px;
          border: 1px solid rgba(79, 70, 229, 0.2);
          background: rgba(79, 70, 229, 0.04);
          color: var(--nv-indigo);
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 20px;
        }
        .dark .nv-sidebar__new-chat-btn {
          border: 1px solid rgba(129, 140, 248, 0.25);
          background: rgba(129, 140, 248, 0.04);
          color: #818cf8;
        }
        .nv-sidebar__new-chat-btn:hover {
          background: rgba(79, 70, 229, 0.08);
          border-color: var(--nv-indigo);
          transform: translateY(-1px);
        }
        .dark .nv-sidebar__new-chat-btn:hover {
          background: rgba(129, 140, 248, 0.08);
          border-color: #818cf8;
        }
        .nv-sidebar__threads {
          flex: 1;
          overflow-y: auto;
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
        }
        .nv-sidebar__threads-label {
          font-size: 9px;
          font-weight: 800;
          color: var(--muted-foreground);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 8px;
          padding: 0 4px;
        }
        .dark .nv-sidebar__threads-label {
          color: rgba(255, 255, 255, 0.3);
        }
        .nv-sidebar__threads-empty {
          font-size: 10px;
          color: var(--muted-foreground);
          text-align: center;
          padding: 20px 0;
        }
        .nv-sidebar__threads-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .nv-sidebar__thread-item {
          display: flex;
          align-items: center;
          padding: 9px 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--text-2);
          position: relative;
          overflow: hidden;
        }
        .dark .nv-sidebar__thread-item {
          color: rgba(255, 255, 255, 0.6);
        }
        .nv-sidebar__thread-item:hover {
          background: var(--secondary);
          color: var(--foreground);
        }
        .dark .nv-sidebar__thread-item:hover {
          background: rgba(255, 255, 255, 0.03);
          color: #fff;
        }
        .nv-sidebar__thread-item--active {
          background: rgba(79, 70, 229, 0.07) !important;
          border: 1px solid rgba(79, 70, 229, 0.2);
          color: var(--nv-indigo) !important;
          font-weight: 700;
        }
        .dark .nv-sidebar__thread-item--active {
          background: rgba(79, 70, 229, 0.15) !important;
          border: 1px solid rgba(79, 70, 229, 0.3);
          color: #818cf8 !important;
        }
        .nv-thread-icon {
          margin-right: 8px;
          flex-shrink: 0;
        }
        .nv-thread-title {
          font-size: 11px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex-1;
          margin-right: 16px;
        }
        .nv-thread-delete-btn {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: var(--muted-foreground);
          cursor: pointer;
          opacity: 0;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 5px;
        }
        .dark .nv-thread-delete-btn {
          color: rgba(255, 255, 255, 0.25);
        }
        .nv-sidebar__thread-item:hover .nv-thread-delete-btn {
          opacity: 1;
        }
        .nv-thread-delete-btn:hover {
          color: #ef4444 !important;
          background: rgba(239, 68, 68, 0.12);
        }
        .nv-sidebar__footer {
          border-top: 1px solid var(--border);
          padding-top: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .dark .nv-sidebar__footer {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .nv-sidebar__profile {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 4px;
        }
        .nv-profile-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4f46e5, #06b6d4);
          color: #fff;
          font-size: 12px;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.35);
        }
        .nv-profile-name {
          font-size: 11px;
          font-weight: 700;
          color: var(--foreground);
        }
        .dark .nv-profile-name {
          color: #fff;
        }
        .nv-profile-email {
          font-size: 9px;
          color: var(--muted-foreground);
          margin-top: 1px;
        }
        .dark .nv-profile-email {
          color: rgba(255, 255, 255, 0.35);
        }
        .nv-sidebar__actions {
          display: flex;
          gap: 6px;
        }
        .nv-sidebar__action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 28px;
          border-radius: 8px;
          background: var(--secondary);
          border: 1px solid var(--border);
          color: var(--muted-foreground);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .dark .nv-sidebar__action-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.5);
        }
        .nv-sidebar__action-btn:hover {
          background: var(--accent);
          color: var(--foreground);
        }
        .dark .nv-sidebar__action-btn:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
        }
        .nv-sidebar__action-btn--logout:hover {
          background: rgba(239, 68, 68, 0.12);
          border-color: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        /* ── Full Page Chat Console (default) ── */
        @media(min-width: 1024px) {
          .nv-chat-console {
            width: 100% !important;
            flex: none !important;
            transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
          .nv-product-shelf {
            width: 0% !important;
            flex: none !important;
            overflow: hidden !important;
            border: none !important;
            padding: 0 !important;
            transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
          .nv-product-shelf--open {
            width: 60% !important;
            overflow: auto !important;
            border-left: 1px solid var(--border) !important;
            padding: 16px !important;
          }
          .nv-root:has(.nv-product-shelf--open) .nv-chat-console {
            width: 40% !important;
          }
        }

        /* ── Center Chat Console (Gemini-style) ── */
        .nv-chat-console {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--background);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          height: 100%;
        }
        .nv-chat-console-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          border-bottom: 1px solid var(--border);
          background: var(--card);
          z-index: 10;
          height: 52px;
          box-sizing: border-box;
        }
        .nv-chat-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .nv-sidebar-toggle-btn {
          background: transparent;
          border: none;
          color: var(--muted-foreground);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        .nv-sidebar-toggle-btn:hover {
          background: var(--secondary);
          color: var(--foreground);
        }
        .nv-chat-header-title {
          font-size: 12px;
          font-weight: 800;
          color: var(--foreground);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .nv-chat-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nv-header-action-btn {
          background: transparent;
          border: none;
          color: var(--muted-foreground);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          transition: all 0.2s ease;
          position: relative;
        }
        .nv-header-action-btn:hover {
          background: var(--secondary);
          color: var(--foreground);
        }
        .nv-header-action-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: var(--nv-indigo);
          color: #fff;
          font-size: 8px;
          font-weight: 800;
          border-radius: 50%;
          width: 14px;
          height: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid var(--card);
          box-shadow: 0 0 6px rgba(79, 70, 229, 0.4);
        }
        
        /* ── Immersive Welcome View ── */
        .nv-welcome-screen {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          max-width: 760px;
          margin: 0 auto;
          text-align: center;
          position: relative;
          z-index: 1;
        }
        .nv-welcome-screen__glow-orb {
          position: absolute;
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%);
          filter: blur(40px);
          pointer-events: none;
          z-index: -1;
        }
        .nv-welcome-screen__logo {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          background: linear-gradient(135deg, #4f46e5, #06b6d4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          margin: 0 auto 16px;
          box-shadow: 0 10px 30px rgba(79, 70, 229, 0.35);
        }
        .nv-welcome-screen__title {
          font-size: 22px;
          font-weight: 900;
          color: var(--foreground);
          line-height: 1.3;
          margin-bottom: 10px;
          letter-spacing: -0.02em;
        }
        .nv-welcome-screen__subtitle {
          font-size: 12px;
          color: var(--muted-foreground);
          line-height: 1.6;
          max-width: 480px;
          margin: 0 auto 28px;
          font-weight: 500;
        }
        .nv-welcome-screen__cards {
          display: grid;
          grid-template-cols: 1fr;
          gap: 10px;
          width: 100%;
        }
        @media(min-width: 640px) {
          .nv-welcome-screen__cards {
            grid-template-cols: 1fr 1fr;
          }
        }
        .nv-welcome-card {
          padding: 14px 16px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: left;
          cursor: pointer;
          box-shadow: var(--nv-shadow-sm);
          position: relative;
        }
        .nv-welcome-card__icon {
          font-size: 18px;
          flex-shrink: 0;
        }
        .nv-welcome-card__content {
          min-w-0;
          flex: 1;
        }
        .nv-welcome-card__title {
          font-size: 11px;
          font-weight: 700;
          color: var(--foreground);
        }
        .nv-welcome-card__desc {
          font-size: 9px;
          color: var(--muted-foreground);
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .nv-welcome-card__arrow {
          color: var(--muted-foreground);
          opacity: 0;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .nv-welcome-card:hover .nv-welcome-card__arrow {
          opacity: 1;
          transform: translateX(2px);
        }

        /* ── Centered Message Flow ── */
        .nv-chat-container-wrap {
          flex: 1;
          overflow-y: auto;
          position: relative;
        }
        .nv-chat-messages-container {
          max-width: 760px;
          margin: 0 auto;
          padding: 24px 20px 100px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-sizing: border-box;
        }

        /* Redesign chat bubbles */
        .nv-msg-row {
          display: flex;
          gap: 12px;
          max-width: 90%;
        }
        .nv-msg-row--user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }
        .nv-msg-row--ai {
          align-self: flex-start;
        }
        .nv-msg-avatar {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: var(--nv-shadow-sm);
        }
        .nv-msg-avatar--ai {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: #fff;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
        }
        .nv-msg-avatar--user {
          background: var(--secondary);
          border: 1px solid var(--border);
          color: var(--muted-foreground);
        }
        .nv-msg-bubble {
          position: relative;
          border-radius: 16px;
          padding: 9px 42px 9px 13px;
          box-shadow: var(--nv-shadow-sm);
          min-width: 50px;
          max-width: 520px;
        }
        .nv-msg-bubble--user {
          background: var(--card);
          border: 1px solid var(--border);
          border-top-right-radius: 4px;
          color: var(--foreground);
        }
        .nv-msg-bubble--ai {
          background: var(--card);
          border: 1px solid var(--border);
          border-top-left-radius: 4px;
          color: var(--foreground);
        }
        
        /* Dark adjustments for AI message bubble */
        .dark .nv-msg-bubble--ai {
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(255, 255, 255, 0.05);
        }

        .nv-msg-bubble--thinking {
          padding: 14px 20px;
          background: var(--secondary) !important;
          border: 1px solid var(--border);
          box-shadow: none;
        }
        .nv-msg-text {
          font-size: 11.5px;
          font-weight: 500;
          line-height: 1.55;
          word-break: break-word;
        }
        .nv-bubble-actions {
          position: absolute;
          top: 8px;
          right: 8px;
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: all 0.2s ease;
        }
        .nv-msg-bubble:hover .nv-bubble-actions {
          opacity: 1;
        }
        .nv-action-btn {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--secondary);
          border: 1px solid var(--border);
          color: var(--muted-foreground);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .nv-action-btn:hover {
          background: var(--accent);
          color: var(--foreground);
        }
        .nv-action-btn--active {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.2);
          color: #10b981 !important;
        }
        .nv-copy-icon--done {
          color: #10b981;
        }

        .nv-tts-badge {
          position: absolute;
          bottom: -20px;
          left: 13px;
          font-size: 8.5px;
          font-weight: 700;
          color: var(--nv-indigo);
          opacity: 0.75;
          pointer-events: none;
          white-space: nowrap;
          animation: fadeIn 0.2s ease;
        }
        .dark .nv-tts-badge {
          color: #a5b4fc;
        }

        /* ── Inline Product snaps inside chat bubbles ── */
        .nv-search-card-wrapper {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 100%;
        }
        .nv-search-card {
          width: 100%;
          max-width: 480px;
          border-radius: 18px;
          background: var(--card);
          border: 1px solid var(--border);
          box-shadow: var(--nv-shadow-md);
          overflow: hidden;
        }
        .nv-search-card__header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.05), rgba(6, 182, 212, 0.03));
          border-bottom: 1px solid var(--border);
        }
        .nv-search-card__icon-wrap {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: linear-gradient(135deg, #4f46e5, #06b6d4);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
        }
        .nv-search-card__title {
          font-size: 10px;
          font-weight: 800;
          color: var(--foreground);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .nv-search-card__query {
          font-size: 11px;
          font-weight: 700;
          color: var(--nv-indigo);
          margin-top: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .nv-search-card__spinner {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid rgba(79, 70, 229, 0.15);
          border-top-color: var(--nv-indigo);
          flex-shrink: 0;
        }
        .nv-search-card__checked-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
          flex-shrink: 0;
        }
        .nv-search-card__params {
          padding: 10px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          border-bottom: 1px solid var(--border);
        }
        .nv-search-card__param {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
        }
        .nv-search-card__param-key {
          font-size: 9px;
          font-weight: 800;
          color: var(--muted-foreground);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          flex-shrink: 0;
        }
        .nv-search-card__param-val {
          font-size: 10.5px;
          font-weight: 700;
          color: var(--foreground);
          text-align: right;
        }
        .nv-search-card__footer {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: var(--secondary);
          font-size: 9px;
          font-weight: 800;
          color: var(--muted-foreground);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* ── Inline snappy snap carousel ── */
        .nv-inline-carousel-wrapper {
          width: 100%;
          max-width: 480px;
          overflow: hidden;
          margin-top: 4px;
        }
        .nv-inline-carousel {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding-bottom: 6px;
        }
        .nv-carousel-card {
          flex-shrink: 0;
          width: 140px;
          border-radius: 14px;
          background: var(--card);
          border: 1px solid var(--border);
          box-shadow: var(--nv-shadow-sm);
          scroll-snap-align: start;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .nv-carousel-card__img-wrap {
          height: 100px;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 10px;
          border-bottom: 1px solid var(--border);
        }
        .dark .nv-carousel-card__img-wrap {
          background: rgba(255, 255, 255, 0.01);
        }
        .nv-carousel-card__img {
          max-height: 100%;
          max-width: 100%;
          object-contain: fit;
        }
        .nv-carousel-card__discount {
          position: absolute;
          top: 6px;
          left: 6px;
          background: #ef4444;
          color: #fff;
          font-size: 7px;
          font-weight: 900;
          padding: 2px 4px;
          border-radius: 4px;
          letter-spacing: 0.02em;
        }
        .nv-carousel-card__content {
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          flex: 1;
        }
        .nv-carousel-card__title {
          font-size: 10px;
          font-weight: 700;
          color: var(--foreground);
          line-clamp: 2;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.3;
          height: 26px;
        }
        .nv-carousel-card__price-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .nv-carousel-card__price {
          font-size: 11px;
          font-weight: 900;
          color: var(--foreground);
        }
        .nv-carousel-card__price-old {
          font-size: 8px;
          color: var(--muted-foreground);
          text-decoration: line-through;
        }
        .nv-carousel-card__actions {
          display: flex;
          gap: 4px;
          margin-top: auto;
        }
        .nv-carousel-card__btn {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 22px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          border: none;
          transition: all 0.15s ease;
        }
        .nv-carousel-card__btn--buy {
          flex: 1;
          background: linear-gradient(135deg, var(--nv-indigo), var(--nv-indigo-mid));
          color: #fff;
          gap: 3px;
        }
        .nv-carousel-card__btn--buy:hover {
          opacity: 0.9;
          transform: translateY(-0.5px);
        }
        .nv-carousel-card__btn--view {
          width: 22px;
          background: var(--secondary);
          border: 1px solid var(--border);
          color: var(--muted-foreground);
        }
        .nv-carousel-card__btn--view:hover {
          background: var(--accent);
          color: var(--foreground);
        }

        /* ── Centered Floating Composer ── */
        .nv-chat-input-container {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(180deg, transparent 0%, var(--background) 25%);
          padding: 16px 20px 24px;
          z-index: 10;
        }
        .nv-composer-wrapper {
          max-width: 760px;
          margin: 0 auto;
        }
        .nv-composer {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f1f5f9;
          border: 1.5px solid #e2e8f0;
          box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
          border-radius: 28px;
          padding: 6px 6px 6px 12px;
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .dark .nv-composer {
          background: #1e1e2e;
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
        }
        .nv-composer:focus-within {
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.10), 0 4px 24px rgba(0, 0, 0, 0.12);
        }
        .dark .nv-composer:focus-within {
          border-color: rgba(255, 255, 255, 0.18);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15), 0 4px 24px rgba(0, 0, 0, 0.4);
        }
        .nv-composer--listening {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12), var(--nv-shadow-lg);
        }
        .nv-composer-plus-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.15);
          color: #6366f1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }
        .dark .nv-composer-plus-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.5);
        }
        .nv-composer-plus-btn:hover {
          background: rgba(99, 102, 241, 0.18);
          color: #4f46e5;
          border-color: rgba(99, 102, 241, 0.3);
        }
        .dark .nv-composer-plus-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.2);
        }
        .nv-voice-btn {
          position: relative;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(99, 102, 241, 0.08);
          border: none;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }
        .dark .nv-voice-btn {
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.6);
        }
        .nv-voice-btn:hover {
          background: rgba(99, 102, 241, 0.15);
          color: #4f46e5;
        }
        .dark .nv-voice-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
        }
        .nv-voice-btn--active {
          background: rgba(239, 68, 68, 0.1) !important;
          border-color: rgba(239, 68, 68, 0.3) !important;
          color: #ef4444 !important;
          animation: voicePulse 1.2s infinite;
        }
        
        /* Two-Way ChatGPT Headphones Button Style */
        .nv-headphones-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #06b6d4 100%);
          border: none;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.45);
          animation: headphoneGlow 3s ease-in-out infinite;
          position: relative;
          overflow: hidden;
        }
        .nv-headphones-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%);
          border-radius: 50%;
          pointer-events: none;
        }
        .nv-headphones-btn:hover {
          transform: scale(1.1) translateY(-1px);
          box-shadow: 0 8px 24px rgba(79, 70, 229, 0.6);
          animation: none;
        }
        .nv-headphones-btn:active {
          transform: scale(0.95);
        }
        .dark .nv-headphones-btn {
          box-shadow: 0 4px 18px rgba(99, 102, 241, 0.55);
        }
        @keyframes headphoneGlow {
          0%, 100% { box-shadow: 0 4px 14px rgba(79, 70, 229, 0.45); }
          50% { box-shadow: 0 6px 22px rgba(99, 102, 241, 0.7), 0 0 0 4px rgba(79, 70, 229, 0.12); }
        }

        @keyframes voicePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0); }
        }
        .nv-voice-ring {
          position: absolute;
          inset: -4px;
          border: 1.5px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          animation: ringGrow 1s infinite linear;
        }
        @keyframes ringGrow {
          from { transform: scale(1); opacity: 1; }
          to { transform: scale(1.4); opacity: 0; }
        }
        .nv-input-wrap {
          flex: 1;
          position: relative;
          overflow: hidden;
        }
        .nv-input {
          width: 100%;
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
          font-size: 13px !important;
          font-weight: 500;
          color: #1e293b;
          height: 36px;
          padding: 0 !important;
          outline: none;
        }
        .dark .nv-input {
          color: #ffffff;
        }
        .nv-input::placeholder {
          color: rgba(100, 116, 139, 0.7);
          opacity: 1;
        }
        .dark .nv-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
          opacity: 1;
        }
        .nv-listening-badge {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          font-size: 11px;
          font-weight: 700;
          color: #ef4444;
          pointer-events: none;
          animation: blink 1.2s infinite;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .nv-interim-text {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
          font-weight: 500;
          color: var(--muted-foreground);
          pointer-events: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        .nv-lang-picker-wrap {
          position: relative;
        }
        .nv-lang-picker-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          border-radius: 8px;
          background: var(--secondary);
          border: 1px solid var(--border);
          font-size: 10px;
          font-weight: 800;
          color: var(--nv-indigo);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .nv-lang-picker-btn:hover {
          background: var(--accent);
        }
        .nv-lang-dropdown {
          position: absolute;
          bottom: calc(100% + 8px);
          right: 0;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 6px;
          box-shadow: var(--nv-shadow-lg);
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          width: 170px;
          z-index: 25;
        }
        .nv-lang-option {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 10.5px;
          font-weight: 700;
          color: var(--muted-foreground);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .nv-lang-option:hover {
          background: var(--secondary);
          color: var(--foreground);
        }
        .nv-lang-option--active {
          background: rgba(79, 70, 229, 0.1) !important;
          color: var(--nv-indigo) !important;
        }
        .nv-send-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: transparent;
          border: 1.5px solid rgba(99, 102, 241, 0.35);
          color: rgba(99, 102, 241, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .dark .nv-send-btn {
          border: 1.5px solid rgba(129, 140, 248, 0.3);
          color: rgba(129, 140, 248, 0.5);
        }
        .nv-send-btn:not(:disabled) {
          background: linear-gradient(135deg, var(--nv-indigo), var(--nv-indigo-light));
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
        }
        .nv-send-btn:hover:not(:disabled) {
          transform: translateY(-1px) scale(1.06);
          box-shadow: 0 6px 18px rgba(79, 70, 229, 0.5);
        }
        .nv-send-btn:active:not(:disabled) {
          transform: scale(0.95);
        }
        .nv-send-btn:disabled {
          cursor: not-allowed;
          box-shadow: none;
        }
        .nv-send-btn:hover:disabled {
          border-color: rgba(99, 102, 241, 0.5);
          color: rgba(99, 102, 241, 0.7);
        }
        .nv-footer__note {
          font-size: 9px;
          color: var(--muted-foreground);
          text-align: center;
          margin-top: 6px;
          opacity: 0.7;
        }

        /* ── Right Collapsible Product Shelf (Catalog Shelf) ── */
        .nv-product-shelf {
          width: 420px;
          background: var(--card);
          border-left: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
          position: relative;
          z-index: 20;
          height: 100%;
        }
        .nv-product-shelf--closed {
          width: 0px;
          transform: translateX(420px);
          opacity: 0;
          border-left: none;
        }
        .nv-shelf-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px;
          border-bottom: 1px solid var(--border);
          background: var(--card);
          height: 52px;
          box-sizing: border-box;
        }
        .nv-shelf-header__left {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nv-shelf-header__title {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--foreground);
        }
        .nv-shelf-header__badge {
          font-size: 9px;
          font-weight: 800;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #10b981;
          padding: 2px 7px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
        }
        .nv-shelf-header__right {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nv-shelf-close-btn {
          background: transparent;
          border: none;
          color: var(--muted-foreground);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 5px;
          transition: all 0.2s ease;
        }
        .nv-shelf-close-btn:hover {
          background: var(--secondary);
          color: var(--foreground);
        }
        .nv-shelf-content {
          flex: 1;
          overflow-y: auto;
          height: 100%;
        }

        /* ── Mobile Drawer and triggers ── */
        .nv-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 40;
          display: flex;
        }
        @media(min-width: 1024px) {
          .nv-fab {
            display: none;
          }
        }
        .nv-fab__btn {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          background: linear-gradient(135deg, var(--nv-indigo) 0%, #7c3aed 50%, var(--nv-cyan) 100%);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(79, 70, 229, 0.45);
          border: none;
          transition: all 0.2s ease;
        }
        .nv-fab__btn:hover {
          transform: scale(1.06);
        }
        .nv-fab__badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: var(--nv-cyan);
          color: #0f172a;
          font-size: 8px;
          font-weight: 800;
          border-radius: var(--radius-full);
          padding: 2px 5px;
          border: 2px solid var(--nv-bg);
          text-transform: uppercase;
        }
        .nv-drawer-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(7, 9, 26, 0.65);
          backdrop-filter: blur(6px);
          z-index: 50;
          display: flex;
          align-items: flex-end;
        }
        @media(min-width: 1024px) {
          .nv-drawer-backdrop {
            display: none;
          }
        }
        .nv-drawer {
          width: 100%;
          background: var(--card);
          border-top: 1px solid var(--border);
          border-radius: 20px 20px 0 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 85vh;
          box-shadow: 0 -12px 48px rgba(0, 0, 0, 0.15);
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .nv-drawer__handle {
          width: 36px;
          height: 4px;
          background: var(--border);
          border-radius: var(--radius-full);
          margin: 10px auto 0;
          flex-shrink: 0;
        }

        /* ── ChatGPT Two-Way Voice Loop Overlay Panel ── */
        .nv-voice-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at center, rgba(13, 16, 39, 0.97) 0%, rgba(7, 9, 26, 0.99) 100%);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          color: #fff;
          animation: fadeIn 0.3s ease-out forwards;
        }
        .nv-voice-orb-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          width: 260px;
          height: 260px;
          margin-bottom: 40px;
        }
        
        /* Glowing waves behind the voice conversation orb */
        .nv-voice-wave-ring {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid rgba(99, 102, 241, 0.15);
          animation: ringGrow 2.5s infinite linear;
          pointer-events: none;
        }
        .nv-voice-wave-ring:nth-child(1) { width: 160px; height: 160px; animation-delay: 0s; }
        .nv-voice-wave-ring:nth-child(2) { width: 210px; height: 210px; animation-delay: 0.8s; }
        .nv-voice-wave-ring:nth-child(3) { width: 260px; height: 260px; animation-delay: 1.6s; }

        /* The central pulsing orb */
        .nv-voice-orb {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--nv-indigo) 0%, #7c3aed 50%, var(--nv-cyan) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 40px rgba(99, 102, 241, 0.6);
          position: relative;
          z-index: 10;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        /* Pulse orb depending on loop state */
        .nv-voice-orb--listening {
          animation: orbPulseListening 1.6s infinite ease-in-out;
          box-shadow: 0 0 40px rgba(16, 185, 129, 0.5);
          background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
        }
        .nv-voice-orb--thinking {
          animation: orbSpinThinking 1.4s infinite linear;
          box-shadow: 0 0 40px rgba(124, 58, 237, 0.6);
        }
        .nv-voice-orb--speaking {
          animation: orbPulseSpeaking 1.1s infinite ease-in-out;
          box-shadow: 0 0 50px rgba(244, 114, 182, 0.6);
          background: linear-gradient(135deg, #7c3aed 0%, #f472b6 100%);
        }
        
        @keyframes orbPulseListening {
          0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(16, 185, 129, 0.4); }
          50% { transform: scale(1.08); box-shadow: 0 0 50px rgba(16, 185, 129, 0.7); }
        }
        @keyframes orbSpinThinking {
          to { transform: rotate(360deg); }
        }
        @keyframes orbPulseSpeaking {
          0%, 100% { transform: scale(1) translateY(0); box-shadow: 0 0 30px rgba(244, 114, 182, 0.4); }
          50% { transform: scale(1.12) translateY(-4px); box-shadow: 0 0 60px rgba(244, 114, 182, 0.8); }
        }

        .nv-voice-conv-status {
          font-size: 10px;
          font-weight: 800;
          color: var(--nv-cyan);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 12px;
        }
        .nv-voice-conv-status--listening { color: #34d399; }
        .nv-voice-conv-status--thinking { color: #a78bfa; }
        .nv-voice-conv-status--speaking { color: #f472b6; }

        .nv-voice-conv-text {
          font-size: 16px;
          font-weight: 500;
          color: #f1f5f9;
          text-align: center;
          line-height: 1.6;
          max-width: 440px;
          min-height: 54px;
          padding: 0 20px;
          margin-bottom: 60px;
          word-break: break-word;
        }
        
        .nv-voice-conv-text--thinking {
          opacity: 0.65;
          font-style: italic;
        }

        .nv-voice-conv-close-btn {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #ef4444;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
        }
        .nv-voice-conv-close-btn:hover {
          background: #dc2626;
          transform: scale(1.08);
          box-shadow: 0 8px 24px rgba(239, 68, 68, 0.5);
        }
        .nv-voice-conv-close-btn:active {
          transform: scale(0.95);
        }

        /* Responsive displays */
        @media(max-width: 1023px) {
          .nv-sidebar {
            display: none;
          }
          .nv-chat-console {
            display: none;
          }
          .nv-product-shelf {
            width: 100% !important;
            border-left: none;
          }
        }
      `}</style>

      <div className="nv-root">
        {/* ── Left Sidebar (Chat History, New Chat) ── */}
        <aside
          className={`nv-sidebar ${sidebarCollapsed ? "nv-sidebar--collapsed" : ""}`}
          role="complementary"
          aria-label="Conversation History"
        >
          {renderSidebar()}
        </aside>

        {/* ── Center Chat Console (Wide ChatGPT/Gemini Stream) ── */}
        <section
          className={`nv-chat-console ${sidebarCollapsed ? "nv-chat-console--sidebar-collapsed" : ""} ${!showShelf ? "nv-chat-console--shelf-collapsed" : ""}`}
          role="main"
          aria-label="Nuvix AI Conversation Console"
        >
          {/* Header */}
          <div className="nv-chat-console-header">
            <div className="nv-chat-header-left">
              <button
                onClick={toggleSidebar}
                className="nv-sidebar-toggle-btn"
                title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {sidebarCollapsed ? (
                  <PanelLeft size={16} />
                ) : (
                  <PanelLeftClose size={16} />
                )}
              </button>
              <div className="nv-chat-header-title">
                {activeThread?.title || "New Shopping Chat"}
              </div>
            </div>

            <div className="nv-chat-header-right">
              {/* Reset Thread Action */}
              <button
                onClick={() => clearMessages(userKey)}
                className="nv-header-action-btn"
                title="Clear active thread messages"
              >
                <Plus size={16} />
              </button>

              {/* Product Shelf Toggle Button with animated badge indicator */}
              <button
                onClick={() => setShowShelf((prev) => !prev)}
                className={`nv-header-action-btn`}
                title={showShelf ? "Hide Catalog" : "View Catalog"}
              >
                {showShelf ? (
                  <PanelRightClose size={16} />
                ) : (
                  <PanelRight size={16} />
                )}
                {activeThread?.products && activeThread.products.length > 0 && (
                  <span className="nv-header-action-badge animate-pulse">
                    {activeThread.products.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Conversation Path */}
          <div className="nv-chat-container-wrap">
            {isNewChat ? (
              <div className="nv-welcome-screen">
                <div className="nv-welcome-screen__glow-orb" />
                <div className="nv-welcome-screen__header animate-fade-down">
                  <div className="nv-welcome-screen__logo glow-brand" style={{ width: 72, height: 72, borderRadius: 22, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(6,182,212,0.08) 100%)", border: "1.5px solid rgba(99,102,241,0.2)", boxShadow: "0 12px 40px rgba(79,70,229,0.25)" }}>
                    <NuvixLogo size={48} glow={true} />
                  </div>
                  <h2 className="nv-welcome-screen__title">
                    Where style meets{" "}
                    <span className="gradient-brand-text font-black">
                      conversational commerce.
                    </span>
                  </h2>
                  <p className="nv-welcome-screen__subtitle">
                    I'm Nuvix AI, your intelligent shopping companion. Describe
                    what you're looking for, compare options, and manage your
                    cart dynamically.
                  </p>
                </div>

                <div className="nv-welcome-screen__cards animate-fade-up">
                  {SUGGESTION_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip.query)}
                      className="nv-welcome-card surface surface-hover"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="nv-welcome-card__icon">{chip.icon}</div>
                      <div className="nv-welcome-card__content">
                        <h4 className="nv-welcome-card__title">{chip.text}</h4>
                        <p className="nv-welcome-card__desc">
                          Search "{chip.query}"
                        </p>
                      </div>
                      <ChevronRight
                        size={13}
                        className="nv-welcome-card__arrow"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div
                ref={chatContainerRef}
                className="nv-chat-messages-container"
                role="log"
                aria-live="polite"
              >
                {messages.map((msg: Message, i: number) => (
                  <MessageBubble
                    key={i}
                    message={msg}
                    index={i}
                    isCopied={copiedIndex === i}
                    onCopy={handleCopy}
                    onSpeak={(text, lang) => speakMessage(text, lang, i)}
                    isSpeaking={speakingIndex === i}
                    loading={i === messages.length - 1 && isThinking}
                    onAddToCart={addToCart}
                  />
                ))}
                {isThinking && (
                  <div className="nv-msg-row nv-msg-row--ai animate-slide-left">
                    <div className="nv-msg-avatar nv-msg-avatar--ai glow-brand">
                      <div className="nv-brand-icon nv-brand-icon--sm">
                        <Sparkles size={11} className="text-white" />
                      </div>
                    </div>
                    <div className="nv-msg-bubble nv-msg-bubble--ai nv-msg-bubble--thinking">
                      <TypingDots />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Floating Composer Area */}
          <div className="nv-chat-input-container">
            <div className="nv-composer-wrapper">
              <div
                className={`nv-composer ${isListening ? "nv-composer--listening" : ""}`}
              >
                {/* + New Chat button */}
                <button
                  onClick={handleNewChat}
                  className="nv-composer-plus-btn"
                  title="New conversation"
                >
                  <Plus size={16} />
                </button>

                <div className="nv-input-wrap">
                  {isListening && transcript && (
                    <span className="nv-interim-text">{transcript}</span>
                  )}
                  {isListening && !transcript && (
                    <span className="nv-listening-badge">Listening…</span>
                  )}
                  {processingVoice && (
                    <span className="nv-listening-badge">
                      <Loader2 size={12} className="nv-spin-icon" /> Processing…
                    </span>
                  )}
                  <input
                    ref={inputRef}
                    type="text"
                    className="nv-input animate-fade-in"
                    placeholder={isListening ? "" : "Ask anything"}
                    value={isListening ? "" : inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={isThinking || isListening}
                    aria-label="Chat input"
                  />
                </div>


                {ttsSupported && voiceSupported && (
                  <button
                    onClick={startVoiceConversation}
                    className="nv-headphones-btn"
                    title="Start hands-free voice companion"
                  >
                    <Headphones size={15} />
                  </button>
                )}

                <button
                  className="nv-send-btn"
                  onClick={() => handleSendMessage()}
                  disabled={(!inputValue.trim() && !transcript) || isThinking}
                  aria-label="Send message"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
            <p className="nv-footer__note">
              Nuvix AI can make mistakes. Verify important information.
            </p>
          </div>
        </section>

        {/* ── Right Collapsible Product Shelf (Catalog Shelf) ── */}
        <div
          className={`nv-product-shelf ${showShelf ? "nv-product-shelf--open" : "nv-product-shelf--closed"}`}
        >
          <div className="nv-shelf-header">
            <div className="nv-shelf-header__left">
              <ShoppingBag size={14} className="text-indigo-500" />
              <span className="nv-shelf-header__title">Companion Catalog</span>
            </div>
            <div className="nv-shelf-header__right">
              <span className="nv-shelf-header__badge">
                {activeThread?.products?.length || 0} products found
              </span>
              <button
                onClick={() => setShowShelf(false)}
                className="nv-shelf-close-btn"
                title="Collapse Catalog"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="nv-shelf-content" id="main-content">
            {children}
          </div>
        </div>

        {/* FAB trigger for mobile drawers */}
        <div className="nv-fab">
          <button
            className="nv-fab__btn"
            onClick={() => setIsMobileChatOpen(true)}
            aria-label="Open AI assistant"
          >
            <MessageCircle size={22} />
            <span className="nv-fab__badge">AI</span>
          </button>
        </div>

        {/* Mobile slide drawer */}
        {isMobileChatOpen && (
          <div
            className="nv-drawer-backdrop"
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsMobileChatOpen(false);
            }}
          >
            <div className="nv-drawer">
              <div className="nv-drawer__handle" />

              <div
                className="nv-chat-console-header"
                style={{
                  borderTopLeftRadius: "20px",
                  borderTopRightRadius: "20px",
                }}
              >
                <div className="nv-chat-header-left">
                  <div className="nv-chat-header-title">
                    {activeThread?.title || "Mobile Chat"}
                  </div>
                </div>
                <div className="nv-chat-header-right">
                  <button
                    onClick={() => clearMessages(userKey)}
                    className="nv-header-action-btn"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    className="nv-shelf-close-btn"
                    onClick={() => setIsMobileChatOpen(false)}
                    aria-label="Close chat"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="nv-chat-container-wrap">
                {isNewChat ? (
                  <div
                    className="nv-welcome-screen"
                    style={{ padding: "20px 14px" }}
                  >
                    <h2
                      className="nv-welcome-screen__title"
                      style={{ fontSize: "18px" }}
                    >
                      Nuvix AI{" "}
                      <span className="gradient-brand-text font-black">
                        Shopping Assistant
                      </span>
                    </h2>
                    <p className="nv-welcome-screen__subtitle">
                      Describe what you're looking for, compare options, and
                      manage your cart dynamically.
                    </p>
                    <div
                      className="nv-welcome-screen__cards"
                      style={{ width: "100%" }}
                    >
                      {SUGGESTION_CHIPS.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            handleSendMessage(chip.query);
                            setIsMobileChatOpen(true);
                          }}
                          className="nv-welcome-card surface"
                          style={{ padding: "10px 12px" }}
                        >
                          <span className="nv-welcome-card__icon">
                            {chip.icon}
                          </span>
                          <span
                            className="nv-welcome-card__title"
                            style={{ fontSize: "10px" }}
                          >
                            {chip.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    className="nv-chat-messages-container"
                    style={{ padding: "14px 10px 100px" }}
                  >
                    {messages.map((msg: Message, i: number) => (
                      <MessageBubble
                        key={i}
                        message={msg}
                        index={i}
                        isCopied={copiedIndex === i}
                        onCopy={handleCopy}
                        onSpeak={(text, lang) => speakMessage(text, lang, i)}
                        isSpeaking={speakingIndex === i}
                        loading={i === messages.length - 1 && isThinking}
                        onAddToCart={addToCart}
                      />
                    ))}
                    {isThinking && (
                      <div className="nv-msg-row nv-msg-row--ai">
                        <div className="nv-msg-avatar nv-msg-avatar--ai glow-brand">
                          <div className="nv-brand-icon nv-brand-icon--sm">
                            <Sparkles size={11} className="text-white" />
                          </div>
                        </div>
                        <div className="nv-msg-bubble nv-msg-bubble--ai nv-msg-bubble--thinking">
                          <TypingDots />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div
                className="nv-chat-input-container"
                style={{ padding: "10px 12px 16px", position: "relative" }}
              >
                <div className="nv-composer-wrapper">
                  <div
                    className={`nv-composer ${isListening ? "nv-composer--listening" : ""}`}
                  >
                    <div className="nv-input-wrap">
                      <input
                        ref={inputRef}
                        type="text"
                        className="nv-input"
                        placeholder="Ask in any language…"
                        value={isListening ? "" : inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                        disabled={isThinking || isListening}
                      />
                    </div>
                    <button
                      className="nv-send-btn"
                      onClick={() => handleSendMessage()}
                      disabled={!inputValue.trim() || isThinking}
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── ChatGPT-style Immersive Hands-free Two-Way Voice Loop Overlay ── */}
      {isVoiceConvOpen && (
        <div className="nv-voice-overlay">
          <div className="nv-voice-orb-wrapper">
            {/* Ambient waves */}
            <div className="nv-voice-wave-ring animate-pulse-soft" />
            <div
              className="nv-voice-wave-ring animate-pulse-soft"
              style={{ animationDelay: "0.8s" }}
            />
            <div
              className="nv-voice-wave-ring animate-pulse-soft"
              style={{ animationDelay: "1.6s" }}
            />

            {/* Glowing Orb */}
            <div
              className={`nv-voice-orb nv-voice-orb--${voiceConvState}`}
              onClick={() => {
                if (voiceConvState === "listening") {
                  setVoiceConvState("paused");
                  stopSpeaking();
                  if (recognitionRef.current) recognitionRef.current.stop();
                } else if (voiceConvState === "paused") {
                  setVoiceConvState("listening");
                  triggerVoiceConvListen();
                }
              }}
            >
              {voiceConvState === "listening" && (
                <Mic2 size={24} className="text-white" />
              )}
              {voiceConvState === "thinking" && (
                <Loader2 size={24} className="text-white animate-spin" />
              )}
              {voiceConvState === "speaking" && (
                <Volume2 size={24} className="text-white animate-pulse-beat" />
              )}
              {voiceConvState === "paused" && (
                <VolumeX size={24} className="text-white" />
              )}
            </div>
          </div>

          {/* Dynamic state tag */}
          <div
            className={`nv-voice-conv-status nv-voice-conv-status--${voiceConvState}`}
          >
            {voiceConvState === "listening" && "Listening..."}
            {voiceConvState === "thinking" && "Thinking..."}
            {voiceConvState === "speaking" && "Speaking..."}
            {voiceConvState === "paused" && "Voice Session Paused"}
          </div>

          {/* Dynamic real-time subtitle block */}
          <p
            className={`nv-voice-conv-text ${voiceConvState === "thinking" ? "nv-voice-conv-text--thinking" : ""}`}
          >
            {voiceConvTranscript ||
              (voiceConvState === "listening" ? "Say something..." : "")}
          </p>

          {/* Call hang-up control */}
          <button
            onClick={endVoiceConversation}
            className="nv-voice-conv-close-btn animate-fade-up"
            title="End Hands-Free Voice Session"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </>
  );
}
