import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, LogIn, UserPlus } from 'lucide-react';
import Modal from './Modal';

const LoginModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Giriş Yapmalısınız"
            type="info"
            customIcon={<UserCircle size={32} className="text-blue-500" />}
            hideDefaultButtons={true}
        >
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Bu işlemi gerçekleştirebilmek için lütfen giriş yapın veya ücretsiz hesap oluşturun.
            </p>

            <div className="space-y-3">
                <button
                    onClick={() => {
                        onClose();
                        navigate('/login');
                    }}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2 hover:-translate-y-0.5 duration-200"
                >
                    <LogIn size={18} />
                    Giriş Yap
                </button>

                <button
                    onClick={() => {
                        onClose();
                        navigate('/register');
                    }}
                    className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-2xl transition border border-gray-200 flex items-center justify-center gap-2"
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
        </Modal>
    );
};

export default LoginModal;

