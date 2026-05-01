import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import type { InterventionPackage } from '../../hooks/useInterventionPackages';

type Props = {
  selectedPackage: InterventionPackage | null;
  onClose: () => void;
  onNavigate: (page: string) => void;
  from: string;
};

export const BundleModal: React.FC<Props> = ({ selectedPackage, onClose, onNavigate, from }) => {
  const stripRiskSuffix = (value: string) => value.replace(/\s*\((sedang|berat)\)\s*$/i, '').trim();

  const persistReturnState = () => {
    if (!selectedPackage) return;
    try {
      const rawFrom = String(from ?? '').trim();
      const [page, contextId] = rawFrom.split(':');
      const payload = {
        page: (page || rawFrom || 'history').trim(),
        contextId: (contextId || '').trim() || null,
        packageId: String(selectedPackage.id ?? '').trim() || null,
        ts: Date.now(),
      };
      sessionStorage.setItem('pb:returnState', JSON.stringify(payload));
    } catch {
      // ignore storage errors
    }
  };

  const buildDetailPage = (id: string) => {
    const safeId = String(id ?? '').trim();
    const safeFrom = encodeURIComponent(String(from ?? '').trim());
    const isAdmin = String(from ?? '').startsWith('admin-');
    const prefix = isAdmin ? 'admin-recommendation-detail-' : 'recommendation-detail-';
    return `${prefix}${safeId}?from=${safeFrom}`;
  };

  const modalTitle = (() => {
    if (!selectedPackage) return '';
    const rawTitle = String(selectedPackage.title ?? '');
    const strippedTitle = rawTitle.replace(/^\s*paket\s*p3k\s*[:\-–—]\s*/i, '');
    const inferredCategory = String(
      selectedPackage.articles?.[0]?.category ?? selectedPackage.videos?.[0]?.category ?? ''
    ).trim();
    const titleLooksLikeTemplate = /^\s*paket\s*p3k\s*[:\-–—]/i.test(rawTitle);

    const cleanedBackendTitle = stripRiskSuffix(strippedTitle);
    const backendLooksAligned = /^\s*pemulihan\b/i.test(cleanedBackendTitle);
    const next = (!backendLooksAligned && titleLooksLikeTemplate && inferredCategory ? inferredCategory : cleanedBackendTitle).trim();
    return stripRiskSuffix(next);
  })();

  return (
    <Dialog open={Boolean(selectedPackage)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        {selectedPackage && (
          <>
            <DialogHeader>
              <DialogTitle>{modalTitle || stripRiskSuffix(String(selectedPackage.title ?? ''))}</DialogTitle>
              <DialogDescription>
                <span className="inline-flex flex-wrap gap-2">
                  <Badge variant="secondary">Kategori: {selectedPackage.categoryTag}</Badge>
                  <Badge variant="outline">Level: {selectedPackage.riskLevel}</Badge>
                </span>
              </DialogDescription>
            </DialogHeader>

            <Alert>
              <AlertTitle>Pesan Sistem</AlertTitle>
              <AlertDescription>{selectedPackage.systemMessage}</AlertDescription>
            </Alert>

            <div className="space-y-5">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">Artikel</h4>
                {selectedPackage.articles.length === 0 ? (
                  <p className="text-sm text-gray-500">Belum ada artikel untuk paket ini.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedPackage.articles.map((rec) => (
                      <Card key={rec.id} className="border">
                        <CardContent className="p-4 flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 line-clamp-1">{rec.title}</p>
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{rec.summary || ''}</p>
                          </div>
                          <Button
                            variant="outline"
                            className="shrink-0"
                            onClick={() => {
                              persistReturnState();
                              onClose();
                              onNavigate(buildDetailPage(rec.id));
                            }}
                          >
                            Buka
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">Video</h4>
                {selectedPackage.videos.length === 0 ? (
                  <p className="text-sm text-gray-500">Belum ada video untuk paket ini.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedPackage.videos.map((rec) => (
                      <Card key={rec.id} className="border">
                        <CardContent className="p-4 flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 line-clamp-1">{rec.title}</p>
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{rec.summary || ''}</p>
                          </div>
                          <Button
                            variant="outline"
                            className="shrink-0"
                            onClick={() => {
                              persistReturnState();
                              onClose();
                              onNavigate(buildDetailPage(rec.id));
                            }}
                          >
                            Tonton
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Tutup
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
