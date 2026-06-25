import { Platform } from 'react-native';

/** React Native file part for FormData.append — not a web Blob. */
export type RNFilePart = {
  uri: string;
  name: string;
  type: string;
};

export function isRNFormData(body: unknown): body is FormData {
  return (
    body != null &&
    typeof body === 'object' &&
    typeof (body as FormData).append === 'function' &&
    typeof (body as { getParts?: () => unknown[] }).getParts === 'function'
  );
}

export function isLocalImageUri(value?: string | null): boolean {
  if (!value) return false;
  return value.startsWith('file://') || value.startsWith('content://');
}

export function isRemoteImageUri(value?: string | null): boolean {
  if (!value) return false;
  return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:image/');
}

export function guessMimeType(uri: string): string {
  const lower = uri.split('?')[0].toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.heic')) return 'image/heic';
  return 'image/jpeg';
}

/** Build a file object accepted by React Native networking FormData. */
export function toUploadFile(uri: string, name: string, mimeType?: string): RNFilePart {
  let normalized = uri;
  if (Platform.OS === 'android' && normalized.startsWith('file://') === false && !normalized.startsWith('content://')) {
    normalized = `file://${normalized}`;
  }

  const type = mimeType ?? guessMimeType(uri);
  const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg';
  const baseName = name.replace(/\.[^.]+$/, '') || name;
  const fileName = `${baseName}.${ext}`;

  const part: RNFilePart = {
    uri: normalized,
    name: fileName,
    type,
  };

  if (__DEV__) {
    console.log('[multipart] file part', { name: part.name, type: part.type, uri: part.uri.slice(0, 100) });
  }

  return part;
}

export function logFormDataParts(formData: FormData, label: string) {
  if (!__DEV__) return;
  try {
    const getParts = (formData as { getParts?: () => { fieldName: string; string?: string; uri?: string }[] })
      .getParts;
    if (!getParts) {
      console.warn(`[multipart] ${label}: FormData has no getParts() — unsupported implementation`);
      return;
    }
    // Must call on formData instance — detached call loses `this._parts`.
    const parts = getParts.call(formData).map((p) => ({
      field: p.fieldName,
      kind: p.string != null ? 'text' : 'file',
      preview: p.string ?? p.uri?.slice(0, 80),
    }));
    console.log(`[multipart] ${label}`, parts);
  } catch (e) {
    console.warn(`[multipart] ${label}: could not read FormData parts`, e);
  }
}
