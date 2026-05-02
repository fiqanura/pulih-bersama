import { useEffect, useMemo, useState } from 'react';
import { BASE_URL } from '../utils/apiConfig';

export type InterventionRiskLevel = 'Sedang' | 'Berat';

export type InterventionContentItem = {
  id: string;
  title: string;
  type: 'Article' | 'Video';
  category: string;
  risk_level: InterventionRiskLevel;
  summary: string;
  thumbnail_url: string;
  link: string;
};

export type InterventionPackage = {
  id: string;
  title: string;
  categoryTag: string;
  riskLevel: InterventionRiskLevel;
  systemMessage: string;
  articles: InterventionContentItem[];
  videos: InterventionContentItem[];
};

export type CfResultLike = { category: string; percentage: number };

type Options = {
  enabled?: boolean;
  baseUrl?: string;
};

const DEFAULT_BASE_URL = BASE_URL;

const toAbsoluteBackendUrl = (raw: unknown, baseUrl: string): string => {
  let url = String(raw ?? '').trim();
  if (!url) return '';

  url = url.replace(/\\/g, '/');
  if (/^(data:|blob:)/i.test(url)) return url;

  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);
      const isLocalHost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
      const isMissingBackendPort = !parsed.port || parsed.port === '80';
      const looksLikeStorage = parsed.pathname.startsWith('/storage/') || parsed.pathname.startsWith('/uploads/');
      if (isLocalHost && isMissingBackendPort && looksLikeStorage) {
        return `${baseUrl}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch {
      // ignore
    }
    return url;
  }

  if (url.startsWith('//')) return `http:${url}`;
  if (url.startsWith('public/storage/')) url = url.replace(/^public\//, '');
  if (url.startsWith('storage/')) return `${baseUrl}/${url}`;
  if (url.startsWith('/storage/')) return `${baseUrl}${url}`;
  if (url.startsWith('/')) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
};

export function useInterventionPackages(results: CfResultLike[], options?: Options) {
  const enabled = options?.enabled ?? true;
  const baseUrl = options?.baseUrl ?? DEFAULT_BASE_URL;

  const normalizedResults = (Array.isArray(results) ? results : [])
    .filter((r) => r && typeof r === 'object')
    .map((r) => ({
      category: String((r as any).category ?? '').trim(),
      percentage: Number((r as any).percentage ?? 0),
    }))
    .filter((r) => r.category);

  // Stable dependency for effects even if callers pass a new array instance each render.
  // (React compares deps by value for primitives; identical strings won't retrigger effects.)
  const payloadKey = normalizedResults.map((r) => `${r.category}|${r.percentage}`).join(';;');

  const payload = useMemo(() => {
    return { results: normalizedResults };
  }, [payloadKey]);

  const [packages, setPackages] = useState<InterventionPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setPackages((prev) => (prev.length ? [] : prev));
      setLoading((prev) => (prev ? false : prev));
      setError((prev) => (prev ? null : prev));
      return;
    }

    if (!payload.results.length) {
      setPackages((prev) => (prev.length ? [] : prev));
      setLoading((prev) => (prev ? false : prev));
      setError((prev) => (prev ? null : prev));
      return;
    }

    const controller = new AbortController();

    const coerceRisk = (raw: unknown): InterventionRiskLevel => {
      const s = String(raw ?? '').toLowerCase().trim();
      return s === 'berat' ? 'Berat' : 'Sedang';
    };

    const coerceType = (raw: unknown): 'Article' | 'Video' => {
      const s = String(raw ?? '').toLowerCase().trim();
      return s === 'video' ? 'Video' : 'Article';
    };

    const normalizeRec = (rec: any): InterventionContentItem | null => {
      const id = String(rec?.id ?? '').trim();
      const title = String(rec?.title ?? '').trim();
      const category = String(rec?.category ?? '').trim();
      if (!id || !title || !category) return null;

      return {
        id,
        title,
        type: coerceType(rec?.type),
        category,
        risk_level: coerceRisk(rec?.risk_level),
        summary: String(rec?.summary ?? ''),
        thumbnail_url: toAbsoluteBackendUrl(rec?.thumbnail_url ?? '', baseUrl),
        link: String(rec?.link ?? ''),
      };
    };

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${baseUrl}/api/intervention-packages`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!res.ok) {
          let msg = `Gagal mengambil paket (HTTP ${res.status})`;
          const contentType = res.headers.get('content-type') ?? '';
          try {
            if (contentType.includes('application/json')) {
              const err = await res.json();
              const firstKey = err?.errors && typeof err.errors === 'object' ? Object.keys(err.errors)[0] : null;
              const firstVal = firstKey ? err.errors[firstKey] : null;
              const firstMsg = Array.isArray(firstVal)
                ? firstVal[0]
                : typeof firstVal === 'string'
                  ? firstVal
                  : null;
              if (typeof firstMsg === 'string' && firstMsg.trim()) msg = firstMsg;
              else if (typeof err?.message === 'string' && err.message.trim()) msg = err.message;
            } else {
              const text = (await res.text()).trim();
              if (text) msg = `${msg}: ${text.slice(0, 200)}`;
            }
          } catch {
            // ignore
          }
          throw new Error(msg);
        }

        const data = await res.json();
        const rawPackages = Array.isArray(data?.packages) ? data.packages : [];

        const normalized: InterventionPackage[] = rawPackages
          .map((p: any) => {
            const id = String(p?.id ?? '').trim();
            const title = String(p?.package_name ?? p?.packageName ?? p?.title ?? '').trim();
            const categoryTag = String(p?.category_tag ?? p?.categoryTag ?? '').trim();
            const systemMessage = String(p?.system_message ?? p?.systemMessage ?? '').trim();
            if (!id || !title) return null;

            const articles = Array.isArray(p?.articles)
              ? (p.articles.map(normalizeRec).filter(Boolean) as InterventionContentItem[])
              : [];
            const videos = Array.isArray(p?.videos)
              ? (p.videos.map(normalizeRec).filter(Boolean) as InterventionContentItem[])
              : [];

            return {
              id,
              title,
              categoryTag: categoryTag || 'Pemulihan',
              riskLevel: coerceRisk(p?.risk_level ?? p?.riskLevel),
              systemMessage,
              articles,
              videos,
            } satisfies InterventionPackage;
          })
          .filter(Boolean) as InterventionPackage[];

        setPackages(normalized);
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setPackages([]);
        setError(String(e?.message ?? 'Gagal memuat rekomendasi pemulihan.'));
      } finally {
        setLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [baseUrl, enabled, payloadKey]);

  return { packages, loading, error };
}
