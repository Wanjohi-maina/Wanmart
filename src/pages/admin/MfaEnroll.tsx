import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Enrollment = {
  factorId: string;
  qrCode: string;
  secret: string;
  uri: string;
};

export default function MfaEnroll({
  onEnrolled,
}: {
  onEnrolled: () => void;
}) {
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Makes sure setup starts only once, even when React runs effects twice.
  const started = useRef(false);

  const start = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Remove unfinished setups left by earlier attempts.
    const { data: existing } = await supabase.auth.mfa.listFactors();

    for (const factor of existing?.all ?? []) {
      if (factor.factor_type === "totp" && factor.status === "unverified") {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }
    }

    // A unique name means two setups can never collide.
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Authenticator ${Date.now()}`,
    });

    if (enrollError || !data) {
      setError(enrollError?.message ?? "Could not start the setup.");
      setLoading(false);
      return;
    }

    setEnrollment({
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
      uri: data.totp.uri,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    start();
  }, [start]);

  async function copySecret() {
    if (!enrollment) return;

    try {
      await navigator.clipboard.writeText(enrollment.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Copying can be blocked. The key is shown on screen to copy by hand.
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!enrollment) return;

    setError(null);
    setBusy(true);

    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: enrollment.factorId,
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

    onEnrolled();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start sm:items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="rounded-lg bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-semibold text-gray-900">
            Set up two-factor sign-in
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Admin accounts need a code from an authenticator app each time you
            sign in.
          </p>

          {loading && (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-orange-600"></div>
            </div>
          )}

          {!loading && enrollment && (
            <div className="mt-6 space-y-6">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  1. Add this account to an authenticator app
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Use any authenticator app, such as Google Authenticator or
                  your password manager.
                </p>

                <img
                  src={enrollment.qrCode}
                  alt="QR code for your authenticator app"
                  className="mx-auto mt-3 h-44 w-44 rounded bg-white"
                />

                <a
                  href={enrollment.uri}
                  className="mt-3 block text-center text-sm text-orange-600 hover:underline"
                >
                  On your phone? Open it in your authenticator app
                </a>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">
                  Or enter this key by hand
                </p>
                <p className="mt-2 break-all rounded-lg bg-gray-50 px-3 py-2 font-mono text-sm text-gray-900">
                  {enrollment.secret}
                </p>
                <button
                  type="button"
                  onClick={copySecret}
                  className="mt-2 text-sm text-orange-600 hover:underline"
                >
                  {copied ? "Copied" : "Copy key"}
                </button>
                <p className="mt-2 text-xs text-gray-500">
                  Also save this key in your password manager. It is the only
                  way to set the authenticator up again if you lose your phone.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label
                    htmlFor="mfa-code"
                    className="mb-1 block text-sm font-medium text-gray-900"
                  >
                    2. Enter the 6-digit code it shows
                  </label>
                  <input
                    id="mfa-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="123456"
                    disabled={busy}
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 text-center font-mono text-xl tracking-widest outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy || code.length !== 6}
                  className="w-full rounded-full bg-orange-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? "Checking..." : "Turn on two-factor sign-in"}
                </button>
              </form>
            </div>
          )}

          {error && (
            <div
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              role="alert"
            >
              {error}
            </div>
          )}

          {!loading && !enrollment && (
            <button
              type="button"
              onClick={start}
              className="mt-4 w-full rounded-full border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 hover:border-gray-400"
            >
              Try again
            </button>
          )}
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