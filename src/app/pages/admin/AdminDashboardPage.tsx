import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { useApp } from '../../context/AppContext';
import { Users, FileText, Activity, TrendingUp, ClipboardList } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { symptoms, users, articles } = useApp(); // Mengambil data pengguna dari AppContext
  const [backendStats, setBackendStats] = React.useState({
    total_users: 0,
    total_articles: 0,
    total_diagnosis: 0,
    recent_diagnoses: [],
    total_symptoms: 0, // Pastikan backend mengirimkan total_symptoms
  });
  const [isLoading, setIsLoading] = React.useState(true);

  // --- AMBIL DATA DARI DATABASE ---
  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/admin/stats');
        const data = await response.json();
        setBackendStats(data);
      } catch (error) {
        console.error('Gagal mengambil statistik:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    {
      icon: Users,
      label: 'Total Pengguna',
      value: backendStats.total_users,
      color: '#93c5fd',
      bgColor: 'from-[#93c5fd]/20 to-[#93c5fd]/10',
    },
    {
      icon: Activity,
      label: 'Total Diagnosis',
      value: backendStats.total_diagnosis,
      color: '#86efac',
      bgColor: 'from-[#86efac]/20 to-[#86efac]/10',
    },
    {
      icon: FileText,
      label: 'Total Artikel',
      value: backendStats.total_articles,
      color: '#ddd6fe',
      bgColor: 'from-[#ddd6fe]/20 to-[#ddd6fe]/10',
    },
    {
      icon: ClipboardList,
      label: 'Total Gejala (PPDGJ-III)',
      value: backendStats.total_symptoms, // Pastikan backend mengirimkan total_symptoms
      color: '#fbbf24',
      bgColor: 'from-[#fbbf24]/20 to-[#fbbf24]/10',
    },
  ];

  if (isLoading) return <div className="p-8 text-center">Memuat data Pusat Komando...</div>;

  const recentDiagnoses = backendStats.recent_diagnoses;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Tidak Terindikasi':
        return 'bg-green-100 text-green-700';
      case 'Ringan':
        return 'bg-[#86efac] text-[#166534]';
      case 'Sedang':
        return 'bg-[#fde68a] text-[#854d0e]';
      case 'Berat':
        return 'bg-[#fca5a5] text-[#991b1b]';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Admin</h1>
        <p className="text-gray-600">Selamat datang di panel administrasi Pulih Bersama</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className={`mb-4 w-12 h-12 bg-gradient-to-br ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Diagnoses */}
        <Card className="border-2">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Diagnosis Terbaru</h3>
            {recentDiagnoses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Belum ada diagnosis</p>
            ) : (
              <div className="space-y-3">
                {recentDiagnoses.map((diagnosis: any) => {
                  const user = users.find(u => u.id === diagnosis.userId);
                  return (
                    <div key={diagnosis.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{user?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(diagnosis.date).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs ${getRiskColor(diagnosis.overallRisk)}`}>
                        {diagnosis.overallRisk}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Stats */}
        <Card className="border-2">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Statistik Pengguna</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-[#93c5fd]/10 to-[#93c5fd]/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Total User</span>
                  <span className="font-bold text-[#1e3a8a]">{users.filter(u => u.role === 'user').length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#93c5fd] h-2 rounded-full transition-all"
                    style={{ width: `${(users.filter(u => u.role === 'user').length / users.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-[#ddd6fe]/10 to-[#ddd6fe]/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Total Admin</span>
                  <span className="font-bold text-[#5b21b6]">{users.filter(u => u.role === 'admin').length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#ddd6fe] h-2 rounded-full transition-all"
                    style={{ width: `${(users.filter(u => u.role === 'admin').length / users.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-[#86efac]/10 to-[#86efac]/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Rata-rata Tes per User</span>
                  <span className="font-bold text-[#166534]">
                    {users.filter(u => u.role === 'user').length > 0
                      ? (backendStats.total_diagnosis / users.filter(u => u.role === 'user').length).toFixed(1)
                      : '0'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-2 bg-gradient-to-br from-[#93c5fd]/5 to-[#ddd6fe]/5">
        <CardContent className="p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Ringkasan Sistem</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-lg border-2">
              <div className="text-3xl mb-2">📊</div>
              <h4 className="font-semibold text-gray-800 mb-1">Data Terkelola</h4>
              <p className="text-sm text-gray-600">Semua data pengguna dan diagnosis tersimpan dengan aman</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg border-2">
              <div className="text-3xl mb-2">🔒</div>
              <h4 className="font-semibold text-gray-800 mb-1">Privasi Terjaga</h4>
              <p className="text-sm text-gray-600">Informasi pengguna dilindungi dengan baik</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg border-2">
              <div className="text-3xl mb-2">✨</div>
              <h4 className="font-semibold text-gray-800 mb-1">Sistem Aktif</h4>
              <p className="text-sm text-gray-600">Platform berjalan dengan optimal</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
