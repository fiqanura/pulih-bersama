import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Plus, Pencil, Trash, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

interface Article {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  url?: string;
  link?: string;
  article_url?: string;
  category: string;
  date?: string;
  created_at?: string;
}

export const ArticleManagementPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    articleUrl: '',
  });

  const normalizeArticles = (input: unknown): Article[] => {
    if (Array.isArray(input)) return input as Article[];
    if (input && typeof input === 'object') {
      const obj: any = input;
      const maybe = obj.data ?? obj.articles ?? obj.results ?? obj.result;
      if (Array.isArray(maybe)) return maybe as Article[];
      if (maybe && typeof maybe === 'object') return [maybe as Article];
    }
    return [];
  };

  // Ambil data artikel dari backend saat halaman dimuat
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/articles');
        const data = await response.json();
        setArticles(normalizeArticles(data));
      } catch (error) {
        console.error('Gagal mengambil artikel:', error);
        toast.error('Gagal mengambil artikel dari server.');
      }
    };
    fetchArticles();
  }, []);

  const handleOpenDialog = (article?: Article) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        title: article.title,
        content: article.content,
        category: article.category,
        articleUrl: (article.url || article.link || article.article_url || '') as string,
      });
    } else {
      setEditingArticle(null);
      setFormData({
        title: '',
        content: '',
        category: '',
        articleUrl: '',
      });
    }
    setThumbnailFile(null);
    setIsDialogOpen(true);
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSave = async () => {
    if (formData.articleUrl && !isValidUrl(formData.articleUrl)) {
      toast.error('URL artikel tidak valid. Harap masukkan URL yang benar.');
      return;
    }

    const endpoint = editingArticle
      ? `http://127.0.0.1:8000/api/articles/${editingArticle.id}`
      : 'http://127.0.0.1:8000/api/articles';

    const summary = formData.content?.slice(0, 160) || '';

    const fd = new FormData();
    fd.append('title', formData.title);
    fd.append('category', formData.category);
    fd.append('content', formData.content);
    fd.append('summary', summary);

    // Kirim URL artikel (untuk tombol “Buka Artikel Asli”)
    if (formData.articleUrl) {
      fd.append('url', formData.articleUrl);
      fd.append('link', formData.articleUrl);
      fd.append('article_url', formData.articleUrl);
    }

    // Upload thumbnail (file)
    if (thumbnailFile) {
      fd.append('image', thumbnailFile);
    }

    // Untuk Laravel, update via POST + _method=PUT sering lebih kompatibel untuk multipart
    if (editingArticle) {
      fd.append('_method', 'PUT');
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: fd,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(editingArticle ? 'Berhasil diperbarui!' : 'Berhasil ditambah!');
        const refreshRes = await fetch('http://127.0.0.1:8000/api/articles');
        const freshData = await refreshRes.json();
        setArticles(normalizeArticles(freshData));
        setIsDialogOpen(false);
      } else {
        console.error('Server Error:', result);
        toast.error(result.message || 'Gagal menyimpan. Cek terminal Laravel!');
      }
    } catch (error) {
      console.error('Gagal menyimpan artikel:', error);
      toast.error('Koneksi Gagal! Apakah Laravel sudah php artisan serve?');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus artikel ini?')) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/articles/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          toast.success('Artikel berhasil dihapus!');
          setArticles((prev) => prev.filter((article) => article.id !== id));
        } else {
          toast.error('Gagal menghapus artikel.');
        }
      } catch (error) {
        console.error('Gagal menghapus artikel:', error);
        toast.error('Terjadi kesalahan saat menghapus artikel.');
      }
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Manajemen Berita</h1>
          <p className="text-gray-600">Kelola berita dan artikel</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-gradient-to-r from-[#93c5fd] to-[#ddd6fe] text-[#1e3a8a]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Artikel
        </Button>
      </div>

      <Card className="border-2">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium max-w-md">
                    <div className="line-clamp-1">{article.title}</div>
                  </TableCell>
                  <TableCell>{article.category}</TableCell>
                  <TableCell>
                    {new Date(article.date || article.created_at || Date.now()).toLocaleDateString('id-ID')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDialog(article)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(article.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingArticle ? 'Edit Artikel' : 'Tambah Artikel Baru'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Judul</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Masukkan judul artikel"
              />
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Contoh: Psikologi Anak"
              />
            </div>
            <div className="space-y-2">
              <Label>Konten</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Konten lengkap artikel"
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label>URL Artikel</Label>
              <Input
                value={formData.articleUrl}
                onChange={(e) => setFormData({ ...formData, articleUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Upload Thumbnail</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              />
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
