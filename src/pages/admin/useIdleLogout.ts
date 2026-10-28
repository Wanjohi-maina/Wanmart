import { useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

const IDLE_LIMIT_MS = 15 * 60 * 1000;
const ACTIVITY_KEY = "admin_last_activity";
const WRITE_EVERY_MS = 5000;
const EVENTS = ["pointerdown", "keydown", "scroll", "touchstart"] as const;

export function useIdleLogout(limitMs: number = IDLE_LIMIT_MS) {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let lastWrite = 0;

    function readLast(): number {
      const value = Number(localStorage.getItem(ACTIVITY_KEY));
      return Number.isFinite(value) && value > 0 ? value : Date.now();
    }

    function markActive() {
      const now = Date.now();
      if (now - lastWrite < WRITE_EVERY_MS) return;
      lastWrite = now;
      localStorage.setItem(ACTIVITY_KEY, String(now));
    }

    function signOutIdle() {
      sessionStorage.setItem("admin_idle_signout", "1");
      // "local" signs out this browser only, not the admin's other devices.
      supabase.auth.signOut({ scope: "local" });
    }

    function check() {
      if (timer) clearTimeout(timer);

      const idleFor = Date.now() - readLast();

      if (idleFor >= limitMs) {
        signOutIdle();
        return;
      }

      timer = setTimeout(check, limitMs - idleFor);
    }

    function handleVisible() {
      if (document.visibilityState === "visible") check();
    }

    // Opening the admin counts as activity.
    lastWrite = 0;
    markActive();
    check();

    EVENTS.forEach((name) =>
      window.addEventListener(name, markActive, { passive: true }),
    );
    document.addEventListener("visibilitychange", handleVisible);

    return () => {
      if (timer) clearTimeout(timer);
      EVENTS.forEach((name) => window.removeEventListener(name, markActive));
      document.removeEventListener("visibilitychange", handleVisible);
    };
  }, [limitMs]);
}