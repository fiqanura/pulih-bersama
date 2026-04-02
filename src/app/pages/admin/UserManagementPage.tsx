import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useApp } from '../../context/AppContext';
import { Shield, User } from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';

export const UserManagementPage: React.FC = () => {
  const { users, updateUserRole } = useApp();

  const handleToggleRole = (userId: string, currentRole: 'user' | 'admin') => {
    const newRole = currentRole === 'user' ? 'admin' : 'user';
    updateUserRole(userId, newRole);
    toast.success(`Role berhasil diubah menjadi ${newRole}!`);
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Manajemen User</h1>
        <p className="text-gray-600">Kelola pengguna dan role</p>
      </div>

      <Card className="border-2">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
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
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      Aktif
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleRole(user.id, user.role)}
                      className="border-[#93c5fd] text-[#1e3a8a]"
                    >
                      Ubah ke {user.role === 'user' ? 'Admin' : 'User'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-2 bg-gradient-to-br from-[#fde68a]/10 to-[#fca5a5]/10">
        <CardContent className="p-6">
          <p className="text-sm text-gray-700">
            <strong>⚠️ Perhatian:</strong> Perubahan role akan langsung berlaku. Pastikan Anda memberikan role admin hanya kepada pengguna yang dipercaya.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
