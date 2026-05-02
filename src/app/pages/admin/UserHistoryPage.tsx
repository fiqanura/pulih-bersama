import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Eye, Search, Loader } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { RecommendationList } from '../../components/intervention/RecommendationList';
import { BundleModal } from '../../components/intervention/BundleModal';
import { useInterventionPackages } from '../../hooks/useInterventionPackages';
import { API_BASE_URL } from '../../utils/apiConfig';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

interface UserHistoryPageProps {
  onNavigate: (page: string) => void;
}

export const UserHistoryPage: React.FC<UserHistoryPageProps> = ({ onNavigate }) => {
  const allCategories = [
    'Gangguan Tidur & Keluhan Fisik',
    'Gangguan Emosi & Afektif',
    'Penurunan Motivasi & Aktivitas',
    'Kecemasan',
    'Kepercayaan Diri & Penyesuaian Sosial',
  ];

  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [expandedDiagnosisId, setExpandedDiagnosisId] = useState<number | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  useEffect(() => {
    // Restore previous admin-user-history context after coming back from a recommendation detail page.
    const raw = sessionStorage.getItem('pb:returnState');
    if (!raw) return;
    let parsed: any = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }

    if (!parsed || parsed.page !== 'admin-user-history') return;

    const contextId = String(parsed.contextId ?? '').trim();
    const packageId = String(parsed.packageId ?? '').trim();
    const [userIdRaw, diagnosisIdRaw] = contextId.split('|');
    const userId = String(userIdRaw ?? '').trim();
    const diagnosisId = diagnosisIdRaw != null && String(diagnosisIdRaw).trim() ? Number(diagnosisIdRaw) : null;

    if (!userId) {
      sessionStorage.removeItem('pb:returnState');
      return;
    }

    const user = dbUsers.find((u) => String(u?.id) === userId) ?? null;
    if (user && (!selectedUser || String(selectedUser?.id) !== userId)) {
      setSelectedUser(user);
      setExpandedDiagnosisId(null);
      setSelectedPackageId(null);
      fetchDiagnoses(Number(user.id));
      return;
    }

    if (selectedUser && String(selectedUser?.id) === userId) {
      if (typeof diagnosisId === 'number' && !Number.isNaN(diagnosisId) && diagnosisId > 0) {
        const hasDiagnosis = diagnoses.some((d) => Number(d?.id) === diagnosisId);
        if (!hasDiagnosis) return; // wait until diagnoses loaded
        setExpandedDiagnosisId(diagnosisId);
      }
      setSelectedPackageId(packageId || null);
      sessionStorage.removeItem('pb:returnState');
    }
  }, [dbUsers, diagnoses, selectedUser]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/user-history`);
        const data = await response.json();
        console.log('User History Response:', data); // Debugging
        setDbUsers(data);
      } catch (error) {
        console.error("Gagal ambil riwayat:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchDiagnoses = async (userId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/user-diagnoses/${userId}`);
      const data = await response.json();
      console.log('User Diagnoses Response:', data); // Debugging
      setDiagnoses(data);
    } catch (error) {
      console.error('Gagal mengambil data diagnosa:', error);
    }
  };

  const filteredUsers = dbUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Ringan': return 'bg-[#86efac] text-[#166534]';
      case 'Sedang': return 'bg-[#fde68a] text-[#854d0e]';
      case 'Berat': return 'bg-[#fca5a5] text-[#991b1b]';
      case 'Tidak Terindikasi': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  const getRiskFromPercentage = (percentage: number) => {
    if (percentage <= 33) return 'Tidak Terindikasi';
    if (percentage <= 60) return 'Ringan';
    if (percentage <= 82) return 'Sedang';
    return 'Berat';
  };

  const normalizeText = (value: unknown) =>
    String(value ?? '')
      .toLowerCase()
      .replace(/&/g, 'dan')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const normalizeCategory = (value: unknown) => {
    const key = normalizeText(value);
    if (key.includes('kepercayaan diri') && key.includes('relasi sosial')) return 'kepercayaan diri dan penyesuaian sosial';
    if (key.includes('kepercayaan diri') && key.includes('penyesuaian sosial')) return 'kepercayaan diri dan penyesuaian sosial';
    return key;
  };

  const normalizePercentage = (value: unknown): number | undefined => {
    if (typeof value !== 'number' || Number.isNaN(value)) return undefined;
    // Accept either 0..100 (percentage) or 0..1 (score)
    const pct = value <= 1 ? Math.round(value * 100) : Math.round(value);
    if (pct < 0 || pct > 100) return undefined;
    return pct;
  };

  const parsePossiblyJson = (value: unknown): unknown => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (!trimmed) return value;
    if (!(trimmed.startsWith('[') || trimmed.startsWith('{'))) return value;
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  };

  const getCategoryResults = (diagnosis: any): Array<{ category: string; percentage?: number }> => {
    const base = allCategories.map((category) => ({ category, percentage: undefined as number | undefined }));

    const fullRaw =
      diagnosis?.full_results ??
      diagnosis?.fullResults ??
      diagnosis?.results ??
      diagnosis?.full_result ??
      diagnosis?.fullResult;

    const full = parsePossiblyJson(fullRaw);
    if (Array.isArray(full)) {
      const byCategory = new Map<string, number>();
      for (const item of full) {
        if (!item || typeof item !== 'object') continue;
        const rawCategory = (item as any).category ?? (item as any).diagnosis;
        const percentage = normalizePercentage((item as any).percentage ?? (item as any).total_score ?? (item as any).score);
        if (typeof rawCategory !== 'string') continue;
        if (typeof percentage !== 'number') continue;
        byCategory.set(normalizeCategory(rawCategory), percentage);
      }

      const merged = base.map((row) => ({
        category: row.category,
        percentage: byCategory.get(normalizeCategory(row.category)),
      }));

      // If backend only provides dominant total_score, attach it as a fallback
      const dominantCategory = String(diagnosis?.diagnosis ?? '').trim();
      const dominantTotal = normalizePercentage(diagnosis?.total_score ?? diagnosis?.totalScore);
      if (dominantCategory && typeof dominantTotal === 'number') {
        for (const row of merged) {
          if (normalizeCategory(row.category) === normalizeCategory(dominantCategory) && typeof row.percentage !== 'number') {
            row.percentage = dominantTotal;
          }
        }
      }

      return merged;
    }

    // Fallback: backend currently only provides dominant category + overall risk
    return base;
  };

  const getDerivedRiskForCategory = (diagnosis: any, category: string, percentage?: number) => {
    if (typeof percentage === 'number') return getRiskFromPercentage(percentage);

    const overallRisk = String(diagnosis?.risk_level ?? '').trim();
    const dominantCategory = String(diagnosis?.diagnosis ?? '').trim();
    if (overallRisk && normalizeCategory(category) === normalizeCategory(dominantCategory)) return overallRisk;

    return 'Belum ada data';
  };

  const expandedDiagnosis = useMemo(
    () => diagnoses.find((d) => d?.id === expandedDiagnosisId) ?? null,
    [diagnoses, expandedDiagnosisId]
  );

  const expandedCfResults = useMemo(() => {
    if (!expandedDiagnosis) return [] as Array<{ category: string; percentage: number }>;
    return getCategoryResults(expandedDiagnosis)
      .filter((r) => typeof r.percentage === 'number')
      .map((r) => ({ category: r.category, percentage: r.percentage as number }));
  }, [expandedDiagnosis]);

  const shouldShowPackagesForExpanded = expandedCfResults.some((r) => {
    const risk = getRiskFromPercentage(r.percentage);
    return risk === 'Sedang' || risk === 'Berat';
  });

  const { packages: interventionPackages, loading: isLoadingPackages, error: packagesError } = useInterventionPackages(
    expandedCfResults,
    { enabled: Boolean(expandedDiagnosis) && shouldShowPackagesForExpanded }
  );

  const selectedPackage = interventionPackages.find((p) => p.id === selectedPackageId) ?? null;

  if (isLoading) return (
    <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <Loader className="animate-spin mr-2" /> Membuka Arsip Pengguna...
    </div>
  );

  if (selectedUser) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <Button variant="ghost" onClick={() => setSelectedUser(null)} className="hover:bg-[#93c5fd]/10">
          ← Kembali ke Daftar
        </Button>

        <Card className="border-2 shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-[#1e3a8a] mb-6">Detail Profil & Riwayat</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-xl mb-8">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Nama Lengkap</p>
                <p className="font-semibold text-lg">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Email</p>
                <p className="font-semibold text-lg">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Nomor Telepon</p>
                <p className="font-semibold text-lg">{selectedUser.phone || '-'}</p>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-4">Aktivitas Diagnosis</h3>
            {diagnoses.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed rounded-xl">
                <p className="text-gray-400">Belum ada aktivitas diagnosis</p>
              </div>
            ) : (
              <div className="space-y-4">
                {diagnoses.map((diagnosis) => (
                  <Card key={diagnosis.id} className="border-2">
                    <CardContent className="p-6">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-gray-800 font-medium">{diagnosis.diagnosis}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(diagnosis.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-4 py-2 rounded-lg ${getRiskColor(diagnosis.risk_level)}`}>
                            {diagnosis.risk_level}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setExpandedDiagnosisId((prev) => {
                                const next = prev === diagnosis.id ? null : diagnosis.id;
                                setSelectedPackageId(null);
                                return next;
                              });
                            }}
                            className="text-[#1e3a8a] hover:bg-[#93c5fd]/10"
                          >
                            {expandedDiagnosisId === diagnosis.id ? 'Tutup Detail' : 'Lihat Detail'}
                          </Button>
                        </div>
                      </div>

                      {expandedDiagnosisId === diagnosis.id && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-xl">
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-bold">ID Diagnosa</p>
                              <p className="font-semibold text-sm">{String(diagnosis.id)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-bold">Tanggal</p>
                              <p className="font-semibold text-sm">{new Date(diagnosis.created_at).toLocaleString('id-ID')}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-bold">Risiko (Keseluruhan)</p>
                              <p className="font-semibold text-sm">{diagnosis.risk_level}</p>
                            </div>
                          </div>

                          <div className="mt-4">
                            <h4 className="text-sm font-bold text-gray-800 mb-2">Kategori & Status Risiko</h4>
                            <div className="space-y-2">
                              {getCategoryResults(diagnosis).map((item, idx) => {
                                const derivedRisk = getDerivedRiskForCategory(diagnosis, item.category, item.percentage);
                                return (
                                  <div key={idx} className="p-3 bg-white rounded-lg border flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                      <p className="font-medium text-gray-800 truncate">{item.category || '-'}</p>
                                      {typeof item.percentage === 'number' && (
                                        <p className="text-xs text-gray-500">Skor: {item.percentage}%</p>
                                      )}
                                    </div>
                                    <div className={`px-3 py-1 rounded-lg text-sm ${getRiskColor(derivedRisk)}`}>
                                      {derivedRisk}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="mt-4">
                            <h4 className="text-sm font-bold text-gray-800 mb-2">Rekomendasi Pemulihan</h4>
                            {shouldShowPackagesForExpanded ? (
                              <RecommendationList
                                packages={interventionPackages}
                                loading={isLoadingPackages}
                                error={packagesError}
                                onOpenPackage={setSelectedPackageId}
                              />
                            ) : (
                              <p className="text-sm text-gray-500">Tidak ada rekomendasi (risiko keseluruhan masih rendah).</p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <BundleModal
          selectedPackage={selectedPackage}
          onClose={() => setSelectedPackageId(null)}
          onNavigate={onNavigate}
          from={`admin-user-history:${String(selectedUser?.id ?? '')}|${String(expandedDiagnosisId ?? '')}`}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1e3a8a] mb-2">Riwayat Pengguna</h1>
        <p className="text-gray-600">Manajemen data dan pantauan hasil diagnosa</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Cari nama atau email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-2 focus:border-[#93c5fd]"
        />
      </div>

      <Card className="border-2 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-bold w-12 text-center">No</TableHead>
              <TableHead className="font-bold">Nama</TableHead>
              <TableHead className="font-bold">Email</TableHead>
              <TableHead className="font-bold">Telepon</TableHead>
              <TableHead className="text-right font-bold">Opsi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? filteredUsers.map((user, index) => (
              <TableRow key={user.id} className="hover:bg-blue-50/30">
                <TableCell className="text-center text-gray-600">{index + 1}</TableCell>
                <TableCell className="font-medium text-gray-800">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone || '-'}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedUser(user);
                      fetchDiagnoses(user.id);
                    }}
                    className="border-[#93c5fd] text-[#1e3a8a] hover:bg-[#93c5fd] hover:text-white"
                  >
                    <Eye className="w-4 h-4 mr-1" /> Lihat Detail
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-400">
                  Tidak ada data pengguna yang ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};