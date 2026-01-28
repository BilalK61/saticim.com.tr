import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Car, Laptop, Briefcase, Sofa, ShoppingBag, Baby, Sparkles, Book, Dumbbell, Palette, Wrench } from 'lucide-react';

const CategoriesSection = () => {
    const categories = [
        { name: 'Emlak', icon: Home, path: '/emlak', color: 'bg-blue-500' },
        { name: 'Vasıta', icon: Car, path: '/vasita', color: 'bg-purple-500' },
        { name: 'Elektronik', icon: Laptop, path: '/elektronik', color: 'bg-orange-500' },
        { name: 'İş İlanları', icon: Briefcase, path: '/is-ilanlari', color: 'bg-green-500' },
        { name: 'Ev & Eşya', icon: Sofa, path: '/ev-esyalari', color: 'bg-indigo-500' },
        { name: 'Giyim', icon: ShoppingBag, path: '/giyim', color: 'bg-pink-500' },
        { name: 'Anne & Bebek', icon: Baby, path: '/anne-bebek', color: 'bg-yellow-500' },
        { name: 'Kozmetik', icon: Sparkles, path: '/kozmetik', color: 'bg-violet-500' },
        { name: 'Kitap & Dergi', icon: Book, path: '/kitap-dergi', color: 'bg-teal-500' },
        { name: 'Spor', icon: Dumbbell, path: '/spor', color: 'bg-red-500' },
        { name: 'Hobi & Oyun', icon: Palette, path: '/hobi-oyun', color: 'bg-cyan-500' },
        { name: 'Hizmetler', icon: Wrench, path: '/hizmetler', color: 'bg-gray-600' },
    ];

    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        Kategoriler
                    </h2>
                    <p className="text-gray-600">
                        İhtiyacınız olan kategoriyi seçin
                    </p>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                    {categories.map((category) => (
                        <Link
                            key={category.path}
                            to={category.path}
                            className="group block"
                        >
                            <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition border border-gray-100 text-center">
                                <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-3 mx-auto`}>
                                    <category.icon className="text-white" size={24} />
                                </div>
                                <h3 className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition">
                                    {category.name}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoriesSection;
