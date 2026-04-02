import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useApp, Symptom } from '../../context/AppContext';
import { Plus, Pencil, Trash, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

export const SymptomManagementPage: React.FC = () => {
  const { symptoms, setSymptoms, addSymptom, updateSymptom, deleteSymptom } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSymptom, setEditingSymptom] = useState<Symptom | null>(null);
  const [formData, setFormData] = useState({ code: '', text: '', weight: 0, category: '' });
  const CATEGORIES = [
  "Gangguan Tidur & Keluhan Fisik",
  "Gangguan Emosi & Afektif",
  "Penurunan Motivasi & Aktivitas",
  "Kecemasan",
  "Kepercayaan Diri & Penyesuaian Sosial"
  ];

  useEffect(() => {
    fetchSymptoms(); // Fetch symptoms when the component is mounted
  }, []);

  useEffect(() => {
    console.log('Data symptoms di frontend:', symptoms);
  }, [symptoms]);

  const handleOpenDialog = (symptom?: Symptom) => {
    if (symptom) {
      setEditingSymptom(symptom);
      setFormData({ code: symptom.code, text: symptom.text, weight: symptom.weight, category: symptom.category });
    } else {
      setEditingSymptom(null);
      setFormData({ code: '', text: '', weight: 0, category: '' });
    }
    setIsDialogOpen(true);
  };

const [isLoading, setIsLoading] = useState(false);

const fetchSymptoms = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/symptoms', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error saat mengambil data gejala dari backend:', errorData);
        return;
      }

      const data = await response.json();
      console.log('Data gejala dari backend:', data);
      setSymptoms(data);
    } catch (error) {
      console.error('Gagal mengambil data gejala dari server:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (editingSymptom) {
        await updateSymptom(editingSymptom.id, formData);
        toast.success('Gejala berhasil diperbarui!');
      } else {
        await addSymptom({
          ...formData,
          name: formData.text,
          description: formData.text,
        });
        toast.success('Gejala berhasil ditambahkan!');
      }
      await fetchSymptoms(); // Ambil data terbaru setelah operasi
      setIsDialogOpen(false);
    } catch (err) {
      toast.error('Gagal menyimpan data ke database!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus gejala ini?')) {
      deleteSymptom(id);
      toast.success('Gejala berhasil dihapus!');
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Manajemen Gejala</h1>
          <p className="text-gray-600">Kelola gejala untuk Certainty Factor</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-gradient-to-r from-[#93c5fd] to-[#ddd6fe] text-[#1e3a8a]">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Gejala
        </Button>
      </div>

      <Card className="border-2">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Kode</TableHead>
                <TableHead className="w-[500px]">Gejala</TableHead> {/* Gejala dikasih jatah paling banyak */}
                <TableHead className="w-[80px]">Bobot</TableHead>
                <TableHead className="w-[200px]">Kategori</TableHead>
                <TableHead className="text-right w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {symptoms.map((symptom) => (
                <TableRow key={symptom.id}>
                  <TableCell className="font-mono">{symptom.code}</TableCell>
                  <TableCell className="min-w-[400px] py-4"> {/* Kasih lebar MINIMAL yang cukup luas */}
                    <div className="whitespace-normal break-words leading-relaxed text-sm text-gray-700">
                      {symptom.text}
                    </div>
                  </TableCell>
                  <TableCell>{symptom.weight}</TableCell>
                  <TableCell>{symptom.category}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => handleOpenDialog(symptom)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(symptom.id)} className="text-red-600 hover:bg-red-50">
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSymptom ? 'Edit Gejala' : 'Tambah Gejala Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Kode Gejala</Label>
              <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="G001" />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi Gejala</Label>
              <Input value={formData.text} onChange={(e) => setFormData({ ...formData, text: e.target.value })} placeholder="Deskripsi gejala" />
            </div>
            <div className="space-y-2">
              <Label>Bobot Expert (0-1)</Label>
              <Input type="number" step="0.1" min="0" max="1" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })} />
            </div>
            <div className="space-y-2">
  <Label>Kategori</Label>
  <select 
    className="w-full p-2 border rounded-md bg-white text-sm"
    value={formData.category} 
    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
  >
    <option value="">-- Pilih Kategori --</option>
    {CATEGORIES.map((cat, index) => (
      <option key={index} value={cat}>
        {cat}
      </option>
    ))}
  </select>
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
        </DialogContent>
      </Dialog>
    </div>
  );
};
