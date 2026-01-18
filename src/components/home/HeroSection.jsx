import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useSearchSuggestions } from '../../hooks/useSearchSuggestions';
import SearchDropdown from '../SearchDropdown';

const HeroSection = ({ stats }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    const { suggestions, loading } = useSearchSuggestions(searchQuery);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/arama?q=${encodeURIComponent(searchQuery.trim())}`);
            setShowDropdown(false);
        }
    };

    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
        setShowDropdown(e.target.value.length >= 2);
    };

    const handleInputFocus = () => {
        if (searchQuery.length >= 2) {
            setShowDropdown(true);
        }
    };

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 pt-24 pb-20">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0aDJWMGgtMnpNMzQgMTRoMlYwSDM0ek0zMiAxNGgyVjBoLTJ6TTMwIDE0aDJWMGgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

            <div className="container mx-auto max-w-7xl px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                >
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                        Aradığın <span className="text-white">Her Şey</span> Burada
                    </h1>
                    <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
                        Türkiye'nin en hızlı büyüyen ilan platformunda hemen alışverişe başla
                    </p>

                    {/* Arama Kutusu */}
                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12 relative">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleInputChange}
                                onFocus={handleInputFocus}
                                placeholder="Ara..."
                                className="w-full px-4 md:px-6 py-4 rounded-full text-sm md:text-lg shadow-2xl focus:outline-none focus:ring-4 focus:ring-yellow-300 pr-16 md:pr-20 placeholder:text-sm md:placeholder:text-base text-gray-900"
                                autoComplete="off"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-10 h-10 md:w-12 md:h-12 rounded-full font-semibold hover:shadow-lg transition-all flex items-center justify-center"
                            >
                                <Search size={23} className="hidden md:block" />
                                <Search size={23} className="md:hidden" />
                            </button>
                        </div>

                        {/* Search Dropdown */}
                        <SearchDropdown
                            suggestions={suggestions}
                            loading={loading}
                            query={searchQuery}
                            show={showDropdown}
                            onClose={() => setShowDropdown(false)}
                            onSelect={() => setSearchQuery('')}
                        />
                    </form>

                    {/* İstatistikler */}
                    <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                        >
                            <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                                {stats.totalListings.toLocaleString('tr-TR')}+
                            </div>
                            <div className="text-blue-100">Aktif İlan</div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                        >
                            <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                                {stats.activeUsers.toLocaleString('tr-TR')}+
                            </div>
                            <div className="text-blue-100">Kullanıcı</div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                        >
                            <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                                {stats.todayListings}
                            </div>
                            <div className="text-blue-100">Bugün Eklenen</div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;
