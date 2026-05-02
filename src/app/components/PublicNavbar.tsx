import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react'; 
import { Button } from './ui/button';

// --- PEMANGGILAN LOGO ---
import LogoFoto from '../../assets/logo_pulih_bersama.png'; 

interface PublicNavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({ onNavigate, currentPage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPage]);

  const navigateAndClose = (page: string) => {
    setMobileMenuOpen(false);
    onNavigate(page);
  };

  const navItems = [
    { label: 'Beranda', value: 'home' },
    { label: 'Tentang Kami', value: 'about' },
    { label: 'Artikel', value: 'news' },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <button
            onClick={() => navigateAndClose('home')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
              <img 
                src={LogoFoto} 
                alt="Logo Pulih Bersama" 
                className="w-full h-full object-contain" 
              />
            </div>

            <span className="text-xl font-semibold bg-gradient-to-r from-[#93c5fd] to-[#ddd6fe] bg-clip-text text-transparent">
              Pulih Bersama
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              <button
                key={item.value}
                onClick={() => navigateAndClose(item.value)}
                className={`transition-colors font-medium ${
                  currentPage === item.value
                    ? 'text-[#1e3a8a]'
                    : 'text-gray-600 hover:text-[#1e3a8a]'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            <div className="flex items-center gap-3 ml-4">
              <Button id="tour-login-btn" variant="outline" onClick={() => navigateAndClose('login')}
                className="border-[#93c5fd] text-[#1e3a8a] hover:bg-[#93c5fd]/10"
              >
                Masuk
              </Button>
              <Button id="tour-register-btn" onClick={() => navigateAndClose('register')}
                className="bg-gradient-to-r from-[#93c5fd] to-[#ddd6fe] text-[#1e3a8a] hover:opacity-90 shadow-sm"
              >
                Daftar
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => navigateAndClose(item.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-medium ${
                    currentPage === item.value
                      ? 'bg-[#93c5fd]/15 text-[#1e3a8a]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button id="tour-login-btn" variant="outline" onClick={() => navigateAndClose('login')}
                className="w-full border-[#93c5fd] text-[#1e3a8a] hover:bg-[#93c5fd]/10"
              >
                Masuk
              </Button>
              <Button id="tour-register-btn" onClick={() => navigateAndClose('register')}
                className="w-full bg-gradient-to-r from-[#93c5fd] to-[#ddd6fe] text-[#1e3a8a] hover:opacity-90 shadow-sm"
              >
                Daftar
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};