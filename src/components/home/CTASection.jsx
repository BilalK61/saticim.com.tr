import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const CTASection = () => {
    return (
        <section className="py-12 bg-blue-600">
            <div className="container mx-auto max-w-4xl px-4 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    Hemen İlan Vermeye Başla
                </h2>
                <p className="text-blue-100 mb-6">
                    Ücretsiz hesap oluştur ve binlerce alıcıya ulaş
                </p>
                <Link
                    to="/ilan-ekle"
                    className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                    Ücretsiz İlan Ver
                    <ChevronRight size={20} />
                </Link>
            </div>
        </section>
    );
};

export default CTASection;
