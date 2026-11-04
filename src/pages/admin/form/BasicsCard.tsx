import { KINDS, KIND_LABELS, type FormState, type Kind } from "../productForm";
import { Card, Field, inputClass, type SetField } from "./formUi";

type CategoryOption = { id: string; label: string };

export default function BasicsCard({
  form,
  isNew,
  categoryOptions,
  setField,
  onNameChange,
}: {
  form: FormState;
  isNew: boolean;
  categoryOptions: CategoryOption[];
  setField: SetField;
  onNameChange: (value: string) => void;
}) {
  return (
    <Card title="Basics">
      <Field label="Name" htmlFor="name">
        <input
          id="name"
          type="text"
          value={form.name}
          onChange={(e) => onNameChange(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field
        label="Product ID"
        htmlFor="product-id"
        hint={
          isNew
            ? "Used in the product's web address. It cannot be changed later."
            : "The ID cannot be changed."
        }
      >
        <input
          id="product-id"
          type="text"
          value={form.id}
          onChange={(e) => {
            setField("id", e.target.value.toLowerCase().replace(/\s+/g, "-"));
            setField("idTouched", true);
          }}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          disabled={!isNew}
          className={`${inputClass} font-mono`}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Type"
          htmlFor="kind"
          hint={isNew ? undefined : "The type cannot be changed."}
        >
          <select
            id="kind"
            value={form.kind}
            onChange={(e) => setField("kind", e.target.value as Kind)}
            disabled={!isNew}
            className={inputClass}
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {KIND_LABELS[k]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Category" htmlFor="category">
          <select
            id="category"
            value={form.categoryId}
            onChange={(e) => setField("categoryId", e.target.value)}
            className={inputClass}
          >
            <option value="">Choose a category</option>
            {categoryOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Description" htmlFor="description">
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          rows={4}
          className={`${inputClass} resize-y`}
        />
      </Field>
    </Card>
  );
}
