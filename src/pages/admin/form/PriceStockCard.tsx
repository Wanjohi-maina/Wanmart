import type { FormState } from "../productForm";
import { Card, Field, inputClass, type SetField } from "./formUi";

export default function PriceStockCard({
  form,
  isNew,
  preview,
  optionPrices,
  reserved,
  available,
  setField,
}: {
  form: FormState;
  isNew: boolean;
  preview: number | null;
  optionPrices: { label: string; price: number }[];
  reserved: number;
  available: number | null;
  setField: SetField;
}) {
  return (
    <Card title="Price and stock">
      {/* Pricing fields */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Price (KES)" htmlFor="price">
          <input
            id="price"
            type="text"
            inputMode="decimal"
            value={form.price}
            onChange={(e) => setField("price", e.target.value)}
            placeholder="Enter base price"
            className={inputClass}
          />
        </Field>

        <Field
          label="Discount (%)"
          htmlFor="discount"
          hint="Leave empty for none."
        >
          <input
            id="discount"
            type="text"
            inputMode="numeric"
            value={form.discountPercent}
            onChange={(e) => setField("discountPercent", e.target.value)}
            placeholder="For example 10"
            className={inputClass}
          />
        </Field>
      </div>

      {/* Customer price preview */}
      {preview !== null && (
        <div className="rounded-xl border border-orange-200/70 bg-orange-50/50 p-4">
          <p className="text-sm font-semibold text-gray-800">
            Customer price preview
          </p>

          {form.kind === "electronics" ? (
            optionPrices.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs leading-5 text-gray-600">
                  Prices below include the storage price change and the
                  applicable discount.
                </p>

                <div className="space-y-2">
                  {optionPrices.map((option) => (
                    <div
                      key={option.label}
                      className="flex items-center justify-between gap-3 border-b border-orange-200/60 pb-2 last:border-0 last:pb-0"
                    >
                      <span className="text-sm text-gray-700">
                        {option.label}
                      </span>

                      <span className="shrink-0 text-sm font-semibold tabular-nums text-gray-900">
                        KES {option.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            <p className="mt-2 text-lg font-semibold tabular-nums text-gray-900">
              KES {preview.toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Stock */}
      <div className="space-y-3 border-t border-gray-200 pt-5">
        <Field label="Stock" htmlFor="stock">
          <input
            id="stock"
            type="text"
            inputMode="numeric"
            value={form.stock}
            onChange={(e) => setField("stock", e.target.value)}
            placeholder="Enter stock quantity"
            className={inputClass}
          />
        </Field>

        {!isNew && (
          <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-3">
            <p className="text-sm font-medium text-gray-800">
              Inventory information
            </p>

            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
              <p>
                Reserved by open orders:{" "}
                <span className="font-semibold tabular-nums text-gray-900">
                  {reserved}
                </span>
              </p>

              {available !== null && (
                <p>
                  Available to buy:{" "}
                  <span className="font-semibold tabular-nums text-gray-900">
                    {available}
                  </span>
                </p>
              )}
            </div>

            <p className="mt-2 text-xs leading-5 text-gray-500">
              Stock cannot go below the quantity reserved by open orders.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
