import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Calendar, ArrowLeft, Tag } from 'lucide-react';

interface NewsDetailPageProps {
  articleId: string;
  onNavigate: (page: string) => void;
}

export const NewsDetailPage: React.FC<NewsDetailPageProps> = ({ articleId, onNavigate }) => {
  // 1. Siapkan state untuk satu artikel dan daftar artikel terkait
  const [article, setArticle] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const normalizeArticles = (input: unknown): any[] => {
    if (Array.isArray(input)) return input;
    if (input && typeof input === 'object') {
      const obj: any = input;
      const maybe = obj.data ?? obj.articles ?? obj.results ?? obj.result;
      if (Array.isArray(maybe)) return maybe;
      if (maybe && typeof maybe === 'object') return [maybe];
    }
    return [];
  };

  useEffect(() => {
    let isActive = true;
    setLoading(true);

    const run = async () => {
      try {
        // 2. Ambil detail artikel spesifik dari Laravel
        // Kita filter di sini atau buat route khusus di Laravel (api/articles/{id})
        const res = await fetch(`http://127.0.0.1:8000/api/articles`);
        const data = await res.json();
        const list = normalizeArticles(data);

        // Cari artikel yang ID-nya cocok (Pastikan tipe data sama, gunakan == atau Number)
        const found = list.find((a: any) => a?.id == articleId);
        const others = list.filter((a: any) => a?.id != articleId).slice(0, 2);

        if (!isActive) return;
        setArticle(found || null);
        setRelatedArticles(others);
      } catch (err) {
        console.error('Gagal ambil detail:', err);
        if (!isActive) return;
        setArticle(null);
        setRelatedArticles([]);
      } finally {
        if (!isActive) return;
        setLoading(false);
      }
    };

    run();
    return () => {
      isActive = false;
    };
  }, [articleId]); // Trigger ulang jika ID berubah

  // 3. Tampilan Loading
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat isi artikel...</div>;
  }

  // 4. Jika artikel tidak ditemukan
  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#93c5fd]/5 to-[#ddd6fe]/5 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-16">
             <h3 className="text-xl font-semibold">Artikel Tidak Ditemukan</h3>
             <Button onClick={() => onNavigate('news')} className="mt-4">Kembali</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#93c5fd]/5 to-[#ddd6fe]/5 py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => onNavigate('news')} className="text-[#1e3a8a]">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Artikel
        </Button>

        <Card className="border-2 overflow-hidden">
          <div className="aspect-[21/9] overflow-hidden bg-gray-100">
            <ImageWithFallback
              src={article.image_url} // Sesuai kolom DB
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <CardContent className="p-8 md:p-12 space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {/* Menggunakan created_at dari DB Laravel */}
                    {new Date(article.created_at).toLocaleDateString('id-ID', { 
                      day: 'numeric', month: 'long', year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span className="px-3 py-1 bg-[#93c5fd]/20 text-[#1e3a8a] rounded-full">
                    {article.category}
                  </span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
                {article.title}
              </h1>

              {(article.url || article.link || article.article_url) && (
                <div>
                  <Button
                    variant="outline"
                    className="border-[#93c5fd] text-[#1e3a8a] hover:bg-[#93c5fd]/10"
                    asChild
                  >
                    <a
                      href={(article.url || article.link || article.article_url) as string}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Baca Sumber Asli
                    </a>
                  </Button>
                </div>
              )}
            </div>

            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed prose-p:my-0 space-y-4">
              {/* Render isi konten dari database (ikuti format saat edit/textarea) */}
              {String(article.content || '')
                .replace(/\r\n/g, '\n')
                .split(/\n{2,}/)
                .map((block: string) => block.trim())
                .filter(Boolean)
                .map((block: string, index: number) => (
                  <p key={index} className="whitespace-pre-line">
                    {block}
                  </p>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Related Articles Dinamis */}
        <div className="mt-12">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">Artikel Lainnya</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {relatedArticles.map(related => (
              <Card key={related.id} className="overflow-hidden hover:shadow-lg border-2">
                <div className="aspect-video">
                  <ImageWithFallback src={related.image_url} alt={related.title} className="w-full h-full object-cover" />
                </div>
                <CardContent className="p-6 space-y-3">
                  <h4 className="font-semibold text-gray-800">{related.title}</h4>
                  <Button variant="ghost" onClick={() => onNavigate(`news-detail-${related.id}`)} className="p-0">
                    Baca Selengkapnya →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};