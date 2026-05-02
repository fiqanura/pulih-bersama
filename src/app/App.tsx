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
import { OnboardingTour } from "./components/OnboardingTour";
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
import { RecommendationDetailPage } from "./pages/user/RecommendationDetailPage";

// Admin components
import { AdminSidebar } from "./components/AdminSidebar";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import { UserHistoryPage } from "./pages/admin/UserHistoryPage";
import { ArticleManagementPage } from "./pages/admin/ArticleManagementPage";
import { SymptomManagementPage } from "./pages/admin/SymptomManagementPage";
import { RecommendationManagementPage } from "./pages/admin/RecommendationManagementPage";
import { UserManagementPage } from "./pages/admin/UserManagementPage";
import { RecommendationDetailPage as AdminRecommendationDetailPage } from "./pages/admin/RecommendationDetailPage";
import { WhatsAppFloatingButton } from "./components/WhatsAppFloatingButton";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "./components/ui/sidebar";
import { Button } from "./components/ui/button";
import { Menu } from "lucide-react";
import logo from "../assets/logo_pulih_bersama.png";

const MobileSidebarToggle: React.FC = () => {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-11 w-11"
      onClick={toggleSidebar}
      aria-label="Buka menu"
    >
      <Menu className="h-6 w-6" />
    </Button>
  );
};

const MobileTopBar: React.FC = () => {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-white/80 backdrop-blur px-3 py-2 md:hidden">
      <MobileSidebarToggle />
      <div className="flex items-center gap-2 min-w-0">
        <img
          src={logo}
          alt="Logo Pulih Bersama"
          className="h-8 w-8 object-contain"
        />
        <span className="text-base font-semibold bg-gradient-to-r from-[#93c5fd] to-[#ddd6fe] bg-clip-text text-transparent truncate">
          Pulih Bersama
        </span>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { currentUser, fetchDiagnosisResults, hasSeenTour, tourStage, setTourStage } = useApp();
  const [currentPage, setCurrentPage] = useState("home");
  const [diagnosisResult, setDiagnosisResult] = useState<CFResult[] | null>(null);

  // ─── Majukan tourStage saat user login ───────────────────────────────────
  useEffect(() => {
    if (!hasSeenTour && currentUser && currentUser.role === 'user') {
      if (tourStage === 'login' || tourStage === 'register') {
        setTourStage('diagnosis');
      }
    }
  }, [currentUser]); // eslint-disable-line

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

  const handleDiagnosisComplete = (results: CFResult[]) => {
    setDiagnosisResult(results);
    setCurrentPage("diagnosis-result");

    // Majukan tourStage ke 'save'
    if (!hasSeenTour && tourStage === 'diagnosis') {
      setTourStage('save');
    }

    // Diagnosis sudah disimpan ke backend oleh `DiagnosisPage`.
    // Refresh state riwayat supaya langsung sinkron tanpa harus klik tombol simpan.
    if (currentUser?.id) {
      void fetchDiagnosisResults(currentUser.id);
    }
  };

  const handleSaveDiagnosisResult = async () => {
    // Tombol ini bukan lagi syarat untuk menyimpan.
    // Data sudah tersimpan di backend; tombol hanya untuk kembali dan memastikan state riwayat ter-refresh.
    if (currentUser?.id) {
      await fetchDiagnosisResults(currentUser.id);
    }
    setDiagnosisResult(null);
    setCurrentPage("user-dashboard");
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Majukan tahap tour saat user berpindah halaman
    if (!hasSeenTour) {
      if (page === 'register' && tourStage === 'register') {
        setTourStage('login');
      }
    }
  };

  // --- RENDER LOGIC ---

  // 1. Tampilan untuk Public (Belum Login)
  if (!currentUser) {
    return (
      <div className="flex flex-col min-h-screen">
        <OnboardingTour currentPage={currentPage} />
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
        <WhatsAppFloatingButton phoneNumber="+62 821-3170-4701" />
        <Footer />
      </div>
    );
  }

  // 2. Tampilan untuk User Dashboard
  if (currentUser.role === "user") {
    const knownUserPages = ["user-dashboard", "diagnosis", "diagnosis-result", "history", "profile"];
    const isRecommendationDetail = currentPage.startsWith('recommendation-detail-');
    const recommendationDetail = (() => {
      if (!isRecommendationDetail) return null;
      const rest = currentPage.replace('recommendation-detail-', '');
      const [idPart, queryString = ''] = rest.split('?');
      const params = new URLSearchParams(queryString);
      const from = params.get('from') ?? undefined;
      return { id: idPart, from };
    })();

    return (
      <SidebarProvider defaultOpen>
      <OnboardingTour currentPage={currentPage} diagnosisCompleted={!!diagnosisResult} />
        <Sidebar>
          <UserSidebar currentPage={currentPage} onNavigate={handleNavigate} />
        </Sidebar>
        <SidebarInset className="bg-slate-50 overflow-hidden">
          <MobileTopBar />
          <div className="flex-1 overflow-auto">
            {currentPage === "user-dashboard" && <UserDashboardPage onNavigate={handleNavigate} />}
            {currentPage === "diagnosis" && <DiagnosisPage onNavigate={handleNavigate} onComplete={handleDiagnosisComplete} />}
            {currentPage === "diagnosis-result" && diagnosisResult && (
              <DiagnosisResultPage result={diagnosisResult} onSave={handleSaveDiagnosisResult} onNavigate={handleNavigate} />
            )}
            {currentPage === "history" && <HistoryPage onNavigate={handleNavigate} />}
            {currentPage === "profile" && <ProfilePage />}
            {isRecommendationDetail && recommendationDetail && (
              <RecommendationDetailPage
                recommendationId={recommendationDetail.id}
                backPage={recommendationDetail.from}
                onNavigate={handleNavigate}
              />
            )}
            {/* Fallback jika page tidak ditemukan di user */}
            {!knownUserPages.includes(currentPage) && !isRecommendationDetail && (
              <UserDashboardPage onNavigate={handleNavigate} />
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // 3. Tampilan untuk Admin Dashboard
  if (currentUser.role === "admin") {
    const knownAdminPages = [
      "admin-dashboard",
      "admin-user-history",
      "admin-articles",
      "admin-symptoms",
      "admin-recommendations",
      "admin-users",
    ];

    const isAdminRecommendationDetail = currentPage.startsWith('admin-recommendation-detail-');
    const adminRecommendationDetail = (() => {
      if (!isAdminRecommendationDetail) return null;
      const rest = currentPage.replace('admin-recommendation-detail-', '');
      const [idPart, queryString = ''] = rest.split('?');
      const params = new URLSearchParams(queryString);
      const from = params.get('from') ?? undefined;
      return { id: idPart, from };
    })();

    return (
      <SidebarProvider defaultOpen>
        <Sidebar>
          <AdminSidebar currentPage={currentPage} onNavigate={handleNavigate} />
        </Sidebar>
        <SidebarInset className="bg-slate-50 overflow-hidden">
          <MobileTopBar />
          <div className="flex-1 overflow-auto">
            {currentPage === "admin-dashboard" && <AdminDashboardPage />}
            {currentPage === "admin-user-history" && <UserHistoryPage onNavigate={handleNavigate} />}
            {currentPage === "admin-articles" && <ArticleManagementPage />}
            {currentPage === "admin-symptoms" && <SymptomManagementPage />}
            {currentPage === "admin-recommendations" && <RecommendationManagementPage />}
            {currentPage === "admin-users" && <UserManagementPage />}
            {isAdminRecommendationDetail && adminRecommendationDetail && (
              <AdminRecommendationDetailPage
                recommendationId={adminRecommendationDetail.id}
                backPage={adminRecommendationDetail.from}
                onNavigate={handleNavigate}
              />
            )}
            {/* Fallback jika page tidak ditemukan di admin */}
            {!knownAdminPages.includes(currentPage) && !isAdminRecommendationDetail && (
              <AdminDashboardPage />
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
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