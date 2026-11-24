import type { Dispatch, SetStateAction } from "react";
import UploadButton from "../UploadButton";
import type { FormState } from "../productForm";
import { Card, Field, TextList, inputClass, type SetField } from "./formUi";

export default function ImagesCard({
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
    <Card
      title="Images"
      hint="Upload photos or paste image URLs. Uploads are resized automatically."
    >
      {/* Main image */}
      <div className="space-y-3">
        <Field label="Main image URL" htmlFor="image-url">
          <input
            id="image-url"
            type="text"
            value={form.imageUrl}
            onChange={(e) => setField("imageUrl", e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Paste the main image URL"
            className={inputClass}
          />
        </Field>

        <UploadButton
          label="Upload main image"
          onBusyChange={trackUpload}
          onUploaded={(urls) =>
            setForm((current) => ({ ...current, imageUrl: urls[0] }))
          }
        />

        {form.imageUrl.trim() !== "" && (
          <div className="inline-flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50/50 p-3">
            <p className="text-xs font-medium text-gray-600">Image preview</p>
            <img
              key={form.imageUrl}
              src={form.imageUrl}
              alt=""
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
              className="h-36 w-36 rounded-lg border border-gray-200 bg-white object-cover"
            />
          </div>
        )}
      </div>

      {/* Additional images */}
      {form.kind !== "electronics" && (
        <div className="space-y-3 border-t border-gray-200 pt-5">
          <div>
            <p className="text-sm font-semibold text-gray-800">
              More images
              <span className="ml-1.5 text-xs font-normal text-gray-400">
                (Optional)
              </span>
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Add additional product photos to give customers a better view of
              the item.
            </p>
          </div>

          <TextList
            values={form.images}
            placeholder="Image URL"
            addLabel="Add image URL"
            preview
            onChange={(values) => setField("images", values)}
          />

          <UploadButton
            multiple
            label="Upload images"
            onBusyChange={trackUpload}
            onUploaded={(urls) =>
              setForm((current) => ({
                ...current,
                images: [
                  ...current.images.filter((v) => v.trim() !== ""),
                  ...urls,
                ],
              }))
            }
          />
        </div>
      )}
    </Card>
  );
}
