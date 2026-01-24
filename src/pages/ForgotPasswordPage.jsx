import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            setSuccess(true);
        } catch (err) {
            console.error('Password reset error:', err);
            setError(err.message || 'Şifre sıfırlama bağlantısı gönderilirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="text-green-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">E-posta Gönderildi!</h2>
                    <p className="text-gray-600 mb-6">
                        Şifre sıfırlama bağlantısı <span className="font-semibold">{email}</span> adresine gönderildi.
                        Lütfen e-postanızı kontrol edin.
                    </p>
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        <ArrowLeft size={20} />
                        Giriş sayfasına dön
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Mail className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Şifremi Unuttum</h1>
                    <p className="text-blue-100 text-sm">
                        E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim
                    </p>
                </div>

                {/* Form */}
                <div className="p-8">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                E-posta Adresi
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                    placeholder="ornek@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
                        >
                            <ArrowLeft size={16} />
                            Giriş sayfasına dön
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
