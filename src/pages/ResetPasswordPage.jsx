import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if we have a valid session (user clicked the reset link)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setError('Geçersiz veya süresi dolmuş bağlantı. Lütfen yeni bir şifre sıfırlama bağlantısı isteyin.');
            }
        };
        checkSession();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (password.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Şifreler eşleşmiyor.');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            console.error('Password update error:', err);
            setError(err.message || 'Şifre güncellenirken bir hata oluştu.');
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Şifre Güncellendi!</h2>
                    <p className="text-gray-600 mb-6">
                        Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...
                    </p>
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
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
                        <Lock className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Yeni Şifre Belirle</h1>
                    <p className="text-blue-100 text-sm">
                        Hesabınız için yeni bir şifre oluşturun
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

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Yeni Şifre
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">En az 6 karakter</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Yeni Şifre (Tekrar)
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
