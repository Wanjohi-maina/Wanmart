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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Price (KES)" htmlFor="price">
          <input
            id="price"
            type="text"
            inputMode="decimal"
            value={form.price}
            onChange={(e) => setField("price", e.target.value)}
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
            className={inputClass}
          />
        </Field>
      </div>

      {preview !== null && (
        <div className="space-y-1 text-sm text-gray-600">
          {form.kind === "electronics" ? (
            optionPrices.length > 0 && (
              <>
                <p>
                  Customers pay this much (the discount applies to the whole
                  price, storage change included):
                </p>
                <ul className="list-disc pl-5">
                  {optionPrices.map((option) => (
                    <li key={option.label}>
                      {option.label}: KES {option.price.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </>
            )
          ) : (
            <p>Customers pay KES {preview.toLocaleString()}.</p>
          )}
        </div>
      )}

      <Field label="Stock" htmlFor="stock">
        <input
          id="stock"
          type="text"
          inputMode="numeric"
          value={form.stock}
          onChange={(e) => setField("stock", e.target.value)}
          className={inputClass}
        />
      </Field>

      {!isNew && (
        <p className="text-sm text-gray-600">
          Reserved by open orders: {reserved}
          {available !== null && ` · Available to buy: ${available}`}. Stock
          cannot go below the reserved amount.
        </p>
      )}
    </Card>
  );
}
