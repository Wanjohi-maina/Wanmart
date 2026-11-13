
import type { ReactNode } from "react";

export function PolicySection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-b border-gray-100 pb-7 last:border-0 last:pb-0"
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:text-xl">
        {title}
      </h2>

      <div className="space-y-4 text-sm leading-7 text-gray-600 sm:text-base">
        {children}
      </div>
    </section>
  );
}

export default function PolicyPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <header className="border-b border-gray-100 px-5 py-7 sm:px-8 sm:py-9">
          <div className="mb-4 h-1 w-12 rounded-full bg-orange-500" />

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {title}
          </h1>

          {updated && (
            <p className="mt-2 text-sm text-gray-500">
              Last updated: {updated}
            </p>
          )}
        </header>

        <div className="space-y-8 px-5 py-7 sm:px-8 sm:py-9">
          {children}
        </div>
      </div>
    </main>
  );
}
