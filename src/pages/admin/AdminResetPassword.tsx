import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { EyeOff, Eye } from "lucide-react";
type Step = "loading" | "invalid" | "needsCode" | "ready";

const MIN_LENGTH = 12;

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-3 text-base outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100";

const primaryButton =
  "w-full rounded-full bg-orange-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60";

export default function AdminResetPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("loading");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkSession = useCallback(async () => {
    // The link signs you in with a password-level session.
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setStep("invalid");
      return;
    }

    const { data: aal } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (aal && aal.currentLevel !== "aal2" && aal.nextLevel === "aal2") {
      setStep("needsCode");
    } else {
      setStep("ready");
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  async function handleCode(e: React.FormEvent<HTMLFormElement>) {
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

    setStep("ready");
  }

  async function handlePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_LENGTH) {
      setError(`Use at least ${MIN_LENGTH} characters.`);
      return;
    }

    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    setBusy(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setBusy(false);

      // The account needs its second factor before the password can change.
      if (/aal2/i.test(updateError.message)) {
        setStep("needsCode");
        setError("Enter the code from your authenticator app first.");
        return;
      }

      setError(updateError.message);
      return;
    }

    // End every session so the new password applies everywhere.
    await supabase.auth.signOut({ scope: "global" });
    sessionStorage.setItem("admin_password_reset", "1");
    setBusy(false);
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start sm:items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="rounded-lg bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-semibold text-gray-900">
            Set a new password
          </h1>

          {step === "loading" && (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-orange-600"></div>
            </div>
          )}

          {step === "invalid" && (
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <p>
                This reset link has expired or has already been used. Please
                request a new one.
              </p>
              <Link
                to="/admin/forgot-password"
                className="inline-block text-orange-600 hover:underline"
              >
                Request a new link
              </Link>
            </div>
          )}

          {step === "needsCode" && (
            <form onSubmit={handleCode} className="mt-4 space-y-4" noValidate>
              <p className="text-sm text-gray-500">
                Enter the 6-digit code from your authenticator app to continue.
              </p>
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
              <button
                type="submit"
                disabled={busy || code.length !== 6}
                className={primaryButton}
              >
                {busy ? "Checking..." : "Continue"}
              </button>
            </form>
          )}

          {step === "ready" && (
            <form onSubmit={handlePassword} className="mt-4 space-y-4" noValidate>
              <p className="text-sm text-gray-500">
                Use at least {MIN_LENGTH} characters. A password manager can
                create a long, unique one for you.
              </p>

              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  New password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={busy}
                    className={`${inputClass} pr-16`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((shown) => !shown)}
                    className="absolute inset-y-0 right-0 px-4 text-gray-500 hover:text-orange-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff aria-hidden="true"/> : <Eye aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm new password
                </label>
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  disabled={busy}
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={busy || password === "" || confirm === ""}
                className={primaryButton}
              >
                {busy ? "Saving..." : "Save new password"}
              </button>
            </form>
          )}

          {error && (
            <div
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              role="alert"
            >
              {error}
            </div>
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