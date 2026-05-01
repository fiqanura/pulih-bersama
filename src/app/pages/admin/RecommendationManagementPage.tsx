import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { useApp, Recommendation } from '../../context/AppContext';
import { Plus, Pencil, Trash, Save, X, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

export const RecommendationManagementPage: React.FC = () => {
  const { recommendations, addRecommendation, updateRecommendation, deleteRecommendation } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRec, setEditingRec] = useState<Recommendation | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string>('');
  const [formData, setFormData] = useState({
    category: '',
    type: 'Article' as 'Article' | 'Video',
    title: '',
    summary: '',
    thumbnail_url: '',
    link: '',
    risk_level: 'Sedang' as 'Sedang' | 'Berat', // Updated to include only 'Sedang' and 'Berat'
  });
  const CATEGORIES = [
  "Gangguan Tidur & Keluhan Fisik",
  "Gangguan Emosi & Afektif",
  "Penurunan Motivasi & Aktivitas",
  "Kecemasan",
  "Kepercayaan Diri & Penyesuaian Sosial"
  ];

  useEffect(() => {
    return () => {
      if (thumbnailPreviewUrl && thumbnailPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailPreviewUrl);
      }
    };
  }, [thumbnailPreviewUrl]);

  const isValidHttpUrl = (value: string) => {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleOpenDialog = (rec?: Recommendation) => {
    if (rec) {
      setEditingRec(rec);
      setThumbnailFile(null);
      setThumbnailPreviewUrl(rec.thumbnail_url ?? '');
      setFormData({ 
        category: rec.category, 
        type: rec.type as 'Article' | 'Video',
        title: rec.title, 
        summary: rec.summary ?? '',
        thumbnail_url: rec.thumbnail_url ?? '',
        link: rec.link, 
        risk_level: rec.risk_level as 'Sedang' | 'Berat' // Updated to include only 'Sedang' and 'Berat'
      });
    } else {
      setEditingRec(null);
      setThumbnailFile(null);
      setThumbnailPreviewUrl('');
      setFormData({ category: '', type: 'Article', title: '', summary: '', thumbnail_url: '', link: '', risk_level: 'Sedang' });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    // link bersifat opsional (backend bisa mengembalikan null)
    if (!formData.category || !formData.title || !formData.type || !formData.risk_level) {
      toast.error('Lengkapi data wajib terlebih dahulu.');
      return;
    }

    const link = (formData.link ?? '').trim();
    // Backend umum: kolom link biasanya VARCHAR(255)
    if (link && link.length > 255) {
      toast.error('Link terlalu panjang. Isi dengan URL saja (contoh: https://...).');
      return;
    }
    if (formData.type === 'Video' && !link) {
      toast.error('Link wajib diisi untuk tipe Video.');
      return;
    }
    if (link && !isValidHttpUrl(link)) {
      toast.error('Link harus berupa URL yang valid (http/https).');
      return;
    }

    if (thumbnailFile) {
      const fd = new FormData();
      fd.append('category', formData.category);
      fd.append('type', formData.type);
      fd.append('title', formData.title);
      fd.append('summary', formData.summary);
      fd.append('risk_level', formData.risk_level);
      fd.append('link', formData.link);
      fd.append('thumbnail', thumbnailFile);

      if (editingRec) {
        updateRecommendation(editingRec.id, fd);
      } else {
        addRecommendation(fd);
      }
    } else {
      const data = { ...formData };
      if (editingRec) {
        updateRecommendation(editingRec.id, data);
      } else {
        addRecommendation(data);
      }
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus rekomendasi ini?')) {
      deleteRecommendation(id);
      toast.success('Rekomendasi berhasil dihapus!');
    }
  };

  const filteredRecommendations = recommendations.filter((rec) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const haystack = `${rec.title} ${rec.summary ?? ''} ${rec.type} ${rec.category} ${rec.risk_level}`.toLowerCase();
    return haystack.includes(q);
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Manajemen Konten Rekomendasi</h1>
          <p className="text-gray-600">Kelola konten rekomendasi pemulihan</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-gradient-to-r from-[#93c5fd] to-[#ddd6fe] text-[#1e3a8a]">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Rekomendasi
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Cari judul, kategori, tipe, atau risk level..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-2 focus:border-[#93c5fd]"
        />
      </div>

      <Card className="border-2">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">No</TableHead>
                <TableHead>Thumbnail</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Ringkasan</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecommendations.length > 0 ? (
                filteredRecommendations.map((rec, index) => (
                  <TableRow key={rec.id}>
                    <TableCell className="text-center text-gray-600">{index + 1}</TableCell>
                    <TableCell className="w-28">
                      <div className="w-20 h-12 rounded overflow-hidden bg-gray-100 border">
                        <ImageWithFallback
                          src={rec.thumbnail_url || ''}
                          alt={rec.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-xs whitespace-normal break-words">{rec.title}</TableCell>
                    <TableCell className="max-w-sm whitespace-normal break-words">
                      <div className="text-sm text-gray-600 line-clamp-2">{rec.summary || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          rec.type === 'Article' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {rec.type}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-normal break-words">{rec.category}</TableCell>
                    <TableCell>{rec.risk_level}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => handleOpenDialog(rec)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(rec.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-gray-400">
                    Tidak ada rekomendasi yang cocok dengan pencarian.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent aria-describedby="recommendation-dialog-description" className="max-h-[85vh] overflow-hidden p-0">
          <DialogHeader>
            <DialogTitle className="p-6 pb-2">{editingRec ? 'Edit Rekomendasi' : 'Tambah Rekomendasi Baru'}</DialogTitle>
          </DialogHeader>
          <div id="recommendation-dialog-description">
            <div className="max-h-[70vh] overflow-y-auto px-6 pb-24 space-y-4">
              <div className="space-y-2">
                <Label>Kategori Gangguan</Label>
                <select 
                  className="w-full p-2 border rounded-md bg-white text-sm"
                  value={formData.category} 
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">-- Pilih Kategori Gangguan --</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                  </option>
                    ))}
                  </select>
              </div>
              <div className="space-y-2">
                <Label>Tipe</Label>
                <Select value={formData.type} onValueChange={(value: 'Article' | 'Video') => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Article">Article</SelectItem>
                    <SelectItem value="Video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Judul</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Judul rekomendasi" />
              </div>
              <div className="space-y-2">
                <Label>Ringkasan</Label>
                <Textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Ringkasan singkat (1-2 kalimat)"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Thumbnail (Unggah File)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setThumbnailFile(file);

                    if (thumbnailPreviewUrl && thumbnailPreviewUrl.startsWith('blob:')) {
                      URL.revokeObjectURL(thumbnailPreviewUrl);
                    }

                    if (file) {
                      const url = URL.createObjectURL(file);
                      setThumbnailPreviewUrl(url);
                      setFormData({ ...formData, thumbnail_url: '' });
                    } else {
                      setThumbnailPreviewUrl(editingRec?.thumbnail_url ?? '');
                    }
                  }}
                />
                <div className="w-full max-w-[240px] aspect-video rounded overflow-hidden bg-gray-100 border">
                  <ImageWithFallback
                    src={thumbnailPreviewUrl || formData.thumbnail_url || ''}
                    alt={formData.title || 'Thumbnail'}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Link (URL)</Label>
                <Input
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder={formData.type === 'Video' ? 'https://youtu.be/... atau https://...' : 'https://... (opsional untuk artikel)'}
                />
                <p className="text-xs text-gray-500">
                  Isi dengan URL sumber asli / video. Jangan isi dengan teks artikel panjang.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Risk Level</Label>
                <Select value={formData.risk_level} onValueChange={(value: 'Sedang' | 'Berat') => setFormData({ ...formData, risk_level: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sedang">Sedang</SelectItem>
                    <SelectItem value="Berat">Berat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4">
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Batal
                </Button>
                <Button onClick={handleSave} className="bg-[#93c5fd] text-[#1e3a8a]">
                  <Save className="w-4 h-4 mr-2" />
                  Simpan
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
