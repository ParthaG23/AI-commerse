"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Check if already installed / running in standalone mode
    const checkStandalone = () => {
      const isStandalone = 
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone);
    };

    checkStandalone();

    // 2. Platform detection
    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(ios);

    // Safari check (excluding Chrome/Firefox/etc. on iOS)
    const safari = ios && /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|mercury/i.test(ua);
    setIsSafari(safari);

    // 3. Listen for Chrome/Android/Edge custom install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // Save event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 4. Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log("[PWA] Nuvix PWA installed successfully!");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const triggerInstall = async (): Promise<"accepted" | "dismissed" | "failed"> => {
    if (!deferredPrompt) {
      console.warn("[PWA] Installation prompt is not available.");
      return "failed";
    }

    try {
      // Trigger native browser prompt
      await deferredPrompt.prompt();
      
      // Wait for user choice
      const choiceResult = await deferredPrompt.userChoice;
      console.log(`[PWA] User response to install: ${choiceResult.outcome}`);
      
      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        return "accepted";
      } else {
        return "dismissed";
      }
    } catch (err) {
      console.error("[PWA] Failed to trigger install prompt:", err);
      return "failed";
    }
  };

  return {
    isInstallable,
    isInstalled,
    isIOS,
    isSafari,
    triggerInstall,
  };
}
