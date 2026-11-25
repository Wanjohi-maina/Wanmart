import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function AdminForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/admin/reset-password` },
    );

    setBusy(false);

    if (resetError) {
      setError(
        "We could not send the email right now. Please wait a few minutes and try again.",
      );
      return;
    }

    setSent(true);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start sm:items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="rounded-lg bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-semibold text-gray-900">
            Reset your password
          </h1>

          {sent ? (
            <div className="mt-4 space-y-3 text-sm text-gray-600" role="status">
              <p>
                If that email belongs to an admin account, we have sent a link
                to reset the password. It can take a few minutes, so check your
                spam folder too.
              </p>
              <p>
                You will also need your authenticator app to finish.
              </p>
            </div>
          ) : (
            <>
              <p className="mt-1 mb-6 text-sm text-gray-500">
                Enter your admin email and we will send you a reset link.
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
                    disabled={busy}
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 text-base outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100"
                  />
                </div>

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
                  disabled={busy || email.trim() === ""}
                  className="w-full rounded-full bg-orange-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? "Sending..." : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>

        <Link
          to="/admin/login"
          className="mt-4 block text-center text-sm text-gray-500 hover:text-orange-600"
        >
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}