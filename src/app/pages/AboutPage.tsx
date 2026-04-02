import React from 'react';
import { Heart, Target, Eye, Shield } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

export const AboutPage: React.FC = () => {  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#93c5fd]/5 to-[#ddd6fe]/5">
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#93c5fd]/20 to-[#ddd6fe]/20 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#1e3a8a] to-[#5b21b6] bg-clip-text text-transparent">
            Tentang Pulih Bersama
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Platform kesehatan mental yang dirancang khusus untuk mendampingi anak dalam menghadapi perubahan hidup akibat perceraian orang tua.
          </p>
        </div>
      </section>

      {/* Background */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="border-2">
            <CardContent className="p-8 space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Latar Belakang
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Perceraian orang tua adalah peristiwa yang dapat memberikan dampak signifikan 
                  terhadap kesehatan mental anak. Banyak anak yang mengalami 
                  gangguan tidur, perubahan emosi, penurunan motivasi, kecemasan, dan 
                  kesulitan dalam penyesuaian sosial.
                </p>
                <p>
                  <strong>Pulih Bersama</strong> hadir sebagai solusi untuk memberikan deteksi dini 
                  terhadap kondisi kesehatan mental anak yang terdampak perceraian. 
                  Kami menggunakan metode <strong>Certainty Factor</strong> untuk menghitung tingkat keyakinan diagnosis 
                  dan sistem akan memberikan rekomendasi yang sesuai dengan kondisi pengguna.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Vision & Mission */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 bg-gradient-to-br from-[#93c5fd]/10 to-white">
              <CardContent className="p-8 space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#93c5fd] to-[#ddd6fe] rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Visi</h3>
                <p className="text-gray-600 leading-relaxed">
                  Menjadi platform terpercaya dalam mendukung kesehatan mental anak
                  Indonesia yang terdampak perceraian orang tua, menciptakan generasi yang sehat secara emosional.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 bg-gradient-to-br from-[#ddd6fe]/10 to-white">
              <CardContent className="p-8 space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#ddd6fe] to-[#93c5fd] rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Misi</h3>
                <ul className="text-gray-600 leading-relaxed space-y-2 list-disc list-inside">
                  <li>Menyediakan alat skrining kesehatan mental yang mudah diakses</li>
                  <li>Memberikan rekomendasi pemulihan yang personal</li>
                  <li>Menciptakan lingkungan digital yang aman dan empatik</li>
                  <li>Meningkatkan awareness tentang kesehatan mental anak</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Focus */}
          <Card className="border-2 bg-gradient-to-br from-[#86efac]/10 to-white">
            <CardContent className="p-8 space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Fokus Pemulihan Emosional
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Sistem ini dirancang untuk mendeteksi lima area utama yang merujuk pada kriteria klinis PPDGJ-III dan disesuaikan dengan kondisi psikologis individu:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#93c5fd] rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Gangguan Tidur & Keluhan Fisik:</strong> Mengatasi masalah pola tidur dan keluhan kondisi fisik yang muncul akibat stres emosional</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#86efac] rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Gangguan Emosi & Afektif:</strong> Memahami dan mengelola stabilitas suasana hati (mood) serta respon emosional</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#ddd6fe] rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Penurunan Motivasi & Aktivitas:</strong> Membangun kembali semangat, energi psikis, dan minat dalam beraktivitas harian</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#fde68a] rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Kecemasan:</strong> Mengelola kekhawatiran berlebih dan ketegangan mental yang menetap</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#fbcfe8] rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Kepercayaan Diri & Penyesuaian Sosial:</strong> Memperkuat harga diri dan kemampuan beradaptasi dalam hubungan interpersonal</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};