import React from 'react';
import { House, FileText, Clock, User, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useApp } from '../context/AppContext';
import logo from '../../assets/logo_pulih_bersama.png';

interface UserSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({ currentPage, onNavigate }) => {
  const { currentUser, logout } = useApp();

  const menuItems = [
    { icon: House, label: 'Dashboard', value: 'user-dashboard' },
    { icon: FileText, label: 'Diagnosis', value: 'diagnosis' },
    { icon: Clock, label: 'Riwayat', value: 'history' },
    { icon: User, label: 'Profil', value: 'profile' },
  ];

  return (
    <div className="bg-white border-r border-border h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden border border-[#93c5fd]/30">
            <img src={logo} alt="Logo Pulih Bersama" className="w-full h-full object-contain p-1" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">Pulih Bersama</h2>
            <p className="text-xs text-gray-500">User Panel</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-border bg-gradient-to-br from-[#93c5fd]/5 to-[#ddd6fe]/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#93c5fd] to-[#ddd6fe] rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 truncate">{currentUser?.name}</p>
            <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.value}
            onClick={() => onNavigate(item.value)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentPage === item.value
                ? 'bg-gradient-to-r from-[#93c5fd] to-[#ddd6fe] text-[#1e3a8a]'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
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
    </div>
  );
};
