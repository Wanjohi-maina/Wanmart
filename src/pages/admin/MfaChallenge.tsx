import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function MfaChallenge({
  onVerified,
}: {
  onVerified: () => void;
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const { data: factors, error: listError } =
      await supabase.auth.mfa.listFactors();
    const factor = factors?.totp?.[0];

    if (listError || !factor) {
      setBusy(false);
      setError("No authenticator is set up for this account.");
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: factor.id,
      code: code.trim(),
    });

    setBusy(false);

    if (verifyError) {
      setCode("");
      setError(
        "That code was not accepted. Codes change every 30 seconds, so wait for a fresh one and try again.",
      );
      return;
    }

    onVerified();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start sm:items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="rounded-lg bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-semibold text-gray-900">
            Two-factor sign-in
          </h1>
          <p className="mt-1 mb-6 text-sm text-gray-500">
            Enter the 6-digit code from your authenticator app.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              aria-label="6-digit code"
              disabled={busy}
              className="w-full rounded-lg border border-gray-300 px-3 py-3 text-center font-mono text-xl tracking-widest outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100"
            />

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
              disabled={busy || code.length !== 6}
              className="w-full rounded-full bg-orange-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Checking..." : "Verify"}
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="mt-4 block w-full text-center text-sm text-gray-500 hover:text-orange-600"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}