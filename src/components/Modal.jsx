import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, message, type = 'info', onConfirm, confirmText = 'Tamam', cancelText = 'İptal', showCancel = false }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !mounted) return null;

    const bgColors = {
        success: 'bg-green-50',
        error: 'bg-red-50',
        warning: 'bg-red-50',
        info: 'bg-blue-50'
    };

    const icons = {
        success: <CheckCircle size={32} className="text-green-500" />,
        error: <AlertCircle size={32} className="text-red-500" />,
        warning: <AlertTriangle size={32} className="text-red-500" />,
        info: <Info size={32} className="text-blue-500" />
    };

    const buttonColors = {
        success: 'bg-green-600 hover:bg-green-700 shadow-green-200',
        error: 'bg-red-600 hover:bg-red-700 shadow-red-200',
        warning: 'bg-red-600 hover:bg-red-700 shadow-red-200',
        info: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8 text-center">
                    <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 ${bgColors[type]} ring-8 ring-white shadow-sm`}>
                        {icons[type]}
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
                    <p className="text-gray-500 leading-relaxed mb-8">{message}</p>

                    <div className="flex gap-3 justify-center">
                        {showCancel && (
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-3 rounded-2xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition duration-200"
                            >
                                {cancelText}
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (onConfirm) onConfirm();
                                onClose();
                            }}
                            className={`flex-1 px-6 py-3 rounded-2xl text-white font-semibold shadow-lg transition duration-200 hover:-translate-y-0.5 ${buttonColors[type]}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-300 hover:text-gray-500 hover:bg-gray-50 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
