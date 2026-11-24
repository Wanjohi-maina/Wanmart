import type { FormState } from "../productForm";
import {
  Card,
  TextList,
  inputClass,
  removeAt,
  replaceAt,
  smallButton,
  type SetField,
} from "./formUi";

export default function HighlightsCard({
  form,
  setField,
}: {
  form: FormState;
  setField: SetField;
}) {
  return (
    <Card title="Highlights and specifications">
      {/* Highlights */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">Highlights</p>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            Add the main selling points customers should notice.
          </p>
        </div>

        <TextList
          values={form.highlights}
          placeholder="A short selling point"
          addLabel="Add highlight"
          onChange={(values) => setField("highlights", values)}
        />
      </div>

      {/* Specifications */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Specifications
          </p>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            Add product details using a label and its corresponding value.
          </p>
        </div>

        <div className="space-y-3">
          {form.specifications.map((spec, index) => (
            <div
              key={index}
              className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/50 p-4"
            >
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Specification label
                </label>
                <input
                  type="text"
                  value={spec.label}
                  onChange={(e) =>
                    setField(
                      "specifications",
                      replaceAt(form.specifications, index, {
                        ...spec,
                        label: e.target.value,
                      }),
                    )
                  }
                  placeholder="Label, for example Screen size"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Specification value
                </label>
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) =>
                    setField(
                      "specifications",
                      replaceAt(form.specifications, index, {
                        ...spec,
                        value: e.target.value,
                      }),
                    )
                  }
                  placeholder="Value, for example 6.1 inches"
                  className={inputClass}
                />
              </div>

              <div className="flex justify-end border-t border-gray-200 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setField(
                      "specifications",
                      removeAt(form.specifications, index),
                    )
                  }
                  className={smallButton}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setField("specifications", [
                ...form.specifications,
                { label: "", value: "" },
              ])
            }
            className="text-sm font-medium text-orange-600 transition-colors hover:text-orange-700 hover:underline"
          >
            + Add specification
          </button>
        </div>
      </div>
    </Card>
  );
}
