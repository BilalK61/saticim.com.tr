import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilPage from './pages/ProfilPage';
import IlanEkle from './pages/ilanEkle';
import IlanDetay from './pages/ilanDetay';
import Mesajlar from './pages/Mesajlar';
import AiAssistantPage from './pages/AiAssistantPage';
import SearchResults from './pages/SearchResults';
import DebugListings from './pages/DebugListings';
import Kategoriler from './pages/kategoriler';

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

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="flex flex-col min-h-screen bg-gray-50">
                    <Navbar />
                    <main className="flex-grow">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/profil" element={<ProfilPage />} />
                            <Route path="/ilan-ekle" element={<IlanEkle />} />
                            <Route path="/ilan-duzenle/:id" element={<IlanEkle />} />
                            <Route path="/ilan/:id" element={<IlanDetay />} />
                            <Route path="/mesajlar" element={<Mesajlar />} />
                            <Route path="/ai-asistani" element={<AiAssistantPage />} />
                            <Route path="/bilai" element={<AiAssistantPage />} />
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
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
