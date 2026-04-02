import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useApp } from '../../context/AppContext';
import { User, Mail, Phone, Lock, Save } from 'lucide-react';
import { toast } from 'sonner';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile, updatePassword } = useApp();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const handleSaveProfile = () => {
    updateProfile(profileData);
    setIsEditingProfile(false);
    toast.success('Profil berhasil diperbarui! ✓');
  };

  const handleSavePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Password tidak sama!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password minimal 6 karakter!');
      return;
    }
    updatePassword(passwordData.newPassword);
    setPasswordData({ newPassword: '', confirmPassword: '' });
    setIsEditingPassword(false);
    toast.success('Password berhasil diubah! 🔒');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Profil Saya</h1>
        <p className="text-gray-600">Kelola informasi akun dan keamananmu</p>
      </div>

      {/* Profile Information */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#93c5fd]" />
            Informasi Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                disabled={!isEditingProfile}
                className="border-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                disabled={!isEditingProfile}
                className="border-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                disabled={!isEditingProfile}
                className="border-2"
              />
            </div>
          </div>

          <div className="flex gap-3">
            {!isEditingProfile ? (
              <Button
                onClick={() => setIsEditingProfile(true)}
                className="bg-gradient-to-r from-[#93c5fd] to-[#ddd6fe] text-[#1e3a8a]"
              >
                Edit Profil
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSaveProfile}
                  className="bg-gradient-to-r from-[#93c5fd] to-[#ddd6fe] text-[#1e3a8a]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Perubahan
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setProfileData({
                      name: currentUser?.name || '',
                      email: currentUser?.email || '',
                      phone: currentUser?.phone || '',
                    });
                    setIsEditingProfile(false);
                  }}
                  className="border-2"
                >
                  Batal
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#93c5fd]" />
            Ubah Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isEditingPassword ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Pastikan password kamu aman dengan menggantinya secara berkala.
              </p>
              <Button
                onClick={() => setIsEditingPassword(true)}
                variant="outline"
                className="border-2 border-[#93c5fd] text-[#1e3a8a]"
              >
                Ubah Password
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Password Baru</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="border-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...profileData, confirmPassword: e.target.value })}
                    placeholder="Masukkan password yang sama"
                    className="border-2"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSavePassword}
                  className="bg-gradient-to-r from-[#93c5fd] to-[#ddd6fe] text-[#1e3a8a]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Password
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPasswordData({ newPassword: '', confirmPassword: '' });
                    setIsEditingPassword(false);
                  }}
                  className="border-2"
                >
                  Batal
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-2 bg-gradient-to-br from-[#93c5fd]/5 to-[#ddd6fe]/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-800">Tips Keamanan</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Gunakan password yang unik dan kuat</li>
                <li>• Jangan bagikan password kepada siapapun</li>
                <li>• Perbarui informasi profil jika ada perubahan</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
