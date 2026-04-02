import React, { useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

// Tambahkan tipe data yang hilang
export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
};

export type Article = {
  id: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  category: string;
  date: string;
};

export type Recommendation = {
  id: string;
  title: string;
  type: 'Article' | 'Video';
  category: string;
  risk_level: 'Sedang' | 'Berat';
  link: string;
};

export type CFResult = {
  category: string;
  score: number;
  percentage: number;
};

export type RiskLevel = 'Tidak Terindikasi' | 'Ringan' | 'Sedang' | 'Berat';

export type DiagnosisResult = {
  id: string;
  userId: string;
  date: string;
  dominantCategory: string;
  overallRisk: RiskLevel;
  results: CFResult[];
  recommendations: Recommendation[];
};

export const AppContext = React.createContext({
  currentUser: null as User | null,
  users: [] as User[],
  diagnosisResults: [] as DiagnosisResult[],
  articles: [] as Article[],
  recommendations: [] as Recommendation[],
  symptoms: [] as Symptom[],
  login: async (email: string, password: string): Promise<boolean> => false,
  updateProfile: (data: Partial<User>) => {},
  saveDiagnosisResult: (result: DiagnosisResult) => {},
  addArticle: (article: Omit<Article, 'id'>) => {},
  updateArticle: (id: string, article: Partial<Article>) => {},
  deleteArticle: (id: string) => {},
  addSymptom: async (newSymptom: Omit<Symptom, 'id'>) => {},
  updateSymptom: (id: string, symptom: Partial<Symptom>) => {},
  deleteSymptom: (id: string) => {},
  addRecommendation: (rec: Omit<Recommendation, 'id'>) => {},
  updateRecommendation: (id: string, rec: Partial<Recommendation>) => {},
  deleteRecommendation: (id: string) => {},
  updateUserRole: (id: string, role: 'user' | 'admin') => {},
  setSymptoms: (symptoms: Symptom[]) => {},
  logout: () => {},
});

// Tambahkan ekspor untuk Symptom dan useApp
export type Symptom = {
  id: string;
  name: string;
  description: string;
  code: string;
  text: string;
  weight: number;
  category: string;
};

export const useApp = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// 1. PINDAHKAN SEMUA MOCK DATA KE ATAS (DI LUAR PROVIDER)
const mockUsers: User[] = []; // Biarkan kosong, kita akan isi dari DB

const mockArticles: Article[] = [
  { id: '1', title: 'Judul Dummy', summary: 'Ringkasan', content: 'Konten', image: '', category: 'Psikologi', date: '2025-01-15' },
];

const mockRecommendations: Recommendation[] = [
  { id: '1', category: 'Umum', type: 'Article', title: 'Tips', link: '#', risk_level: 'Sedang' },
];

// 2. MULAI PROVIDER
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [diagnosisResults, setDiagnosisResults] = useState<DiagnosisResult[]>([]);
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Ambil Rekomendasi (Ini yang kamu bilang Berhasil di Console)
        const resRec = await fetch('http://127.0.0.1:8000/api/recommendations');
        if (resRec.ok) {
          const dataRec = await resRec.json();
          setRecommendations(dataRec);
          console.log("Data rekomendasi mendarat:", dataRec);
        }

        // 2. AMBIL GEJALA (CEK BAGIAN INI TELITI!)
        const resSymp = await fetch('http://127.0.0.1:8000/api/symptoms'); // Pastikan URL benar
        if (resSymp.ok) {
          const dataSymp = await resSymp.json();
          console.log("DATA GEJALA BERHASIL MENDARAT:", dataSymp); // Tambahkan ini buat cek
          setSymptoms(dataSymp); // <--- INI BAGIAN PALING PENTING!
        }

      } catch (error) {
        console.error("Gagal koneksi backend:", error);
      }
    };

    fetchData();
  }, []);

  const fetchSymptoms = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/symptoms', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error saat mengambil data gejala dari backend:', errorData);
        return;
      }

      const data = await response.json();
      console.log('Data gejala dari backend:', data);
      setSymptoms(data);
    } catch (error) {
      console.error('Gagal mengambil data gejala dari server:', error);
    }
  };

  // -----------------------------------------------------------------

  // 1. Ambil Data (SINKRONISASI)
  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/recommendations');
        if (res.ok) {
          const data = await res.json();
          console.log('Data rekomendasi dari backend:', data);
          setRecommendations(data);
        } else {
          console.error('Gagal mengambil data rekomendasi dari backend');
        }
      } catch (error) {
        console.error('Error saat mengambil data rekomendasi:', error);
      }
    };
    fetchRecs();
  }, []);

useEffect(() => {
  const fetchSemuaData = async () => {
    try {
      // Panggil daftar user dari Laravel
      const response = await fetch('http://127.0.0.1:8000/api/users');
      if (response.ok) {
        const dataAsli = await response.json();
        setUsers(dataAsli); // INI KUNCINYA: Memasukkan data MySQL ke variabel 'users'
      }
    } catch (error) {
      console.error("Gagal ambil data user dari database!", error);
    }
  };

  fetchSemuaData();
}, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error connecting to server:', error);
      return false;
    }
  };

  const logout = () => {
  setUser(null); // Hapus data user dari state
  localStorage.removeItem('user'); // Hapus dari memori browser
  window.location.href = '/'; // Paksa tendang ke halaman depan
};

  const register = async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    const newUser: User = { id: Date.now().toString(), name, email, phone, role: 'user' };
    setUsers([...users, newUser]);
    return true;
  };

  const updateProfile = (data: Partial<User>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...data };
      setCurrentUser(updatedUser);
    }
  };

  const updatePassword = (newPassword: string) => console.log('Password updated');
  const saveDiagnosisResult = (result: DiagnosisResult) => setDiagnosisResults([...diagnosisResults, result]);

  // CRUD Articles
  const addArticle = (article: Omit<Article, 'id'>) => setArticles([...articles, { ...article, id: Date.now().toString() }]);
  const updateArticle = (id: string, article: Partial<Article>) => setArticles(articles.map(a => a.id === id ? { ...a, ...article } : a));
  const deleteArticle = (id: string) => setArticles(articles.filter(a => a.id !== id));

  // CRUD Symptoms (SINKRON KE BACKEND)
  const addSymptom = async (newSymptom: Omit<Symptom, 'id'>) => {
    try {
      console.log('Mengirim data ke backend:', newSymptom);
      const response = await fetch('http://127.0.0.1:8000/api/symptoms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(newSymptom),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error dari backend:', errorData);
        return;
      }

      const data = await response.json();
      console.log('Respons dari backend:', data);
      await fetchSymptoms(); // Ambil data terbaru setelah operasi
    } catch (error) {
      console.error('Gagal menghubungi server:', error);
    }
  };

  const updateSymptom = async (id: string, symptom: Partial<Symptom>) => {
    try {
      console.log('Mengirim data pembaruan ke backend:', symptom);
      const response = await fetch(`http://127.0.0.1:8000/api/symptoms/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(symptom),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error dari backend saat memperbarui gejala:', errorData);
        return;
      }

      const data = await response.json();
      console.log('Respons pembaruan dari backend:', data);
      await fetchSymptoms(); // Ambil data terbaru setelah operasi
    } catch (error) {
      console.error('Gagal menghubungi server untuk pembaruan gejala:', error);
    }
  };

  const deleteSymptom = async (id: string) => {
    try {
      console.log('Menghapus gejala dengan ID:', id);
      const response = await fetch(`http://127.0.0.1:8000/api/symptoms/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error dari backend saat menghapus gejala:', errorData);
        return;
      }

      console.log('Gejala berhasil dihapus di backend');
      await fetchSymptoms(); // Ambil data terbaru setelah operasi
    } catch (error) {
      console.error('Gagal menghubungi server untuk menghapus gejala:', error);
    }
  };

  // CRUD Recommendations
  const addRecommendation = async (newRec: any) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/recommendations', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json' 
      },
      body: JSON.stringify(newRec),
    });

    if (response.ok) {
      const data = await response.json();
      setRecommendations(prev => [...prev, data]);
      toast.success('Berhasil disimpan ke database!'); // Pindahkan toast ke sini
    } else {
      const errorData = await response.json();
      console.error("Ditolak Laravel:", errorData);
      toast.error('Gagal: ' + (errorData.message || 'Data tidak valid'));
    }
  } catch (error) {
    console.error("Koneksi Error:", error);
  }
};

  const updateRecommendation = async (id: string, updatedData: any) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/recommendations/${id}`, {
      method: 'PUT', // Gunakan PUT untuk update
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(updatedData),
    });

    if (response.ok) {
      const data = await response.json();
      // Update state di web HANYA jika database sukses
      setRecommendations(prev => prev.map(r => r.id === id ? data : r));
      toast.success('Database Berhasil Diperbarui!');
    } else {
      const err = await response.json();
      console.error("Ditolak Laravel:", err);
      toast.error('Gagal sinkron ke database!');
    }
  } catch (error) {
    console.error("Koneksi Error:", error);
  }
};
  
  const deleteRecommendation = async (id: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/recommendations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        console.log('Rekomendasi berhasil dihapus');
        setRecommendations(recommendations.filter(r => r.id !== id));
      } else {
        console.error('Gagal menghapus rekomendasi');
      }
    } catch (error) {
      console.error('Error saat menghapus rekomendasi:', error);
    }
  };
  const updateUserRole = (id: string, role: 'user' | 'admin') => setUsers(users.map(u => u.id === id ? { ...u, role } : u));

  
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error saat mengambil data user dari backend:', errorData);
        return;
      }

      const data = await response.json();
      console.log('Data user dari backend:', data);
      setUsers(data);
    } catch (error) {
      console.error('Gagal mengambil data user dari server:', error);
    }
  };

  const addUser = async (newUser: Omit<User, 'id'>) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error dari backend saat menambahkan user:', errorData);
        return;
      }

      const data = await response.json();
      console.log('User berhasil ditambahkan:', data);
      setUsers((prev) => [...prev, data]);
    } catch (error) {
      console.error('Gagal menghubungi server untuk menambahkan user:', error);
    }
  };

  const updateUser = async (id: string, updatedData: Partial<User>) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error dari backend saat memperbarui user:', errorData);
        return;
      }

      const data = await response.json();
      console.log('User berhasil diperbarui:', data);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
    } catch (error) {
      console.error('Gagal menghubungi server untuk memperbarui user:', error);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error dari backend saat menghapus user:', errorData);
        return;
      }

      console.log('User berhasil dihapus di backend');
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error('Gagal menghubungi server untuk menghapus user:', error);
    }
  };

  const setUser = (user: any) => {
    setCurrentUser(user);
  };

  const value = {
    currentUser,
    users,
    diagnosisResults,
    articles,
    recommendations,
    symptoms, // Pastikan symptoms di-export
    setSymptoms,
    login,
    logout, // Added logout to the context value
    updateProfile,
    saveDiagnosisResult,
    addArticle,
    updateArticle,
    deleteArticle,
    addSymptom,
    updateSymptom,
    deleteSymptom,
    addRecommendation,
    updateRecommendation,
    deleteRecommendation,
    updateUserRole,
    setUser,
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        diagnosisResults,
        articles,
        recommendations,
        symptoms, // Pastikan symptoms di-export
        setSymptoms,
        login,
        updateProfile,
        saveDiagnosisResult,
        addArticle,
        updateArticle,
        deleteArticle,
        addSymptom,
        updateSymptom,
        deleteSymptom,
        addRecommendation,
        updateRecommendation,
        deleteRecommendation,
        updateUserRole,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};