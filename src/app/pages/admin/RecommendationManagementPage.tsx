import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useApp, Recommendation } from '../../context/AppContext';
import { Plus, Pencil, Trash, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export const RecommendationManagementPage: React.FC = () => {
  const { recommendations, addRecommendation, updateRecommendation, deleteRecommendation } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRec, setEditingRec] = useState<Recommendation | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    type: 'Article' as 'Article' | 'Video',
    title: '',
    link: '',
    risk_level: 'Sedang' as 'Sedang' | 'Berat', // Updated to include only 'Sedang' and 'Berat'
  });
  const CATEGORIES = [
  "Gangguan Tidur & Keluhan Fisik",
  "Gangguan Emosi & Afektif",
  "Penurunan Motivasi & Aktivitas",
  "Kecemasan",
  "Kepercayaan Diri & Relasi Sosial"
  ];

  const handleOpenDialog = (rec?: Recommendation) => {
    if (rec) {
      setEditingRec(rec);
      setFormData({ 
        category: rec.category, 
        type: rec.type as 'Article' | 'Video',
        title: rec.title, 
        link: rec.link, 
        risk_level: rec.risk_level as 'Sedang' | 'Berat' // Updated to include only 'Sedang' and 'Berat'
      });
    } else {
      setEditingRec(null);
      setFormData({ category: '', type: 'Article', title: '', link: '', risk_level: 'Sedang' });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    const data = { ...formData };
    if (editingRec) {
      updateRecommendation(editingRec.id, data);
      toast.success('Rekomendasi berhasil diperbarui!');
    } else {
      addRecommendation(data);
      toast.success('Rekomendasi berhasil ditambahkan!');
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus rekomendasi ini?')) {
      deleteRecommendation(id);
      toast.success('Rekomendasi berhasil dihapus!');
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Manajemen Konten Rekomendasi</h1>
          <p className="text-gray-600">Kelola konten rekomendasi pemulihan</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-gradient-to-r from-[#93c5fd] to-[#ddd6fe] text-[#1e3a8a]">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Rekomendasi
        </Button>
      </div>

      <Card className="border-2">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recommendations.map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell className="font-medium max-w-xs">{rec.title}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${rec.type === 'Article' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {rec.type}
                    </span>
                  </TableCell>
                  <TableCell>{rec.category}</TableCell>
                  <TableCell>{rec.risk_level}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => handleOpenDialog(rec)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(rec.id)} className="text-red-600 hover:bg-red-50">
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent aria-describedby="recommendation-dialog-description">
          <DialogHeader>
            <DialogTitle>{editingRec ? 'Edit Rekomendasi' : 'Tambah Rekomendasi Baru'}</DialogTitle>
          </DialogHeader>
          <div id="recommendation-dialog-description">
            <div className="space-y-4">
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
                <Label>Link</Label>
                <Input value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} placeholder="https://..." />
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
              <div className="flex gap-2 justify-end pt-4">
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
