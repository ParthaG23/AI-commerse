"use client";

import { useEffect } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────
const SW_PATH    = "/sw.js";
const SW_SCOPE   = "/";
const LOG_PREFIX = "[PWA]";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function log(msg: string, ...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    console.log(`${LOG_PREFIX} ${msg}`, ...args);
  }
}

function warn(msg: string, ...args: unknown[]) {
  console.warn(`${LOG_PREFIX} ${msg}`, ...args);
}

function err(msg: string, error: unknown) {
  console.error(`${LOG_PREFIX} ${msg}`, error);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PwaManager() {
  useEffect(() => {
    // SSR / unsupported browser guard
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      warn("Service Worker not supported in this environment.");
      return;
    }

    // Skip registration in development — hot-reload and SW caching conflict.
    // Remove this guard only if you intentionally want to test SW behaviour in dev.
    if (process.env.NODE_ENV === "development") {
      log("Skipping SW registration in development mode.");
      return;
    }

    let swRegistration: ServiceWorkerRegistration | null = null;

    // ── Registration ──────────────────────────────────────────────────────────
    const registerSW = async () => {
      try {
        swRegistration = await navigator.serviceWorker.register(SW_PATH, {
          scope: SW_SCOPE,
          // "all" means the browser fetches a fresh sw.js on every navigation,
          // catching updates quickly without hammering the network on every fetch.
          updateViaCache: "none",
        });

        log("Registered. Scope:", swRegistration.scope);

        // ── Update detection ───────────────────────────────────────────────────
        // Fires when a new SW version has been found and is installing.
        swRegistration.addEventListener("updatefound", () => {
          const nextWorker = swRegistration!.installing;
          if (!nextWorker) return;

          log("New SW version installing…");

          nextWorker.addEventListener("statechange", () => {
            // A new SW is ready but waiting — the old one is still controlling the page.
            if (
              nextWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              log(
                "New SW installed and waiting. " +
                "Reload to activate, or dispatch SKIP_WAITING to force."
              );

              // Dispatch a custom event so the app UI can show an
              // "Update available — reload?" toast if desired.
              window.dispatchEvent(new CustomEvent("pwa:update-available"));
            }

            // First-time install — no previous controller, cache is freshly populated.
            if (
              nextWorker.state === "installed" &&
              !navigator.serviceWorker.controller
            ) {
              log("SW installed for the first time. Content cached for offline use.");
              window.dispatchEvent(new CustomEvent("pwa:installed"));
            }
          });
        });

        // ── Periodic update check ─────────────────────────────────────────────
        // The browser checks automatically on navigation, but this ensures
        // long-lived single-page sessions also pick up updates.
        const UPDATE_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
        const updateInterval = setInterval(async () => {
          if (!swRegistration) return;
          try {
            await swRegistration.update();
            log("Periodic SW update check completed.");
          } catch (e) {
            warn("Periodic SW update check failed:", e);
          }
        }, UPDATE_INTERVAL_MS);

        // Return cleanup — stored on the outer `cleanup` ref below.
        return () => clearInterval(updateInterval);

      } catch (error) {
        err("SW registration failed:", error);

        // Retry once after 10 s if offline at boot (common on flaky mobile networks).
        const retryDelay = 10_000;
        log(`Will retry SW registration in ${retryDelay / 1000}s…`);
        const retryTimer = setTimeout(async () => {
          try {
            await navigator.serviceWorker.register(SW_PATH, {
              scope: SW_SCOPE,
              updateViaCache: "none",
            });
            log("SW registered successfully on retry.");
          } catch (retryError) {
            err("SW registration failed on retry — giving up:", retryError);
          }
        }, retryDelay);

        return () => clearTimeout(retryTimer);
      }
    };

    // ── Controller change ─────────────────────────────────────────────────────
    // When a waiting SW activates (e.g. after SKIP_WAITING), force a reload
    // so the page is served by the new worker and avoids mixed-version caches.
    let reloadPending = false;
    const handleControllerChange = () => {
      if (reloadPending) return;
      reloadPending = true;
      log("SW controller changed — reloading page to activate new version.");
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    // ── Boot ──────────────────────────────────────────────────────────────────
    // Defer to after load so SW registration never delays first paint.
    let innerCleanup: (() => void) | undefined;

    const boot = () => {
      registerSW().then((cleanup) => {
        innerCleanup = cleanup;
      });
    };

    if (document.readyState === "complete") {
      boot();
    } else {
      window.addEventListener("load", boot, { once: true });
    }

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      window.removeEventListener("load", boot);
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      innerCleanup?.();
    };
  }, []);

  return null;
}