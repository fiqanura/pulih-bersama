import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useApp } from '../../context/AppContext';
import { FileText, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import { RecommendationList } from '../../components/intervention/RecommendationList';
import { BundleModal } from '../../components/intervention/BundleModal';
import { useInterventionPackages } from '../../hooks/useInterventionPackages';

interface UserDashboardPageProps {
  onNavigate: (page: string) => void;
}

export const UserDashboardPage: React.FC<UserDashboardPageProps> = ({ onNavigate }) => {
  const { currentUser, diagnosisResults, fetchDiagnosisResults } = useApp();
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.id) return;
    fetchDiagnosisResults(currentUser.id).catch(() => {
      // errors (if any) are handled/toasted elsewhere when needed
    });
  }, [currentUser?.id]);
  
  const userResults = diagnosisResults.filter(r => r.userId === currentUser?.id);
  const latestResult = userResults[userResults.length - 1];

  const latestCfResults = latestResult?.results ?? [];

  const getRiskFromPercentage = (percentage: number) => {
    if (percentage <= 33) return 'Tidak Terindikasi';
    if (percentage <= 60) return 'Ringan';
    if (percentage <= 82) return 'Sedang';
    return 'Berat';
  };

  const shouldShowPackages = latestCfResults.some((r) => {
    const risk = getRiskFromPercentage(Number(r?.percentage ?? 0));
    return risk === 'Sedang' || risk === 'Berat';
  });

  const { packages: interventionPackages, loading: isLoadingPackages, error: packagesError } = useInterventionPackages(
    latestCfResults,
    { enabled: Boolean(latestResult) && shouldShowPackages }
  );

  const selectedPackage = interventionPackages.find((p) => p.id === selectedPackageId) ?? null;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Tidak Terindikasi':
        return 'bg-green-100 text-green-700';
      case 'Ringan':
        return 'bg-[#86efac] text-[#166534]';
      case 'Sedang':
        return 'bg-[#fde68a] text-[#854d0e]';
      case 'Berat':
        return 'bg-[#fca5a5] text-[#991b1b]';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Halo, {currentUser?.name}! 👋
        </h1>
        <p className="text-gray-600">
          Selamat datang. Bagaimana perasaanmu hari ini?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#93c5fd] to-[#ddd6fe] rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              {latestResult && (
                <span className={`px-3 py-1 rounded-full text-xs ${getRiskColor(latestResult.overallRisk)}`}>
                  {latestResult.overallRisk}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Diagnosis Terbaru</h3>
            {latestResult ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  {new Date(latestResult.date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-sm text-gray-600">
                  Kategori Dominan: <strong>{latestResult.dominantCategory}</strong>
                </p>
                <Button
                  variant="ghost"
                  onClick={() => onNavigate('history')}
                  className="text-[#1e3a8a] hover:text-[#93c5fd] p-0 h-auto mt-2"
                >
                  Lihat Detail →
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Belum ada diagnosis</p>
                <Button
                  variant="ghost"
                  onClick={() => onNavigate('diagnosis')}
                  className="text-[#1e3a8a] hover:text-[#93c5fd] p-0 h-auto"
                >
                  Mulai Sekarang →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#86efac] to-[#93c5fd] rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#1e3a8a]">{userResults.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Riwayat Tes</h3>
            <p className="text-sm text-gray-600 mb-4">
              {userResults.length === 0
                ? 'Belum ada riwayat tes'
                : `Kamu telah melakukan ${userResults.length} kali tes`}
            </p>
            <Button
              variant="ghost"
              onClick={() => onNavigate('history')}
              className="text-[#1e3a8a] hover:text-[#93c5fd] p-0 h-auto"
            >
              Lihat Semua →
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="border-2 bg-gradient-to-br from-[#93c5fd]/10 to-[#ddd6fe]/10">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#93c5fd] to-[#ddd6fe] rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  Mulai Tes Kesehatan Mental
                </h3>
                <p className="text-gray-600">
                  Pahami kondisi mentalmu dengan kuesioner yang telah dirancang khusus
                </p>
              </div>
            </div>
            <Button id="tour-start-test-btn" onClick={() => onNavigate('diagnosis')}
              className="bg-gradient-to-r from-[#93c5fd] to-[#ddd6fe] text-[#1e3a8a] hover:opacity-90 px-6 flex-shrink-0"
            >
              Mulai Tes
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <BundleModal
        selectedPackage={selectedPackage}
        onClose={() => setSelectedPackageId(null)}
        onNavigate={onNavigate}
        from="user-dashboard"
      />
    </div>
  );
};
