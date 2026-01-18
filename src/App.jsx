import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilPage from './pages/ProfilPage';
import Kategoriler from './pages/kategoriler';
import Emlak from './pages/Emlak';
import Vasita from './pages/Vasita';
import Elektronik from './pages/Elektronik';
import IsIlanlari from './pages/IsIlanlari';
import EvEsyalari from './pages/EvEsyalari';
import Giyim from './pages/Giyim';
import Spor from './pages/Spor';
import Kozmetik from './pages/kozmetik';
import KitapDergi from './pages/kitap-dergi';
import HobiOyun from './pages/hobi-oyun';
import Hizmetler from './pages/hizmetler';
import AnneBebek from './pages/anne-bebek';
import Mesajlar from './pages/Mesajlar';
import IlanDetay from './pages/ilanDetay';
import IlanEkle from './pages/ilanEkle';
import DebugListings from './pages/DebugListings';
import SearchResults from './pages/SearchResults';
import AiAssistantPage from './pages/AiAssistantPage';

// Admin Components
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/Dashboard';
import AdminListings from './admin/Listings';
import AdminUsers from './admin/Users';
import AdminLogin from './admin/admin-login';
import AdminRoute from './admin/AdminRoute';
import AdminSettings from './admin/Settings';
import AdminReports from './admin/Reports';

// ...existing imports
import FloatingActionButton from './components/FloatingActionButton';

const MainLayout = () => (
  <div className="app font-sans text-gray-900">
    <Navbar />
    <main>
      <Outlet />
    </main>
    <FloatingActionButton />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin Login (Public) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="listings" element={<AdminListings />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* Main Site Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profil" element={<ProfilPage />} />
            <Route path="/mesajlar" element={<Mesajlar />} />

            {/* Category Routes */}
            <Route path="/kategoriler" element={<Kategoriler />} />
            <Route path="/emlak" element={<Emlak />} />
            <Route path="/vasita" element={<Vasita />} />
            <Route path="/elektronik" element={<Elektronik />} />
            <Route path="/is-ilanlari" element={<IsIlanlari />} />
            <Route path="/ev-esyalari" element={<EvEsyalari />} />
            <Route path="/giyim" element={<Giyim />} />
            <Route path="/spor" element={<Spor />} />
            <Route path="/kozmetik" element={<Kozmetik />} />
            <Route path="/kitap-dergi" element={<KitapDergi />} />
            <Route path="/hobi-oyun" element={<HobiOyun />} />
            <Route path="/hizmetler" element={<Hizmetler />} />
            <Route path="/anne-bebek" element={<AnneBebek />} />

            {/* Listing Routes */}
            <Route path="/ilan-detay/:id" element={<IlanDetay />} />
            <Route path="/ilan-detay" element={<IlanDetay />} />
            <Route path="/ilan-ekle/:id" element={<IlanEkle />} />
            <Route path="/ilan-ekle" element={<IlanEkle />} />
            <Route path="/debug-listings" element={<DebugListings />} />
            <Route path="/arama" element={<SearchResults />} />
            <Route path="/bilAI" element={<AiAssistantPage />} />

            {/* Catch-all Route */}
            <Route path="*" element={<div className="pt-24 text-center">Sayfa bulunamadı</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;