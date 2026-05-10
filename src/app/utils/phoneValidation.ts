export type PhoneValidationResult =
  | { ok: true; normalizedPhone: string }
  | { ok: false; message: string };

export const validatePhone11to13Digits = (rawPhone: unknown): PhoneValidationResult => {
  const normalizedPhone = String(rawPhone ?? '').replace(/\s/g, '');

  if (!normalizedPhone.trim()) return { ok: false, message: 'Nomor telepon harus diisi.' };
  if (!/^[0-9]+$/.test(normalizedPhone)) {
    return { ok: false, message: 'Nomor telepon hanya boleh angka.' };
  }
  if (normalizedPhone.length < 11 || normalizedPhone.length > 13) {
    return { ok: false, message: 'Nomor telepon harus 11-13 digit.' };
  }

  return { ok: true, normalizedPhone };
};
