import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import { CheckCircle2, MousePointerClick } from 'lucide-react';

interface OnboardingTourProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const TOUR_STEPS = [
  {
    target: '#tour-register-btn',
    title: '1. Daftar Akun',
    content: 'Klik tombol ini untuk membuat akun baru di Pulih Bersama.',
    page: 'home',
    stage: 'register',
    stepIdx: 0,
  },
  {
    target: '#tour-login-btn',
    title: '2. Masuk (Login)',
    content: 'Masukkan email dan kata sandi Anda, lalu klik tombol ini untuk masuk.',
    page: 'login',
    stage: 'login',
    stepIdx: 1,
  },
  {
    target: '#tour-start-test-btn',
    title: '3. Isi Diagnosis',
    content: 'Silakan tekan tombol yang disorot untuk mulai melakukan tes kesehatan mental.',
    page: 'user-dashboard',
    stage: 'diagnosis',
    stepIdx: 2,
  },
  {
    target: '#tour-save-test-btn',
    title: '4. Simpan ke Riwayat',
    content: 'Pilih rekomendasi intervensi, lalu simpan hasil Anda ke riwayat.',
    page: 'diagnosis-result',
    stage: 'save',
    stepIdx: 3,
  },
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ currentPage }) => {
  const { hasSeenTour, completeTour, tourStage, setTourStage } = useApp();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = TOUR_STEPS.find(s => s.stage === tourStage && s.page === currentPage);

  // 🔥 TAKTIK 2: Fungsi untuk mengecek elemen, ditambah pendeteksi Viewport (Layar)
  const getVisibleElement = (selector: string, requireInViewport: boolean = false) => {
    const elements = document.querySelectorAll(selector);
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i] as HTMLElement;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);

      let isVisible = rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';

      // Jika diset TRUE, sistem akan menahan render sampai elemen masuk ke dalam layar saat di-scroll
      if (isVisible && requireInViewport) {
        const isInViewport = rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
        isVisible = isInViewport;
      }

      if (isVisible) {
        return { el, rect };
      }
    }
    return null;
  };

  useEffect(() => {
    if (hasSeenTour || !currentStep) {
      setTargetRect(null);
      return;
    }

    // 🔥 TAKTIK 1: Hanya izinkan maju JIKA target asli (tombol) ditekan
    const handleDocumentClick = (e: MouseEvent) => {
      const targetEl = document.querySelector(currentStep.target);

      // Jika yang diklik adalah tombol yang sedang disorot
      if (targetEl && targetEl.contains(e.target as Node)) {
        if (tourStage === 'register') setTourStage('login');
        else if (tourStage === 'login') setTourStage('diagnosis');
        else if (tourStage === 'diagnosis') setTourStage('save');
        else completeTour();
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);

    const updatePosition = () => {
      if (currentStep) {
        // Khusus tahap "Save", paksa sistem menunggu sampai user scroll ke bawah (elemen masuk layar)
        const mustBeInViewport = currentStep.stage === 'save';
        const found = getVisibleElement(currentStep.target, mustBeInViewport);

        if (found) {
          setTargetRect(found.rect);
        } else {
          setTargetRect(null); // Sembunyikan lampu sorot jika belum di-scroll / belum terlihat
        }
      }
    };

    const timer = setTimeout(updatePosition, 300);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    const interval = setInterval(updatePosition, 500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      clearInterval(interval);
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [hasSeenTour, currentStep, tourStage, setTourStage, completeTour]);

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    completeTour();
  };

  const handleGotIt = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tourStage === 'register') setTourStage('login');
    else if (tourStage === 'login') setTourStage('diagnosis');
    else if (tourStage === 'diagnosis') setTourStage('save');
    else completeTour();
  };

  if (hasSeenTour || !currentStep || !targetRect) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[9998] pointer-events-none transition-all duration-500"
        style={{
          background: `radial-gradient(circle at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, transparent 40px, rgba(0, 0, 0, 0.65) 60px)`
        }}
      />

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

      <div
        ref={tooltipRef}
        className="fixed z-[9999] bg-white rounded-xl shadow-2xl w-[320px] p-5 border-2 border-blue-100 transition-all duration-300 pointer-events-auto"
        style={{
          top: targetRect.bottom + 20 + 200 > window.innerHeight
            ? Math.max(10, targetRect.top - 220)
            : targetRect.bottom + 20,
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

        <div className="flex gap-1 mb-5">
          {TOUR_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full ${idx <= currentStep.stepIdx ? 'bg-blue-500' : 'bg-slate-200'}`}
            />
          ))}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handleSkip}
            className="text-sm text-slate-400 hover:text-slate-600 font-medium px-2"
          >
            Selesai
          </button>

          {/* 🔥 Jika di tahap Diagnosis, tombol Mengerti diubah jadi pesan instruksi */}
          {currentStep.stage === 'diagnosis' ? (
            <div className="bg-blue-50 text-blue-600 text-[13px] font-semibold px-3 py-2 rounded-lg flex items-center gap-2 border border-blue-200">
              <MousePointerClick className="w-4 h-4 animate-bounce" />
              Klik target disorot
            </div>
          ) : (
            <Button
              onClick={handleGotIt}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md gap-2 h-9 px-4 rounded-lg"
            >
              {currentStep.stage === 'save' ? 'Selesai' : 'Mengerti'} <CheckCircle2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div
          className="absolute w-4 h-4 bg-white border-blue-100 transform rotate-45"
          style={{
            ...(targetRect.bottom + 20 + 200 <= window.innerHeight
              ? { top: -9, left: 24, borderTopWidth: 2, borderLeftWidth: 2 }
              : { bottom: -9, left: 24, borderBottomWidth: 2, borderRightWidth: 2 }
            )
          }}
        />
      </div>
    </>
  );
};