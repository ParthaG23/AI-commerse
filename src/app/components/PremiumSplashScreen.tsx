"use client";

import { useState, useEffect, useRef } from "react";
import NuvixLogo from "./NuvixLogo";

// ─── Particle System ───────────────────────────────────────────────────────────
interface Particle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  opacity: number;
  pulse: number;
  pulseSpeed: number;
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const PARTICLE_COUNT = 55;
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      opacity: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.015 + 0.005,
    }));

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(165,180,252,${alpha})`;
        ctx.fill();
      });

      // draw connection lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${0.08 * (1 - dist / 90)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (animRef.current !== null) {
        cancelAnimationFrame(animRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}



// ─── Animated Ring ─────────────────────────────────────────────────────────────
interface SpinRingProps {
  size?: number;
  phase?: number;
  speed?: number;
  color?: string;
}

function SpinRing({ size = 120, phase = 0, speed = 12, color = "rgba(99,102,241,0.35)" }: SpinRingProps) {
  const id = `ring-${phase}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        animation: `spin${phase % 2 === 0 ? "CW" : "CCW"} ${speed}s linear infinite`,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="40%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 2}
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="1"
        strokeDasharray={`${Math.PI * (size - 4) * 0.35} ${Math.PI * (size - 4) * 0.65}`}
      />
    </svg>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function PremiumSplashScreen() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState("idle"); // idle | loading | done | hidden
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing...");

  const STATUS_STEPS = [
    { at: 0,  text: "Initializing core engine..." },
    { at: 20, text: "Loading AI models..." },
    { at: 45, text: "Calibrating recommendations..." },
    { at: 70, text: "Syncing product catalog..." },
    { at: 88, text: "Almost ready..." },
    { at: 97, text: "Launching Nuvix..." },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const seen = sessionStorage.getItem("nuvix_splash_v2");
    const isDev = process.env.NODE_ENV === "development";
    if (seen === "true" && !isDev) {
      setPhase("hidden");
      return;
    }

    // All refs live outside the setTimeout so cleanup can reach them
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let finishTimeout1: ReturnType<typeof setTimeout> | null = null;
    let finishTimeout2: ReturnType<typeof setTimeout> | null = null;

    const DURATION     = 3600; // 3.6 seconds — responsive, premium unhurried duration
    const INTERVAL     = 16;   // ~60fps tick
    const TOTAL_STEPS  = Math.floor(DURATION / INTERVAL);
    let currentStep    = 0;

    // Short lead-in pause so entry animations land before bar starts moving
    const startDelay = setTimeout(() => {
      setPhase("loading");

      intervalId = setInterval(() => {
        currentStep++;

        // Ease-in-out quad: fast start, decelerates smoothly into 100%
        const t      = currentStep / TOTAL_STEPS;
        const eased  = t < 0.5
          ? 2 * t * t
          : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const p = Math.min(Math.round(eased * 100), 100);

        setProgress(p);

        // Swap status label at defined thresholds
        const match = [...STATUS_STEPS].reverse().find((s) => p >= s.at);
        if (match) setStatusText(match.text);

        if (currentStep >= TOTAL_STEPS) {
          if (intervalId) clearInterval(intervalId);
          intervalId = null;

          // Hold at 100% briefly, then fade out
          finishTimeout1 = setTimeout(() => {
            setPhase("done");

            finishTimeout2 = setTimeout(() => {
              setPhase("hidden");
              sessionStorage.setItem("nuvix_splash_v2", "true");
            }, 800); // fade-out CSS transition duration
          }, 600); // linger at 100% for 600ms
        }
      }, INTERVAL);
    }, 300);

    // Cleanup — runs on unmount or double-invocation in StrictMode
    return () => {
      clearTimeout(startDelay);
      if (intervalId)     clearInterval(intervalId);
      if (finishTimeout1) clearTimeout(finishTimeout1);
      if (finishTimeout2) clearTimeout(finishTimeout2);
    };
  }, [mounted]);

  if (!mounted || phase === "hidden") return null;

  const isOut = phase === "done";

  return (
    <>
      {/* ── Keyframe Injection ─────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Space+Grotesk:wght@600;700&display=swap');

        @keyframes spinCW  { from { transform: translate(-50%,-50%) rotate(0deg);   } to { transform: translate(-50%,-50%) rotate(360deg);  } }
        @keyframes spinCCW { from { transform: translate(-50%,-50%) rotate(0deg);   } to { transform: translate(-50%,-50%) rotate(-360deg); } }
        @keyframes floatUp  { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        @keyframes breatheGlow {
          0%,100% { box-shadow: 0 0 30px rgba(99,102,241,0.3), 0 0 60px rgba(99,102,241,0.12), 0 0 0 1px rgba(99,102,241,0.2); }
          50%      { box-shadow: 0 0 50px rgba(99,102,241,0.5), 0 0 90px rgba(168,85,247,0.2),  0 0 0 1px rgba(168,85,247,0.35); }
        }
        @keyframes logoEnter {
          0%   { opacity:0; transform: scale(0.6) translateY(20px); }
          70%  { transform: scale(1.06) translateY(-3px); }
          100% { opacity:1; transform: scale(1) translateY(0); }
        }
        @keyframes textEnter {
          from { opacity:0; transform: translateY(16px) skewY(1.5deg); }
          to   { opacity:1; transform: translateY(0)    skewY(0deg); }
        }
        @keyframes barGlow {
          0%,100% { box-shadow: 0 0 8px rgba(99,102,241,0.4); }
          50%      { box-shadow: 0 0 18px rgba(168,85,247,0.7); }
        }
        @keyframes statusBlink {
          0%,100% { opacity: 0.55; }
          50%      { opacity: 1; }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
        @keyframes aura1Drift {
          0%,100% { transform: translate(0,0) scale(1); }
          33%     { transform: translate(30px,-20px) scale(1.08); }
          66%     { transform: translate(-20px,30px) scale(0.95); }
        }
        @keyframes aura2Drift {
          0%,100% { transform: translate(0,0) scale(1); }
          40%     { transform: translate(-25px,20px) scale(1.1); }
          80%     { transform: translate(20px,-15px) scale(0.93); }
        }
        @keyframes cornerPulse {
          0%,100% { opacity: 0.35; }
          50%      { opacity: 0.75; }
        }

        .nuvix-splash-root {
          font-family: 'DM Sans', sans-serif;
        }
        .nuvix-status-text {
          animation: statusBlink 2s ease-in-out infinite;
        }
        .nuvix-logo-wrap {
          animation: floatUp 5s ease-in-out infinite 1s;
        }
      `}</style>

      {/* ── Root overlay ───────────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Loading Nuvix"
        className="nuvix-splash-root"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          background: "#05070f",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          transition: isOut
            ? "opacity 0.75s cubic-bezier(0.4,0,1,1), transform 0.75s cubic-bezier(0.4,0,1,1)"
            : "none",
          opacity: isOut ? 0 : 1,
          transform: isOut ? "scale(1.04)" : "scale(1)",
        }}
      >
        {/* ── Particle canvas ──────────────────────────────────────────────── */}
        <ParticleCanvas />

        {/* ── Ambient auras ────────────────────────────────────────────────── */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden",
        }}>
          {/* top-left indigo */}
          <div style={{
            position: "absolute", width: 520, height: 520,
            borderRadius: "50%", top: "-180px", left: "-180px",
            background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)",
            filter: "blur(60px)",
            animation: "aura1Drift 12s ease-in-out infinite",
          }} />
          {/* bottom-right cyan */}
          <div style={{
            position: "absolute", width: 440, height: 440,
            borderRadius: "50%", bottom: "-160px", right: "-160px",
            background: "radial-gradient(circle, rgba(34,211,238,0.13) 0%, transparent 65%)",
            filter: "blur(60px)",
            animation: "aura2Drift 14s ease-in-out infinite 2s",
          }} />
          {/* center purple */}
          <div style={{
            position: "absolute", width: 300, height: 300,
            borderRadius: "50%", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)",
            filter: "blur(50px)",
          }} />
        </div>

        {/* ── Grid overlay ─────────────────────────────────────────────────── */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
          `,
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 100%)",
        }} />

        {/* ── Scanline sweep ───────────────────────────────────────────────── */}
        <div style={{
          position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none",
        }}>
          <div style={{
            position: "absolute", left: 0, right: 0, height: "25%",
            background: "linear-gradient(to bottom, transparent, rgba(99,102,241,0.04), transparent)",
            animation: "scanline 5s linear infinite",
          }} />
        </div>

        {/* ── Corner decorations ───────────────────────────────────────────── */}
        {[
          { top: 20, left: 20, borderTop: "1px solid", borderLeft: "1px solid" },
          { top: 20, right: 20, borderTop: "1px solid", borderRight: "1px solid" },
          { bottom: 20, left: 20, borderBottom: "1px solid", borderLeft: "1px solid" },
          { bottom: 20, right: 20, borderBottom: "1px solid", borderRight: "1px solid" },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute", width: 22, height: 22,
              borderColor: "rgba(99,102,241,0.45)",
              animation: `cornerPulse ${2 + i * 0.4}s ease-in-out infinite ${i * 0.3}s`,
              ...pos,
            }}
          />
        ))}

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <div style={{
          position: "relative", zIndex: 10,
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 0,
        }}>

          {/* Logo assembly */}
          <div className="nuvix-logo-wrap" style={{ position: "relative" }}>

            {/* Spinning rings */}
            <SpinRing size={148} phase={0} speed={14} color="rgba(99,102,241,0.3)" />
            <SpinRing size={120} phase={1} speed={9}  color="rgba(168,85,247,0.25)" />
            <SpinRing size={96}  phase={0} speed={18} color="rgba(34,211,238,0.2)" />

            {/* Logo card */}
            <div style={{
              width: 88, height: 88,
              borderRadius: 24,
              background: "linear-gradient(135deg, #6366f1, #a855f7 50%, #22d3ee)",
              padding: "1.5px",
              animation: "breatheGlow 4s ease-in-out infinite, logoEnter 0.8s cubic-bezier(0.16,1,0.3,1) both",
              position: "relative",
            }}>
              {/* inner refraction sheen */}
              <div style={{
                position: "absolute", inset: 0, borderRadius: 24,
                background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)",
                zIndex: 2, pointerEvents: "none",
              }} />
              <div style={{
                width: "100%", height: "100%",
                borderRadius: 22.5,
                background: "linear-gradient(160deg, #0e1230 0%, #080c1e 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", overflow: "hidden",
              }}>
                {/* inner glow */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "radial-gradient(circle at 35% 35%, rgba(99,102,241,0.25) 0%, transparent 65%)",
                }} />
                <NuvixLogo size={50} />
              </div>
            </div>
          </div>

          {/* Brand name */}
          <h1 style={{
            marginTop: 32,
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: "0.24em",
            background: "linear-gradient(90deg, #e0e7ff 0%, #f5f3ff 45%, #cffafe 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            margin: "32px 0 0",
            animation: "textEnter 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both",
          }}>
            NUVIX
          </h1>

          {/* Tagline */}
          <p style={{
            marginTop: 10,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.38em",
            color: "rgba(103,232,249,0.85)",
            textTransform: "uppercase",
            animation: "textEnter 0.6s cubic-bezier(0.16,1,0.3,1) 0.35s both",
          }}>
            AI-Powered Co-Shopping
          </p>

          {/* Divider */}
          <div style={{
            marginTop: 32,
            width: 40, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)",
            animation: "textEnter 0.6s cubic-bezier(0.16,1,0.3,1) 0.45s both",
          }} />

          {/* Progress section */}
          <div style={{
            marginTop: 28,
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 0,
            animation: "textEnter 0.6s cubic-bezier(0.16,1,0.3,1) 0.5s both",
          }}>
            {/* Status text */}
            <p
              className="nuvix-status-text"
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.08em",
                color: "rgba(165,180,252,0.65)",
                marginBottom: 14,
                height: 16,
                textAlign: "center",
                minWidth: 220,
              }}
            >
              {statusText}
            </p>

            {/* Track */}
            <div style={{
              width: 220,
              height: 2,
              background: "rgba(255,255,255,0.05)",
              borderRadius: 99,
              overflow: "visible",
              position: "relative",
              border: "0.5px solid rgba(255,255,255,0.06)",
            }}>
              {/* Fill */}
              <div style={{
                height: "100%",
                borderRadius: 99,
                background: "linear-gradient(90deg, #6366f1, #a855f7, #22d3ee)",
                width: `${progress}%`,
                transition: "width 0.05s linear",
                position: "relative",
                animation: "barGlow 2s ease-in-out infinite",
              }}>
                {/* glowing tip */}
                {progress > 2 && (
                  <div style={{
                    position: "absolute",
                    right: -3, top: "50%",
                    transform: "translateY(-50%)",
                    width: 7, height: 7,
                    borderRadius: "50%",
                    background: "#c4b5fd",
                    boxShadow: "0 0 10px #a855f7, 0 0 20px rgba(168,85,247,0.7)",
                  }} />
                )}
              </div>
            </div>

            {/* Percentage */}
            <div style={{
              marginTop: 14,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}>
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.1em",
                color: "rgba(165,180,252,0.45)",
                fontVariantNumeric: "tabular-nums",
                minWidth: 34,
                textAlign: "center",
              }}>
                {progress}%
              </span>

              {/* Step indicators */}
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                {[20, 50, 80, 100].map((threshold, i) => (
                  <div
                    key={i}
                    style={{
                      width: progress >= threshold ? 18 : 4,
                      height: 4,
                      borderRadius: 99,
                      background: progress >= threshold
                        ? "linear-gradient(90deg, #6366f1, #22d3ee)"
                        : "rgba(255,255,255,0.1)",
                      transition: "width 0.4s cubic-bezier(0.16,1,0.3,1), background 0.3s",
                      boxShadow: progress >= threshold
                        ? "0 0 6px rgba(99,102,241,0.5)"
                        : "none",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div style={{
          position: "absolute",
          bottom: 28,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <div style={{
              width: 4, height: 4, borderRadius: "50%",
              background: "#22d3ee",
              boxShadow: "0 0 6px #22d3ee",
              animation: "statusBlink 2s ease-in-out infinite",
            }} />
            <span style={{
              fontSize: 8.5,
              fontWeight: 600,
              letterSpacing: "0.22em",
              color: "rgba(255,255,255,0.18)",
              textTransform: "uppercase",
            }}>
              Intelligent Retail Interface
            </span>
          </div>
        </div>
      </div>
    </>
  );
}