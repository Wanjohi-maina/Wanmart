import { Link } from "react-router-dom";
import { ACTIONS } from "./actions";
import { Card, inputClassName } from "./orderDetailUi";
import type { ActionKey } from "./types";

export default function ActionsCard({
  available,
  panel,
  text,
  text2,
  busy,
  actionError,
  needsPaymentDecision,
  promptMayBeLive,
  isMatatu,
  onOpen,
  onTextChange,
  onText2Change,
  onPerform,
}: {
  available: ActionKey[];
  panel: ActionKey | null;
  text: string;
  text2: string;
  busy: boolean;
  actionError: string | null;
  needsPaymentDecision: boolean;
  promptMayBeLive: boolean;
  isMatatu: boolean;
  onOpen: (next: ActionKey | null) => void;
  onTextChange: (value: string) => void;
  onText2Change: (value: string) => void;
  onPerform: (action: ActionKey) => void;
}) {
  return (
    <Card title="Actions">
      {panel === null && (
        <div className="space-y-4">
          {available.length > 0 ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {available.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onOpen(key)}
                  className={
                    ACTIONS[key].danger
                      ? "w-full rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 sm:w-auto"
                      : "w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700 sm:w-auto"
                  }
                >
                  {ACTIONS[key].label}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No actions are available for this order.
            </p>
          )}

          {needsPaymentDecision && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm leading-relaxed text-amber-800">
              This order needs a payment decision.{" "}
              <Link to="/admin/review" className="underline">
                Open Review
              </Link>
            </p>
          )}
        </div>
      )}

      {panel !== null && (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-gray-600">
            {ACTIONS[panel].description}
          </p>

          {panel === "cancel" && promptMayBeLive && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm leading-relaxed text-amber-800">
              A payment prompt may already have been sent. If the customer pays
              after you cancel, the payment will appear under Review.
            </p>
          )}

          {ACTIONS[panel].field === "note" && (
            <textarea
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              rows={2}
              placeholder="Note (optional)"
              className={`${inputClassName} resize-none`}
              disabled={busy}
            />
          )}

          {ACTIONS[panel].field === "reference" && (
            <input
              type="text"
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Receipt or reference (optional)"
              autoCorrect="off"
              spellCheck={false}
              className={inputClassName}
              disabled={busy}
            />
          )}

          {ACTIONS[panel].field === "dispatch" && (
            <>
              <div>
                <label
                  htmlFor="ship-reference"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Reference (optional)
                </label>

                <input
                  id="ship-reference"
                  type="text"
                  value={text}
                  onChange={(e) => onTextChange(e.target.value)}
                  maxLength={200}
                  placeholder={
                    isMatatu
                      ? "SACCO parcel receipt number and vehicle plate"
                      : "Rider's name and phone number"
                  }
                  className={inputClassName}
                  disabled={busy}
                />
              </div>

              <div>
                <label
                  htmlFor="ship-note"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Note (optional)
                </label>

                <textarea
                  id="ship-note"
                  value={text2}
                  onChange={(e) => onText2Change(e.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder="Anything the customer should know"
                  className={`${inputClassName} resize-none`}
                  disabled={busy}
                />
              </div>

              <p className="text-xs leading-relaxed text-gray-500">
                Both are shown to the customer on their order page.
              </p>
            </>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={busy}
              onClick={() => onPerform(panel)}
              className={`w-full rounded-full px-5 py-3 text-base font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${
                ACTIONS[panel].danger
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {busy ? "Working..." : ACTIONS[panel].confirmLabel}
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => onOpen(null)}
              className="w-full rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {actionError && (
        <div
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {actionError}
        </div>
      )}
    </Card>
  );
}
