import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { Card, Field, inputClassName } from "./orderDetailUi";
import type { OrderDetail } from "./types";

export default function DispatchCard({
  order,
  onSaved,
}: {
  order: OrderDetail;
  onSaved: () => Promise<void>;
}) {
  const dispatch = order.dispatch;

  const [editing, setEditing] = useState(false);
  const [reference, setReference] = useState(dispatch?.reference ?? "");
  const [note, setNote] = useState(dispatch?.note ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!dispatch) return null;

  async function handleSave() {
    setBusy(true);
    setError(null);

    const { error: rpcError } = await supabase.rpc("admin_update_dispatch", {
      p_order_id: order.order_id,
      p_reference: reference.trim() || undefined,
      p_note: note.trim() || undefined,
    });

    setBusy(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    setEditing(false);
    await onSaved();
  }

  return (
    <Card title="Dispatch details">
      {!editing ? (
        <div className="space-y-4">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
            <Field label="Reference">{dispatch.reference ?? "None"}</Field>
            <Field label="Note">{dispatch.note ?? "None"}</Field>
            <Field label="Dispatched">
              {new Date(dispatch.dispatched_at).toLocaleString()}
            </Field>
          </dl>

          <p className="text-xs leading-relaxed text-gray-500">
            The customer can see the reference and note on their order page.
          </p>

          <button
            type="button"
            onClick={() => {
              setReference(dispatch.reference ?? "");
              setNote(dispatch.note ?? "");
              setEditing(true);
            }}
            className="inline-flex items-center text-sm font-medium text-orange-600 transition hover:text-orange-700 hover:underline"
          >
            Edit dispatch details
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="dispatch-reference"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Reference
            </label>
            <input
              id="dispatch-reference"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              maxLength={200}
              disabled={busy}
              className={inputClassName}
            />
          </div>

          <div>
            <label
              htmlFor="dispatch-note"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Note
            </label>
            <textarea
              id="dispatch-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={500}
              disabled={busy}
              className={`${inputClassName} resize-none`}
            />
          </div>

          <p className="text-xs leading-relaxed text-gray-500">
            Both are shown to the customer on their order page.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={busy}
              onClick={handleSave}
              className="w-full rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {busy ? "Saving..." : "Save details"}
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => setEditing(false)}
              className="w-full rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 sm:w-auto"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
