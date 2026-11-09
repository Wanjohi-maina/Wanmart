import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { supabase } from "../../lib/supabaseClient";
import { ReviewCountContext, type ReviewCounts } from "./reviewCountContext";

const POLL_MS = 60_000;

export function ReviewCountProvider({ children }: { children: ReactNode }) {
  const [counts, setCounts] = useState<ReviewCounts | null>(null);
  const latest = useRef(0);

  const refresh = useCallback(async () => {
    // Ignore the result of an older request if a newer one has started.
    const run = ++latest.current;

    const { data, error } = await supabase.rpc("admin_review_count");

    if (run !== latest.current) return;
    if (error || !data) return;

    const result = data as unknown as {
      needs_decision: number;
      refund_pending: number;
      total: number;
    };

    setCounts({
      needsDecision: Number(result.needs_decision),
      refundPending: Number(result.refund_pending),
      total: Number(result.total),
    });
  }, []);

  useEffect(() => {
    refresh();

    const timer = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, POLL_MS);

    function handleVisible() {
      if (document.visibilityState === "visible") refresh();
    }

    document.addEventListener("visibilitychange", handleVisible);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisible);
    };
  }, [refresh]);

  return (
    <ReviewCountContext.Provider value={{ counts, refresh }}>
      {children}
    </ReviewCountContext.Provider>
  );
}