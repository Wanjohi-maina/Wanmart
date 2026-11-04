import type { Dispatch, SetStateAction } from "react";
import UploadButton from "../UploadButton";
import type { FormState } from "../productForm";
import {
  Field,
  TextList,
  Thumb,
  inputClass,
  removeAt,
  replaceAt,
  smallButton,
  type SetField,
} from "./formUi";

export default function ElectronicsDetails({
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Warranty (months)" htmlFor="warranty">
          <input
            id="warranty"
            type="text"
            inputMode="numeric"
            value={form.warrantyMonths}
            onChange={(e) => setField("warrantyMonths", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Condition" htmlFor="condition">
          <select
            id="condition"
            value={form.condition}
            onChange={(e) =>
              setField("condition", e.target.value as "new" | "used")
            }
            className={inputClass}
          >
            <option value="new">New</option>
            <option value="used">Used</option>
          </select>
        </Field>
      </div>

      <div>
        <p className="mb-1 text-sm font-medium text-gray-700">Colors</p>
        <p className="mb-2 text-xs text-gray-500">
          Each color needs the image shown for it. Upload a photo or paste a
          URL.
        </p>
        <div className="space-y-3">
          {form.colors.map((color, index) => (
            <div
              key={index}
              className="space-y-2 rounded-lg border border-gray-200 p-3"
            >
              <input
                type="text"
                value={color.name}
                onChange={(e) =>
                  setField(
                    "colors",
                    replaceAt(form.colors, index, {
                      ...color,
                      name: e.target.value,
                    }),
                  )
                }
                placeholder="Color name, for example Sage"
                className={inputClass}
              />

              <div className="flex items-center gap-2">
                <Thumb url={color.imageUrl} />
                <input
                  type="text"
                  value={color.imageUrl}
                  onChange={(e) =>
                    setField(
                      "colors",
                      replaceAt(form.colors, index, {
                        ...color,
                        imageUrl: e.target.value,
                      }),
                    )
                  }
                  placeholder="Image URL for this color"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className={inputClass}
                />
              </div>

              <UploadButton
                label="Upload image for this color"
                onBusyChange={trackUpload}
                onUploaded={(urls) =>
                  setForm((current) =>
                    current.colors[index]
                      ? {
                          ...current,
                          colors: replaceAt(current.colors, index, {
                            ...current.colors[index],
                            imageUrl: urls[0],
                          }),
                        }
                      : current,
                  )
                }
              />

              <div>
                <p className="mb-1 text-xs font-medium text-gray-600">
                  More images for this color (optional)
                </p>
                <TextList
                  values={color.gallery}
                  placeholder="Image URL"
                  addLabel="Add image URL"
                  preview
                  onChange={(values) =>
                    setField(
                      "colors",
                      replaceAt(form.colors, index, {
                        ...color,
                        gallery: values,
                      }),
                    )
                  }
                />
                <div className="mt-2">
                  <UploadButton
                    multiple
                    label="Upload images"
                    onBusyChange={trackUpload}
                    onUploaded={(urls) =>
                      setForm((current) =>
                        current.colors[index]
                          ? {
                              ...current,
                              colors: replaceAt(current.colors, index, {
                                ...current.colors[index],
                                gallery: [
                                  ...current.colors[index].gallery.filter(
                                    (v) => v.trim() !== "",
                                  ),
                                  ...urls,
                                ],
                              }),
                            }
                          : current,
                      )
                    }
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setField("colors", removeAt(form.colors, index))}
                className={smallButton}
              >
                Remove color
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setField("colors", [
                ...form.colors,
                { name: "", imageUrl: "", gallery: [] },
              ])
            }
            className="text-sm text-orange-600 hover:underline"
          >
            + Add color
          </button>
        </div>
      </div>

      <div>
        <p className="mb-1 text-sm font-medium text-gray-700">Storage options</p>
        <p className="mb-2 text-xs text-gray-500">
          The price change is added to the base price. Use 0 for the standard
          option, or a single option such as Standard.
        </p>
        <div className="space-y-3">
          {form.storageOptions.map((option, index) => (
            <div
              key={index}
              className="space-y-2 rounded-lg border border-gray-200 p-3"
            >
              <input
                type="text"
                value={option.label}
                onChange={(e) =>
                  setField(
                    "storageOptions",
                    replaceAt(form.storageOptions, index, {
                      ...option,
                      label: e.target.value,
                    }),
                  )
                }
                placeholder="Label, for example 256GB"
                className={inputClass}
              />
              <input
                type="text"
                inputMode="decimal"
                value={option.priceModifier}
                onChange={(e) =>
                  setField(
                    "storageOptions",
                    replaceAt(form.storageOptions, index, {
                      ...option,
                      priceModifier: e.target.value,
                    }),
                  )
                }
                placeholder="Price change in KES"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() =>
                  setField(
                    "storageOptions",
                    removeAt(form.storageOptions, index),
                  )
                }
                className={smallButton}
              >
                Remove option
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setField("storageOptions", [
                ...form.storageOptions,
                { label: "", priceModifier: "0" },
              ])
            }
            className="text-sm text-orange-600 hover:underline"
          >
            + Add storage option
          </button>
        </div>
      </div>
    </>
  );
}
