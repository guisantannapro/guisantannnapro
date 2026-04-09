/**
 * Compresses an image file to a target max size (default 200KB).
 * Uses Canvas API to resize and adjust JPEG quality.
 * Returns a new File with the compressed image.
 */
export async function compressImage(
  file: File,
  maxSizeKB = 200,
  maxWidth = 1200,
  maxHeight = 1200
): Promise<File> {
  // Skip if already small enough
  if (file.size <= maxSizeKB * 1024) return file;

  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  // Scale down if needed
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // Try decreasing quality until under target size
  let quality = 0.82;
  let blob: Blob;
  do {
    blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
    quality -= 0.08;
  } while (blob.size > maxSizeKB * 1024 && quality > 0.3);

  const name = file.name.replace(/\.\w+$/, ".jpg");
  return new File([blob], name, { type: "image/jpeg" });
}
