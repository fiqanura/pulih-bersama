import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import { CheckCircle2 } from 'lucide-react';

interface OnboardingTourProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const TOUR_STEPS = [
  {
    target: '#tour-register-btn',
    fallbackTarget: '#mobile-menu-btn', // Untuk responsivitas di HP/Tablet
    title: '1. Daftar Akun',
    content: 'Klik tombol ini untuk membuat akun baru di Pulih Bersama.',
    page: 'home',
    stage: 'register',
    stepIdx: 0,
    requireInView: false,
  },
  {
    target: '#tour-login-btn',
    title: '2. Masuk (Login)',
    content: 'Masukkan email dan kata sandi Anda, lalu klik tombol ini untuk masuk.',
    page: 'login',
    stage: 'login',
    stepIdx: 1,
    requireInView: false,
  },
  {
    target: '#tour-start-test-btn',
    title: '3. Isi Diagnosis',
    content: 'Klik tombol ini untuk mulai melakukan tes kesehatan mental.',
    page: 'user-dashboard',
    stage: 'diagnosis',
    stepIdx: 2,
    requireInView: false,
  },
  {
    target: '#tour-save-test-btn',
    title: '4. Simpan ke Riwayat',
    content: 'Pilih rekomendasi intervensi, lalu simpan hasil Anda ke riwayat.',
    page: 'diagnosis-result',
    stage: 'save',
    stepIdx: 3,
    requireInView: true, // Tunggu user scroll sampai tombol ini terlihat!
  },
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ currentPage }) => {
  const { hasSeenTour, completeTour, tourStage, setTourStage } = useApp();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Cari step yang cocok dengan stage & page saat ini
  const currentStep = TOUR_STEPS.find(s => s.stage === tourStage && s.page === currentPage);
  
  // Fungsi untuk mencari elemen target yang BENAR-BENAR TERLIHAT di layar
  const getVisibleElement = (selector: string, requireInView?: boolean) => {
    const elements = document.querySelectorAll(selector);
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i] as HTMLElement;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      // Cek apakah elemen memiliki ukuran dan tidak disembunyikan oleh CSS
      if (rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden') {
        if (requireInView) {
          // Harus berada di dalam viewport (sudah di-scroll sampai terlihat)
          // Beri sedikit margin (misal 50px) agar tidak terlalu kaku
          if (rect.top < window.innerHeight - 50 && rect.bottom > 0) {
            return { el, rect };
          }
        } else {
          return { el, rect };
        }
      }
    }
    return null;
  };

  useEffect(() => {
    if (hasSeenTour || !currentStep) {
      setTargetRect(null);
      return;
    }

    const handleDocumentClick = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        // Cek apakah klik mengenai tombol target itu sendiri (atau fallback-nya)
        const targetEl = document.querySelector(currentStep.target);
        const fallbackEl = currentStep.fallbackTarget ? document.querySelector(currentStep.fallbackTarget) : null;
        
        const clickedTarget = targetEl?.contains(e.target as Node) || fallbackEl?.contains(e.target as Node);
        
        if (clickedTarget) {
          // Jika tombol target di klik, majukan stage agar panduan sinkron dengan navigasi user
          if (tourStage === 'register') setTourStage('login');
          else if (tourStage === 'login') setTourStage('diagnosis');
          else if (tourStage === 'diagnosis') setTourStage('save');
          else completeTour();
        } else {
          // Klik sembarang (background) -> Jangan ditutup (biarkan panduan tetap muncul)
          // Sesuai permintaan: "yang panduan diagnosis itu jangan langsung hilang yaa tunggu pengguna klik dulu"
        }
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);

    const updatePosition = () => {
      if (currentStep) {
        // Coba cari target utama
        let found = getVisibleElement(currentStep.target, currentStep.requireInView);
        
        // Jika target utama tidak terlihat (misal disembunyikan dalam Hamburger Menu HP/Tablet), coba cari target fallback
        if (!found && currentStep.fallbackTarget) {
          found = getVisibleElement(currentStep.fallbackTarget, false);
        }

        if (found) {
          setTargetRect(found.rect);
        } else {
          setTargetRect(null);
        }
      }
    };

    // Beri sedikit jeda agar DOM selesai dirender
    const timer = setTimeout(updatePosition, 300);
    
    // Perbarui posisi saat scroll atau resize
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    
    // Interval fallback jika elemen muncul terlambat atau bergeser
    const interval = setInterval(updatePosition, 500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      clearInterval(interval);
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [hasSeenTour, currentStep, tourStage, setTourStage, completeTour]);

  const handleGotIt = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Majukan stage agar panduan di halaman ini tertutup dan menunggu halaman berikutnya
    if (tourStage === 'register') setTourStage('login');
    else if (tourStage === 'login') setTourStage('diagnosis');
    else if (tourStage === 'diagnosis') setTourStage('save');
    else completeTour();
  };

  if (hasSeenTour || !currentStep || !targetRect) return null;

  return (
    <>
      {/* Overlay Backdrop - pointerEvents: none agar user BISA mengklik tombol di bawahnya */}
      <div 
        className="fixed inset-0 z-[9998] pointer-events-none transition-all duration-500"
        style={{
          background: `radial-gradient(circle at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, transparent 40px, rgba(0, 0, 0, 0.65) 60px)`
        }}
      />

      {/* Cincin Spotlight Tambahan untuk memperjelas target */}
      <div 
        className="fixed z-[9998] border-2 border-blue-400 rounded-lg pointer-events-none animate-pulse"
        style={{
          top: targetRect.top - 8,
          left: targetRect.left - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
          boxShadow: '0 0 15px rgba(96, 165, 250, 0.5)'
        }}
      />

      {/* Tooltip Card */}
      <div 
        ref={tooltipRef}
        className="fixed z-[9999] bg-white rounded-xl shadow-2xl w-[320px] p-5 border-2 border-blue-100 transition-all duration-300 pointer-events-auto"
        style={{
          // Posisikan tooltip di bawah atau di atas elemen tergantung ruang yang tersedia
          top: targetRect.bottom + 20 + 200 > window.innerHeight 
               ? Math.max(10, targetRect.top - 220) // Di atas
               : targetRect.bottom + 20,            // Di bawah
          left: Math.max(10, Math.min(targetRect.left, window.innerWidth - 330)),
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            {currentStep.stepIdx + 1}
          </div>
          <h3 className="text-lg font-bold text-slate-800 m-0">{currentStep.title}</h3>
        </div>
        
        <p className="text-slate-600 text-sm leading-relaxed mb-5">
          {currentStep.content}
        </p>
        
        {/* Progress Bar */}
        <div className="flex gap-1 mb-5">
          {TOUR_STEPS.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 flex-1 rounded-full ${idx <= currentStep.stepIdx ? 'bg-blue-500' : 'bg-slate-200'}`}
            />
          ))}
        </div>

        <div className="flex justify-end items-center">
          <Button 
            onClick={handleGotIt}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md gap-2 h-9 px-4 rounded-lg"
          >
            Mengerti <CheckCircle2 className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Tanda panah segitiga penunjuk arah */}
        <div 
          className="absolute w-4 h-4 bg-white border-blue-100 transform rotate-45"
          style={{
            // Jika tooltip di bawah elemen, panah menghadap atas
            ...(targetRect.bottom + 20 + 200 <= window.innerHeight 
              ? { top: -9, left: 24, borderTopWidth: 2, borderLeftWidth: 2 }
              : { bottom: -9, left: 24, borderBottomWidth: 2, borderRightWidth: 2 } // Jika tooltip di atas elemen, panah menghadap bawah
            )
          }}
        />
      </div>
    </>
  );
};