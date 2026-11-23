
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import type { Json } from "../../types/supabase";
import { Badge } from "./orderUi";

type Method = {
  code: string;
  name: string;
  provider: string;
  is_active: boolean;
};
type Area = { id: number; name: string; fee: number; is_active: boolean };
type Town = { id: number; name: string; is_active: boolean };
type Sacco = { id: number; name: string; is_active: boolean };
type Route = {
  id: number;
  town_id: number;
  sacco_id: number;
  fee: number;
  note: string | null;
  is_active: boolean;
};
type Config = {
  methods: Method[];
  areas: Area[];
  towns: Town[];
  saccos: Sacco[];
  routes: Route[];
};

type Tab = "courier" | "matatu" | "methods";
type OnSaved = (message: string) => void;

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-100";

const saveButton =
  "w-full rounded-full bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto";

const rowClass =
  "space-y-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5";

const WHOLE = /^\d+$/;

function Labelled({
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

function ActiveToggle({
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

function ErrorText({ message }: { message: string | null }) {
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

// ---------- Courier areas ----------

function AreaForm({ area, onSaved }: { area?: Area; onSaved: OnSaved }) {
  const [name, setName] = useState(area?.name ?? "");
  const [fee, setFee] = useState(area ? String(area.fee) : "");
  const [active, setActive] = useState(area?.is_active ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = area
    ? name.trim() !== area.name ||
      fee.trim() !== String(area.fee) ||
      active !== area.is_active
    : name.trim() !== "" || fee.trim() !== "";

  async function handleSave() {
    setError(null);

    if (name.trim().length < 2) {
      setError("Enter the area name.");
      return;
    }

    if (!WHOLE.test(fee.trim())) {
      setError("The fee must be a whole number of shillings.");
      return;
    }

    setBusy(true);

    const { error: rpcError } = await supabase.rpc("admin_save_delivery_area", {
      p: {
        id: area?.id ?? null,
        name: name.trim(),
        fee: Number(fee),
        is_active: active,
      } as unknown as Json,
    });

    setBusy(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    const saved = name.trim();

    if (!area) {
      setName("");
      setFee("");
      setActive(true);
    }

    onSaved(area ? `${saved} was saved.` : `${saved} was added.`);
  }

  return (
    <div className={rowClass}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_9rem]">
        <Labelled label="Area">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="For example Kilimani"
          />
        </Labelled>
        <Labelled label="Fee (KES)">
          <input
            type="text"
            inputMode="numeric"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className={inputClass}
            placeholder="300"
          />
        </Labelled>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <ActiveToggle checked={active} onChange={setActive} />
        <button
          type="button"
          onClick={handleSave}
          disabled={busy || !dirty}
          className={saveButton}
        >
          {busy ? "Saving..." : area ? "Save changes" : "Add area"}
        </button>
      </div>

      <ErrorText message={error} />
    </div>
  );
}

function CourierTab({ config, onSaved }: { config: Config; onSaved: OnSaved }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900">
          Courier delivery areas
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-gray-500">
          Customers choose their area at checkout and the fee is added to their
          total. A fee change applies to new orders only. Hide an area to stop
          offering it.
        </p>
      </div>

      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Add an area</h3>
          <p className="mt-1 text-xs text-gray-500">
            Set the delivery area and its fee in Kenyan shillings.
          </p>
        </div>
        <AreaForm onSaved={onSaved} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Existing areas
          </h3>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
            {config.areas.length} areas
          </span>
        </div>

        <div className="space-y-3">
          {config.areas.map((area) => (
            <AreaForm
              key={`${area.id}:${area.name}:${area.fee}:${area.is_active}`}
              area={area}
              onSaved={onSaved}
            />
          ))}
          {config.areas.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-8 text-center">
              <p className="text-sm font-medium text-gray-700">
                No delivery areas yet
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Add your first courier delivery area above.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// ---------- Matatu ----------

function NameForm({
  kind,
  item,
  info,
  onSaved,
}: {
  kind: "town" | "sacco";
  item?: { id: number; name: string; is_active: boolean };
  info?: string;
  onSaved: OnSaved;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [active, setActive] = useState(item?.is_active ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const noun = kind === "town" ? "town" : "SACCO";
  const dirty = item
    ? name.trim() !== item.name || active !== item.is_active
    : name.trim() !== "";

  async function handleSave() {
    setError(null);

    if (name.trim().length < 2) {
      setError(`Enter the ${noun} name.`);
      return;
    }

    setBusy(true);

    const payload = {
      id: item?.id ?? null,
      name: name.trim(),
      is_active: active,
    } as unknown as Json;

    const { error: rpcError } =
      kind === "town"
        ? await supabase.rpc("admin_save_matatu_town", { p: payload })
        : await supabase.rpc("admin_save_matatu_sacco", { p: payload });

    setBusy(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    const saved = name.trim();

    if (!item) {
      setName("");
      setActive(true);
    }

    onSaved(
      item
        ? `${saved} was saved.`
        : kind === "sacco"
          ? `${saved} was added. Now add it to the towns it serves, in the town sections above.`
          : `${saved} was added. Now add the SACCOs that serve it.`,
    );
  }

  return (
    <div className={rowClass}>
      <Labelled label={kind === "town" ? "Town" : "SACCO"}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder={kind === "town" ? "For example Thika" : "For example Metro"}
        />
      </Labelled>

      {info && <p className="text-xs text-gray-500">{info}</p>}

      <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <ActiveToggle checked={active} onChange={setActive} />
        <button
          type="button"
          onClick={handleSave}
          disabled={busy || !dirty}
          className={saveButton}
        >
          {busy ? "Saving..." : item ? "Save changes" : `Add ${noun}`}
        </button>
      </div>

      <ErrorText message={error} />
    </div>
  );
}

function RouteForm({
  route,
  saccoName,
  saccoActive,
  onSaved,
}: {
  route: Route;
  saccoName: string;
  saccoActive: boolean;
  onSaved: OnSaved;
}) {
  const [fee, setFee] = useState(String(route.fee));
  const [note, setNote] = useState(route.note ?? "");
  const [active, setActive] = useState(route.is_active);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    fee.trim() !== String(route.fee) ||
    note.trim() !== (route.note ?? "") ||
    active !== route.is_active;

  async function handleSave() {
    setError(null);

    if (!WHOLE.test(fee.trim())) {
      setError("The fee must be a whole number of shillings.");
      return;
    }

    setBusy(true);

    const { error: rpcError } = await supabase.rpc("admin_save_matatu_route", {
      p: {
        id: route.id,
        fee: Number(fee),
        note: note.trim() || null,
        is_active: active,
      } as unknown as Json,
    });

    setBusy(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    onSaved(`${saccoName} was saved.`);
  }

  return (
    <div className={rowClass}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-900">{saccoName}</p>
          <p className="mt-0.5 text-xs text-gray-500">SACCO route</p>
        </div>
        {!saccoActive && (
          <Badge className="bg-amber-100 text-amber-800">SACCO hidden</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[9rem_1fr]">
        <Labelled label="Fee (KES)">
          <input
            type="text"
            inputMode="numeric"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className={inputClass}
          />
        </Labelled>
        <Labelled label="Note shown to customers (optional)">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
            className={inputClass}
            placeholder="For example the SACCO's drop-off point"
          />
        </Labelled>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <ActiveToggle checked={active} onChange={setActive} />
        <button
          type="button"
          onClick={handleSave}
          disabled={busy || !dirty}
          className={saveButton}
        >
          {busy ? "Saving..." : "Save changes"}
        </button>
      </div>

      <ErrorText message={error} />
    </div>
  );
}

function AddRouteForm({
  townId,
  saccos,
  onSaved,
  onManageSaccos,
}: {
  townId: number;
  saccos: Sacco[];
  onSaved: OnSaved;
  onManageSaccos: () => void;
}) {
  const [saccoId, setSaccoId] = useState("");
  const [fee, setFee] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    setError(null);

    if (saccoId === "") {
      setError("Choose a SACCO.");
      return;
    }

    if (!WHOLE.test(fee.trim())) {
      setError("The fee must be a whole number of shillings.");
      return;
    }

    setBusy(true);

    const { error: rpcError } = await supabase.rpc("admin_save_matatu_route", {
      p: {
        town_id: townId,
        sacco_id: Number(saccoId),
        fee: Number(fee),
        note: note.trim() || null,
        is_active: true,
      } as unknown as Json,
    });

    setBusy(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    const added = saccos.find((s) => String(s.id) === saccoId)?.name;

    onSaved(added ? `${added} was added to this town.` : "Route added.");
  }

  const manageLink = (
    <button
      type="button"
      onClick={onManageSaccos}
      className="text-orange-600 underline"
    >
      Add it under SACCOs
    </button>
  );

  if (saccos.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Every active SACCO already serves this town. To offer another,{" "}
        {manageLink} first, then come back here.
      </p>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-dashed border-gray-300 bg-gray-50/70 p-4 sm:p-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          Add a SACCO to this town
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          Select an active SACCO and set its delivery fee.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_9rem]">
        <Labelled label="SACCO">
          <select
            value={saccoId}
            onChange={(e) => setSaccoId(e.target.value)}
            className={inputClass}
          >
            <option value="">Select a SACCO</option>
            {saccos.map((sacco) => (
              <option key={sacco.id} value={String(sacco.id)}>
                {sacco.name}
              </option>
            ))}
          </select>
        </Labelled>
        <Labelled label="Fee (KES)">
          <input
            type="text"
            inputMode="numeric"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className={inputClass}
          />
        </Labelled>
      </div>

      <p className="text-xs text-gray-500">
        SACCO not in the list? {manageLink} first, then come back here.
      </p>

      <Labelled label="Note shown to customers (optional)">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={200}
          className={inputClass}
        />
      </Labelled>

      <button
        type="button"
        onClick={handleAdd}
        disabled={busy}
        className={saveButton}
      >
        {busy ? "Adding..." : "Add to this town"}
      </button>

      <ErrorText message={error} />
    </div>
  );
}

function MatatuTab({ config, onSaved }: { config: Config; onSaved: OnSaved }) {
  const [saccosOpen, setSaccosOpen] = useState(false);

  const towns = [...config.towns].sort((a, b) => a.name.localeCompare(b.name));
  const saccos = [...config.saccos].sort((a, b) => a.name.localeCompare(b.name));
  const saccoById = new Map(config.saccos.map((s) => [s.id, s]));

  function openSaccos() {
    setSaccosOpen(true);

    setTimeout(() => {
      document
        .getElementById("saccos-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  function saccoInfo(saccoId: number) {
    const count = config.routes.filter((r) => r.sacco_id === saccoId).length;

    if (count === 0) return "Not set up in any town yet.";

    return `Serves ${count} ${count === 1 ? "town" : "towns"}.`;
  }

  function townInfo(townId: number) {
    const count = config.routes.filter((r) => r.town_id === townId).length;

    if (count === 0) return "No SACCO serves this town yet.";

    return `${count} ${count === 1 ? "SACCO" : "SACCOs"} set up.`;
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        A customer picks a destination town and then one of the SACCOs set up
        for it. Each SACCO has its own fee in each town. A town with no active
        SACCO shows customers a message asking them to choose another. To use
        a new SACCO, add it under SACCOs first, then add it to each town it
        serves.
      </p>

      {towns.map((town) => {
        const routes = config.routes
          .filter((r) => r.town_id === town.id)
          .sort((a, b) =>
            (saccoById.get(a.sacco_id)?.name ?? "").localeCompare(
              saccoById.get(b.sacco_id)?.name ?? "",
            ),
          );
        const used = new Set(routes.map((r) => r.sacco_id));
        const available = saccos.filter((s) => s.is_active && !used.has(s.id));

        return (
          <section
            key={town.id}
            className={`overflow-hidden rounded-xl border ${
              town.is_active
                ? "border-gray-200 bg-white"
                : "border-amber-200 bg-amber-50/30"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-5">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {town.name}
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  {routes.length}{" "}
                  {routes.length === 1 ? "SACCO route" : "SACCO routes"}
                </p>
              </div>
              {!town.is_active && (
                <Badge className="bg-amber-100 text-amber-800">Town hidden</Badge>
              )}
            </div>

            <div className="space-y-3 p-3 sm:p-4">
              {routes.length === 0 && (
                <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">
                  No SACCO serves this town yet.
                </p>
              )}

              {routes.map((route) => (
                <RouteForm
                  key={`${route.id}:${route.fee}:${route.note ?? ""}:${route.is_active}`}
                  route={route}
                  saccoName={saccoById.get(route.sacco_id)?.name ?? "SACCO"}
                  saccoActive={saccoById.get(route.sacco_id)?.is_active ?? true}
                  onSaved={onSaved}
                />
              ))}

              <AddRouteForm
                key={`${town.id}:${routes.length}:${available.length}`}
                townId={town.id}
                saccos={available}
                onSaved={onSaved}
                onManageSaccos={openSaccos}
              />
            </div>
          </section>
        );
      })}

      {towns.length === 0 && (
        <p className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-500">
          There are no towns yet. Add one below.
        </p>
      )}

      <details className="group overflow-hidden rounded-xl border border-gray-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-sm font-semibold text-gray-900 sm:px-5">
          <span>Towns ({towns.length})</span>
          <span className="text-xs font-medium text-gray-500 transition-transform group-open:rotate-180">
            ▼
          </span>
        </summary>
        <div className="space-y-3 border-t border-gray-100 bg-gray-50/50 p-3 sm:p-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Add a town</h3>
            <p className="mt-1 text-xs text-gray-500">
              Create a destination town for matatu delivery.
            </p>
          </div>
          <NameForm kind="town" onSaved={onSaved} />
          {towns.map((town) => (
            <NameForm
              key={`${town.id}:${town.name}:${town.is_active}`}
              kind="town"
              item={town}
              info={townInfo(town.id)}
              onSaved={onSaved}
            />
          ))}
        </div>
      </details>

      <details
        id="saccos-section"
        open={saccosOpen}
        onToggle={(e) => setSaccosOpen(e.currentTarget.open)}
        className="group scroll-mt-20 overflow-hidden rounded-xl border border-gray-200 bg-white"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-sm font-semibold text-gray-900 sm:px-5">
          <span>SACCOs ({saccos.length})</span>
          <span className="text-xs font-medium text-gray-500 transition-transform group-open:rotate-180">
            ▼
          </span>
        </summary>
        <div className="space-y-3 border-t border-gray-100 bg-gray-50/50 p-3 sm:p-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Manage SACCOs
            </h3>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Add a new SACCO here first, then add it to the towns it serves.
              Renaming a SACCO changes it everywhere. Hiding one stops customers
              choosing it in every town.
            </p>
          </div>
          <NameForm kind="sacco" onSaved={onSaved} />
          {saccos.map((sacco) => (
            <NameForm
              key={`${sacco.id}:${sacco.name}:${sacco.is_active}`}
              kind="sacco"
              item={sacco}
              info={saccoInfo(sacco.id)}
              onSaved={onSaved}
            />
          ))}
        </div>
      </details>
    </div>
  );
}

// ---------- Methods ----------

function MethodForm({ method, onSaved }: { method: Method; onSaved: OnSaved }) {
  const [name, setName] = useState(method.name);
  const [active, setActive] = useState(method.is_active);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = name.trim() !== method.name || active !== method.is_active;

  async function handleSave() {
    setError(null);

    if (name.trim().length < 2) {
      setError("Enter a name.");
      return;
    }

    setBusy(true);

    const { error: rpcError } = await supabase.rpc("admin_save_delivery_method", {
      p_code: method.code,
      p_name: name.trim(),
      p_active: active,
    });

    setBusy(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    onSaved(`${name.trim()} was saved.`);
  }

  return (
    <div className={rowClass}>
      <Labelled label="Name customers see">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </Labelled>

      <div className="rounded-lg bg-gray-50 px-3 py-2.5">
        <p className="text-xs text-gray-500">Handled by</p>
        <p className="mt-0.5 text-sm font-medium text-gray-800">
          {method.provider === "manual" ? "You, manually" : method.provider}
        </p>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <ActiveToggle
          checked={active}
          onChange={setActive}
          label="Offered at checkout"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={busy || !dirty}
          className={saveButton}
        >
          {busy ? "Saving..." : "Save changes"}
        </button>
      </div>

      <ErrorText message={error} />
    </div>
  );
}

function MethodsTab({ config, onSaved }: { config: Config; onSaved: OnSaved }) {
  const noneActive = config.methods.every((m) => !m.is_active);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900">
          Checkout delivery methods
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-gray-500">
          Turn a delivery method off to stop offering it at checkout, or rename
          it.
        </p>
      </div>

      {noneActive && (
        <div
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          role="alert"
        >
          Both methods are off, so customers cannot check out.
        </div>
      )}

      {config.methods.map((method) => (
        <MethodForm
          key={`${method.code}:${method.name}:${method.is_active}`}
          method={method}
          onSaved={onSaved}
        />
      ))}
    </div>
  );
}

// ---------- Page ----------

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
