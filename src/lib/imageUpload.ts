import { supabase } from "./supabaseClient";

const BUCKET = "products";
const FOLDER = "uploads";
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SOURCE_BYTES = 15 * 1024 * 1024;
const MAX_DIMENSION = 1200; // pixels on the longest side
const WEBP_QUALITY = 0.8;
const JPEG_QUALITY = 0.85;

function toBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function prepareImage(
  file: File,
): Promise<{ blob: Blob; extension: string }> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error(`${file.name} is not a JPEG, PNG or WebP image.`);
  }

  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error(`${file.name} is larger than 15 MB.`);
  }

  let bitmap: ImageBitmap;

  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(`${file.name} could not be read as an image.`);
  }

  try {
    const scale = Math.min(
      1,
      MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
    );
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser cannot process images.");

    context.drawImage(bitmap, 0, 0, width, height);

    let blob = await toBlob(canvas, "image/webp", WEBP_QUALITY);
    let extension = "webp";

    // Some browsers cannot make WebP and return PNG instead. Use JPEG then, with white behind any transparent areas.
    if (!blob || blob.type !== "image/webp") {
      context.globalCompositeOperation = "destination-over";
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      blob = await toBlob(canvas, "image/jpeg", JPEG_QUALITY);
      extension = "jpg";
    }

    if (!blob) throw new Error(`${file.name} could not be converted.`);

    return { blob, extension };
  } finally {
    bitmap.close();
  }
}

// Resizes an image, uploads it and returns its public URL.
export async function uploadProductImage(file: File): Promise<string> {
  const { blob, extension } = await prepareImage(file);
  const path = `${FOLDER}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: blob.type,
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) throw new Error(error.message);

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}