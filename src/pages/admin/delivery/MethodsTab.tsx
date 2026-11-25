import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import type { Config, Method, OnSaved } from "./types";
import {
  ActiveToggle,
  ErrorText,
  Labelled,
  inputClass,
  rowClass,
  saveButton,
} from "./deliveryUi";

// Methods
function MethodForm({ method, onSaved }: { method: Method; onSaved: OnSaved }) {
  const [name, setName] = useState(method.name);
  const [active, setActive] = useState(method.is_active);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = name.trim() !== method.name || active !== method.is_active;

  async function handleSave() {
    setError(null);

    if (name.trim().length < 2) {
      setError("Enter a name.");
      return;
    }

    setBusy(true);

    const { error: rpcError } = await supabase.rpc("admin_save_delivery_method", {
      p_code: method.code,
      p_name: name.trim(),
      p_active: active,
    });

    setBusy(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    onSaved(`${name.trim()} was saved.`);
  }

  return (
    <div className={rowClass}>
      <Labelled label="Name customers see">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </Labelled>

      <div className="rounded-lg bg-gray-50 px-3 py-2.5">
        <p className="text-xs text-gray-500">Handled by</p>
        <p className="mt-0.5 text-sm font-medium text-gray-800">
          {method.provider === "manual" ? "You, manually" : method.provider}
        </p>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <ActiveToggle
          checked={active}
          onChange={setActive}
          label="Offered at checkout"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={busy || !dirty}
          className={saveButton}
        >
          {busy ? "Saving..." : "Save changes"}
        </button>
      </div>

      <ErrorText message={error} />
    </div>
  );
}

export default function MethodsTab({
  config,
  onSaved,
}: {
  config: Config;
  onSaved: OnSaved;
}) {
  const noneActive = config.methods.every((m) => !m.is_active);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900">
          Checkout delivery methods
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-gray-500">
          Turn a delivery method off to stop offering it at checkout, or rename
          it.
        </p>
      </div>

      {noneActive && (
        <div
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          role="alert"
        >
          Both methods are off, so customers cannot check out.
        </div>
      )}

      {config.methods.map((method) => (
        <MethodForm
          key={`${method.code}:${method.name}:${method.is_active}`}
          method={method}
          onSaved={onSaved}
        />
      ))}
    </div>
  );
}
