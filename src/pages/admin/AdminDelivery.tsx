import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import type { Config, Tab } from "./delivery/types";
import CourierTab from "./delivery/CourierTab";
import MatatuTab from "./delivery/MatatuTab";
import MethodsTab from "./delivery/MethodsTab";

const TABS: { value: Tab; label: string }[] = [
  { value: "courier", label: "Courier" },
  { value: "matatu", label: "Matatu" },
  { value: "methods", label: "Methods" },
];

export default function AdminDelivery() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("courier");
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc("admin_get_delivery_config");

    if (error) {
      setLoadError(error.message);
      return;
    }

    setLoadError(null);
    setConfig(data as unknown as Config);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  function handleSaved(message: string) {
    setNotice(message);
    load();
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="border-b border-gray-200 pb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">
          Store configuration
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
          Delivery
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-gray-500">
          Manage delivery areas, matatu routes and fees.
        </p>
      </div>

      <div className="mt-5 flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-1">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === item.value
                ? "bg-white text-orange-600 shadow-sm ring-1 ring-gray-200"
                : "text-gray-600 hover:bg-white/70 hover:text-gray-900"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {notice && (
        <div
          className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          role="status"
        >
          {notice}
        </div>
      )}

      {loadError && (
        <div
          className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {loadError}
        </div>
      )}

      {!config && !loadError && (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-orange-600"></div>
        </div>
      )}

      {config && (
        <div className="mt-6">
          {tab === "courier" && (
            <CourierTab config={config} onSaved={handleSaved} />
          )}
          {tab === "matatu" && (
            <MatatuTab config={config} onSaved={handleSaved} />
          )}
          {tab === "methods" && (
            <MethodsTab config={config} onSaved={handleSaved} />
          )}
        </div>
      )}
    </div>
  );
}
