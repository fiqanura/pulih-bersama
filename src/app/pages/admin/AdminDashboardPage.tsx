import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Users, FileText, Activity, TrendingUp, ClipboardList } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, type ChartData } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboardPage: React.FC = () => {
  const [backendStats, setBackendStats] = useState({
    total_users: 0,
    total_articles: 0,
    total_diagnosis: 0,
    recent_diagnoses: [],
    total_symptoms: 0,
  });
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]); // Define users with proper type
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [years, setYears] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnosisData, setDiagnosisData] = useState<ChartData<'line', number[], string>>({
    labels: [],
    datasets: [],
  });

  const monthLabels = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  async function fetchTrendData(year: number) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/diagnosis-trend?year=${year}`);
      const payload = await response.json();

      // Backend might return either:
      // 1) { year: number, data: number[12] }
      // 2) [{ month: string|number, count: number }, ...]
      let values: number[] | null = null;

      if (payload && Array.isArray(payload.data)) {
        values = payload.data;
      } else if (Array.isArray(payload)) {
        values = payload.map((item: any) => Number(item?.count ?? 0));
      }

      if (!values) {
        throw new Error('Format data tren diagnosis tidak dikenali');
      }

      const normalizedValues = Array.from({ length: 12 }, (_, i) => Number(values?.[i] ?? 0));
      const chartData = {
        labels: monthLabels,
        datasets: [
          {
            label: 'Jumlah Diagnosa',
            data: normalizedValues,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
          },
        ],
      };

      setDiagnosisData(chartData);
      setError(null);
    } catch {
      setError('Gagal memuat data tren diagnosis.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/admin/stats');
        const data = await response.json();
        setBackendStats(data);
      } catch (error) {
        console.error('Error fetching backend stats:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/admin/user-history');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchStats();
    fetchUsers();

    const currentYear = new Date().getFullYear();
    const yearRange = Array.from({ length: 5 }, (_, i) => currentYear - i);
    setYears(yearRange);

    fetchTrendData(currentYear);
  }, []);

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedYear = Number(event.target.value);
    setSelectedYear(selectedYear);
    fetchTrendData(selectedYear);
  };

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
      value: backendStats.total_symptoms,
      color: '#fbbf24',
      bgColor: 'from-[#fbbf24]/20 to-[#fbbf24]/10',
    },
  ];

  const recentDiagnoses = backendStats.recent_diagnoses || [];

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
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Admin</h1>
        <p className="text-gray-600">Selamat datang di panel administrasi Pulih Bersama</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat: any, index: number) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card className="border-2 w-full">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Diagnosis Terbaru</h3>
            {recentDiagnoses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Belum ada diagnosis</p>
            ) : (
              <div className="space-y-3">
                {recentDiagnoses.map((diagnosis: any) => {
                  const user = users.find((u) => u.id === diagnosis.user_id);
                  const dt = new Date(diagnosis.created_at);
                  const isValidDate = !isNaN(dt.getTime());
                  return (
                    <div key={diagnosis.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-gray-800 font-medium">
                          {diagnosis.diagnosis || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {isValidDate
                            ? dt.toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })
                            : '-'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Oleh: {user ? user.name : 'Unknown'}
                        </p>
                      </div>
                      <div
                        className={`px-4 py-2 rounded-lg ${getRiskColor(diagnosis.risk_level)}`}
                      >
                        {diagnosis.risk_level}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="diagnosis-container" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Tren Jumlah Diagnosa per Bulan</h3>
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="border border-gray-300 rounded-md p-2"
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        {isLoading ? (
          <p className="text-center text-gray-500">Memuat data...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="diagnosis-card" style={{ flex: 1, padding: '20px', margin: '10px 0', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <Line data={diagnosisData} options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: true,
                  text: `Tren Jumlah Diagnosa per Bulan (${selectedYear})`,
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const label = context.label ?? '';
                      const value = Number(context.parsed?.y ?? context.raw ?? 0);
                      return `Jumlah Diagnosa (${label}): ${value}`;
                    },
                    footer: () => {
                      const values = Array.isArray((diagnosisData as any)?.datasets?.[0]?.data)
                        ? ((diagnosisData as any).datasets[0].data as any[])
                        : [];
                      const total = values.reduce((sum, v) => sum + Number(v ?? 0), 0);
                      return `Total ${selectedYear}: ${total}`;
                    },
                  },
                },
              },
            }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
