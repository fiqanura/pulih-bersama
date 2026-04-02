import React from 'react';
import { House, Clock, FileText, Activity, Lightbulb, Users, LogOut, Heart, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { useApp } from '../context/AppContext';

interface AdminSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentPage, onNavigate }) => {
  const { currentUser: user, logout } = useApp();

  const menuItems = [
    { icon: House, label: 'Dashboard', value: 'admin-dashboard' },
    { icon: Clock, label: 'Riwayat Pengguna', value: 'admin-user-history' },
    { icon: FileText, label: 'Manajemen Berita', value: 'admin-articles' },
    { icon: Activity, label: 'Manajemen Gejala', value: 'admin-symptoms' },
    { icon: Lightbulb, label: 'Manajemen Konten', value: 'admin-recommendations' },
    { icon: Users, label: 'Manajemen User', value: 'admin-users' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-border h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#93c5fd] to-[#ddd6fe] rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">Pulih Bersama</h2>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Admin Info */}
      <div className="p-6 border-b border-border bg-gradient-to-br from-[#ddd6fe]/10 to-[#93c5fd]/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#ddd6fe] to-[#93c5fd] rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 truncate">{user?.name || 'Administrator'}</p>
            <p className="text-xs text-[#5b21b6] font-medium">Administrator</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.value}
            onClick={() => onNavigate(item.value)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${
              currentPage === item.value
                ? 'bg-gradient-to-r from-[#93c5fd] to-[#ddd6fe] text-[#1e3a8a]'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          onClick={() => {
            logout();
            onNavigate('home');
          }}
          className="w-full justify-start text-gray-600 hover:text-red-600 hover:border-red-300"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Keluar
        </Button>
      </div>
    </aside>
  );
};
