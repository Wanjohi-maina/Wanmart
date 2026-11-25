import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import type { Json } from "../../../types/supabase";
import type { Area, Config, OnSaved } from "./types";
import {
  ActiveToggle,
  ErrorText,
  Labelled,
  WHOLE,
  inputClass,
  rowClass,
  saveButton,
} from "./deliveryUi";

// Courier areas
function AreaForm({ area, onSaved }: { area?: Area; onSaved: OnSaved }) {
  const [name, setName] = useState(area?.name ?? "");
  const [fee, setFee] = useState(area ? String(area.fee) : "");
  const [active, setActive] = useState(area?.is_active ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = area
    ? name.trim() !== area.name ||
      fee.trim() !== String(area.fee) ||
      active !== area.is_active
    : name.trim() !== "" || fee.trim() !== "";

  async function handleSave() {
    setError(null);

    if (name.trim().length < 2) {
      setError("Enter the area name.");
      return;
    }

    if (!WHOLE.test(fee.trim())) {
      setError("The fee must be a whole number of shillings.");
      return;
    }

    setBusy(true);

    const { error: rpcError } = await supabase.rpc("admin_save_delivery_area", {
      p: {
        id: area?.id ?? null,
        name: name.trim(),
        fee: Number(fee),
        is_active: active,
      } as unknown as Json,
    });

    setBusy(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    const saved = name.trim();

    if (!area) {
      setName("");
      setFee("");
      setActive(true);
    }

    onSaved(area ? `${saved} was saved.` : `${saved} was added.`);
  }

  return (
    <div className={rowClass}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_9rem]">
        <Labelled label="Area">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="For example Kilimani"
          />
        </Labelled>
        <Labelled label="Fee (KES)">
          <input
            type="text"
            inputMode="numeric"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className={inputClass}
            placeholder="300"
          />
        </Labelled>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <ActiveToggle checked={active} onChange={setActive} />
        <button
          type="button"
          onClick={handleSave}
          disabled={busy || !dirty}
          className={saveButton}
        >
          {busy ? "Saving..." : area ? "Save changes" : "Add area"}
        </button>
      </div>

      <ErrorText message={error} />
    </div>
  );
}

export default function CourierTab({ config, onSaved }: { config: Config; onSaved: OnSaved }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900">
          Courier delivery areas
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-gray-500">
          Customers choose their area at checkout and the fee is added to their
          total. A fee change applies to new orders only. Hide an area to stop
          offering it.
        </p>
      </div>

      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Add an area</h3>
          <p className="mt-1 text-xs text-gray-500">
            Set the delivery area and its fee in Kenyan shillings.
          </p>
        </div>
        <AreaForm onSaved={onSaved} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Existing areas
          </h3>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
            {config.areas.length} areas
          </span>
        </div>

        <div className="space-y-3">
          {config.areas.map((area) => (
            <AreaForm
              key={`${area.id}:${area.name}:${area.fee}:${area.is_active}`}
              area={area}
              onSaved={onSaved}
            />
          ))}
          {config.areas.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-8 text-center">
              <p className="text-sm font-medium text-gray-700">
                No delivery areas yet
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Add your first courier delivery area above.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
