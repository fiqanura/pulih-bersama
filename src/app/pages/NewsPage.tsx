import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Calendar } from 'lucide-react';

interface NewsPageProps {
  onNavigate: (page: string) => void;
}

export const NewsPage: React.FC<NewsPageProps> = ({ onNavigate }) => {
  // 1. Inisialisasi State untuk menampung data dari Database
  const [dbArticles, setDbArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const normalizeArticles = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.articles)) return data.articles;
    return [];
  };

  // 2. Ambil data dari Laravel saat halaman dimuat
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/articles');
        const data = await res.json();
        setDbArticles(normalizeArticles(data));
      } catch (err) {
        console.error('Gagal mengambil data artikel:', err);
        setDbArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // 3. Tampilan saat sedang loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#1e3a8a] font-semibold animate-pulse">Menghubungkan ke database...</p>
      </div>
    );
  }

  // 4. Tampilan jika artikel kosong di database
  if (dbArticles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#93c5fd]/5 to-[#ddd6fe]/5 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Artikel & Berita</h1>
          <Card className="border-2">
            <CardContent className="p-16 text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#93c5fd]/20 to-[#ddd6fe]/20 rounded-full flex items-center justify-center">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700">Belum Ada Artikel</h3>
              <p className="text-gray-500">Gudang database masih kosong. Silakan isi melalui phpMyAdmin!</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#93c5fd]/5 to-[#ddd6fe]/5 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#1e3a8a] to-[#5b21b6] bg-clip-text text-transparent mb-4">
            Artikel & Berita
          </h1>
          <p className="text-gray-600">
            Temukan informasi dan tips seputar kesehatan mental dari database Pulih Bersama
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dbArticles.map((article) => (
            <Card key={article.id} className="overflow-hidden hover:shadow-xl transition-all group border-2">
              <div className="aspect-video overflow-hidden bg-gray-100">
                <ImageWithFallback
                  src={article.image_url} // Pakai image_url sesuai database
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(article.created_at).toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</span>
                </div>
                <div className="inline-block px-3 py-1 bg-[#93c5fd]/20 text-[#1e3a8a] text-xs rounded-full">
                  {article.category}
                </div>
                <h3 className="font-semibold text-gray-800 line-clamp-2 min-h-[3rem]">
                  {article.title}
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => onNavigate(`news-detail-${article.id}`)}
                  className="text-[#1e3a8a] hover:text-[#93c5fd] hover:bg-[#93c5fd]/10 p-0 h-auto font-semibold"
                >
                  Baca Selengkapnya →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};