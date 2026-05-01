import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import type { InterventionPackage } from '../../hooks/useInterventionPackages';

type Props = {
  packages: InterventionPackage[];
  loading: boolean;
  error: string | null;
  onOpenPackage: (packageId: string) => void;
};

export const RecommendationList: React.FC<Props> = ({ packages, loading, error, onOpenPackage }) => {
  if (loading) {
    return <p className="text-sm text-gray-500">Memuat rekomendasi pemulihan...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!packages.length) {
    return <p className="text-sm text-gray-500">Belum ada rekomendasi pemulihan untuk hasil ini.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {packages.map((pkg) => {
        const stripRiskSuffix = (value: string) => value.replace(/\s*\((sedang|berat)\)\s*$/i, '').trim();

        const rawTitle = String(pkg.title ?? '');
        const strippedTitle = rawTitle.replace(/^\s*paket\s*p3k\s*[:\-–—]\s*/i, '');
        const inferredCategory = String(pkg.articles?.[0]?.category ?? pkg.videos?.[0]?.category ?? '').trim();
        const titleLooksLikeTemplate = /^\s*paket\s*p3k\s*[:\-–—]/i.test(rawTitle);
        const cleanedBackendTitle = stripRiskSuffix(strippedTitle);
        const backendLooksAligned = /^\s*pemulihan\b/i.test(cleanedBackendTitle);
        const chosenTitle =
          !backendLooksAligned && titleLooksLikeTemplate && inferredCategory ? inferredCategory : cleanedBackendTitle;
        const displayTitle = stripRiskSuffix(String(chosenTitle ?? '').trim());
        const firstThumb = pkg.articles?.[0]?.thumbnail_url || pkg.videos?.[0]?.thumbnail_url || '';
        return (
          <Card key={pkg.id} className="overflow-hidden hover:shadow-xl transition-all group border-2">
            <div className="aspect-video overflow-hidden bg-gray-100">
              <ImageWithFallback
                src={firstThumb}
                alt={displayTitle || pkg.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <CardContent className="p-6 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Kategori: {pkg.categoryTag}</Badge>
                <Badge variant="outline">Level: {pkg.riskLevel}</Badge>
              </div>

              <h3 className="font-semibold text-gray-800 line-clamp-2 min-h-[3rem]">{displayTitle || stripRiskSuffix(String(pkg.title ?? ''))}</h3>

              <p className="text-sm text-gray-600">
                {pkg.articles.length} artikel • {pkg.videos.length} video
              </p>

              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenPackage(pkg.id)}
                className="text-[#1e3a8a] hover:text-[#93c5fd] hover:bg-[#93c5fd]/10 p-0 h-auto font-semibold"
              >
                Selengkapnya →
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
