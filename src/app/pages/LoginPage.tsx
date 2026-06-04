import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Mail, Lock, Loader, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import logo from '../../assets/logo_pulih_bersama.png';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const result = await login(email, password);

    if (result.ok) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      toast.success(`Masuk berhasil! Selamat datang, ${user.name} 🌟`);

      setTimeout(() => {
        if (user.role === 'admin') {
          onNavigate('admin-dashboard');
        } else {
          onNavigate('user-dashboard');
        }
      }, 1000);
    } else {
      const nextErrors: { email?: string; password?: string; general?: string } = {};
      if (result.fieldErrors?.email) nextErrors.email = result.fieldErrors.email;
      if (result.fieldErrors?.password) nextErrors.password = result.fieldErrors.password;

      // If backend provides only a generic message, show it as a general warning.
      if (!nextErrors.email && !nextErrors.password) {
        nextErrors.general = result.message || 'Email atau kata sandi salah.';
      }

      setErrors(nextErrors);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#93c5fd]/20 via-[#ddd6fe]/20 to-[#86efac]/20 py-16 px-4 flex items-center justify-center">
      <Card className="w-full max-w-md border-2 shadow-lg">
        <CardHeader className="text-center space-y-4 pb-8">
          {/* Logo Lingkaran (Bisa diganti dengan img logo seperti di Footer) */}
          <div className="inline-flex items-center justify-center w-16 h-16 mx-auto">
            <img src={logo} alt="Logo Pulih Bersama" className="w-full h-full object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#1e3a8a] to-[#5b21b6] bg-clip-text text-transparent">
            Masuk ke Pulih Bersama
          </CardTitle>
          <p className="text-gray-600 text-sm">Kami senang melihatmu kembali 💙</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#93c5fd]" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined, general: undefined }));
                }}
                placeholder="nama@gmail.com"
                required
                className={`border-2 ${errors.email ? 'border-red-300' : 'focus:border-[#93c5fd]'}`}
                disabled={isLoading}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#93c5fd]" /> Kata Sandi
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined, general: undefined }));
                  }}
                  placeholder="Masukkan kata sandi"
                  required
                  className={`border-2 pr-10 ${errors.password ? 'border-red-300' : 'focus:border-[#93c5fd]'}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            {errors.general && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            <Button id="tour-login-submit-btn" type="submit" className="w-full bg-gradient-to-r from-[#93c5fd] to-[#ddd6fe] text-[#1e3a8a]" disabled={isLoading}>
              {isLoading ? 'Sedang masuk...' : 'Masuk'}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Belum punya akun?{' '}
              <button type="button" onClick={() => onNavigate('register')} className="text-[#1e3a8a] font-semibold">
                Daftar di sini
              </button>
            </div>

            {/* Bagian Demo masuk disingkirkan atau disesuaikan dengan akun asli */}
            <div className="pt-4 border-t border-gray-200 text-center">
              <p className="text-[10px] text-gray-400">Pastikan email & password sudah terdaftar.</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};