import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { ArrowLeft, Tag } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface RecommendationDetailPageProps {
  recommendationId: string;
  onNavigate: (page: string) => void;
  backPage?: string;
}

export const RecommendationDetailPage: React.FC<RecommendationDetailPageProps> = ({
  recommendationId,
  onNavigate,
  backPage,
}) => {
  const { recommendations } = useApp();

  const rec = recommendations.find((r) => String(r.id) == String(recommendationId));
  const baseBackPage = (backPage ? String(backPage).split(':')[0] : '').trim();
  const handleBack = () => onNavigate(baseBackPage || 'admin-user-history');
  const sourceLabel = rec?.type === 'Video' ? 'Tonton Video' : 'Baca Sumber Asli';

  if (!rec) {
    return (
      <div className="min-h-full bg-gradient-to-br from-[#93c5fd]/5 to-[#ddd6fe]/5 py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="ghost" onClick={handleBack} className="text-[#1e3a8a]">
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
          </Button>

          <Card className="p-12 text-center">
            <h3 className="text-xl font-semibold">Rekomendasi Tidak Ditemukan</h3>
            <p className="text-sm text-gray-500 mt-2">Data rekomendasi belum tersedia atau sudah dihapus.</p>
            <Button onClick={handleBack} className="mt-6">
              Kembali
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-[#93c5fd]/5 to-[#ddd6fe]/5 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={handleBack} className="text-[#1e3a8a]">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </Button>

        <Card className="border-2 overflow-hidden">
          <div className="aspect-[21/9] overflow-hidden bg-gray-100">
            <ImageWithFallback
              src={rec.thumbnail_url || ''}
              alt={rec.title}
              className="w-full h-full object-cover"
            />
          </div>

          <CardContent className="p-4 sm:p-8 md:p-12 space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span className="px-3 py-1 bg-[#93c5fd]/20 text-[#1e3a8a] rounded-full">{rec.category}</span>
                </div>

                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">{rec.risk_level}</span>
                <span
                  className={`px-3 py-1 rounded-full ${rec.type === 'Article' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}
                >
                  {rec.type}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">{rec.title}</h1>

              {rec.link && (
                <div>
                  <Button
                    variant="outline"
                    className="border-[#93c5fd] text-[#1e3a8a] hover:bg-[#93c5fd]/10"
                    asChild
                  >
                    <a href={rec.link} target="_blank" rel="noreferrer">
                      {sourceLabel}
                    </a>
                  </Button>
                </div>
              )}
            </div>

            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
              {rec.summary ? (
                <p className="whitespace-pre-wrap break-words">{rec.summary}</p>
              ) : (
                <p className="text-gray-500">Ringkasan belum tersedia untuk rekomendasi ini.</p>
              )}

              {rec.link && (
                <p>
                  Untuk informasi lengkap, gunakan tombol <strong>{sourceLabel}</strong>.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
