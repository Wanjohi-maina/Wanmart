import type { ReactNode } from "react";
import type { FormState } from "../productForm";

export type SetField = <K extends keyof FormState>(
  key: K,
  value: FormState[K],
) => void;

export const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-base text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500";

export const smallButton =
  "shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500/20";

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
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-base font-semibold tracking-tight text-gray-900">
        {title}
      </h2>

      {hint && (
        <p className="mt-1.5 text-sm leading-6 text-gray-500">{hint}</p>
      )}

      <div className="mt-5 space-y-5">{children}</div>
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
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      {children}

      {hint && (
        <p className="mt-1.5 text-xs leading-5 text-gray-500">{hint}</p>
      )}
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
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-gray-50/50 p-3 transition-colors hover:bg-gray-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-gray-300 accent-orange-600 focus:ring-2 focus:ring-orange-500/20"
      />

      <span className="min-w-0">
        <span className="block text-sm font-medium text-gray-900">
          {label}
        </span>

        {hint && (
          <span className="mt-0.5 block text-xs leading-5 text-gray-500">
            {hint}
          </span>
        )}
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
      className="h-12 w-12 shrink-0 rounded-lg border border-gray-200 bg-gray-50 object-cover"
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
    <div className="space-y-3">
      {values.map((value, index) => (
        <div key={index} className="flex items-center gap-2">
          {preview && <Thumb url={value} />}

          <input
            type="text"
            value={value}
            onChange={(e) =>
              onChange(replaceAt(values, index, e.target.value))
            }
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
        className="text-sm font-medium text-orange-600 transition-colors hover:text-orange-700 hover:underline focus:outline-none focus:underline"
      >
        + {addLabel}
      </button>
    </div>
  );
}
