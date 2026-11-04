import type { Dispatch, SetStateAction } from "react";
import { KIND_LABELS, type FormState } from "../productForm";
import ElectronicsDetails from "./ElectronicsDetails";
import {
  Card,
  CheckField,
  Field,
  inputClass,
  type SetField,
} from "./formUi";

export default function KindDetailsCard({
  form,
  setField,
  setForm,
  trackUpload,
}: {
  form: FormState;
  setField: SetField;
  setForm: Dispatch<SetStateAction<FormState>>;
  trackUpload: (busy: boolean) => void;
}) {
  return (
    <Card title={`${KIND_LABELS[form.kind]} details`}>
      {form.kind === "electronics" && (
        <ElectronicsDetails
          form={form}
          setField={setField}
          setForm={setForm}
          trackUpload={trackUpload}
        />
      )}

      {form.kind === "clothing" && (
        <>
          <Field
            label="Sizes"
            htmlFor="sizes"
            hint="Separate sizes with commas, for example S, M, L."
          >
            <input
              id="sizes"
              type="text"
              value={form.sizes}
              onChange={(e) => setField("sizes", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Material" htmlFor="material">
            <input
              id="material"
              type="text"
              value={form.material}
              onChange={(e) => setField("material", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Color" htmlFor="color">
            <input
              id="color"
              type="text"
              value={form.color}
              onChange={(e) => setField("color", e.target.value)}
              className={inputClass}
            />
          </Field>
        </>
      )}

      {form.kind === "sneakers" && (
        <>
          <Field label="Brand" htmlFor="brand">
            <input
              id="brand"
              type="text"
              value={form.brand}
              onChange={(e) => setField("brand", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field
            label="Sizes"
            htmlFor="sizes"
            hint="Separate sizes with commas, for example 40, 41, 42."
          >
            <input
              id="sizes"
              type="text"
              value={form.sizes}
              onChange={(e) => setField("sizes", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Color" htmlFor="color">
            <input
              id="color"
              type="text"
              value={form.color}
              onChange={(e) => setField("color", e.target.value)}
              className={inputClass}
            />
          </Field>
        </>
      )}

      {form.kind === "watches" && (
        <>
          <Field label="Brand" htmlFor="brand">
            <input
              id="brand"
              type="text"
              value={form.brand}
              onChange={(e) => setField("brand", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Movement" htmlFor="movement">
            <select
              id="movement"
              value={form.movement}
              onChange={(e) =>
                setField("movement", e.target.value as FormState["movement"])
              }
              className={inputClass}
            >
              <option value="quartz">Quartz</option>
              <option value="automatic">Automatic</option>
              <option value="digital">Digital</option>
            </select>
          </Field>
          <CheckField
            label="Water resistant"
            checked={form.waterResistant}
            onChange={(value) => setField("waterResistant", value)}
          />
        </>
      )}

      {form.kind === "accessory" && (
        <>
          <Field label="Material" htmlFor="material">
            <input
              id="material"
              type="text"
              value={form.material}
              onChange={(e) => setField("material", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Color" htmlFor="color">
            <input
              id="color"
              type="text"
              value={form.color}
              onChange={(e) => setField("color", e.target.value)}
              className={inputClass}
            />
          </Field>
        </>
      )}

      {form.kind === "perfume" && (
        <>
          <Field label="Brand" htmlFor="brand">
            <input
              id="brand"
              type="text"
              value={form.brand}
              onChange={(e) => setField("brand", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Volume (ml)" htmlFor="volume">
            <input
              id="volume"
              type="text"
              inputMode="decimal"
              value={form.volumeMl}
              onChange={(e) => setField("volumeMl", e.target.value)}
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Concentration" htmlFor="concentration">
              <select
                id="concentration"
                value={form.concentration}
                onChange={(e) =>
                  setField(
                    "concentration",
                    e.target.value as FormState["concentration"],
                  )
                }
                className={inputClass}
              >
                <option value="EDT">EDT</option>
                <option value="EDP">EDP</option>
                <option value="Parfum">Parfum</option>
              </select>
            </Field>
            <Field label="Gender" htmlFor="gender">
              <select
                id="gender"
                value={form.gender}
                onChange={(e) =>
                  setField("gender", e.target.value as FormState["gender"])
                }
                className={inputClass}
              >
                <option value="men's">Men's</option>
                <option value="women's">Women's</option>
                <option value="unisex">Unisex</option>
              </select>
            </Field>
          </div>
        </>
      )}
    </Card>
  );
}
