import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import type { Json } from "../../types/supabase";
import {
  KIND_LABELS,
  buildPayload,
  emptyForm,
  finalPrice,
  recordToForm,
  slugify,
  validateForm,
  type FormState,
  type ProductRecord,
} from "./productForm";
import BasicsCard from "./form/BasicsCard";
import DeleteProductCard from "./form/DeleteProductCard";
import HighlightsCard from "./form/HighlightsCard";
import ImagesCard from "./form/ImagesCard";
import KindDetailsCard from "./form/KindDetailsCard";
import PriceStockCard from "./form/PriceStockCard";
import VisibilityCard from "./form/VisibilityCard";
import type { SetField } from "./form/formUi";

type CategoryRow = { id: string; name: string; parent_id: string | null };

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === undefined;

  const [form, setForm] = useState<FormState>(emptyForm());
  const [record, setRecord] = useState<ProductRecord | null>(null);
  const [categories, setCategories] = useState<CategoryRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeUploads, setActiveUploads] = useState(0);

  function trackUpload(busy: boolean) {
    setActiveUploads((count) => Math.max(0, count + (busy ? 1 : -1)));
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);

      const categoryResult = await supabase
        .from("categories")
        .select("id, name, parent_id");

      if (cancelled) return;

      if (categoryResult.error) {
        setLoadError(categoryResult.error.message);
        setLoading(false);
        return;
      }

      setCategories(categoryResult.data ?? []);

      if (id !== undefined) {
        const { data, error } = await supabase.rpc("admin_get_product", {
          p_id: id,
        });

        if (cancelled) return;

        if (error) {
          setLoadError(error.message);
          setLoading(false);
          return;
        }

        const loaded = data as unknown as ProductRecord;
        setRecord(loaded);
        setForm(recordToForm(loaded));
      }

      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const categoryOptions = useMemo(() => {
    const byId = new Map(categories.map((c) => [c.id, c]));

    return categories
      .map((c) => {
        const parent = c.parent_id ? byId.get(c.parent_id) : undefined;
        return {
          id: c.id,
          label: parent ? `${parent.name} › ${c.name}` : c.name,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [categories]);

  const setField: SetField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSuccess(null);
  };

  function handleNameChange(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      id: isNew && !current.idTouched ? slugify(value) : current.id,
    }));
    setSuccess(null);
  }

  function showProblems(messages: string[]) {
    setErrors(messages);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(null);

    const problems = validateForm(form, isNew, record?.reserved_stock ?? 0);

    if (problems.length > 0) {
      showProblems(problems);
      return;
    }

    setErrors([]);
    setSaving(true);

    const payload = buildPayload(form) as unknown as Json;

    if (isNew) {
      const { error } = await supabase.rpc("admin_create_product", {
        p: payload,
      });

      setSaving(false);

      if (error) {
        showProblems([error.message]);
        return;
      }

      navigate("/admin/products", {
        state: { notice: `${form.name.trim()} was created.` },
      });
      return;
    }

    const { error } = await supabase.rpc("admin_update_product", {
      p: payload,
    });

    if (error) {
      setSaving(false);
      showProblems([error.message]);
      return;
    }

    const { data } = await supabase.rpc("admin_get_product", { p_id: id });

    setSaving(false);

    if (data) {
      const reloaded = data as unknown as ProductRecord;
      setRecord(reloaded);
      setForm(recordToForm(reloaded));
    }

    setSuccess("Changes saved.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete() {
    if (id === undefined) return;

    setDeleting(true);

    const { error } = await supabase.rpc("admin_delete_product", {
      p_id: id,
    });

    setDeleting(false);

    if (error) {
      setConfirmDelete(false);
      showProblems([error.message]);
      return;
    }

    navigate("/admin/products", {
      state: { notice: `${record?.name ?? "The product"} was deleted.` },
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-orange-600"></div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div>
        <Link
          to="/admin/products"
          className="text-sm text-gray-500 hover:text-orange-600"
        >
          ← Products
        </Link>
        <div
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          role="alert"
        >
          {loadError}
        </div>
      </div>
    );
  }

  const preview = finalPrice(form.price, form.discountPercent);

  const optionPrices =
    form.kind === "electronics"
      ? form.storageOptions
          .filter(
            (o) =>
              o.label.trim() !== "" &&
              o.priceModifier.trim() !== "" &&
              Number.isFinite(Number(o.priceModifier)),
          )
          .map((o) => ({
            label: o.label.trim(),
            price: finalPrice(
              form.price,
              form.discountPercent,
              Number(o.priceModifier),
            ),
          }))
          .filter((o): o is { label: string; price: number } => o.price !== null)
      : [];

  const reserved = record?.reserved_stock ?? 0;
  const stockNumber = Number(form.stock);
  const available = Number.isFinite(stockNumber) ? stockNumber - reserved : null;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/admin/products"
        className="inline-block text-sm text-gray-500 hover:text-orange-600"
      >
        ← Products
      </Link>

      <h1 className="mt-2 text-xl font-semibold text-gray-900 sm:text-2xl">
        {isNew ? "Add product" : record?.name}
      </h1>
      {!isNew && (
        <p className="mt-1 text-xs text-gray-500">
          {KIND_LABELS[form.kind]} · {record?.order_count ?? 0}{" "}
          {record?.order_count === 1 ? "order" : "orders"}
        </p>
      )}

      {success && (
        <div
          className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          role="status"
        >
          {success}
        </div>
      )}

      {errors.length > 0 && (
        <div
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          role="alert"
        >
          <ul className="list-disc space-y-1 pl-5">
            {errors.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
        <BasicsCard
          form={form}
          isNew={isNew}
          categoryOptions={categoryOptions}
          setField={setField}
          onNameChange={handleNameChange}
        />
        <PriceStockCard
          form={form}
          isNew={isNew}
          preview={preview}
          optionPrices={optionPrices}
          reserved={reserved}
          available={available}
          setField={setField}
        />
        <ImagesCard
          form={form}
          setField={setField}
          setForm={setForm}
          trackUpload={trackUpload}
        />
        <KindDetailsCard
          form={form}
          setField={setField}
          setForm={setForm}
          trackUpload={trackUpload}
        />
        <HighlightsCard form={form} setField={setField} />
        <VisibilityCard form={form} setField={setField} />

        {!isNew && record && (
          <DeleteProductCard
            orderCount={record.order_count}
            confirmDelete={confirmDelete}
            deleting={deleting}
            onAskDelete={() => setConfirmDelete(true)}
            onCancel={() => setConfirmDelete(false)}
            onConfirm={handleDelete}
          />
        )}

        <div className="sticky bottom-0 -mx-4 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Link
              to="/admin/products"
              className="w-full rounded-full border border-gray-300 bg-white px-5 py-3 text-center text-base font-medium text-gray-700 hover:border-gray-400 sm:w-auto"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || activeUploads > 0}
              className="w-full rounded-full bg-orange-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving
                ? "Saving..."
                : activeUploads > 0
                  ? "Uploading images..."
                  : isNew
                    ? "Create product"
                    : "Save changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
