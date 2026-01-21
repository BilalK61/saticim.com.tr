import React, { useState } from 'react';
import { UserCircle, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';

const LoginPage = () => {
    const { signIn } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Modal State
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null,
        showCancel: false
    });

    const showModal = (title, message, type = 'info', onConfirm = null, showCancel = false) => {
        setModal({
            isOpen: true,
            title,
            message,
            type,
            onConfirm,
            showCancel
        });
    };

    const closeModal = () => {
        setModal(prev => ({ ...prev, isOpen: false }));
    };

    const showError = (field, message) => {
        setErrors(prev => ({ ...prev, [field]: message }));
        setTimeout(() => {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }, 3000);
    };

    const validateForm = () => {
        let isValid = true;
        const { email, password } = formData;

        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            showError('email', 'Geçerli bir e-posta adresi giriniz');
            isValid = false;
        }

        if (password.length < 6) {
            showError('password', 'Şifre en az 6 karakter olmalıdır');
            isValid = false;
        }

        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const { error } = await signIn({
                email: formData.email,
                password: formData.password,
            });

            if (error) throw error;

            // Security Notification
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase.from('notifications').insert({
                        user_id: user.id,
                        type: 'security',
                        title: 'Yeni Giriş',
                        message: 'Hesabınıza yeni bir giriş yapıldı.',
                        link: '/profil'
                    });
                }
            } catch (notifyError) {
                console.warn('Login notification failed:', notifyError);
            }

            showModal('Başarılı', 'Giriş başarılı! Ana sayfaya yönlendiriliyorsunuz...', 'success', () => {
                window.location.href = '/';
            });

        } catch (err) {
            console.error('Giriş hatası:', err);
            showError('email', err.message || 'Giriş sırasında bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center py-12 px-4">
                <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md">
                    {/* Auth Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Giriş Yap</h1>
                        <p className="text-gray-500">Hesabınıza giriş yapın</p>
                    </div>

                    {/* Social Buttons */}
                    <div className="space-y-3 mb-6">
                        <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium">
                            <svg className="w-6 h-6" viewBox="0 0 48 48"><path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" /><path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" /><path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" /><path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" /></svg>
                            Google ile Giriş Yap
                        </button>
                        <button className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            Facebook ile Giriş Yap
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">veya e-posta ile giriş yap</span>
                        </div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="E-posta"
                                    required
                                    className="w-full pl-12 pr- py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            {errors.email && (
                                <div className="text-red-500 text-sm mt-2">{errors.email}</div>
                            )}
                        </div>

                        <div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Şifre"
                                    required
                                    className="w-full pl-12 pr- py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            {errors.password && (
                                <div className="text-red-500 text-sm mt-2">{errors.password}</div>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={formData.remember}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Beni hatırla</span>
                            </label>
                            <button type="button" onClick={() => window.location.href = '/forgot-password'} className="text-sm text-blue-600 hover:underline">
                                Şifremi Unuttum
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Giriş Yapılıyor...
                                </>
                            ) : (
                                <>
                                    <UserCircle className="w-5 h-5" />
                                    Giriş Yap
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center text-sm text-gray-600">
                        Henüz hesabın yok mu?{' '}
                        <button onClick={() => window.location.href = '/register'} className="text-blue-600 font-medium hover:underline">
                            Kayıt Ol
                        </button>
                    </div>
                </div>
            </main>
            <Modal
                isOpen={modal.isOpen}
                onClose={closeModal}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                onConfirm={modal.onConfirm}
                showCancel={modal.showCancel}
            />
        </div>
    );
};

export default LoginPage;