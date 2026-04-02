import React, { useState } from 'react';
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

  const navItems = [
    { label: 'Home', value: 'home' },
    { label: 'Tentang Kami', value: 'about' },
    { label: 'Berita', value: 'news' },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <button
            onClick={() => onNavigate('home')}
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
                onClick={() => onNavigate(item.value)}
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
              <Button
                variant="outline"
                onClick={() => onNavigate('login')}
                className="border-[#93c5fd] text-[#1e3a8a] hover:bg-[#93c5fd]/10"
              >
                Login
              </Button>
              <Button
                onClick={() => onNavigate('register')}
                className="bg-gradient-to-r from-[#93c5fd] to-[#ddd6fe] text-[#1e3a8a] hover:opacity-90 shadow-sm"
              >
                Register
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
    </nav>
  );
};