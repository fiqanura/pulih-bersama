import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Plus, Pencil, Trash, Save, X, Search } from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { API_BASE_URL, BASE_URL } from '../../utils/apiConfig';
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
  thumbnail_url?: string;
  url?: string;
  link?: string;
  article_url?: string;
  category: string;
  date?: string;
  created_at?: string;
}

export const ArticleManagementPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    articleUrl: '',
  });


  const toAbsoluteBackendUrl = (raw: unknown): string => {
    let url = String(raw ?? '').trim();
    if (!url) return '';

    url = url.replace(/\\/g, '/');
    if (/^(data:|blob:)/i.test(url)) return url;
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('public/storage/')) url = url.replace(/^public\//, '');
    if (url.startsWith('storage/')) return `${BASE_URL}/${url}`;
    if (url.startsWith('/storage/')) return `${BASE_URL}${url}`;
    if (url.startsWith('/')) return `${BASE_URL}${url}`;
    return `${BASE_URL}/${url}`;
  };

  const revokeIfBlob = (url: string) => {
    if (url && url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    return () => {
      revokeIfBlob(thumbnailPreviewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        const response = await fetch(`${API_BASE_URL}/articles`);
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
    revokeIfBlob(thumbnailPreviewUrl);

    if (article) {
      setEditingArticle(article);
      setFormData({
        title: article.title,
        content: article.content,
        category: article.category,
        articleUrl: (article.url || article.link || article.article_url || '') as string,
      });

      const existingThumb = article.image_url || article.thumbnail_url || '';
      setThumbnailPreviewUrl(toAbsoluteBackendUrl(existingThumb));
    } else {
      setEditingArticle(null);
      setFormData({
        title: '',
        content: '',
        category: '',
        articleUrl: '',
      });
      setThumbnailPreviewUrl('');
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
      ? `${API_BASE_URL}/articles/${editingArticle.id}`
      : `${API_BASE_URL}/articles`;

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
        const refreshRes = await fetch(`${API_BASE_URL}/articles`);
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
        const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
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

  const filteredArticles = articles.filter((article) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const haystack = `${article.title} ${article.category}`.toLowerCase();
    return haystack.includes(q);
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Manajemen Artikel</h1>
          <p className="text-gray-600">Kelola artikel kesehatan mental</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-gradient-to-r from-[#93c5fd] to-[#ddd6fe] text-[#1e3a8a]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Artikel
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Cari judul atau kategori..."
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
                <TableHead>Judul</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArticles.length > 0 ? (
                filteredArticles.map((article, index) => (
                  <TableRow key={article.id}>
                    <TableCell className="text-center text-gray-600">{index + 1}</TableCell>
                    <TableCell className="font-medium max-w-md whitespace-normal break-words">
                      {article.title}
                    </TableCell>
                    <TableCell>{article.category}</TableCell>
                    <TableCell>
                      {new Date(article.date || article.created_at || Date.now()).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => handleOpenDialog(article)}>
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-gray-400">
                    Tidak ada artikel yang cocok dengan pencarian.
                  </TableCell>
                </TableRow>
              )}
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
              {thumbnailPreviewUrl ? (
                <div className="w-64 aspect-video rounded-md overflow-hidden border bg-gray-100">
                  <ImageWithFallback
                    src={thumbnailPreviewUrl}
                    alt="Preview thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : null}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setThumbnailFile(file);

                  revokeIfBlob(thumbnailPreviewUrl);

                  if (file) {
                    const url = URL.createObjectURL(file);
                    setThumbnailPreviewUrl(url);
                  } else {
                    const existingThumb = editingArticle?.image_url || editingArticle?.thumbnail_url || '';
                    setThumbnailPreviewUrl(toAbsoluteBackendUrl(existingThumb));
                  }
                }}
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
