import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.user) {
                // Check if user is admin in profiles table
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single();

                if (profileError) throw profileError;

                if (profile?.role === 'admin') {
                    navigate('/admin');
                } else {
                    await supabase.auth.signOut();
                    throw new Error('Bu alana erişim yetkiniz bulunmuyor.');
                }
            }
        } catch (err) {
            console.error('Admin login error:', err);
            setError(err.message || 'Giriş yapılırken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">
                {/* Decorative Header */}
                <div className="bg-blue-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 opacity-90"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center backdrop-blur-sm mb-4">
                            <Lock className="text-white" size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Yönetici Paneli</h1>
                        <p className="text-blue-100 text-sm mt-1">Lütfen kimliğinizi doğrulayın</p>
                    </div>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">E-posta Adresi</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                    placeholder="admin@saticim.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">Şifre</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    Giriş Yap
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-400">
                            Güvenli Yönetici Erişimi
                            <br />
                            &copy; 2025 saticim.com
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
