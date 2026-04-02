import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Eye, Search, Loader } from 'lucide-react';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

export const UserHistoryPage: React.FC = () => {
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- AMBIL DATA DARI DATABASE ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/admin/user-history');
        const data = await response.json();
        setDbUsers(data);
      } catch (error) {
        console.error("Gagal ambil riwayat:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredUsers = dbUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Ringan': return 'bg-[#86efac] text-[#166534]';
      case 'Sedang': return 'bg-[#fde68a] text-[#854d0e]';
      case 'Berat': return 'bg-[#fca5a5] text-[#991b1b]';
      case 'Tidak Terindikasi': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  if (isLoading) return (
    <div className="p-8 flex items-center justify-center">
      <Loader className="animate-spin mr-2" /> Membuka Arsip Pengguna...
    </div>
  );

  // VIEW DETAIL USER
  if (selectedUser) {
    return (
      <div className="p-8 space-y-6">
        <Button variant="ghost" onClick={() => setSelectedUser(null)} className="hover:bg-[#93c5fd]/10">
          ← Kembali ke Daftar
        </Button>

        <Card className="border-2 shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-[#1e3a8a] mb-6">Detail Profil & Riwayat</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-xl mb-8">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Nama Lengkap</p>
                <p className="font-semibold text-lg">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Email</p>
                <p className="font-semibold text-lg">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Nomor Telepon</p>
                <p className="font-semibold text-lg">{selectedUser.phone || '-'}</p>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-4">Aktivitas Diagnosis</h3>
            <div className="text-center py-10 border-2 border-dashed rounded-xl">
               <p className="text-gray-400">Data diagnosa akan muncul di sini setelah tabel Diagnosa di Backend selesai dibuat.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // VIEW TABEL UTAMA
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1e3a8a] mb-2">Riwayat Pengguna</h1>
        <p className="text-gray-600">Manajemen data dan pantauan hasil diagnosa</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Cari nama atau email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-2 focus:border-[#93c5fd]"
        />
      </div>

      <Card className="border-2 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-bold">Nama</TableHead>
              <TableHead className="font-bold">Email</TableHead>
              <TableHead className="font-bold">Telepon</TableHead>
              <TableHead className="text-right font-bold">Opsi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-blue-50/30">
                <TableCell className="font-medium text-gray-800">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone || '-'}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedUser(user)}
                    className="border-[#93c5fd] text-[#1e3a8a] hover:bg-[#93c5fd] hover:text-white"
                  >
                    <Eye className="w-4 h-4 mr-1" /> Lihat Detail
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-gray-400">
                  Tidak ada data pengguna yang ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};