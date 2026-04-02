import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { CircleCheck, TrendingUp, Save, ArrowLeft, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../context/AppContext';

// Definisi interface agar sesuai dengan output calculateFinalCF
interface CFResult {
  category: string;
  score: number;
  percentage: number;
}

interface DiagnosisResultPageProps {
  result: CFResult[]; // Ini adalah hasil array dari calculateFinalCF
  onSave: () => void;
  onNavigate: (page: string) => void;
}

export const DiagnosisResultPage: React.FC<DiagnosisResultPageProps> = ({ result, onSave, onNavigate }) => {
  const { recommendations } = useApp();
  
  if (!result || result.length === 0) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Data Tidak Tersedia</h1>
        <p className="text-gray-500">Hasil diagnosis tidak ditemukan. Silakan coba lagi.</p>
        <Button onClick={() => onNavigate('user-dashboard')} className="mt-4">Kembali ke Beranda</Button>
      </div>
    );
  }

  // 1. Identifikasi Hasil Tertinggi (Dominan)
  const dominant = result[0]; // Karena sudah di-sort descending di fungsi hitung

  // 2. Tentukan Klasifikasi Risiko berdasarkan Tabel 3.4
  const getRiskDetail = (percentage: number) => {
    if (percentage <= 25) return { 
      level: 'Tidak Terindikasi', 
      bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200',
      desc: 'Kondisi stabil, tidak ditemukan gejala signifikan.'
    };
    if (percentage <= 50) return { 
      level: 'Ringan', 
      bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200',
      desc: 'Terdapat indikasi gangguan minor, disarankan monitoring mandiri.'
    };
    if (percentage <= 75) return { 
      level: 'Sedang', 
      bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200',
      desc: 'Gangguan cukup jelas, membutuhkan perhatian atau konseling.'
    };
    return { 
      level: 'Berat', 
      bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200',
      desc: 'Risiko tinggi, sangat disarankan konsultasi ke profesional/psikolog.'
    };
  };

  const overallRisk = getRiskDetail(dominant.percentage);

  const shouldShowRecommendations = overallRisk.level === 'Sedang' || overallRisk.level === 'Berat';
  const matchedRecommendations = shouldShowRecommendations
    ? recommendations.filter(
        (r) => r.category === dominant.category && r.risk_level === overallRisk.level
      )
    : [];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      
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
          {result.map((item, idx) => {
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
                      <div className={`h-full ${risk.bg.replace('100', '500')}`} style={{ width: `${item.percentage}%` }} />
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
            Jika skor menunjukkan tingkat <strong>Sedang</strong> atau <strong>Berat</strong>, kami sangat menyarankan untuk menghubungi:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="bg-white p-3 rounded border border-yellow-100">
              📞 <strong>Hotline 119 Ext 8</strong> (Layanan 24 Jam)
            </div>
            <div className="bg-white p-3 rounded border border-yellow-100">
              📞 <strong>0811-10-500-567</strong> (Whatsapp Kemenkes RI)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* REKOMENDASI (DB) */}
      {shouldShowRecommendations && (
        <Card className="border-2">
          <CardContent className="p-6 space-y-4">
            <h4 className="text-xl font-semibold text-gray-800">Rekomendasi</h4>
            {matchedRecommendations.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada rekomendasi untuk kategori ini.</p>
            ) : (
              <div className="space-y-3">
                {matchedRecommendations.map((rec) => (
                  <div key={rec.id} className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-800">{rec.title}</p>
                    <a className="text-sm text-[#1e3a8a] underline" href={rec.link} target="_blank" rel="noreferrer">
                      Buka {rec.type}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
            onSave();
            toast.success('Hasil berhasil disimpan ke riwayat!');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-8"
        >
          <Save className="w-4 h-4 mr-2" /> Simpan Hasil Diagnosis
        </Button>
      </div>
    </div>
  );
};