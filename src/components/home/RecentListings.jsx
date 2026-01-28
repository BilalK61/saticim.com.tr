import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ShoppingBag } from 'lucide-react';

const RecentListings = ({ listings, loading }) => {
    const formatPrice = (price) => {
        if (!price) return 'Fiyat Belirtilmemiş';
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0
        }).format(price);
    };

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                            Son Eklenen İlanlar
                        </h2>
                        <p className="text-gray-600">Yeni eklenen fırsatları kaçırmayın</p>
                    </div>
                    <Link
                        to="/kategoriler"
                        className="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold group"
                    >
                        Tümünü Gör
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                                <div className="h-48 bg-gray-200"></div>
                                <div className="p-4">
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {listings.map((listing, index) => (
                            <motion.div
                                key={listing.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link
                                    to={`/ilan/${listing.id}`}
                                    className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                                        {listing.images && listing.images.length > 0 ? (
                                            <img
                                                src={listing.images[0]}
                                                alt={listing.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                <ShoppingBag className="text-gray-400" size={48} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                            {listing.title}
                                        </h3>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-blue-600">
                                                {formatPrice(listing.price)}
                                            </span>
                                            {listing.city && (
                                                <span className="text-sm text-gray-500">{listing.city}</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}

                <div className="text-center mt-8 md:hidden">
                    <Link
                        to="/kategoriler"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                    >
                        Tüm İlanları Gör
                        <ChevronRight size={20} />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default RecentListings;
