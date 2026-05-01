import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { CircleCheck, TrendingUp, Save, ArrowLeft, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { RecommendationList } from '../../components/intervention/RecommendationList';
import { BundleModal } from '../../components/intervention/BundleModal';
import { useInterventionPackages } from '../../hooks/useInterventionPackages';

// Definisi interface agar sesuai dengan output calculateFinalCF
interface CFResult {
  category: string;
  score: number;
  percentage: number;
}

interface DiagnosisResultPageProps {
  result: CFResult[]; // Ini adalah hasil array dari calculateFinalCF
  onSave: () => void | Promise<void>;
  onNavigate: (page: string) => void;
}

export const DiagnosisResultPage: React.FC<DiagnosisResultPageProps> = ({ result, onSave, onNavigate }) => {
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  
  const safeResult = Array.isArray(result) ? result : [];

  // 1. Identifikasi Hasil Tertinggi (Dominan)
  const dominant = safeResult[0]; // Karena sudah di-sort descending di fungsi hitung

  // 2. Tentukan Klasifikasi Risiko berdasarkan Tabel 3.4
  const getRiskDetail = (percentage: number) => {
    if (percentage <= 33) return { 
      level: 'Tidak Terindikasi', 
      bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200',
      bar: 'bg-green-500',
      desc: 'Kondisi stabil, tidak ditemukan gejala signifikan.'
    };
    if (percentage <= 60) return { 
      level: 'Ringan', 
      bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200',
      bar: 'bg-blue-500',
      desc: 'Terdapat indikasi gangguan minor, disarankan monitoring mandiri.'
    };
    if (percentage <= 82) return { 
      level: 'Sedang', 
      bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200',
      bar: 'bg-yellow-500',
      desc: 'Gangguan cukup jelas, membutuhkan perhatian atau konseling.'
    };
    return { 
      level: 'Berat', 
      bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200',
      bar: 'bg-red-500',
      desc: 'Risiko tinggi, sangat disarankan konsultasi ke profesional/psikolog.'
    };
  };

  const overallRisk = dominant ? getRiskDetail(dominant.percentage) : getRiskDetail(0);

  const adminSystemWhatsAppNumber = '6282131704701';
  const adminSystemWhatsAppUrl = `https://wa.me/${adminSystemWhatsAppNumber}?text=${encodeURIComponent(
    'Halo Admin Sistem, saya membutuhkan bantuan/dukungan terkait hasil diagnosis di aplikasi Pulih Bersama.'
  )}`;

  // Tampilkan rekomendasi untuk SEMUA kategori yang masuk level Sedang/Berat,
  // supaya konten dari DB tetap muncul meskipun kategori dominan tidak punya rekomendasi.
  const categoriesNeedingRecs = safeResult
    .map((item) => ({ item, risk: getRiskDetail(item.percentage).level }))
    .filter(({ risk }) => risk === 'Sedang' || risk === 'Berat');

  const shouldShowRecommendations = categoriesNeedingRecs.length > 0;
  const shouldShowAdminWhatsAppButton = categoriesNeedingRecs.length > 0;

  const { packages: interventionPackages, loading: isLoadingPackages, error: packagesError } = useInterventionPackages(
    safeResult,
    { enabled: safeResult.length > 0 }
  );

  const selectedPackage = interventionPackages.find((p) => p.id === selectedPackageId) ?? null;

  if (!safeResult.length) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Data Tidak Tersedia</h1>
        <p className="text-gray-500">Hasil diagnosis tidak ditemukan. Silakan coba lagi.</p>
        <Button onClick={() => onNavigate('user-dashboard')} className="mt-4">Kembali ke Beranda</Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shadow-lg">
          <CircleCheck className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Analisis Kesehatan Mental</h1>
        <p className="text-gray-500">Berdasarkan metode Certainty Factor (CF)</p>
      </div>

      {/* HASIL UTAMA (RISIKO TERTINGGI) */}
      <Card className={`border-l-8 ${overallRisk.border} shadow-xl overflow-hidden`}>
        <CardContent className="p-0">
          <div className={`${overallRisk.bg} p-8 text-center space-y-4`}>
            <p className={`text-sm font-bold uppercase tracking-widest ${overallRisk.text}`}>Hasil Diagnosis Utama</p>
            <h2 className={`text-4xl font-black ${overallRisk.text}`}>{dominant.category}</h2>
            <div className="flex justify-center items-baseline gap-1">
              <span className="text-5xl font-bold">{dominant.percentage}</span>
              <span className="text-xl font-medium">% Tingkat Keyakinan</span>
            </div>
          </div>
          <div className="p-6 bg-white border-t text-center">
             <div className={`inline-block px-4 py-1 rounded-full border ${overallRisk.border} ${overallRisk.text} font-bold mb-3`}>
                Status: {overallRisk.level}
             </div>
             <p className="text-gray-600 italic">"{overallRisk.desc}"</p>
          </div>
        </CardContent>
      </Card>

      {/* RINCIAN PER KATEGORI */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="text-blue-500" /> Rincian Skor Per Kategori
        </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safeResult.map((item, idx) => {
            const risk = getRiskDetail(item.percentage);
            return (
              <Card key={idx} className={`transition-all hover:shadow-md ${idx === 0 ? 'ring-2 ring-blue-400' : ''}`}>
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-700">{item.category}</p>
                    <p className={`text-xs font-bold ${risk.text}`}>{risk.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800">{item.percentage}%</p>
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div className={`h-full ${risk.bar}`} style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CATATAN PENTING & KONTAK */}
      <Card className="border-2 border-yellow-200 bg-yellow-50/30">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-yellow-700">
            <AlertTriangle className="w-5 h-5" />
            <h4 className="font-bold italic">Peringatan Penting</h4>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            Hasil ini didasarkan pada perhitungan algoritma sistem "Pulih Bersama" dan bukan pengganti diagnosa medis profesional.
            <br />
            Jika skor menunjukkan tingkat <strong>Sedang</strong> atau <strong>Berat</strong>, kami sangat menyarankan Anda untuk menjangkau bantuan profesional.
            <br />
            <br />
            Silakan hubungi Admin Sistem di bawah ini untuk mendapatkan panduan atau informasi kontak psikolog terdekat.
          </p>

          {shouldShowAdminWhatsAppButton && (
            <div className="pt-2">
              <Button asChild className="w-full sm:w-auto">
                <a href={adminSystemWhatsAppUrl} target="_blank" rel="noreferrer">
                  Hubungi WhatsApp Admin Sistem
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* REKOMENDASI (DB) */}
      {shouldShowRecommendations && (
        <Card className="border-2">
          <CardContent className="p-6 space-y-4">
            <h4 className="text-xl font-semibold text-gray-800">Rekomendasi Pemulihan</h4>
            <RecommendationList
              packages={interventionPackages}
              loading={isLoadingPackages}
              error={packagesError}
              onOpenPackage={setSelectedPackageId}
            />
          </CardContent>
        </Card>
      )}

      <BundleModal
        selectedPackage={selectedPackage}
        onClose={() => setSelectedPackageId(null)}
        onNavigate={onNavigate}
        from="diagnosis-result"
      />

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
        <Button
          variant="outline"
          onClick={() => onNavigate('user-dashboard')}
          className="border-2 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Beranda
        </Button>
        <Button
          onClick={() => {
            Promise.resolve(onSave()).catch(() => {
              // ignore: navigation/refresh failures are non-fatal here
            });
            toast.success('Hasil sudah tersimpan otomatis ke riwayat.');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-8"
        >
          <Save className="w-4 h-4 mr-2" /> Simpan Hasil Diagnosis
        </Button>
      </div>
    </div>
  );
};