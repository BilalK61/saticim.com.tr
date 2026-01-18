import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Home, Car, Smartphone, Briefcase, Shirt,
    Dumbbell, Book, Gamepad2, Baby, Wrench,
    Sparkles, Sofa, Search, ArrowRight
} from 'lucide-react';
import Footer from '../components/Footer';

const categories = [
    {
        id: 'emlak',
        name: 'Emlak',
        desc: 'Konut, İş Yeri, Arsa',
        icon: Home,
        color: 'bg-blue-50 text-blue-600',
        link: '/emlak'
    },
    {
        id: 'vasita',
        name: 'Vasıta',
        desc: 'Otomobil, Motosiklet',
        icon: Car,
        color: 'bg-red-50 text-red-600',
        link: '/vasita'
    },
    {
        id: 'elektronik',
        name: 'Elektronik',
        desc: 'Telefon, Bilgisayar',
        icon: Smartphone,
        color: 'bg-purple-50 text-purple-600',
        link: '/elektronik'
    },
    {
        id: 'is-ilanlari',
        name: 'İş İlanları',
        desc: 'Tam/Yarı Zamanlı İşler',
        icon: Briefcase,
        color: 'bg-green-50 text-green-600',
        link: '/is-ilanlari'
    },
    {
        id: 'ev-esyalari',
        name: 'Ev Eşyaları',
        desc: 'Mobilya, Beyaz Eşya',
        icon: Sofa,
        color: 'bg-orange-50 text-orange-600',
        link: '/ev-esyalari'
    },
    {
        id: 'giyim',
        name: 'Giyim & Moda',
        desc: 'Kadın, Erkek, Çocuk',
        icon: Shirt,
        color: 'bg-pink-50 text-pink-600',
        link: '/giyim'
    },
    {
        id: 'spor',
        name: 'Spor & Outdoor',
        desc: 'Ekipman, Giyim',
        icon: Dumbbell,
        color: 'bg-teal-50 text-teal-600',
        link: '/spor'
    },
    {
        id: 'kozmetik',
        name: 'Kozmetik',
        desc: 'Parfüm, Bakım',
        icon: Sparkles,
        color: 'bg-rose-50 text-rose-600',
        link: '/kozmetik'
    },
    {
        id: 'kitap',
        name: 'Kitap & Dergi',
        desc: 'Edebiyat, Eğitim',
        icon: Book,
        color: 'bg-yellow-50 text-yellow-600',
        link: '/kitap-dergi'
    },
    {
        id: 'hobi',
        name: 'Hobi & Oyun',
        desc: 'Konsol, Koleksiyon',
        icon: Gamepad2,
        color: 'bg-indigo-50 text-indigo-600',
        link: '/hobi-oyun'
    },
    {
        id: 'anne-bebek',
        name: 'Anne & Bebek',
        desc: 'Giyim, Bakım',
        icon: Baby,
        color: 'bg-cyan-50 text-cyan-600',
        link: '/anne-bebek'
    },
    {
        id: 'hizmetler',
        name: 'Hizmetler',
        desc: 'Usta, Nakliye, Ders',
        icon: Wrench,
        color: 'bg-slate-50 text-slate-600',
        link: '/hizmetler'
    }
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const Kategoriler = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Hero Section */}
            <div className="bg-white border-b border-gray-100 pb-12 pt-8 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Tüm Kategorileri Keşfet
                        </h1>
                        <p className="text-gray-500 text-lg">
                            Aradığınız her şeyi bulabileceğiniz binlerce ilan sizi bekliyor.
                        </p>
                    </div>

                    <div className="max-w-xl mx-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Kategori ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-2xl transition-all outline-none text-gray-700 placeholder-gray-400 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="flex-grow container mx-auto px-4 py-12 max-w-6xl">
                {filteredCategories.length > 0 ? (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredCategories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <motion.div
                                    key={cat.id}
                                    variants={item}
                                    onClick={() => navigate(cat.link)}
                                    className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 hover:border-blue-100 transition-all duration-300 cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${cat.color} group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className="w-8 h-8" />
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                        {cat.name}
                                    </h3>
                                    <p className="text-gray-500 text-sm">
                                        {cat.desc}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : (
                    <div className="text-center py-20">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Sonuç bulunamadı</h3>
                        <p className="text-gray-500">"{searchQuery}" araması için kategori bulunamadı.</p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}

export default Kategoriler;