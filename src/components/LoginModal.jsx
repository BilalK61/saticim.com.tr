import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, UserCircle, LogIn, UserPlus } from 'lucide-react';

const LoginModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl transform transition-all scale-100 p-6 relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-full"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-6 mt-2">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-blue-50/50">
                        <UserCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Giriş Yapmalısınız</h3>
                    <p className="text-gray-500 text-sm leading-relaxed px-4">
                        Bu işlemi gerçekleştirebilmek için lütfen giriş yapın veya ücretsiz hesap oluşturun.
                    </p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => {
                            onClose();
                            navigate('/login');
                        }}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                    >
                        <LogIn size={18} />
                        Giriş Yap
                    </button>

                    <button
                        onClick={() => {
                            onClose();
                            navigate('/register');
                        }}
                        className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition border border-gray-200 flex items-center justify-center gap-2"
                    >
                        <UserPlus size={18} />
                        Hesap Oluştur
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition font-medium"
                    >
                        Vazgeç
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default LoginModal;
