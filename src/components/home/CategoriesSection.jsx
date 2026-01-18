import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Car, Laptop, Briefcase, Sofa, ShoppingBag, Baby, Sparkles, Book, Dumbbell, Palette, Wrench } from 'lucide-react';

const CategoriesSection = () => {
    const categories = [
        { name: 'Emlak', icon: Home, path: '/emlak', color: 'from-blue-500 to-cyan-500' },
        { name: 'Vasıta', icon: Car, path: '/vasita', color: 'from-purple-500 to-pink-500' },
        { name: 'Elektronik', icon: Laptop, path: '/elektronik', color: 'from-orange-500 to-red-500' },
        { name: 'İş İlanları', icon: Briefcase, path: '/is-ilanlari', color: 'from-green-500 to-emerald-500' },
        { name: 'Ev & Eşya', icon: Sofa, path: '/ev-esyalari', color: 'from-indigo-500 to-blue-500' },
        { name: 'Giyim', icon: ShoppingBag, path: '/giyim', color: 'from-pink-500 to-rose-500' },
        { name: 'Anne & Bebek', icon: Baby, path: '/anne-bebek', color: 'from-yellow-500 to-orange-500' },
        { name: 'Kozmetik', icon: Sparkles, path: '/kozmetik', color: 'from-purple-500 to-violet-500' },
        { name: 'Kitap & Dergi', icon: Book, path: '/kitap-dergi', color: 'from-teal-500 to-cyan-500' },
        { name: 'Spor', icon: Dumbbell, path: '/spor', color: 'from-red-500 to-orange-500' },
        { name: 'Hobi & Oyun', icon: Palette, path: '/hobi-oyun', color: 'from-blue-500 to-purple-500' },
        { name: 'Hizmetler', icon: Wrench, path: '/hizmetler', color: 'from-gray-600 to-gray-800' },
    ];

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Kategoriler
                    </h2>
                    <p className="text-lg text-gray-600">
                        İhtiyacınız olan kategoriyi seçin ve alışverişe başlayın
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.path}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link
                                to={category.path}
                                className="group block"
                            >
                                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-transparent hover:-translate-y-1">
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                                        <category.icon className="text-white" size={28} />
                                    </div>
                                    <h3 className="text-center font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {category.name}
                                    </h3>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoriesSection;
