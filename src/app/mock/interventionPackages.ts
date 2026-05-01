// Mock structure for the "rekomendasi pemulihan" concept.
//
// ✅ This file is intentionally decoupled from API/DB.
// Nanti ketika sudah ada backend, kamu bisa:
// - fetch paket dari API (1 paket = 1 kategori + 1 level), ATAU
// - fetch konten rekomendasi biasa (artikel/video), lalu bundling di frontend.

export type InterventionRiskLevel = 'Sedang' | 'Berat';

export type InterventionContentItem = {
  // Bisa pakai ID konten dari tabel recommendations.
  id: string;
  type: 'Article' | 'Video';
  title: string;
  summary?: string;
  thumbnailUrl?: string;
  link?: string;
};

export type InterventionPackage = {
  // Primary key yang aman untuk bundling: categoryKey + riskLevel.
  // Contoh: "gangguan emosi|berat"
  id: string;

  // Judul Card utama di halaman hasil.
  // Contoh: "Rekomendasi Pemulihan: Regulasi Emosi (Berat)"
  title: string;

  // Badge/tag untuk konteks klinis.
  categoryTag: string; // contoh: "Emosi"
  riskLevel: InterventionRiskLevel;

  // Pesan empati / safety message dari sistem.
  systemMessage: string;

  // Menu pilihan intervensi.
  articles: InterventionContentItem[];
  videos: InterventionContentItem[];
};

// ===== Example Mock Data =====
// Kamu bisa pakai ini untuk testing UI bundling sebelum API siap.
export const MOCK_INTERVENTION_PACKAGES: InterventionPackage[] = [
  {
    id: 'gangguan emosi|berat',
    title: 'Rekomendasi Pemulihan: Regulasi Emosi (Berat)',
    categoryTag: 'Emosi',
    riskLevel: 'Berat',
    systemMessage:
      'Sistem mendeteksi emosimu sedang sangat tertekan. Kamu tidak sendirian—ambil jeda sebentar, tarik napas, dan pilih pemulihan yang paling terasa aman untukmu.',
    articles: [
      {
        id: '101',
        type: 'Article',
        title: 'Langkah Cepat Saat Emosi Memuncak',
        summary: 'Teknik grounding 60 detik untuk menurunkan intensitas emosi.',
        thumbnailUrl: '',
        link: 'https://example.com/article/101',
      },
    ],
    videos: [
      {
        id: '201',
        type: 'Video',
        title: 'Latihan Napas 4-6 untuk Menenangkan',
        summary: 'Panduan video singkat 3 menit.',
        thumbnailUrl: '',
        link: 'https://example.com/video/201',
      },
    ],
  },
  {
    id: 'stres|sedang',
    title: 'Rekomendasi Pemulihan: Manajemen Stres (Sedang)',
    categoryTag: 'Stres',
    riskLevel: 'Sedang',
    systemMessage:
      'Sistem mendeteksi tanda stres yang cukup mengganggu. Pilih satu langkah kecil dulu—konsistensi lebih penting daripada banyak tapi berat.',
    articles: [
      {
        id: '102',
        type: 'Article',
        title: 'Jurnal 5 Menit untuk Meredakan Stres',
        summary: 'Prompt sederhana untuk menata pikiran dan emosi.',
        thumbnailUrl: '',
        link: 'https://example.com/article/102',
      },
    ],
    videos: [],
  },
];
