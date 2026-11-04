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
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">Highlights</p>
        <TextList
          values={form.highlights}
          placeholder="A short selling point"
          addLabel="Add highlight"
          onChange={(values) => setField("highlights", values)}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">Specifications</p>
        <div className="space-y-3">
          {form.specifications.map((spec, index) => (
            <div
              key={index}
              className="space-y-2 rounded-lg border border-gray-200 p-3"
            >
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
          ))}
          <button
            type="button"
            onClick={() =>
              setField("specifications", [
                ...form.specifications,
                { label: "", value: "" },
              ])
            }
            className="text-sm text-orange-600 hover:underline"
          >
            + Add specification
          </button>
        </div>
      </div>
    </Card>
  );
}
