import React, { useState } from 'react';
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
        <section className="bg-blue-600 pt-24 pb-16">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                        Aradığın Her Şey Burada
                    </h1>
                    <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                        Türkiye'nin en hızlı büyüyen ilan platformunda hemen alışverişe başla
                    </p>

                    {/* Arama Kutusu */}
                    <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-10 relative">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleInputChange}
                                onFocus={handleInputFocus}
                                placeholder="Ne aramıştınız?"
                                className="w-full px-5 py-4 rounded-full text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 pr-14 text-gray-900"
                                autoComplete="off"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white w-10 h-10 rounded-full hover:bg-blue-700 transition flex items-center justify-center"
                            >
                                <Search size={20} />
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
                    <div className="flex justify-center gap-8 md:gap-16">
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-white">
                                {stats.totalListings.toLocaleString('tr-TR')}+
                            </div>
                            <div className="text-sm text-blue-200">Aktif İlan</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-white">
                                {stats.activeUsers.toLocaleString('tr-TR')}+
                            </div>
                            <div className="text-sm text-blue-200">Kullanıcı</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-white">
                                {stats.todayListings}
                            </div>
                            <div className="text-sm text-blue-200">Bugün Eklenen</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
