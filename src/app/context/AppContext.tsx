import React, { useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { validateCommonEmailDomain } from "../utils/emailValidation";
import { validatePhone12to13Digits } from "../utils/phoneValidation";
import { apiClient, getApiErrorMessage } from "../utils/apiClient";
import { API_BASE_URL, BASE_URL } from "../utils/apiConfig";

// Tambahkan tipe data yang hilang
export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
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
  type: "Article" | "Video";
  category: string;
  risk_level: "Sedang" | "Berat";
  summary: string;
  thumbnail_url: string;
  link: string;
};

export type CFResult = {
  category: string;
  score: number;
  percentage: number;
};

export type RiskLevel = "Tidak Terindikasi" | "Ringan" | "Sedang" | "Berat";

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
  hasSeenTour: false,
  tourStage: "register" as "register" | "login" | "diagnosis" | "save" | "done",
  setTourStage: (
    _stage: "register" | "login" | "diagnosis" | "save" | "done",
  ) => {},
  completeTour: () => {},
  currentUser: null as User | null,
  users: [] as User[],
  diagnosisResults: [] as DiagnosisResult[],
  articles: [] as Article[],
  recommendations: [] as Recommendation[],
  symptoms: [] as Symptom[],
  fetchUsers: async (): Promise<void> => {},
  fetchDiagnosisResults: async (_userId?: string): Promise<void> => {},
  login: async (email: string, password: string): Promise<boolean> => false,
  updateProfile: async (
    _data: Partial<User>,
  ): Promise<{ ok: true; user: User } | { ok: false; message: string }> => ({
    ok: false,
    message: "Not implemented",
  }),
  updatePassword: async (
    _newPassword: string,
  ): Promise<{ ok: boolean; message?: string }> => ({
    ok: false,
    message: "Not implemented",
  }),
  saveDiagnosisResult: (result: DiagnosisResult) => {},
  addArticle: (article: Omit<Article, "id">) => {},
  updateArticle: (id: string, article: Partial<Article>) => {},
  deleteArticle: (id: string) => {},
  addSymptom: async (newSymptom: Omit<Symptom, "id">) => {},
  updateSymptom: (id: string, symptom: Partial<Symptom>) => {},
  deleteSymptom: (id: string) => {},
  addRecommendation: (rec: Omit<Recommendation, "id">) => {},
  updateRecommendation: (id: string, rec: Partial<Recommendation>) => {},
  deleteRecommendation: (id: string) => {},
  updateUserRole: async (
    _id: string,
    _role: "user" | "admin",
  ): Promise<{ ok: true } | { ok: false; message: string }> => ({
    ok: false,
    message: "Not implemented",
  }),
  deleteUser: async (
    _id: string,
  ): Promise<{ ok: true } | { ok: false; message: string }> => ({
    ok: false,
    message: "Not implemented",
  }),
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
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

// 1. PINDAHKAN SEMUA MOCK DATA KE ATAS (DI LUAR PROVIDER)
const mockUsers: User[] = []; // Biarkan kosong, kita akan isi dari DB

const mockArticles: Article[] = [
  {
    id: "1",
    title: "Judul Dummy",
    summary: "Ringkasan",
    content: "Konten",
    image: "",
    category: "Psikologi",
    date: "2025-01-15",
  },
];

const mockRecommendations: Recommendation[] = [
  {
    id: "1",
    category: "Umum",
    type: "Article",
    title: "Tips",
    summary: "",
    thumbnail_url: "",
    link: "#",
    risk_level: "Sedang",
  },
];

// 2. MULAI PROVIDER
export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [diagnosisResults, setDiagnosisResults] = useState<DiagnosisResult[]>(
    [],
  );
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [hasSeenTour, setHasSeenTour] = useState(
    () => localStorage.getItem("has_seen_tour") === "true",
  );
  const [tourStage, setTourStage] = useState(() => {
    const hasSeen = localStorage.getItem("has_seen_tour") === "true";
    if (!hasSeen) return "register";
    const saved = localStorage.getItem("tour_stage");
    return (saved || "register") as
      | "register"
      | "login"
      | "diagnosis"
      | "save"
      | "done";
  });

  const completeTour = () => {
    localStorage.setItem("has_seen_tour", "true");
    localStorage.setItem("tour_stage", "done");
    setHasSeenTour(true);
    setTourStage("done");
  };
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);

  const normalizeRecommendations = (input: unknown): Recommendation[] => {
    const list = (() => {
      if (Array.isArray(input)) return input as any[];
      if (input && typeof input === "object") {
        const obj: any = input;
        const maybe =
          obj.data ?? obj.recommendations ?? obj.results ?? obj.result;
        if (Array.isArray(maybe)) return maybe as any[];
        if (maybe && typeof maybe === "object") return [maybe as any];
      }
      return [] as any[];
    })();

    const coerceRisk = (raw: unknown): Recommendation["risk_level"] => {
      const s = String(raw ?? "")
        .toLowerCase()
        .trim();
      if (s === "berat") return "Berat";
      return "Sedang";
    };

    const coerceType = (raw: unknown): Recommendation["type"] => {
      const s = String(raw ?? "")
        .toLowerCase()
        .trim();
      return s === "video" ? "Video" : "Article";
    };

    const toAbsoluteBackendUrl = (raw: unknown): string => {
      const base = BASE_URL;

      let url = String(raw ?? "").trim();
      if (!url) return "";

      // Perbaiki protokol "htts://" menjadi "https://"
      if (/^htts:\/\//i.test(url)) {
        url = url.replace(/^htts:\/\//i, "https://");
      }

      // Normalize slashes for any accidental backslashes.
      url = url.replace(/\\/g, "/");

      // Keep data/blob URLs as-is.
      if (/^(data:|blob:)/i.test(url)) return url;

      // Absolute URL: ensure local Laravel storage URLs include backend port.
      if (/^https?:\/\//i.test(url)) {
        try {
          const parsed = new URL(url);
          const isLocalHost =
            parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
          const isMissingBackendPort = !parsed.port || parsed.port === "80";
          const looksLikeStorage =
            parsed.pathname.startsWith("/storage/") ||
            parsed.pathname.startsWith("/uploads/");

          if (isLocalHost && isMissingBackendPort && looksLikeStorage) {
            return `${base}${parsed.pathname}${parsed.search}${parsed.hash}`;
          }
        } catch {
          // ignore parse errors; return as-is
        }

        return url;
      }

      // Scheme-relative.
      if (url.startsWith("//")) return `http:${url}`;

      // Some backends may return paths like "public/storage/...".
      if (url.startsWith("public/storage/")) url = url.replace(/^public\//, "");

      // Common Laravel storage/url patterns.
      if (url.startsWith("storage/")) return `${base}/${url}`;
      if (url.startsWith("/storage/")) return `${base}${url}`;

      // Root-relative.
      if (url.startsWith("/")) return `${base}${url}`;

      // Fallback: treat as relative path.
      return `${base}/${url}`;
    };

    return list
      .filter((r) => r && typeof r === "object")
      .map((r: any) => {
        const summary = String(r.summary ?? r.ringkasan ?? r.description ?? "");
        const thumbnailUrl = toAbsoluteBackendUrl(
          r.thumbnail_url ?? r.thumbnail ?? r.image_url ?? r.image ?? "",
        );
        const link = String(
          r.link ?? r.url ?? r.article_url ?? r.video_url ?? "",
        );
        return {
          id: String(r.id ?? ""),
          title: String(r.title ?? ""),
          type: coerceType(r.type),
          category: String(r.category ?? ""),
          risk_level: coerceRisk(r.risk_level),
          summary,
          thumbnail_url: thumbnailUrl,
          link,
        } as Recommendation;
      })
      .filter((r) => r.id && r.title && r.category);
  };

  const normalizeUsers = (input: unknown): User[] => {
    if (!Array.isArray(input)) return [];
    return (input as any[])
      .filter((u) => u && typeof u === "object")
      .map((u: any) => ({
        id: String(u.id ?? ""),
        name: String(u.name ?? ""),
        email: String(u.email ?? ""),
        phone: String(
          u.phone ??
            u.phone_number ??
            u.phoneNumber ??
            u.nomor_telepon ??
            u.nomorTelepon ??
            u.no_telp ??
            u.noTelp ??
            u.telepon ??
            "",
        ),
        role: (u.role === "admin" ? "admin" : "user") as User["role"],
      }))
      .filter((u) => u.id && u.email);
  };

  const getNormalizedUserPhone = (u: any): string => {
    const raw =
      u?.phone ??
      u?.phone_number ??
      u?.phoneNumber ??
      u?.nomor_telepon ??
      u?.nomorTelepon ??
      u?.no_telp ??
      u?.noTelp ??
      u?.telepon ??
      "";
    return String(raw ?? "").trim();
  };

  const normalizeUser = (u: any, fallback?: Partial<User>): User => {
    const phone =
      getNormalizedUserPhone(u) || String(fallback?.phone ?? "").trim();
    const role =
      u?.role === "admin"
        ? "admin"
        : u?.role === "user"
          ? "user"
          : (fallback?.role ?? "user");

    return {
      id: String(u?.id ?? fallback?.id ?? ""),
      name: String(u?.name ?? fallback?.name ?? ""),
      email: String(u?.email ?? fallback?.email ?? ""),
      phone,
      role: role as User["role"],
    };
  };

  const parseFullResults = (raw: unknown): CFResult[] => {
    try {
      const value = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (!Array.isArray(value)) return [];
      return (value as any[])
        .filter((r) => r && typeof r === "object")
        .map((r: any) => ({
          category: String(r.category ?? ""),
          score: Number(r.score ?? 0),
          percentage: Number(r.percentage ?? 0),
        }))
        .filter((r) => r.category);
    } catch {
      return [];
    }
  };

  const coerceRiskLevel = (raw: unknown, totalScore?: unknown): RiskLevel => {
    const str = typeof raw === "string" ? raw : "";
    if (
      str === "Tidak Terindikasi" ||
      str === "Ringan" ||
      str === "Sedang" ||
      str === "Berat"
    )
      return str;
    const score = Number(totalScore);
    if (!Number.isFinite(score)) return "Tidak Terindikasi";
    if (score <= 33) return "Tidak Terindikasi";
    if (score <= 60) return "Ringan";
    if (score <= 82) return "Sedang";
    return "Berat";
  };

  const normalizeDiagnosisResults = (input: unknown): DiagnosisResult[] => {
    const arr = Array.isArray(input)
      ? (input as any[])
      : input && typeof input === "object" && Array.isArray((input as any).data)
        ? ((input as any).data as any[])
        : [];

    return arr
      .filter((it) => it && typeof it === "object")
      .map((it: any) => {
        const results = parseFullResults(
          it.full_results ?? it.fullResults ?? it.results,
        );
        const dominant = String(
          it.diagnosis_result ?? it.diagnosis ?? it.dominantCategory ?? "",
        );
        const created = String(
          it.created_at ?? it.date ?? new Date().toISOString(),
        );
        return {
          id: String(it.id ?? ""),
          userId: String(it.user_id ?? it.userId ?? ""),
          date: created,
          dominantCategory: dominant || "-",
          overallRisk: coerceRiskLevel(
            it.risk_level ?? it.overallRisk,
            it.total_score ?? results?.[0]?.percentage,
          ),
          results,
          recommendations: [],
        } as DiagnosisResult;
      })
      .filter((r) => r.id);
  };

  const syncCurrentUserFromUsers = (userList: User[]) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const found = userList.find(
        (u) => u.id === String(prev.id) || u.email === prev.email,
      );
      if (!found) return prev;
      const merged: User = {
        ...prev,
        ...found,
        id: String(found.id ?? prev.id),
        role: (found.role ?? prev.role) as User["role"],
      };
      localStorage.setItem("user", JSON.stringify(merged));
      return merged;
    });
  };

  const getFirstLaravelValidationError = (err: any): string | null => {
    const errors = err?.errors;
    if (!errors || typeof errors !== "object") return null;
    const firstKey = Object.keys(errors)[0];
    const firstVal = firstKey ? (errors as any)[firstKey] : null;
    if (Array.isArray(firstVal) && typeof firstVal[0] === "string")
      return firstVal[0];
    if (typeof firstVal === "string") return firstVal;
    return null;
  };

  // Restore logged-in user on refresh
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return;
    try {
      const parsed: any = JSON.parse(raw);
      if (!parsed || !parsed.email) return;
      const restored: User = {
        id: String(parsed.id ?? ""),
        name: String(parsed.name ?? ""),
        email: String(parsed.email ?? ""),
        phone: String(parsed.phone ?? ""),
        role: (parsed.role === "admin" ? "admin" : "user") as User["role"],
      };
      setCurrentUser(restored);
    } catch {
      // ignore
    }
  }, []);

  // Restore token on refresh
  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) setToken(stored);
  }, []);

  const fetchCurrentUser = async () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) return;

    // Get id from state or localStorage to avoid timing issues on refresh.
    let userId = String(currentUser?.id ?? "").trim();
    if (!userId) {
      try {
        const raw = localStorage.getItem("user");
        if (raw) {
          const parsed = JSON.parse(raw);
          userId = String(parsed?.id ?? "").trim();
        }
      } catch {
        // ignore
      }
    }

    // Prefer the common Laravel resource endpoint.
    if (userId) {
      try {
        const res = await apiClient.get(`/users/${encodeURIComponent(userId)}`);
        const next = normalizeUser(res.data ?? {}, currentUser ?? undefined);
        if (next.email) {
          setCurrentUser(next);
          localStorage.setItem("user", JSON.stringify(next));
        }
        return;
      } catch (err) {
        // fallback below
      }
    }

    // Fallbacks (optional), depending on backend naming.
    try {
      const res = await apiClient.get("/user");
      const next = normalizeUser(res.data ?? {}, currentUser ?? undefined);
      if (next.email) {
        setCurrentUser(next);
        localStorage.setItem("user", JSON.stringify(next));
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        try {
          const res = await apiClient.get("/me");
          const next = normalizeUser(res.data ?? {}, currentUser ?? undefined);
          if (next.email) {
            setCurrentUser(next);
            localStorage.setItem("user", JSON.stringify(next));
          }
        } catch {
          // ignore
        }
      }
    }
  };

  // When token exists, refresh current user profile (phone/role)
  useEffect(() => {
    if (!token) return;
    void fetchCurrentUser();
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Ambil Rekomendasi (Ini yang kamu bilang Berhasil di Console)
        const resRec = await fetch(`${API_BASE_URL}/recommendations`);
        if (resRec.ok) {
          const dataRec = await resRec.json();
          console.log("DataRec", dataRec);
          setRecommendations(normalizeRecommendations(dataRec));
          console.log("Data rekomendasi mendarat:", dataRec);
        }

        // 2. AMBIL GEJALA (CEK BAGIAN INI TELITI!)
        const resSymp = await fetch(`${API_BASE_URL}/symptoms`); // Pastikan URL benar
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
      const response = await fetch(`${API_BASE_URL}/symptoms`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      console.log("Response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          "Error saat mengambil data gejala dari backend:",
          errorData,
        );
        return;
      }

      const data = await response.json();
      console.log("Data gejala dari backend:", data);
      setSymptoms(data);
    } catch (error) {
      console.error("Gagal mengambil data gejala dari server:", error);
    }
  };

  // -----------------------------------------------------------------

  // 1. Ambil Data (SINKRONISASI)
  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/recommendations`);
        if (res.ok) {
          const data = await res.json();
          console.log("Data rekomendasi dari backend:", data);
          setRecommendations(normalizeRecommendations(data));
        } else {
          console.error("Gagal mengambil data rekomendasi dari backend");
        }
      } catch (error) {
        console.error("Error saat mengambil data rekomendasi:", error);
      }
    };
    fetchRecs();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await apiClient.post(
        "/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } },
      );
      const data: any = res.data;

      const tokenValue = String(
        data?.token ?? data?.access_token ?? data?.data?.token ?? "",
      ).trim();
      if (tokenValue) {
        localStorage.setItem("token", tokenValue);
        setToken(tokenValue);
      }

      const incoming: any = data?.user ?? data?.data?.user ?? {};

      let previousUser: Partial<User> | undefined = undefined;
      try {
        const rawPrev = localStorage.getItem("user");
        if (rawPrev) previousUser = JSON.parse(rawPrev);
      } catch {
        previousUser = undefined;
      }

      const nextUser: User = normalizeUser(
        { ...incoming, email: incoming?.email ?? email },
        previousUser,
      );
      setCurrentUser(nextUser);
      localStorage.setItem("user", JSON.stringify(nextUser));

      // If login payload is incomplete, enrich via authenticated profile endpoint.
      if (tokenValue) {
        try {
          await fetchCurrentUser();
        } catch {
          // ignore
        }
      }

      return true;
    } catch (error) {
      console.error("Error connecting to server:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null); // Hapus data user dari state
    setUsers([]);
    setToken(null);
    localStorage.removeItem("user"); // Hapus dari memori browser
    localStorage.removeItem("token");
    window.location.href = "/"; // Paksa tendang ke halaman depan
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    password: string,
  ): Promise<boolean> => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      role: "user",
    };
    setUsers([...users, newUser]);
    return true;
  };

  const updateProfile = async (
    data: Partial<User>,
  ): Promise<{ ok: true; user: User } | { ok: false; message: string }> => {
    if (!currentUser) return { ok: false, message: "Kamu belum masuk." };

    const optimistic: User = {
      ...currentUser,
      ...data,
      id: String(currentUser.id),
      role: currentUser.role,
    };

    // Defensive validation so invalid/uncommon emails can't be saved from any caller.
    const validation = validateCommonEmailDomain(optimistic.email);
    if (!validation.ok) return { ok: false, message: validation.message };

    const email = String(optimistic.email ?? "").trim();

    const phoneValidation = validatePhone12to13Digits(optimistic.phone);
    if (!phoneValidation.ok)
      return { ok: false, message: phoneValidation.message };
    const phone = phoneValidation.normalizedPhone;

    try {
      const res = await apiClient.put(
        `/users/${encodeURIComponent(optimistic.id)}`,
        {
          name: optimistic.name,
          email,
          phone,
        },
        { headers: { "Content-Type": "application/json" } },
      );

      const payload: any = res.data;
      const rawUser = payload?.user ?? payload?.data ?? payload ?? {};
      const savedUser: User = {
        id: String(rawUser.id ?? optimistic.id),
        name: String(rawUser.name ?? optimistic.name),
        email: String(rawUser.email ?? optimistic.email),
        phone: String(rawUser.phone ?? phone),
        role: (rawUser.role === "admin"
          ? "admin"
          : optimistic.role) as User["role"],
      };

      setCurrentUser(savedUser);
      localStorage.setItem("user", JSON.stringify(savedUser));
      setUsers((prev) =>
        prev.map((u) => (u.id === savedUser.id ? { ...u, ...savedUser } : u)),
      );
      return { ok: true, user: savedUser };
    } catch (error) {
      console.error("Gagal menghubungi server untuk update profil:", error);
      const message = getApiErrorMessage(error) || "Gagal terhubung ke server.";
      return { ok: false, message };
    }
  };

  const updatePassword = async (
    newPassword: string,
  ): Promise<{ ok: boolean; message?: string }> => {
    if (!currentUser) return { ok: false, message: "Kamu belum masuk." };
    try {
      await apiClient.put(
        `/users/${encodeURIComponent(String(currentUser.id))}/password`,
        {
          new_password: newPassword,
          new_password_confirmation: newPassword,
        },
        { headers: { "Content-Type": "application/json" } },
      );

      return { ok: true };
    } catch (error) {
      console.error("Gagal menghubungi server untuk ganti password:", error);
      const message = getApiErrorMessage(error) || "Gagal terhubung ke server.";
      return { ok: false, message };
    }
  };
  const saveDiagnosisResult = (result: DiagnosisResult) =>
    setDiagnosisResults([...diagnosisResults, result]);

  // CRUD Articles
  const addArticle = (article: Omit<Article, "id">) =>
    setArticles([...articles, { ...article, id: Date.now().toString() }]);
  const updateArticle = (id: string, article: Partial<Article>) =>
    setArticles(articles.map((a) => (a.id === id ? { ...a, ...article } : a)));
  const deleteArticle = (id: string) =>
    setArticles(articles.filter((a) => a.id !== id));

  // CRUD Symptoms (SINKRON KE BACKEND)
  const addSymptom = async (newSymptom: Omit<Symptom, "id">) => {
    try {
      console.log("Mengirim data ke backend:", newSymptom);
      const response = await fetch(`${API_BASE_URL}/symptoms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(newSymptom),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error dari backend:", errorData);
        return;
      }

      const data = await response.json();
      console.log("Respons dari backend:", data);
      await fetchSymptoms(); // Ambil data terbaru setelah operasi
    } catch (error) {
      console.error("Gagal menghubungi server:", error);
    }
  };

  const updateSymptom = async (id: string, symptom: Partial<Symptom>) => {
    try {
      console.log("Mengirim data pembaruan ke backend:", symptom);
      const response = await fetch(`${API_BASE_URL}/symptoms/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(symptom),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error dari backend saat memperbarui gejala:", errorData);
        return;
      }

      const data = await response.json();
      console.log("Respons pembaruan dari backend:", data);
      await fetchSymptoms(); // Ambil data terbaru setelah operasi
    } catch (error) {
      console.error("Gagal menghubungi server untuk pembaruan gejala:", error);
    }
  };

  const deleteSymptom = async (id: string) => {
    try {
      console.log("Menghapus gejala dengan ID:", id);
      const response = await fetch(`${API_BASE_URL}/symptoms/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error dari backend saat menghapus gejala:", errorData);
        return;
      }

      console.log("Gejala berhasil dihapus di backend");
      await fetchSymptoms(); // Ambil data terbaru setelah operasi
    } catch (error) {
      console.error("Gagal menghubungi server untuk menghapus gejala:", error);
    }
  };

  // CRUD Recommendations
  const addRecommendation = async (newRec: any) => {
    try {
      const isFormData =
        typeof FormData !== "undefined" && newRec instanceof FormData;
      const response = await fetch(`${API_BASE_URL}/recommendations`, {
        method: "POST",
        headers: isFormData
          ? { Accept: "application/json" }
          : {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
        body: isFormData ? newRec : JSON.stringify(newRec),
      });

      if (response.ok) {
        const data = await response.json();
        const normalized = normalizeRecommendations(data);
        if (normalized.length > 0) {
          setRecommendations((prev) => [...prev, ...normalized]);
        } else {
          // fallback: keep previous behavior if backend returns unexpected shape
          setRecommendations((prev: any) => [...prev, data]);
        }
        toast.success("Berhasil disimpan ke database!"); // Pindahkan toast ke sini
      } else {
        let errorData: any = null;
        try {
          errorData = await response.json();
        } catch {
          errorData = null;
        }
        console.error("Ditolak Laravel:", errorData);
        let message =
          getFirstLaravelValidationError(errorData) ||
          errorData?.message ||
          errorData?.error ||
          "Data tidak valid";

        if (typeof message === "string") {
          if (
            message.includes("Data too long for column 'link'") ||
            message.includes("Data too long for column 'link'")
          ) {
            message =
              "Link terlalu panjang. Isi field Link dengan URL saja (contoh: https://...).";
          }
          if (message.length > 240) {
            message = message.slice(0, 240) + "…";
          }
        }

        toast.error("Gagal: " + message);
      }
    } catch (error) {
      console.error("Koneksi Error:", error);
    }
  };

  const updateRecommendation = async (id: string, updatedData: any) => {
    try {
      const isFormData =
        typeof FormData !== "undefined" && updatedData instanceof FormData;
      const response = await fetch(`${API_BASE_URL}/recommendations/${id}`, {
        // Backend: saat edit dengan FormData, gunakan POST ke /api/recommendations/{id}
        method: isFormData ? "POST" : "PUT",
        headers: isFormData
          ? { Accept: "application/json" }
          : {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
        body: isFormData ? updatedData : JSON.stringify(updatedData),
      });

      if (response.ok) {
        const data = await response.json();
        const normalized = normalizeRecommendations(data);
        const next = normalized[0] ?? data;
        // Update state di web HANYA jika database sukses
        setRecommendations((prev: any) =>
          prev.map((r: any) => (r.id === id ? next : r)),
        );
        toast.success("Database Berhasil Diperbarui!");
      } else {
        let err: any = null;
        try {
          err = await response.json();
        } catch {
          err = null;
        }
        console.error("Ditolak Laravel:", err);
        let message =
          getFirstLaravelValidationError(err) ||
          err?.message ||
          err?.error ||
          "Gagal sinkron ke database!";

        if (typeof message === "string") {
          if (
            message.includes("Data too long for column 'link'") ||
            message.includes("Data too long for column 'link'")
          ) {
            message =
              "Link terlalu panjang. Isi field Link dengan URL saja (contoh: https://...).";
          }
          if (message.length > 240) {
            message = message.slice(0, 240) + "…";
          }
        }

        toast.error(message);
      }
    } catch (error) {
      console.error("Koneksi Error:", error);
    }
  };

  const deleteRecommendation = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/recommendations/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        console.log("Rekomendasi berhasil dihapus");
        setRecommendations(recommendations.filter((r) => r.id !== id));
      } else {
        console.error("Gagal menghapus rekomendasi");
      }
    } catch (error) {
      console.error("Error saat menghapus rekomendasi:", error);
    }
  };

  const updateUserRole = async (
    id: string,
    role: "user" | "admin",
  ): Promise<{ ok: true } | { ok: false; message: string }> => {
    try {
      const headers = { "Content-Type": "application/json" } as const;
      let payload: any = null;

      // Prefer a dedicated role endpoint if backend provides it.
      try {
        const res = await apiClient.patch(
          `/users/${encodeURIComponent(id)}/role`,
          { role },
          { headers },
        );
        payload = res.data;
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 405) {
          const res = await apiClient.put(
            `/users/${encodeURIComponent(id)}/role`,
            { role },
            { headers },
          );
          payload = res.data;
        } else if (status === 404) {
          // Some backends may accept role update via PUT /users/{id}.
          const res = await apiClient.put(
            `/users/${encodeURIComponent(id)}`,
            { role },
            { headers },
          );
          payload = res.data;
        } else {
          throw err;
        }
      }

      const raw = payload?.user ?? payload?.data ?? payload ?? {};
      const savedRole = (
        raw?.role === "admin" ? "admin" : raw?.role === "user" ? "user" : role
      ) as User["role"];

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: savedRole } : u)),
      );

      // Keep currentUser/localStorage in sync if the edited user is the current session user.
      setCurrentUser((prev) => {
        if (!prev) return prev;
        if (String(prev.id) !== String(id)) return prev;
        const next = { ...prev, role: savedRole };
        localStorage.setItem("user", JSON.stringify(next));
        return next;
      });

      return { ok: true };
    } catch (error) {
      console.error(
        "Gagal menghubungi server untuk mengubah role user:",
        error,
      );
      return {
        ok: false,
        message: getApiErrorMessage(error) || "Gagal terhubung ke server.",
      };
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get("/users");
      const data = res.data;
      console.log("Data user dari backend:", data);
      const normalized = normalizeUsers(data);
      setUsers(normalized);
      syncCurrentUserFromUsers(normalized);
    } catch (error) {
      console.error("Gagal mengambil data user dari server:", error);
    }
  };

  const fetchDiagnosisResults = async (userId?: string) => {
    const id = String(userId ?? currentUser?.id ?? "");
    if (!id) return;
    try {
      const baseUrl = `${API_BASE_URL}/diagnoses?user_id=${encodeURIComponent(id)}`;
      const headers = { Accept: "application/json" } as const;

      const allRows: any[] = [];
      let nextUrl: string | null = baseUrl;
      const seen = new Set<string>();
      let guard = 0;

      while (nextUrl && guard < 100) {
        if (seen.has(nextUrl)) break;
        seen.add(nextUrl);

        const response = await fetch(nextUrl, { method: "GET", headers });
        if (!response.ok) {
          let message = "Gagal mengambil riwayat diagnosis.";
          try {
            const err = await response.json();
            message = err?.message || err?.error || message;
          } catch {
            // ignore
          }
          console.error(message);
          return;
        }

        const payload = await response.json();

        // Backend bisa saja mengembalikan array tanpa pagination.
        if (Array.isArray(payload)) {
          allRows.splice(0, allRows.length, ...payload);
          nextUrl = null;
          break;
        }

        const pageRows = Array.isArray((payload as any)?.data)
          ? ((payload as any).data as any[])
          : [];
        allRows.push(...pageRows);

        const nextPageUrl = (payload as any)?.next_page_url;
        if (typeof nextPageUrl === "string" && nextPageUrl) {
          nextUrl = nextPageUrl;
        } else {
          const currentPage = Number((payload as any)?.current_page);
          const lastPage = Number((payload as any)?.last_page);
          if (
            Number.isFinite(currentPage) &&
            Number.isFinite(lastPage) &&
            currentPage < lastPage
          ) {
            nextUrl = `${baseUrl}&page=${currentPage + 1}`;
          } else {
            nextUrl = null;
          }
        }

        guard += 1;
      }

      const normalized = normalizeDiagnosisResults(allRows)
        .filter((r) => r.userId === id)
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );

      setDiagnosisResults(normalized);
    } catch (error) {
      console.error(
        "Gagal menghubungi server untuk ambil riwayat diagnosis:",
        error,
      );
    }
  };

  useEffect(() => {
    if (!currentUser?.id) return;
    (async () => {
      await fetchDiagnosisResults(currentUser.id);
    })();
  }, [currentUser?.id]);

  const addUser = async (newUser: Omit<User, "id">) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error dari backend saat menambahkan user:", errorData);
        return;
      }

      const data = await response.json();
      console.log("User berhasil ditambahkan:", data);
      setUsers((prev) => [...prev, data]);
    } catch (error) {
      console.error("Gagal menghubungi server untuk menambahkan user:", error);
    }
  };

  const updateUser = async (id: string, updatedData: Partial<User>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error dari backend saat memperbarui user:", errorData);
        return;
      }

      const data = await response.json();
      console.log("User berhasil diperbarui:", data);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...data } : u)),
      );
    } catch (error) {
      console.error("Gagal menghubungi server untuk memperbarui user:", error);
    }
  };

  const deleteUser = async (
    id: string,
  ): Promise<{ ok: true } | { ok: false; message: string }> => {
    try {
      await apiClient.delete(`/users/${encodeURIComponent(id)}`);

      console.log("User berhasil dihapus di backend");
      setUsers((prev) => prev.filter((u) => u.id !== id));
      return { ok: true };
    } catch (error) {
      console.error("Gagal menghubungi server untuk menghapus user:", error);
      return {
        ok: false,
        message: getApiErrorMessage(error) || "Gagal terhubung ke server.",
      };
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
        fetchUsers,
        fetchDiagnosisResults,
        login,
        updateProfile,
        updatePassword,
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
        deleteUser,
        logout,
        hasSeenTour,
        tourStage,
        setTourStage,
        completeTour,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
