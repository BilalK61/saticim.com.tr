import React from 'react';
import { Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const FloatingActionButton = () => {
    const location = useLocation();

    return (
        <Link
            to="/ilan-ekle"
            state={{ from: location.pathname }}
            className="fixed bottom-8 left-8 z-40 w-16 h-16 bg-blue-600 rounded-full shadow-lg hover:shadow-blue-500/50 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 group"
            title="Hızlı İlan Ver"
        >
            <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="absolute left-full ml-4 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Ücretsiz İlan Ver
            </span>
        </Link>
    );
};

export default FloatingActionButton;
