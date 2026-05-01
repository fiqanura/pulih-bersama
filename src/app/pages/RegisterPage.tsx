import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { User, Mail, Phone, Lock, Loader, Eye, EyeOff, CircleCheck } from 'lucide-react';
import { toast } from 'sonner';
import logo from '../../assets/logo_pulih_bersama.png';
import { validateCommonEmailDomain } from '../utils/emailValidation';
import { validatePhone12to13Digits } from '../utils/phoneValidation';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nama lengkap harus diisi';

    const emailValidation = validateCommonEmailDomain(formData.email);
    if (!emailValidation.ok) newErrors.email = emailValidation.message;

    const phoneValidation = validatePhone12to13Digits(formData.phone);
    if (!phoneValidation.ok) newErrors.phone = phoneValidation.message;
    if (!formData.password) {
      newErrors.password = 'Kata sandi harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Kata sandi minimal 6 karakter';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Kata sandi tidak sama';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // TEMBAK LANGSUNG KE BACKEND LARAVEL
      const response = await fetch('http://127.0.0.1:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone.replace(/\s/g, ''),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Pendaftaran berhasil! Silakan masuk');
        setTimeout(() => {
          onNavigate('login');
        }, 1500);
      } else {
        // Menampilkan pesan error dari Laravel (misal email/phone sudah ada)
        const errorsObj: any = data?.errors ?? data;
        const emailError =
          Array.isArray(errorsObj?.email) ? errorsObj.email[0] : errorsObj?.email;
        const phoneError =
          Array.isArray(errorsObj?.phone) ? errorsObj.phone[0] : errorsObj?.phone;

        if (emailError) {
          toast.error(String(emailError));
        } else if (phoneError) {
          toast.error(String(phoneError));
        } else {
          toast.error(data?.message || 'Terjadi kesalahan pada pendaftaran.');
        }
      }
    } catch (err) {
      toast.error('Gagal terhubung ke server!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#93c5fd]/20 via-[#ddd6fe]/20 to-[#86efac]/20 py-16 px-4 flex items-center justify-center">
      <Card className="w-full max-w-md border-2 shadow-lg">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mx-auto">
            <img src={logo} alt="Logo Pulih Bersama" className="w-full h-full object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#1e3a8a] to-[#5b21b6] bg-clip-text text-transparent">
            Bergabung dengan Pulih Bersama
          </CardTitle>
          <p className="text-gray-600 text-sm">Langkah pertama menuju pemulihan</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#93c5fd]" /> Nama Lengkap
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Nama Lengkap"
                className={`border-2 ${errors.name ? 'border-red-300' : 'focus:border-[#93c5fd]'}`}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Input Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#93c5fd]" /> Nomor Telepon
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="08xxxxxxxxxx"
                className={`border-2 ${errors.phone ? 'border-red-300' : 'focus:border-[#93c5fd]'}`}
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>

            {/* Input Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#93c5fd]" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="nama@gmail.com"
                className={`border-2 ${errors.email ? 'border-red-300' : 'focus:border-[#93c5fd]'}`}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Input Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#93c5fd]" /> Kata Sandi
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={`border-2 pr-10 ${errors.password ? 'border-red-300' : 'focus:border-[#93c5fd]'}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            {/* Input Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <CircleCheck className="w-4 h-4 text-[#93c5fd]" /> Konfirmasi Kata Sandi
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className={`border-2 pr-10 ${errors.confirmPassword ? 'border-red-300' : 'focus:border-[#93c5fd]'}`}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-[#93c5fd] to-[#ddd6fe] text-[#1e3a8a]" disabled={isLoading}>
              {isLoading ? <><Loader className="w-4 h-4 mr-2 animate-spin" /> Sedang mendaftar...</> : 'Daftar Sekarang'}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Sudah punya akun? <button type="button" onClick={() => onNavigate('login')} className="text-[#1e3a8a] font-semibold">Masuk di sini</button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};