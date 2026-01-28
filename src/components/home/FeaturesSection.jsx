import React from 'react';
import { Zap, Shield, TrendingUp } from 'lucide-react';

const FeaturesSection = () => {
    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-6 rounded-xl bg-gray-50">
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <Zap className="text-white" size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Hızlı İlan Ver</h3>
                        <p className="text-sm text-gray-600">Dakikalar içinde ücretsiz ilan oluştur</p>
                    </div>

                    <div className="text-center p-6 rounded-xl bg-gray-50">
                        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <Shield className="text-white" size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Güvenli Alışveriş</h3>
                        <p className="text-sm text-gray-600">Satıcı değerlendirmeleri ile güvenle alışveriş</p>
                    </div>

                    <div className="text-center p-6 rounded-xl bg-gray-50">
                        <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <TrendingUp className="text-white" size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">En İyi Fiyatlar</h3>
                        <p className="text-sm text-gray-600">Binlerce ilan arasından en uygun fiyatları bul</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
