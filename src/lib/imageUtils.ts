export function hasUploadedImage(value?: string | null): boolean {
  return Boolean(
    value &&
      (value.startsWith('data:image/') ||
        value.startsWith('http') ||
        value.startsWith('file://') ||
        value.startsWith('content://')),
  );
}