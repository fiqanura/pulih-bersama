import React, { useState, useEffect } from "react";
import {
  AppProvider,
  useApp,
  DiagnosisResult,
  CFResult,
} from "./context/AppContext";
import { Toaster } from "./components/ui/sonner";

// Public components
import { PublicNavbar } from "./components/PublicNavbar";
import { Footer } from "./components/Footer";

// Public pages
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { NewsPage } from "./pages/NewsPage";
import { NewsDetailPage } from "./pages/NewsDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

// User components
import { UserSidebar } from "./components/UserSidebar";
import { UserDashboardPage } from "./pages/user/UserDashboardPage";
import { DiagnosisPage } from "./pages/user/DiagnosisPage";
import { DiagnosisResultPage } from "./pages/user/DiagnosisResultPage";
import { HistoryPage } from "./pages/user/HistoryPage";
import { ProfilePage } from "./pages/user/ProfilePage";

// Admin components
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { UserHistoryPage } from "./pages/admin/UserHistoryPage";
import { ArticleManagementPage } from "./pages/admin/ArticleManagementPage";
import { SymptomManagementPage } from "./pages/admin/SymptomManagementPage";
import { RecommendationManagementPage } from "./pages/admin/RecommendationManagementPage";
import { UserManagementPage } from "./pages/admin/UserManagementPage";

const AppContent: React.FC = () => {
  const { currentUser, saveDiagnosisResult, recommendations } = useApp();
  const [currentPage, setCurrentPage] = useState("home");
  const [diagnosisResult, setDiagnosisResult] = useState<CFResult[] | null>(null);

  // --- LOGIKA REDIRECT OTOMATIS BERDASARKAN ROLE ---
  useEffect(() => {
    if (currentUser) {
      // Jika User Login (Role Admin), lempar ke Dashboard Admin
      if (currentUser.role === "admin") {
        if (currentPage === "login" || currentPage === "register" || currentPage === "home") {
          setCurrentPage("admin-dashboard");
        }
      } 
      // Jika User Login (Role User), lempar ke Dashboard User
      else if (currentUser.role === "user") {
        if (currentPage === "login" || currentPage === "register" || currentPage === "home") {
          setCurrentPage("user-dashboard");
        }
      }
    } else {
      // Jika Logout, balikkan ke Home (Kecuali sedang di Register/About/News)
      const publicPages = ["home", "about", "news", "login", "register"];
      const isNewsDetail = currentPage.startsWith("news-detail-");
      
      if (!publicPages.includes(currentPage) && !isNewsDetail) {
        setCurrentPage("home");
      }
    }
  }, [currentUser]); // Trigger jalan setiap kali currentUser berubah (Login/Logout)

  const getRiskLevelFromPercentage = (percentage: number): DiagnosisResult["overallRisk"] => {
    if (percentage <= 25) return "Tidak Terindikasi";
    if (percentage <= 50) return "Ringan";
    if (percentage <= 75) return "Sedang";
    return "Berat";
  };

  const handleDiagnosisComplete = (results: CFResult[]) => {
    setDiagnosisResult(results);
    setCurrentPage("diagnosis-result");
  };

  const handleSaveDiagnosisResult = () => {
    if (diagnosisResult) {
      const dominant = diagnosisResult[0];
      const overallRisk = getRiskLevelFromPercentage(dominant?.percentage ?? 0);

      const recs =
        overallRisk === "Sedang" || overallRisk === "Berat"
          ? recommendations.filter(
              (r) => r.category === dominant?.category && r.risk_level === overallRisk
            )
          : [];

      saveDiagnosisResult({
        id: Date.now().toString(),
        userId: currentUser?.id || "",
        date: new Date().toISOString().split("T")[0],
        dominantCategory: dominant?.category || "-",
        overallRisk,
        results: diagnosisResult,
        recommendations: recs,
      });
      setDiagnosisResult(null);
      setCurrentPage("user-dashboard");
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- RENDER LOGIC ---

  // 1. Tampilan untuk Public (Belum Login)
  if (!currentUser) {
    return (
      <div className="flex flex-col min-h-screen">
        <PublicNavbar onNavigate={handleNavigate} currentPage={currentPage} />
        <main className="flex-1">
          {currentPage === "home" && <HomePage onNavigate={handleNavigate} />}
          {currentPage === "about" && <AboutPage />}
          {currentPage === "news" && <NewsPage onNavigate={handleNavigate} />}
          {currentPage.startsWith("news-detail-") && (
            <NewsDetailPage articleId={currentPage.replace("news-detail-", "")} onNavigate={handleNavigate} />
          )}
          {currentPage === "login" && <LoginPage onNavigate={handleNavigate} />}
          {currentPage === "register" && <RegisterPage onNavigate={handleNavigate} />}
        </main>
        <Footer />
      </div>
    );
  }

  // 2. Tampilan untuk User Dashboard
  if (currentUser.role === "user") {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <UserSidebar currentPage={currentPage} onNavigate={handleNavigate} />
        <main className="flex-1 overflow-auto">
          {currentPage === "user-dashboard" && <UserDashboardPage onNavigate={handleNavigate} />}
          {currentPage === "diagnosis" && <DiagnosisPage onNavigate={handleNavigate} onComplete={handleDiagnosisComplete} />}
          {currentPage === "diagnosis-result" && diagnosisResult && (
            <DiagnosisResultPage result={diagnosisResult} onSave={handleSaveDiagnosisResult} onNavigate={handleNavigate} />
          )}
          {currentPage === "history" && <HistoryPage onNavigate={handleNavigate} />}
          {currentPage === "profile" && <ProfilePage />}
          {/* Fallback jika page tidak ditemukan di user */}
          {!["user-dashboard", "diagnosis", "diagnosis-result", "history", "profile"].includes(currentPage) && (
            <UserDashboardPage onNavigate={handleNavigate} />
          )}
        </main>
      </div>
    );
  }

  // 3. Tampilan untuk Admin Dashboard
  if (currentUser.role === "admin") {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <AdminSidebar currentPage={currentPage} onNavigate={handleNavigate} />
        <main className="flex-1 overflow-auto">
          {currentPage === "admin-dashboard" && <AdminDashboardPage />}
          {currentPage === "admin-user-history" && <UserHistoryPage />}
          {currentPage === "admin-articles" && <ArticleManagementPage />}
          {currentPage === "admin-symptoms" && <SymptomManagementPage />}
          {currentPage === "admin-recommendations" && <RecommendationManagementPage />}
          {currentPage === "admin-users" && <UserManagementPage />}
          {/* Fallback jika page tidak ditemukan di admin */}
          {!["admin-dashboard", "admin-user-history", "admin-articles", "admin-symptoms", "admin-recommendations", "admin-users"].includes(currentPage) && (
            <AdminDashboardPage />
          )}
        </main>
      </div>
    );
  }

  return null;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
      <Toaster position="top-right" expand={false} richColors />
    </AppProvider>
  );
};

export default App;