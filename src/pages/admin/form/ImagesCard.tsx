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
      <Field label="Main image URL" htmlFor="image-url">
        <input
          id="image-url"
          type="text"
          value={form.imageUrl}
          onChange={(e) => setField("imageUrl", e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
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
        <img
          key={form.imageUrl}
          src={form.imageUrl}
          alt=""
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          className="h-32 w-32 rounded-md bg-gray-50 object-cover"
        />
      )}

      {form.kind !== "electronics" && (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">
            More images (optional)
          </p>
          <TextList
            values={form.images}
            placeholder="Image URL"
            addLabel="Add image URL"
            preview
            onChange={(values) => setField("images", values)}
          />
          <div className="mt-2">
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
        </div>
      )}
    </Card>
  );
}
