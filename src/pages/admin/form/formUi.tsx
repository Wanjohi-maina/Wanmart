import type { FormState } from "../productForm";

export type SetField = <K extends keyof FormState>(
  key: K,
  value: FormState[K],
) => void;

export const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-base outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100";

export const smallButton =
  "shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 hover:border-gray-400";

export function replaceAt<T>(list: T[], index: number, value: T): T[] {
  return list.map((item, i) => (i === index ? value : item));
}

export function removeAt<T>(list: T[], index: number): T[] {
  return list.filter((_, i) => i !== index);
}

export function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {hint && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export function CheckField({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 rounded border-gray-300"
      />
      <span>
        <span className="block text-sm font-medium text-gray-900">{label}</span>
        {hint && <span className="block text-xs text-gray-500">{hint}</span>}
      </span>
    </label>
  );
}

export function Thumb({ url }: { url: string }) {
  if (url.trim() === "") return null;

  return (
    <img
      key={url}
      src={url}
      alt=""
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
      className="h-12 w-12 shrink-0 rounded-md bg-gray-50 object-cover"
    />
  );
}

export function TextList({
  values,
  placeholder,
  addLabel,
  preview = false,
  onChange,
}: {
  values: string[];
  placeholder: string;
  addLabel: string;
  preview?: boolean;
  onChange: (values: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      {values.map((value, index) => (
        <div key={index} className="flex items-center gap-2">
          {preview && <Thumb url={value} />}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(replaceAt(values, index, e.target.value))}
            placeholder={placeholder}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => onChange(removeAt(values, index))}
            className={smallButton}
          >
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...values, ""])}
        className="text-sm text-orange-600 hover:underline"
      >
        + {addLabel}
      </button>
    </div>
  );
}
