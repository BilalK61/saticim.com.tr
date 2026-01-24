import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const EmailVerificationPage = () => {
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error', 'resend'
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const verifyEmail = async () => {
            // Check if this is a confirmation callback
            const token = searchParams.get('token');
            const type = searchParams.get('type');

            if (type === 'signup') {
                // Email confirmation from signup
                try {
                    const { data: { session }, error } = await supabase.auth.getSession();

                    if (error) throw error;

                    if (session) {
                        setStatus('success');
                        setTimeout(() => {
                            navigate('/');
                        }, 3000);
                    } else {
                        setStatus('error');
                        setError('E-posta doğrulama bağlantısı geçersiz veya süresi dolmuş.');
                    }
                } catch (err) {
                    console.error('Verification error:', err);
                    setStatus('error');
                    setError(err.message || 'E-posta doğrulanırken bir hata oluştu.');
                }
            } else {
                // User manually navigated to this page
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    if (user.email_confirmed_at) {
                        setStatus('success');
                        setTimeout(() => {
                            navigate('/');
                        }, 3000);
                    } else {
                        setStatus('resend');
                        setEmail(user.email);
                    }
                } else {
                    setStatus('error');
                    setError('Oturum bulunamadı. Lütfen giriş yapın.');
                }
            }
        };

        verifyEmail();
    }, [searchParams, navigate]);

    const handleResendEmail = async () => {
        setResendLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
            });

            if (error) throw error;

            alert('Doğrulama e-postası tekrar gönderildi. Lütfen gelen kutunuzu kontrol edin.');
        } catch (err) {
            console.error('Resend error:', err);
            setError(err.message || 'E-posta gönderilirken bir hata oluştu.');
        } finally {
            setResendLoading(false);
        }
    };

    if (status === 'verifying') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Loader className="text-blue-600 animate-spin" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">E-posta Doğrulanıyor...</h2>
                    <p className="text-gray-600">
                        Lütfen bekleyin, e-posta adresiniz doğrulanıyor.
                    </p>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="text-green-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">E-posta Doğrulandı! ✓</h2>
                    <p className="text-gray-600 mb-6">
                        E-posta adresiniz başarıyla doğrulandı. Ana sayfaya yönlendiriliyorsunuz...
                    </p>
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </div>
        );
    }

    if (status === 'resend') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <Mail className="text-white" size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">E-posta Doğrulama</h1>
                        <p className="text-blue-100 text-sm">
                            E-posta adresinizi doğrulamak için gelen kutunuzu kontrol edin
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <div className="mb-6 space-y-3 text-sm text-gray-600">
                            <p>
                                <span className="font-semibold">{email}</span> adresine bir doğrulama e-postası gönderdik.
                            </p>
                            <p>
                                E-postanızdaki linke tıklayarak hesabınızı aktifleştirebilirsiniz.
                            </p>
                        </div>

                        <button
                            onClick={handleResendEmail}
                            disabled={resendLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {resendLoading ? 'Gönderiliyor...' : 'Doğrulama E-postasını Tekrar Gönder'}
                        </button>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            E-posta gelmedi mi? Spam klasörünü kontrol edin.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="text-red-600" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Doğrulama Başarısız</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                    onClick={() => navigate('/login')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                >
                    Giriş sayfasına dön
                </button>
            </div>
        </div>
    );
};

export default EmailVerificationPage;
