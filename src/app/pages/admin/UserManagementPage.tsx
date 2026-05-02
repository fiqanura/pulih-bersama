import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useApp } from '../../context/AppContext';
import { Shield, User, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog';

export const UserManagementPage: React.FC = () => {
  const { users, updateUserRole, fetchUsers, deleteUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleRole = async (userId: string, currentRole: 'user' | 'admin') => {
    const newRole = currentRole === 'user' ? 'admin' : 'user';
    const res = await updateUserRole(userId, newRole);
    if (res.ok) {
      toast.success(`Hak akses berhasil diubah!`);
      await fetchUsers();
      return;
    }
    toast.error(res.message || 'Gagal mengubah hak akses.');
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    const res = await deleteUser(userId);
    if (res.ok) {
      toast.success(`Akun "${userName}" berhasil dihapus.`);
      await fetchUsers();
      return;
    }
    toast.error(res.message || 'Gagal menghapus akun.');
  };

  const filteredUsers = users.filter((user) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const haystack = `${user.name} ${user.email} ${user.phone ?? ''} ${user.role}`.toLowerCase();
    return haystack.includes(q);
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Manajemen User</h1>
        <p className="text-gray-600">Kelola pengguna dan hak akses</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Cari nama, email, atau telepon..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-2 focus:border-[#93c5fd]"
        />
      </div>

      <Card className="border-2">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">No</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-center text-gray-600">{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {user.role === 'admin' ? (
                          <Shield className="w-4 h-4 text-purple-600" />
                        ) : (
                          <User className="w-4 h-4 text-blue-600" />
                        )}
                        {user.name}
                      </div>
                    </TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}
                      >
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">Aktif</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleRole(user.id, user.role)}
                          className="border-[#93c5fd] text-[#1e3a8a]"
                        >
                          Ubah ke {user.role === 'user' ? 'Admin' : 'User'}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="outline"
                              aria-label={`Hapus akun ${user.name}`}
                              className="border-destructive/30 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus akun?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Akun <strong>{user.name}</strong> akan dihapus permanen.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction asChild>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDeleteUser(user.id, user.name)}
                                >
                                  Hapus
                                </Button>
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-400">
                    Tidak ada pengguna yang cocok dengan pencarian.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-2 bg-gradient-to-br from-[#fde68a]/10 to-[#fca5a5]/10">
        <CardContent className="p-6">
          <p className="text-sm text-gray-700">
            <strong>⚠️ Perhatian:</strong> Perubahan hak akses akan langsung berlaku. Pastikan Anda memberikan hak akses admin hanya kepada pengguna yang dipercaya.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
