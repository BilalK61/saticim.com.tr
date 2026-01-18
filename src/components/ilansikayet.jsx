import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const IlanSikayet = ({ isOpen, onClose, listingId, listingTitle }) => {
    const { user } = useAuth();
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const reasons = [
        "Yanlış Fiyat",
        "Yanlış Kategori",
        "Sahte İlan / Dolandırıcılık Şüphesi",
        "Uygunsuz İçerik / Fotoğraf",
        "Satılmış Ürün",
        "Diğer"
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            alert("Şikayet etmek için lütfen giriş yapınız.");
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('listing_reports')
                .insert([
                    {
                        listing_id: listingId,
                        reporter_id: user.id,
                        reason,
                        description
                    }
                ]);

            if (error) throw error;

            setIsSuccess(true);

            // Close after success
            setTimeout(() => {
                setIsSuccess(false);
                setReason('');
                setDescription('');
                onClose();
            }, 2000);

        } catch (error) {
            console.error("Şikayet gönderme hatası:", error);
            alert("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all scale-100 p-6 relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-full"
                >
                    <X size={20} />
                </button>

                {!isSuccess ? (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <AlertTriangle size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">İlanı Şikayet Et</h2>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{listingTitle}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Şikayet Nedeni</label>
                                <select
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 appearance-none"
                                >
                                    <option value="">Bir neden seçin</option>
                                    {reasons.map((r, idx) => (
                                        <option key={idx} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama (İsteğe bağlı)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    placeholder="Lütfen detayları belirtin (örn: Ürün fotoğrafları farklı...)"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 resize-none"
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={!reason || isSubmitting}
                                    className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Gönderiliyor
                                        </>
                                    ) : (
                                        'Şikayet Et'
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Teşekkürler</h3>
                        <p className="text-gray-500">
                            Bildiriminiz başarıyla alındı. Ekibimiz en kısa sürede inceleyecektir.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IlanSikayet;
