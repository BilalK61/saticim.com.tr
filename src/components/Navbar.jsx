import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ChevronDown, Car, Smartphone, Briefcase, MoreHorizontal, Search, UserCircle, UserPlus, LogOut, MessageCircle, Bot, Heart, Plus, Menu, X, Building2, Shirt, Dumbbell, Sofa } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { suggestions, loading } = useSearchSuggestions(searchQuery);

  // Timer ID'lerini tutmak için ref'ler
  const categoryTimeoutRef = useRef(null);
  const profileTimeoutRef = useRef(null);

  const categories = [
    { name: 'Emlak', desc: 'Konut, İş Yeri, Arsa', icon: Building2, link: '/emlak', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Vasıta', desc: 'Otomobil, Motosiklet', icon: Car, link: '/vasita', color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Elektronik', desc: 'Telefon, Bilgisayar', icon: Smartphone, link: '/elektronik', color: 'text-purple-600', bg: 'bg-purple-50' },
    { name: 'İş İlanları', desc: 'İş Fırsatları', icon: Briefcase, link: '/is-ilanlari', color: 'text-orange-600', bg: 'bg-orange-50' },
    { name: 'Ev Eşyaları', desc: 'Mobilya, Beyaz Eşya', icon: Sofa, link: '/ev-esyalari', color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'Giyim', desc: 'Kıyafet, Aksesuar', icon: Shirt, link: '/giyim', color: 'text-pink-600', bg: 'bg-pink-50' },
    { name: 'Spor', desc: 'Ekipman, Giyim', icon: Dumbbell, link: '/spor', color: 'text-red-600', bg: 'bg-red-50' },
    { name: 'Daha Fazla', desc: 'Tüm Kategoriler', icon: MoreHorizontal, link: '/kategoriler', color: 'text-gray-600', bg: 'bg-gray-50' }
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
      setSearchQuery('');
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
    <header className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="https://ecbhhbyfocitafbfsegg.supabase.co/storage/v1/object/public/logos/saticimlogokucuk.png"
              alt="Satıcım"
              className="h-16 w-auto object-contain hover:opacity-90 transition-opacity"
            />
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-6 relative">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onFocus={handleSearchInputFocus}
                placeholder="Ürün, kategori veya marka ara..."
                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                autoComplete="off"
              />
            </div>
            <SearchDropdown
              suggestions={suggestions}
              loading={loading}
              query={searchQuery}
              show={showSearchDropdown}
              onClose={() => setShowSearchDropdown(false)}
              onSelect={() => setSearchQuery('')}
            />
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2">

            {/* İlan Ver Button */}
            <button
              onClick={() => navigate('/ilan-ekle')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-blue-200 transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>İlan Ver</span>
            </button>

            {/* bilAI Button */}
            <button
              onClick={() => navigate('/bilai')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-gray-300 to-gray-400 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-gray-200 transition-all hover:-translate-y-0.5"
              title="bilAI Asistan"
            >
              <Bot className="w-4 h-4" />
              <img src="/img/logokucuk.png" alt="bilAI" className="h-4 object-contain" />
            </button>

            {/* Profile Menu - Hidden on mobile, shown on desktop */}
            <div
              className="hidden md:block relative"
              onMouseEnter={handleProfileEnter}
              onMouseLeave={handleProfileLeave}
            >
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden lg:block max-w-[100px] truncate">
                  {user ? (user.username || user.email?.split('@')[0]) : 'Misafir'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400 hidden lg:block" />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    onMouseEnter={handleProfileEnter}
                    onMouseLeave={handleProfileLeave}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                  >
                    {/* User Info Header */}
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden ring-2 ring-white shadow">
                          {user?.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <UserCircle className="w-7 h-7 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate">
                            {user ? (user.full_name || user.username || 'Kullanıcı') : 'Misafir'}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {user ? user.email : 'Henüz giriş yapmadınız'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      {user ? (
                        <>
                          <button onClick={() => navigate('/profil')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                              <UserCircle className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-sm">Profilim</div>
                              <div className="text-xs text-gray-400">Hesap bilgilerini yönet</div>
                            </div>
                          </button>
                          <button onClick={() => navigate('/profil?tab=favorites')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors">
                            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                              <Heart className="w-5 h-5 text-red-500" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-sm">Favorilerim</div>
                              <div className="text-xs text-gray-400">Kaydettiğin ilanlar</div>
                            </div>
                          </button>
                          <button onClick={() => navigate('/mesajlar')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors">
                            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                              <MessageCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-sm">Mesajlarım</div>
                              <div className="text-xs text-gray-400">Konuşmalarını gör</div>
                            </div>
                          </button>
                          <div className="my-2 border-t border-gray-100"></div>
                          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 transition-colors">
                            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                              <LogOut className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-sm">Çıkış Yap</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => navigate('/login')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 text-blue-600 transition-colors">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                              <UserCircle className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-sm">Giriş Yap</div>
                              <div className="text-xs text-gray-400">Hesabına erişim sağla</div>
                            </div>
                          </button>
                          <button onClick={() => navigate('/register')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors">
                            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                              <UserPlus className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-sm">Kayıt Ol</div>
                              <div className="text-xs text-gray-400">Yeni hesap oluştur</div>
                            </div>
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>


      </div>

      {/* Category Navigation */}
      <nav className="border-t border-gray-100 hidden md:block">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center">
            {/* Main Categories - Inline */}
            <div className="flex items-center gap-1">
              <Link
                to="/"
                className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors relative group"
              >
                Ana Sayfa
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-3/4 transition-all"></span>
              </Link>

              {categories.slice(0, 5).map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={idx}
                    to={cat.link}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors relative group"
                  >
                    <Icon className={`w-4 h-4 ${cat.color}`} />
                    <span>{cat.name}</span>
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-3/4 transition-all"></span>
                  </Link>
                );
              })}

              {/* More Categories Dropdown */}
              <motion.div
                onMouseEnter={handleCategoryEnter}
                onMouseLeave={handleCategoryLeave}
                className="relative"
              >
                <button className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                  <span>Daha Fazla</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                <AnimatePresence>
                  {showCategoryMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      onMouseEnter={handleCategoryEnter}
                      onMouseLeave={handleCategoryLeave}
                      className="absolute left-1/2 -translate-x-1/2 mt-1 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50"
                    >
                      <div className="grid grid-cols-2 gap-1">
                        {categories.map((cat, idx) => {
                          const Icon = cat.icon;
                          return (
                            <button
                              key={idx}
                              onClick={() => { navigate(cat.link); setShowCategoryMenu(false); }}
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group"
                            >
                              <div className={`w-10 h-10 rounded-xl ${cat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <Icon className={`w-5 h-5 ${cat.color}`} />
                              </div>
                              <div className="text-left">
                                <div className="font-medium text-sm text-gray-800">{cat.name}</div>
                                <div className="text-xs text-gray-400">{cat.desc}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
          >
            <div className="p-4 space-y-2">
              {/* Search Bar - Mobile Menu */}
              <div className="pb-2">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onFocus={handleSearchInputFocus}
                    placeholder="Ne arıyorsun?"
                    className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    autoComplete="off"
                  />
                  <SearchDropdown
                    suggestions={suggestions}
                    loading={loading}
                    query={searchQuery}
                    show={showSearchDropdown}
                    onClose={() => setShowSearchDropdown(false)}
                    onSelect={() => setSearchQuery('')}
                  />
                </form>
              </div>

              {/* İlan Ver - Mobile */}
              <button
                onClick={() => { navigate('/ilan-ekle'); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Ücretsiz İlan Ver</span>
              </button>

              {/* bilAI - Mobile */}
              <button
                onClick={() => { navigate('/bilai'); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium"
              >
                <Bot className="w-5 h-5" />
                <span>bilAI Asistan</span>
              </button>

              {/* Categories Grid */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                {categories.map((cat, idx) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => { navigate(cat.link); setMobileMenuOpen(false); }}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-gray-50 transition"
                    >
                      <div className={`w-10 h-10 rounded-xl ${cat.bg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${cat.color}`} />
                      </div>
                      <span className="text-xs text-gray-600 font-medium text-center">{cat.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-3"></div>

              {/* Profile Section - Mobile */}
              <div className="space-y-2">
                {user ? (
                  <>
                    {/* User Info */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate text-sm">
                          {user.full_name || user.username || 'Kullanıcı'}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                      </div>
                    </div>

                    {/* Profile Links */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => { navigate('/profil'); setMobileMenuOpen(false); }}
                        className="flex flex-col items-center gap-1 p-3 bg-blue-50 rounded-xl"
                      >
                        <UserCircle className="w-5 h-5 text-blue-600" />
                        <span className="text-xs text-blue-700 font-medium">Profilim</span>
                      </button>
                      <button
                        onClick={() => { navigate('/profil?tab=favorites'); setMobileMenuOpen(false); }}
                        className="flex flex-col items-center gap-1 p-3 bg-red-50 rounded-xl"
                      >
                        <Heart className="w-5 h-5 text-red-500" />
                        <span className="text-xs text-red-600 font-medium">Favoriler</span>
                      </button>
                      <button
                        onClick={() => { navigate('/mesajlar'); setMobileMenuOpen(false); }}
                        className="flex flex-col items-center gap-1 p-3 bg-green-50 rounded-xl"
                      >
                        <MessageCircle className="w-5 h-5 text-green-600" />
                        <span className="text-xs text-green-700 font-medium">Mesajlar</span>
                      </button>
                    </div>

                    {/* Logout */}
                    <button
                      onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-red-600 bg-red-50 rounded-xl font-medium text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Çıkış Yap</span>
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                      className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm"
                    >
                      <UserCircle className="w-5 h-5" />
                      <span>Giriş Yap</span>
                    </button>
                    <button
                      onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                      className="flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm"
                    >
                      <UserPlus className="w-5 h-5" />
                      <span>Kayıt Ol</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;