import { useRef, useState } from "react";
import { uploadProductImage } from "../../lib/imageUpload";

type Props = {
  onUploaded: (urls: string[]) => void;
  onBusyChange?: (busy: boolean) => void;
  multiple?: boolean;
  label?: string;
};

export default function UploadButton({
  onUploaded,
  onBusyChange,
  multiple = false,
  label = "Upload image",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    const urls: string[] = [];
    const failures: string[] = [];

    setErrorMessage(null);
    onBusyChange?.(true);

    for (let i = 0; i < files.length; i++) {
      setProgress(
        files.length > 1
          ? `Uploading ${i + 1} of ${files.length}...`
          : "Uploading...",
      );

      try {
        urls.push(await uploadProductImage(files[i]));
      } catch (error) {
        failures.push(error instanceof Error ? error.message : "Upload failed.");
      }
    }

    setProgress(null);
    onBusyChange?.(false);

    if (urls.length > 0) onUploaded(urls);
    if (failures.length > 0) setErrorMessage(failures.join(" "));

    // Allow choosing the same file again.
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <button
        type="button"
        disabled={progress !== null}
        onClick={() => inputRef.current?.click()}
        className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {progress ?? label}
      </button>

      {errorMessage && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}