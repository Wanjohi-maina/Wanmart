import type { FormState } from "../productForm";
import { Card, CheckField, Field, inputClass, type SetField } from "./formUi";

export default function VisibilityCard({
  form,
  setField,
}: {
  form: FormState;
  setField: SetField;
}) {
  return (
    <Card title="Visibility">
      <CheckField
        label="Visible in store"
        hint="Turn this off to hide the product. Customers can no longer see or order it."
        checked={form.isActive}
        onChange={(value) => setField("isActive", value)}
      />

      <CheckField
        label="Featured"
        checked={form.featured}
        onChange={(value) => setField("featured", value)}
      />

      <Field
        label="Display order (optional)"
        htmlFor="display-order"
        hint="A whole number. Leave empty for no fixed position."
      >
        <input
          id="display-order"
          type="text"
          inputMode="numeric"
          value={form.displayOrder}
          onChange={(e) => setField("displayOrder", e.target.value)}
          className={inputClass}
        />
      </Field>
    </Card>
  );
}
