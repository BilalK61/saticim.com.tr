import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';

const IlanSikayet = ({ isOpen, onClose, listingId, listingTitle }) => {
    const { user } = useAuth();
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

    const reasons = [
        "Yanlış Fiyat",
        "Yanlış Kategori",
        "Sahte İlan / Dolandırıcılık Şüphesi",
        "Uygunsuz İçerik / Fotoğraf",
        "Satılmış Ürün",
        "Diğer"
    ];

    const handleSubmit = async () => {
        if (!user) {
            setErrorModal({ isOpen: true, message: 'Şikayet etmek için lütfen giriş yapınız.' });
            return;
        }

        if (!reason) {
            setErrorModal({ isOpen: true, message: 'Lütfen bir şikayet nedeni seçin.' });
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
            setErrorModal({ isOpen: true, message: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setReason('');
        setDescription('');
        setIsSuccess(false);
        onClose();
    };

    // Success Modal
    if (isSuccess) {
        return (
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                title="Teşekkürler"
                type="success"
                customIcon={<CheckCircle2 size={32} className="text-green-500" />}
                confirmText="Tamam"
                onConfirm={handleClose}
            >
                <p className="text-gray-500 leading-relaxed">
                    Bildiriminiz başarıyla alındı. Ekibimiz en kısa sürede inceleyecektir.
                </p>
            </Modal>
        );
    }

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                title="İlanı Şikayet Et"
                type="error"
                customIcon={<AlertTriangle size={32} className="text-red-500" />}
                size="md"
                showCancel={true}
                cancelText="İptal"
                confirmText={isSubmitting ? 'Gönderiliyor...' : 'Şikayet Et'}
                confirmDisabled={!reason}
                confirmLoading={isSubmitting}
                onConfirm={handleSubmit}
            >
                <p className="text-gray-500 text-sm mb-4 line-clamp-1">{listingTitle}</p>

                <div className="text-left space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Şikayet Nedeni</label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 appearance-none transition"
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
                            rows={3}
                            placeholder="Lütfen detayları belirtin..."
                            className="w-full p-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 resize-none transition"
                        />
                    </div>
                </div>
            </Modal>

            {/* Error Modal */}
            <Modal
                isOpen={errorModal.isOpen}
                onClose={() => setErrorModal({ isOpen: false, message: '' })}
                title="Hata"
                message={errorModal.message}
                type="error"
            />
        </>
    );
};

export default IlanSikayet;

