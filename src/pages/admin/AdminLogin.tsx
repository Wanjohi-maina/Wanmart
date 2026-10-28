import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: string } | null)?.from ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [idleNotice] = useState(
    () => sessionStorage.getItem("admin_idle_signout") === "1",
  );

  useEffect(() => {
    sessionStorage.removeItem("admin_idle_signout");
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setSubmitting(false);

    if (signInError) {
      // Keep the message vague so it does not reveal which part was wrong.
      setError("Invalid email or password.");
      return;
    }

    navigate(from, { replace: true });
  }

  const inputClassName =
    "w-full rounded-lg border border-gray-300 px-3 py-3 text-base outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100";

  return (
    <div className="min-h-screen bg-gray-50 flex items-start sm:items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="rounded-lg bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-semibold text-gray-900">Admin login</h1>
          <p className="mt-1 mb-6 text-sm text-gray-500">
            Sign in to manage orders and products.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="email"
                className={inputClassName}
                disabled={submitting}
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className={`${inputClassName} pr-16`}
                  disabled={submitting}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((shown) => !shown)}
                  className="absolute inset-y-0 right-0 px-4 text-sm text-gray-500 hover:text-orange-600"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            
            {idleNotice && (
              <div
                className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                role="status"
              >
                You were signed out because of inactivity.
              </div>
            )}

            {error && (
              <div
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || email.trim() === "" || password === ""}
              className="w-full rounded-full bg-orange-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <Link
          to="/"
          className="mt-4 block text-center text-sm text-gray-500 hover:text-orange-600"
        >
          ← Back to store
        </Link>
      </div>
    </div>
  );
}