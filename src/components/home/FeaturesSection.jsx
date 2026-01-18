import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, TrendingUp } from 'lucide-react';

const FeaturesSection = () => {
    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="grid md:grid-cols-3 gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50"
                    >
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Zap className="text-white" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Hızlı İlan Ver</h3>
                        <p className="text-gray-600">Dakikalar içinde ücretsiz ilan oluştur ve binlerce kişiye ulaş</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50"
                    >
                        <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="text-white" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Güvenli Alışveriş</h3>
                        <p className="text-gray-600">Satıcı değerlendirmeleri ve güvenli ödeme sistemleri ile</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-center p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50"
                    >
                        <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <TrendingUp className="text-white" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">En İyi Fiyatlar</h3>
                        <p className="text-gray-600">Binlerce ilan arasından en uygun fiyatları bul</p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
