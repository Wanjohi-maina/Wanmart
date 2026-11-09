import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import MfaChallenge from "./MfaChallenge";
import MfaEnroll from "./MfaEnroll";

type Status =
  | "checking"
  | "admin"
  | "anonymous"
  | "forbidden"
  | "needsEnroll"
  | "needsVerify";

export default function RequireAdmin() {
  const [status, setStatus] = useState<Status>("checking");
  const location = useLocation();
  const latest = useRef(0);

  const check = useCallback(async () => {
    // Ignore the result of an older check if a newer one has started.
    const run = ++latest.current;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (run !== latest.current) return;

    if (!session) {
      setStatus("anonymous");
      return;
    }

    // Membership only. The second factor is checked separately below.
    const { data: isMember, error } = await supabase.rpc("is_admin_member");

    if (run !== latest.current) return;

    if (error || isMember !== true) {
      setStatus("forbidden");
      return;
    }

    const { data: aal, error: aalError } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (run !== latest.current) return;

    if (aalError || !aal) {
      setStatus("forbidden");
      return;
    }

    if (aal.currentLevel === "aal2") setStatus("admin");
    else if (aal.nextLevel === "aal2") setStatus("needsVerify");
    else setStatus("needsEnroll");
  }, []);

  useEffect(() => {
    check();

    // Re-check on sign in, sign out and token refresh. The check is deferred
    // because calling Supabase inside this callback can deadlock.
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      setTimeout(check, 0);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [check]);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-orange-600"></div>
      </div>
    );
  }

  if (status === "anonymous") {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (status === "needsEnroll") return <MfaEnroll onEnrolled={check} />;
  if (status === "needsVerify") return <MfaChallenge onVerified={check} />;

  if (status === "forbidden") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-start sm:items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-sm sm:p-8">
          <h1 className="text-xl font-semibold text-gray-900">
            Not authorised
          </h1>
          <p className="mt-2 mb-6 text-sm text-gray-500">
            This account does not have admin access.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full rounded-full bg-orange-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-orange-700"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}