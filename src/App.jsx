import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import ProfilPage from './pages/ProfilPage';
import IlanEkle from './pages/ilanEkle';
import IlanDetay from './pages/ilanDetay';
import Mesajlar from './pages/Mesajlar';
import AiAssistantPage from './pages/AiAssistantPage';
import NotificationsPage from './pages/NotificationsPage';
import SearchResults from './pages/SearchResults';
import DebugListings from './pages/DebugListings';
import Kategoriler from './pages/kategoriler';
import PriceGuessGame from './pages/PriceGuessGame';

// Admin Files
import AdminRoute from './admin/AdminRoute';
import AdminLogin from './admin/admin-login';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/Dashboard';
import Listings from './admin/Listings';
import Users from './admin/Users';
import Reports from './admin/Reports';
import Settings from './admin/Settings';
import GameScores from './admin/GameScores';

// Category Pages
import Emlak from './pages/ilansayfalari/Emlak';
import Vasita from './pages/ilansayfalari/Vasita';
import Elektronik from './pages/ilansayfalari/Elektronik';
import Giyim from './pages/ilansayfalari/Giyim';
import EvEsyalari from './pages/ilansayfalari/EvEsyalari';
import IsIlanlari from './pages/ilansayfalari/IsIlanlari';
import Hizmetler from './pages/ilansayfalari/hizmetler';
import AnneBebek from './pages/ilansayfalari/anne-bebek';
import HobiOyun from './pages/ilansayfalari/hobi-oyun';
import KitapDergi from './pages/ilansayfalari/kitap-dergi';
import Kozmetik from './pages/ilansayfalari/kozmetik';
import Spor from './pages/ilansayfalari/Spor';

import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route element={<PublicLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                        <Route path="/verify-email" element={<EmailVerificationPage />} />
                        <Route path="/profil" element={<ProfilPage />} />
                        <Route path="/ilan-ekle" element={<IlanEkle />} />
                        <Route path="/ilanuzenle/:id" element={<IlanEkle />} />
                        <Route path="/ilan/:id" element={<IlanDetay />} />
                        <Route path="/mesajlar" element={<Mesajlar />} />
                        <Route path="/ai-asistani" element={<AiAssistantPage />} />
                        <Route path="/bilai" element={<AiAssistantPage />} />
                        <Route path="/bildirimler" element={<NotificationsPage />} />
                        <Route path="/arama" element={<SearchResults />} />
                        <Route path="/debug" element={<DebugListings />} />
                        <Route path="/kategoriler" element={<Kategoriler />} />

                        {/* Category Routes */}
                        <Route path="/emlak" element={<Emlak />} />
                        <Route path="/vasita" element={<Vasita />} />
                        <Route path="/elektronik" element={<Elektronik />} />
                        <Route path="/giyim" element={<Giyim />} />
                        <Route path="/ev-esyalari" element={<EvEsyalari />} />
                        <Route path="/is-ilanlari" element={<IsIlanlari />} />
                        <Route path="/hizmetler" element={<Hizmetler />} />
                        <Route path="/anne-bebek" element={<AnneBebek />} />
                        <Route path="/hobi-oyun" element={<HobiOyun />} />
                        <Route path="/kitap-dergi" element={<KitapDergi />} />
                        <Route path="/kozmetik" element={<Kozmetik />} />
                        <Route path="/spor" element={<Spor />} />

                        {/* Mini Game */}
                        <Route path="/fiyat-tahmin" element={<PriceGuessGame />} />
                    </Route>

                    {/* Admin Login Route (unprotected) */}
                    <Route path="/admin/login" element={<AdminLogin />} />

                    {/* Admin Routes (protected) */}
                    <Route element={<AdminRoute />}>
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<Dashboard />} />
                            <Route path="listings" element={<Listings />} />
                            <Route path="users" element={<Users />} />
                            <Route path="reports" element={<Reports />} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="game-scores" element={<GameScores />} />
                        </Route>
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
