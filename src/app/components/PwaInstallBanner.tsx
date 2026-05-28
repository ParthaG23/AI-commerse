"use client";

import { useState, useEffect, useRef } from "react";
import { usePwaInstall } from "../hooks/usePwaInstall";
import NuvixLogo from "./NuvixLogo";

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

const IconShare = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15" />
  </svg>
);

const IconPlus = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const IconZap = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const IconWifi = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
  </svg>
);

const IconMaximize = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
  </svg>
);



// ─── Feature Pill ─────────────────────────────────────────────────────────────
interface FeaturePillProps {
  icon: React.ComponentType;
  label: string;
  color: string;
  delay: number;
}

function FeaturePill({ icon: Icon, label, color, delay }: FeaturePillProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        animation: `pwaFadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}ms both`,
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: 26,
          height: 26,
          borderRadius: 8,
          background: `${color}18`,
          border: `0.5px solid ${color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: color,
        }}
      >
        <Icon />
      </span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: "rgba(226,232,255,0.8)",
          letterSpacing: "0.01em",
          lineHeight: 1.4,
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Main Banner ──────────────────────────────────────────────────────────────
export default function PwaInstallBanner() {
  const { isInstallable, isInstalled, isIOS, isSafari, triggerInstall } = usePwaInstall();
  const [isVisible, setIsVisible] = useState(false);
  const [isOut, setIsOut]         = useState(false);
  const [isMobile, setIsMobile]   = useState(false);
  const [installing, setInstalling] = useState(false);

  // Detect viewport width
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = localStorage.getItem("nuvix_pwa_v2_dismissed") === "true";
    if (dismissed || isInstalled) return;
    const shouldShow = isInstallable || (isIOS && isSafari);
    if (!shouldShow) return;
    const t = setTimeout(() => setIsVisible(true), 6000);
    return () => clearTimeout(t);
  }, [isInstallable, isInstalled, isIOS, isSafari]);

  const dismiss = () => {
    setIsOut(true);
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem("nuvix_pwa_v2_dismissed", "true");
    }, 500);
  };

  const handleInstall = async () => {
    if (isIOS) return;
    setInstalling(true);
    const result = await triggerInstall();
    setInstalling(false);
    if (result === "accepted") {
      setIsOut(true);
      setTimeout(() => setIsVisible(false), 500);
    }
  };

  if (!isVisible) return null;

  // ── Positioning ─────────────────────────────────────────────────────────────
  const rootStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 9999,
    fontFamily: "'DM Sans', sans-serif",
    // Mobile: bottom drawer
    ...(isMobile
      ? {
          left: 0,
          right: 0,
          bottom: 0,
          transform: isOut
            ? "translateY(110%)"
            : "translateY(0)",
          transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.5s",
          opacity: isOut ? 0 : 1,
        }
      : {
          right: 24,
          bottom: 24,
          width: 380,
          transform: isOut
            ? "translateY(24px) scale(0.95)"
            : "translateY(0) scale(1)",
          opacity: isOut ? 0 : 1,
          transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.5s",
          animation: !isOut ? "pwaSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
        }),
  };

  const cardStyle: React.CSSProperties = {
    position: "relative",
    overflow: "hidden",
    background: "rgba(10,12,28,0.92)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "0.5px solid rgba(255,255,255,0.1)",
    boxShadow: isMobile
      ? "0 -12px 48px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(99,102,241,0.2)"
      : "0 20px 60px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(99,102,241,0.15)",
    borderRadius: isMobile ? "28px 28px 0 0" : 20,
    padding: isMobile ? "28px 24px 40px" : "22px 22px 24px",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Syne:wght@700;800&display=swap');

        @keyframes pwaSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes pwaFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pwaShimmer {
          0%   { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(300%)  skewX(-12deg); }
        }
        @keyframes pwaPulse {
          0%,100% { opacity: 0.6; transform: scale(1); }
          50%     { opacity: 1;   transform: scale(1.1); }
        }
        @keyframes pwaDrawerPeek {
          0%   { transform: translateY(110%); }
          100% { transform: translateY(0); }
        }

        .pwa-install-btn {
          position: relative;
          overflow: hidden;
          cursor: pointer;
          border: none;
          outline: none;
          flex: 1.6;
          padding: 14px 0;
          border-radius: 14px;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #22d3ee 100%);
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: #fff;
          text-transform: uppercase;
          box-shadow: 0 6px 24px rgba(99,102,241,0.4), 0 2px 8px rgba(0,0,0,0.3);
          transition: transform 0.15s, box-shadow 0.15s, filter 0.15s;
        }
        .pwa-install-btn:hover  { filter: brightness(1.12); transform: translateY(-1px); box-shadow: 0 10px 30px rgba(99,102,241,0.5); }
        .pwa-install-btn:active { transform: scale(0.97); }
        .pwa-install-btn::after {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 40%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          animation: pwaShimmer 3s ease-in-out infinite 1s;
        }

        .pwa-later-btn {
          cursor: pointer;
          border: 0.5px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          flex: 1;
          padding: 14px 0;
          border-radius: 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.5);
          transition: background 0.2s, color 0.2s, border-color 0.2s;
          outline: none;
        }
        .pwa-later-btn:hover  { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.75); border-color: rgba(255,255,255,0.2); }
        .pwa-later-btn:active { transform: scale(0.98); }

        .pwa-dismiss-btn {
          position: absolute;
          top: 16px; right: 16px;
          width: 28px; height: 28px;
          border-radius: 50%;
          border: 0.5px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.35);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
          outline: none;
        }
        .pwa-dismiss-btn:hover  { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.75); border-color: rgba(255,255,255,0.2); }
        .pwa-dismiss-btn:active { transform: scale(0.92); }

        .pwa-ios-step {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px 6px;
          border-radius: 7px;
          background: rgba(255,255,255,0.1);
          border: 0.5px solid rgba(255,255,255,0.15);
          vertical-align: middle;
          margin: 0 2px;
        }
      `}</style>

      <div style={rootStyle} role="complementary" aria-label="Install Nuvix App">
        {/* Mobile drag handle */}
        {isMobile && (
          <div style={{
            position: "absolute",
            top: 10, left: "50%",
            transform: "translateX(-50%)",
            width: 36, height: 4,
            borderRadius: 99,
            background: "rgba(255,255,255,0.15)",
          }} />
        )}

        <div style={cardStyle}>
          {/* Ambient auras */}
          <div style={{
            position: "absolute", top: "-40%", right: "-20%",
            width: 200, height: 200, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)",
            filter: "blur(30px)", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: "-40%", left: "-20%",
            width: 180, height: 180, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)",
            filter: "blur(30px)", pointerEvents: "none",
          }} />

          {/* Dismiss */}
          <button className="pwa-dismiss-btn" onClick={dismiss} aria-label="Dismiss">
            <IconX />
          </button>

          {/* Header row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              animation: "pwaFadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.05s both",
            }}
          >
            {/* Logo */}
            <div style={{
              flexShrink: 0,
              width: 56, height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #6366f1, #a855f7, #22d3ee)",
              padding: "1.5px",
              boxShadow: "0 6px 20px rgba(99,102,241,0.3)",
            }}>
              <div style={{
                width: "100%", height: "100%",
                borderRadius: 14.5,
                background: "linear-gradient(160deg, #0e1230, #080c1e)",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", inset: 0,
                  background: "radial-gradient(circle at 30% 30%, rgba(99,102,241,0.2) 0%, transparent 65%)",
                }} />
                <NuvixLogo size={32} glow={false} />
              </div>
            </div>

            {/* Title + description */}
            <div style={{ flex: 1, paddingRight: 28 }}>
              <h2 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: "0.03em",
                color: "#fff",
                margin: 0,
                lineHeight: 1.2,
              }}>
                Install Nuvix App
              </h2>
              <p style={{
                fontSize: 11.5,
                fontWeight: 400,
                color: "rgba(165,180,252,0.6)",
                margin: "5px 0 0",
                lineHeight: 1.5,
              }}>
                Faster speeds, price tracking & offline shopping.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div style={{
            margin: "16px 0",
            height: "0.5px",
            background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)",
            animation: "pwaFadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.15s both",
          }} />

          {/* Feature pills */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <FeaturePill icon={IconZap}      label="Installs in seconds — zero storage used"   color="#818cf8" delay={200} />
            <FeaturePill icon={IconWifi}     label="Browse recent deals & wishlist offline"      color="#22d3ee" delay={270} />
            <FeaturePill icon={IconMaximize} label="Full-screen immersive shopping shell"        color="#c084fc" delay={340} />
          </div>

          {/* CTA area */}
          <div style={{
            marginTop: 20,
            animation: "pwaFadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.4s both",
          }}>
            {!isIOS ? (
              /* Native install flow */
              <div style={{ display: "flex", gap: 10 }}>
                <button className="pwa-later-btn" onClick={dismiss}>
                  Later
                </button>
                <button
                  className="pwa-install-btn"
                  onClick={handleInstall}
                  disabled={installing}
                  aria-label="Install Nuvix now"
                >
                  {installing ? "Installing…" : "Install Now"}
                </button>
              </div>
            ) : (
              /* iOS Safari manual instructions */
              <div style={{
                padding: "14px 16px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.04)",
                border: "0.5px solid rgba(255,255,255,0.09)",
              }}>
                <p style={{
                  margin: 0,
                  fontSize: 12,
                  fontWeight: 500,
                  color: "rgba(226,232,255,0.75)",
                  lineHeight: 1.7,
                  textAlign: "center",
                }}>
                  Tap the{" "}
                  <span className="pwa-ios-step"><IconShare /></span>
                  {" "}Share button, then choose{" "}
                  <span style={{ color: "#67e8f9", fontWeight: 700 }}>"Add to Home Screen"</span>
                  {" "}<span className="pwa-ios-step"><IconPlus /></span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}