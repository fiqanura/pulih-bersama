import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useApp, DiagnosisResult } from '../../context/AppContext';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { Clock, Calendar, Eye, TrendingUp } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { RecommendationList } from '../../components/intervention/RecommendationList';
import { BundleModal } from '../../components/intervention/BundleModal';
import { useInterventionPackages } from '../../hooks/useInterventionPackages';

interface HistoryPageProps {
  onNavigate: (page: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate }) => {
  const { currentUser, diagnosisResults, fetchDiagnosisResults } = useApp();
  const [selectedResult, setSelectedResult] = useState<DiagnosisResult | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  const { packages: interventionPackages, loading: isLoadingPackages, error: packagesError } = useInterventionPackages(
    selectedResult?.results ?? [],
    { enabled: Boolean(selectedResult) }
  );

  useEffect(() => {
    if (!currentUser?.id) return;
    setIsLoadingHistory(true);
    fetchDiagnosisResults(currentUser.id)
      .catch(() => {
        // errors are already logged/toasted elsewhere when needed
      })
      .finally(() => setIsLoadingHistory(false));
  }, [currentUser?.id]);

  useEffect(() => {
    // Restore the previous detailed view (and package modal) after navigating back from a detail page.
    const raw = sessionStorage.getItem('pb:returnState');
    if (!raw) return;
    let parsed: any = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }

    if (!parsed || parsed.page !== 'history') return;
    if (!currentUser?.id) return;

    const contextId = String(parsed.contextId ?? '').trim();
    const packageId = String(parsed.packageId ?? '').trim();
    if (!contextId) {
      sessionStorage.removeItem('pb:returnState');
      return;
    }

    const found = diagnosisResults.find((r) => String(r.id) === contextId && r.userId === currentUser.id);
    if (!found) return; // wait for results to load

    setSelectedResult(found);
    setSelectedPackageId(packageId || null);
    sessionStorage.removeItem('pb:returnState');
  }, [currentUser?.id, diagnosisResults]);

  const userResults = diagnosisResults
    .filter(r => r.userId === currentUser?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Tidak Terindikasi':
        return { bg: 'bg-green-100', text: 'text-green-700' };
      case 'Ringan':
        return { bg: 'bg-[#86efac]', text: 'text-[#166534]' };
      case 'Sedang':
        return { bg: 'bg-[#fde68a]', text: 'text-[#854d0e]' };
      case 'Berat':
        return { bg: 'bg-[#fca5a5]', text: 'text-[#991b1b]' };
      default:
        return { bg: 'bg-gray-200', text: 'text-gray-700' };
    }
  };

  if (selectedResult) {
    const selectedPackage = interventionPackages.find((p) => p.id === selectedPackageId) ?? null;

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => {
            setSelectedPackageId(null);
            setSelectedResult(null);
          }}
          className="text-[#1e3a8a] hover:text-[#93c5fd]"
        >
          ← Kembali ke Riwayat
        </Button>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">Detail Diagnosis</h1>
          <p className="text-gray-600">
            {new Date(selectedResult.date).toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        <Card className={`border-4 ${getRiskColor(selectedResult.overallRisk).bg}`}>
          <CardContent className="p-6 sm:p-8 text-center space-y-4">
            <div className={`inline-block px-6 py-3 rounded-full text-xl ${getRiskColor(selectedResult.overallRisk).bg} ${getRiskColor(selectedResult.overallRisk).text}`}>
              Tingkat Risiko: <strong>{selectedResult.overallRisk}</strong>
            </div>
            <p className="text-gray-700">
              Kategori Dominan: <strong>{selectedResult.dominantCategory}</strong>
            </p>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Hasil per Kategori</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedResult.results.map((item, idx) => {
              const risk = item.percentage <= 33 ? 'Tidak Terindikasi' : item.percentage <= 60 ? 'Ringan' : item.percentage <= 82 ? 'Sedang' : 'Berat';
              const colors = getRiskColor(risk);
              return (
                <Card key={idx} className="border-2">
                  <CardContent className="p-6 flex items-center justify-between gap-4">
                    <span className="text-gray-700">{item.category}</span>
                    <div className={`px-4 py-2 rounded-lg text-right ${colors.bg} ${colors.text}`}>
                      <div className="font-semibold">{item.percentage}%</div>
                      <div className="text-xs leading-tight">{risk}</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Card className="border-2">
          <CardContent className="p-6 sm:p-8 space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Rekomendasi Pemulihan</h3>
            <div>
              <RecommendationList
                packages={interventionPackages}
                loading={isLoadingPackages}
                error={packagesError}
                onOpenPackage={setSelectedPackageId}
              />
            </div>
          </CardContent>
        </Card>

        <BundleModal
          selectedPackage={selectedPackage}
          onClose={() => setSelectedPackageId(null)}
          onNavigate={onNavigate}
          from={`history:${selectedResult.id}`}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Riwayat Diagnosis</h1>
        <p className="text-gray-600">Lihat kembali hasil tes kesehatan mental yang pernah kamu lakukan</p>
      </div>

      {isLoadingHistory ? (
        <Card className="border-2">
          <CardContent className="p-16 text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#93c5fd]/20 to-[#ddd6fe]/20 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700">Memuat Riwayat...</h3>
            <p className="text-gray-500 max-w-md mx-auto">Sedang mengambil data riwayat diagnosis dari database.</p>
          </CardContent>
        </Card>
      ) : userResults.length === 0 ? (
        <Card className="border-2">
          <CardContent className="p-16 text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#93c5fd]/20 to-[#ddd6fe]/20 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700">Belum Ada Riwayat</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Kamu belum pernah melakukan tes diagnosis. Mulai sekarang untuk memahami kondisi kesehatan mentalmu.
            </p>
            <Button
              onClick={() => onNavigate('diagnosis')}
              className="bg-gradient-to-r from-[#93c5fd] to-[#ddd6fe] text-[#1e3a8a] hover:opacity-90"
            >
              Mulai Tes Sekarang
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {userResults.map((result) => {
            const colors = getRiskColor(result.overallRisk);
            return (
              <Card key={result.id} className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">
                          {new Date(result.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">
                          Kategori Dominan: <strong>{result.dominantCategory}</strong>
                        </span>
                      </div>
                      <div className={`inline-block px-4 py-2 rounded-lg ${colors.bg} ${colors.text}`}>
                        {result.overallRisk}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedPackageId(null);
                        setSelectedResult(result);
                      }}
                      className="border-2 border-[#93c5fd] text-[#1e3a8a] hover:bg-[#93c5fd]/10"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Lihat Detail
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
