import React from 'react';
import { Phone, Mail } from 'lucide-react';
// @ts-ignore
import LogoFoto from '../../assets/logo_pulih_bersama.png';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-[#93c5fd]/10 to-[#ddd6fe]/10 border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Section 1: About with New Logo Icon */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {/* Wadah Lingkaran untuk Logo */}
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden border border-[#93c5fd]/30">
                <img 
                  src={LogoFoto} 
                  alt="Logo Pulih Bersama" 
                  className="w-full h-full object-contain p-1.5" 
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#1e3a8a] to-[#5b21b6] bg-clip-text text-transparent">
                Pulih Bersama
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Platform deteksi dini dan pemulihan kesehatan mental untuk anak yang terdampak perceraian orang tua.
            </p>
          </div>

          {/* Section 2: Disclaimer */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Penting untuk Diketahui!</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Platform ini adalah alat skrining awal dan <strong>bukan pengganti</strong> konsultasi dengan profesional kesehatan mental. Jika Anda mengalami kesulitan, silakan hubungi tenaga profesional.
            </p>
          </div>

          {/* Section 3: Emergency Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Butuh Bantuan Segera?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <Phone className="w-5 h-5 text-[#93c5fd] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800">Hotline Kesehatan Mental</p>
                  <p className="text-gray-600">119 ext. 8 (24 jam)</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Mail className="w-5 h-5 text-[#93c5fd] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800">WhatsApp</p>
                  <p className="text-gray-600">0811-2609-168</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-gray-500">
          <p>© 2026 Pulih Bersama. Dibuat dengan ❤️ untuk kesejahteraan anak Indonesia.</p>
        </div>
      </div>
    </footer>
  );
};