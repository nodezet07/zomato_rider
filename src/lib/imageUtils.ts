import { isLocalImageUri, isRemoteImageUri } from '@/lib/multipart';

/** True when image is stored on server (http/https/data URL). */
export function hasUploadedImage(value?: string | null): boolean {
  return isRemoteImageUri(value);
}

/** True when user picked a local file not yet uploaded. */
export function hasLocalImage(value?: string | null): boolean {
  return isLocalImageUri(value);
}

export function imageStatusLabel(value?: string | null): 'Uploaded' | 'Selected' | 'Required' {
  if (hasUploadedImage(value)) return 'Uploaded';
  if (hasLocalImage(value)) return 'Selected';
  return 'Required';
}
