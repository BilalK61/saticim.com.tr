import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp } from 'lucide-react';

const SearchDropdown = ({
    suggestions,
    loading,
    query,
    onClose,
    onSelect,
    show
}) => {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                onClose();
            }
        };

        if (show) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [show, onClose]);

    // ESC to close
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (show) {
            document.addEventListener('keydown', handleEsc);
        }

        return () => document.removeEventListener('keydown', handleEsc);
    }, [show, onClose]);

    const handleItemClick = (listing) => {
        onSelect?.();
        navigate(`/ilan-detay/${listing.id}`);
        onClose();
    };

    const handleViewAll = () => {
        onSelect?.();
        navigate(`/arama?q=${encodeURIComponent(query)}`);
        onClose();
    };

    if (!show) return null;

    return (
        <AnimatePresence>
            <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-[400px] overflow-y-auto"
            >
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-3">Aranıyor...</p>
                    </div>
                ) : suggestions.length > 0 ? (
                    <>
                        {suggestions.map((listing, index) => (
                            <motion.button
                                key={listing.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={() => handleItemClick(listing)}
                                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                            >
                                <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                    {listing.images && listing.images.length > 0 ? (
                                        <img
                                            src={listing.images[0]}
                                            alt={listing.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Search className="w-6 h-6 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <h4 className="font-medium text-gray-900 line-clamp-1">
                                        {listing.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm font-semibold text-blue-600">
                                            {new Intl.NumberFormat('tr-TR').format(listing.price)} {listing.currency}
                                        </span>
                                        {listing.cities && (
                                            <span className="text-xs text-gray-500">
                                                • {listing.cities.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400 capitalize">
                                    {listing.category?.replace('-', ' ')}
                                </div>
                            </motion.button>
                        ))}

                        {/* View All Button */}
                        <button
                            onClick={handleViewAll}
                            className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-blue-600 font-medium"
                        >
                            <TrendingUp size={18} />
                            <span>Tüm Sonuçları Gör ({suggestions.length}+)</span>
                        </button>
                    </>
                ) : (
                    <div className="p-8 text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Search className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">
                            "<span className="font-semibold">{query}</span>" için sonuç bulunamadı
                        </p>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default SearchDropdown;
