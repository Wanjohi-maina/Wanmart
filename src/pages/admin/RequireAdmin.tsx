import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

type Status = "checking" | "admin" | "anonymous" | "forbidden";

export default function RequireAdmin() {
  const [status, setStatus] = useState<Status>("checking");
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (!session) {
        setStatus("anonymous");
        return;
      }

      // The database decides who is an admin, not the browser.
      const { data, error } = await supabase.rpc("is_admin");

      if (cancelled) return;

      setStatus(!error && data === true ? "admin" : "forbidden");
    }

    check();

    // Re-check when the user signs in or out. The check is deferred
    // because calling Supabase inside this callback can deadlock.
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      setTimeout(check, 0);
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

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