import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { Search, MapPin, Filter, X } from 'lucide-react';
import Footer from '../components/Footer';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalResults, setTotalResults] = useState(0);

    // Filters
    const [selectedCategory, setSelectedCategory] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [showFilters, setShowFilters] = useState(false);

    const categories = [
        'vasita', 'emlak', 'elektronik', 'giyim', 'ev-esyalari',
        'is-ilanlari', 'hizmetler', 'anne-bebek', 'hobi-oyun',
        'kitap-dergi', 'kozmetik', 'spor'
    ];

    useEffect(() => {
        if (query) {
            fetchResults();
        }
    }, [query, selectedCategory, priceRange]);

    const fetchResults = async () => {
        setLoading(true);
        try {
            let queryBuilder = supabase
                .from('listings')
                .select('*, cities(name), districts(name)')
                .eq('status', 'approved');

            // Search in title and description
            if (query) {
                queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
            }

            // Category filter
            if (selectedCategory) {
                queryBuilder = queryBuilder.eq('category', selectedCategory);
            }

            // Price filters
            if (priceRange.min) {
                queryBuilder = queryBuilder.gte('price', parseFloat(priceRange.min));
            }
            if (priceRange.max) {
                queryBuilder = queryBuilder.lte('price', parseFloat(priceRange.max));
            }

            const { data, error, count } = await queryBuilder
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            setListings(data || []);
            setTotalResults(data?.length || 0);
        } catch (error) {
            console.error('Arama hatası:', error);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSelectedCategory('');
        setPriceRange({ min: '', max: '' });
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <div className="container mx-auto px-4 py-8 flex-1">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Search className="text-blue-600" size={32} />
                                Arama Sonuçları
                            </h1>
                            <p className="text-gray-600 mt-2">
                                "<span className="font-semibold text-gray-900">{query}</span>" için{' '}
                                <span className="font-semibold text-blue-600">{totalResults}</span> sonuç bulundu
                            </p>
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                            <Filter size={20} />
                            Filtrele
                        </button>
                    </div>
                </motion.div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Filters Sidebar */}
                    <motion.aside
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`w-full md:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}
                    >
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Filter size={18} className="text-blue-600" />
                                    Filtreler
                                </h3>
                                {(selectedCategory || priceRange.min || priceRange.max) && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-xs text-blue-600 hover:underline"
                                    >
                                        Temizle
                                    </button>
                                )}
                            </div>

                            {/* Category Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Tümü</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat} className="capitalize">
                                            {cat.replace('-', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fiyat (TL)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.aside>

                    {/* Results Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                            </div>
                        ) : listings.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {listings.map((listing, index) => (
                                    <motion.div
                                        key={listing.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Link
                                            to={`/ilan/${listing.id}`}
                                            className="block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                        >
                                            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                                                {listing.images && listing.images.length > 0 ? (
                                                    <img
                                                        src={listing.images[0]}
                                                        alt={listing.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                                        <Search className="text-gray-400" size={48} />
                                                    </div>
                                                )}
                                                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                                    <MapPin size={12} />
                                                    {listing.cities?.name} / {listing.districts?.name}
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 hover:text-blue-600 transition">
                                                    {listing.title}
                                                </h3>
                                                <div className="text-xl font-bold text-blue-600 mb-2">
                                                    {new Intl.NumberFormat('tr-TR').format(listing.price)} {listing.currency}
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <span className="capitalize bg-gray-100 px-2 py-1 rounded">
                                                        {listing.category?.replace('-', ' ')}
                                                    </span>
                                                    <span>{new Date(listing.created_at).toLocaleDateString('tr-TR')}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white rounded-xl shadow-sm p-16 text-center border border-gray-200"
                            >
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                                    <Search className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Sonuç Bulunamadı</h3>
                                <p className="text-gray-500 max-w-md mx-auto mb-6">
                                    "<span className="font-semibold">{query}</span>" için herhangi bir ilan bulunamadı.
                                    Farklı bir arama terimi deneyebilir veya filtreleri değiştirebilirsiniz.
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                                >
                                    Filtreleri Temizle
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default SearchResults;
