import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const CTASection = () => {
    return (
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0aDJWMGgtMnpNMzQgMTRoMlYwSDM0ek0zMiAxNGgyVjBoLTJ6TTMwIDE0aDJWMGgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

            <div className="container mx-auto max-w-4xl px-4 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Hemen İlan Vermeye Başla
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Ücretsiz hesap oluştur, ilanını yayınla ve binlerce alıcıya ulaş
                    </p>
                    <Link
                        to="/ilan-ekle"
                        className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                    >
                        Ücretsiz İlan Ver
                        <ChevronRight size={24} />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};

export default CTASection;
