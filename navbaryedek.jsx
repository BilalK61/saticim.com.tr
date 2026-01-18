import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ChevronDown, Car, Smartphone, Briefcase, MoreHorizontal, Search, UserCircle, UserPlus, LogOut, MessageCircle, Bot, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';
import SearchDropdown from './SearchDropdown';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showCategoryMenu, setShowCategoryMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const { suggestions, loading } = useSearchSuggestions(searchQuery);

    // Timer ID'lerini tutmak için ref'ler
    const categoryTimeoutRef = useRef(null);
    const profileTimeoutRef = useRef(null);

    const categories = [
        { name: 'Emlak', desc: 'Konut, İş Yeri, Arsa', icon: Home, link: '/emlak' },
        { name: 'Vasıta', desc: 'Otomobil, Motosiklet', icon: Car, link: '/vasita' },
        { name: 'Elektronik', desc: 'Telefon, Bilgisayar', icon: Smartphone, link: '/elektronik' },
        { name: 'İş İlanları', desc: 'Kıyafet, Aksesuar', icon: Briefcase, link: '/is-ilanlari' },
        { name: 'Ev Eşyaları', desc: 'Mobilya, Beyaz Eşya', icon: Home, link: '/ev-esyalari' },
        { name: 'Giyim', desc: 'Kıyafet, Aksesuar', icon: Home, link: '/giyim' },
        { name: 'Spor', desc: 'Ekipman, Giyim', icon: Home, link: '/spor' },
        { name: 'Daha Fazla', desc: 'Tüm Kategoriler', icon: MoreHorizontal, link: '/kategoriler' }
    ];

    // --- Kategori Menüsü Handlerları ---
    const handleCategoryEnter = () => {
        if (categoryTimeoutRef.current) {
            clearTimeout(categoryTimeoutRef.current);
        }
        setShowCategoryMenu(true);
    };

    const handleCategoryLeave = () => {
        categoryTimeoutRef.current = setTimeout(() => {
            setShowCategoryMenu(false);
        }, 200);
    };

    // --- Profil Menüsü Handlerları ---
    const handleProfileEnter = () => {
        if (profileTimeoutRef.current) {
            clearTimeout(profileTimeoutRef.current);
        }
        setShowProfileMenu(true);
    };

    const handleProfileLeave = () => {
        profileTimeoutRef.current = setTimeout(() => {
            setShowProfileMenu(false);
        }, 200);
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    // --- Arama Fonksiyonu ---
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/arama?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery(''); // Arama sonrası temizle
            setShowSearchDropdown(false);
        }
    };

    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
        setShowSearchDropdown(e.target.value.length >= 2);
    };

    const handleSearchInputFocus = () => {
        if (searchQuery.length >= 2) {
            setShowSearchDropdown(true);
        }
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center cursor-pointer">
                        <div className="text-2xl font-bold text-blue-600">Satıcım</div>
                    </Link>

                    <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8 relative">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchInputChange}
                                onFocus={handleSearchInputFocus}
                                placeholder="Ne aramıştınız?"
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoComplete="off"
                            />
                        </div>

                        {/* Search Dropdown */}
                        <SearchDropdown
                            suggestions={suggestions}
                            loading={loading}
                            query={searchQuery}
                            show={showSearchDropdown}
                            onClose={() => setShowSearchDropdown(false)}
                            onSelect={() => setSearchQuery('')}
                        />
                    </form>

                    {/* Profil Menüsü */}
                    <div
                        className="relative"
                        onMouseEnter={handleProfileEnter}
                        onMouseLeave={handleProfileLeave}
                    >
                        <button
                            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                        >
                            <UserCircle className="w-6 h-6 text-gray-600" />
                            <span className="text-sm font-medium">{user ? (user.username || user.email?.split('@')[0]) : 'Misafir'}</span>
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                        </button>

                        {showProfileMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                onMouseEnter={handleProfileEnter}
                                onMouseLeave={handleProfileLeave}
                                className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50"
                            >
                                <div className="p-4 border-b border-gray-100">
                                    <div className="text-sm text-gray-500">{user ? 'Hoş geldiniz' : 'Henüz giriş yapmadınız'}</div>
                                    <div className="font-semibold text-sm text-gray-800">{user ? (user.full_name) : 'Misafir'}</div>
                                </div>
                                <div className="py-2 border-b border-gray-100">
                                    {user ? (
                                        <>
                                            <button onClick={() => navigate('/profil')} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700">
                                                <UserCircle className="w-5 h-5" />
                                                <span>Profilim</span>
                                            </button>
                                            <button onClick={() => navigate('/profil?tab=favorites')} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700">
                                                <Heart className="w-5 h-5 text-red-500" />
                                                <span>Favorilerim</span>
                                            </button>
                                            <button onClick={() => navigate('/mesajlar')} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700">
                                                <MessageCircle className="w-5 h-5" />
                                                <span>Mesajlarım</span>
                                            </button>
                                            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-red-600">
                                                <LogOut className="w-5 h-5" />
                                                <span>Çıkış Yap</span>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => navigate('/login')} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-blue-600">
                                                <UserCircle className="w-5 h-5" />
                                                <span>Giriş Yap</span>
                                            </button>
                                            <button onClick={() => navigate('/register')} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50">
                                                <UserPlus className="w-5 h-5" />
                                                <span>Kayıt Ol</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                                <div className="py-2">
                                    <button onClick={() => { navigate('/bilai'); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700" title="bilAI">
                                        <Bot className="w-5 h-5 text-[#0015cf]" />
                                        <img src="/img/logokucuk.png" alt="bilAI" className="h-4 object-contain" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-center gap-6 py-3">
                        <Link to="/" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">
                            Ana Sayfa
                        </Link>

                        <motion.div
                            onMouseEnter={handleCategoryEnter}
                            onMouseLeave={handleCategoryLeave}
                            className="relative"
                        >
                            <button
                                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
                                onClick={() => navigate('/kategoriler')}
                            >
                                Kategoriler
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {showCategoryMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    onMouseEnter={handleCategoryEnter}
                                    onMouseLeave={handleCategoryLeave}
                                    className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-2
                             transition-opacity duration-300 ease-out opacity-100 z-50"
                                >
                                    {categories.map((cat, idx) => {
                                        const Icon = cat.icon;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => navigate(cat.link)}
                                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
                                            >
                                                <Icon className="w-6 h-6 text-blue-600" />
                                                <div className="text-left">
                                                    <div className="font-medium text-gray-800">{cat.name}</div>
                                                    <div className="text-xs text-gray-500">{cat.desc}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;