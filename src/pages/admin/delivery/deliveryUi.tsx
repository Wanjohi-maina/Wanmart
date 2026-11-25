export const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-100";

export const saveButton =
  "w-full rounded-full bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto";

export const rowClass =
  "space-y-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5";

export const WHOLE = /^\d+$/;

export function Labelled({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-gray-600">
        {label}
      </span>
      {children}
    </label>
  );
}

export function ActiveToggle({
  checked,
  onChange,
  label = "Available to customers",
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 accent-orange-600"
      />
      {label}
    </label>
  );
}

export function ErrorText({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <p
      className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700"
      role="alert"
    >
      {message}
    </p>
  );
}