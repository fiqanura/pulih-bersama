export type EmailValidationResult = { ok: true } | { ok: false; message: string };

const COMMON_GLOBAL_TLDS = new Set([
  'com',
  'net',
  'org',
  'edu',
  'gov',
  'mil',
  'info',
  'biz',
  'io',
  'me',
  'co',
  'app',
  'dev',
  'ai',
]);

const COMMON_ID_SUFFIXES = [
  'id',
  'co.id',
  'ac.id',
  'go.id',
  'or.id',
  'sch.id',
  'web.id',
  'my.id',
  'biz.id',
  'net.id',
  'desa.id',
  'ponpes.id',
];

const looksLikeEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email);

const getDomain = (email: string): string => {
  const at = email.lastIndexOf('@');
  if (at < 0) return '';
  return email.slice(at + 1).trim().toLowerCase();
};

const isCommonDomainSuffix = (domain: string): boolean => {
  if (!domain) return false;
  if (domain.includes('..')) return false;

  const normalized = domain.replace(/\.+$/g, '');
  if (!normalized.includes('.')) return false;

  // Common Indonesian domains/suffixes
  for (const suffix of COMMON_ID_SUFFIXES) {
    if (normalized === suffix || normalized.endsWith(`.${suffix}`)) return true;
  }

  // Common global TLDs
  const parts = normalized.split('.').filter(Boolean);
  const tld = parts[parts.length - 1] || '';
  return COMMON_GLOBAL_TLDS.has(tld);
};

export const validateCommonEmailDomain = (rawEmail: unknown): EmailValidationResult => {
  const email = String(rawEmail ?? '').trim();
  if (!email) return { ok: false, message: 'Email harus diisi.' };
  if (!looksLikeEmail(email)) return { ok: false, message: 'Format email belum sesuai.' };

  const domain = getDomain(email);
  if (!isCommonDomainSuffix(domain)) {
    return {
      ok: false,
      message:
        'Domain email tidak umum / tidak valid. Gunakan domain yang umum seperti ".com", ".net", atau domain Indonesia seperti ".co.id".',
    };
  }

  return { ok: true };
};
