import React, { useState } from 'react';
import { X, MapPin, Calendar, User, Tag, ChevronLeft, ChevronRight, Check, X as XIcon, Maximize2 } from 'lucide-react';

const ListingPreviewModal = ({ isOpen, onClose, listing, onApprove, onReject }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!isOpen || !listing) return null;

    const images = listing.images || [];
    const hasImages = images.length > 0;

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">İlan Önizleme</h2>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${listing.status === 'approved' ? 'bg-green-100 text-green-700' :
                            listing.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-orange-100 text-orange-700'
                            }`}>
                            {listing.status === 'approved' ? 'Onaylandı' : listing.status === 'rejected' ? 'Reddedildi' : 'Onay Bekliyor'}
                        </span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col lg:flex-row">

                        {/* Left: Images */}
                        <div className="lg:w-1/2 p-6 bg-gray-50">
                            <div className="relative aspect-video bg-gray-200 rounded-xl overflow-hidden mb-4 group shadow-sm">
                                {hasImages ? (
                                    <>
                                        <img
                                            src={images[currentImageIndex]}
                                            alt={listing.title}
                                            className="w-full h-full object-contain mix-blend-multiply"
                                        />
                                        {images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <ChevronLeft size={20} />
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <ChevronRight size={20} />
                                                </button>
                                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                                                    {currentImageIndex + 1} / {images.length}
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        Resim Yok
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${currentImageIndex === idx ? 'border-blue-500' : 'border-transparent'}`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="mt-6 bg-white p-4 rounded-xl border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <User size={18} className="text-blue-500" />
                                    Satıcı Bilgileri
                                </h3>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                                        {(listing.profiles?.full_name?.[0] || listing.profiles?.email?.[0] || '?').toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="font-medium text-gray-900 truncate">{listing.profiles?.full_name || 'Bilinmiyor'}</div>
                                        <div className="text-xs text-gray-500 truncate">{listing.profiles?.email}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Details */}
                        <div className="lg:w-1/2 p-6">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                            <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                                <MapPin size={16} />
                                <span>{listing.city || 'Şehir'}, {listing.district || 'İlçe'}</span>
                                <span className="mx-1">•</span>
                                <Calendar size={16} />
                                <span>{new Date(listing.created_at).toLocaleDateString('tr-TR')}</span>
                            </div>

                            <div className="text-3xl font-bold text-blue-600 mb-6">
                                {parseFloat(listing.price).toLocaleString()} {listing.currency}
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2 border-b border-gray-100 pb-2">Açıklama</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto pr-2">
                                        {listing.description || 'Açıklama girilmemiş.'}
                                    </p>
                                </div>

                                {listing.details && Object.keys(listing.details).length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">Özellikler</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {Object.entries(listing.details).map(([key, value]) => (
                                                <div key={key} className="bg-gray-50 p-2 rounded-lg text-sm flex justify-between">
                                                    <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                                                    <span className="font-medium text-gray-900">{String(value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    {listing.status === 'pending' && (
                        <>
                            <button
                                onClick={() => onReject(listing.id)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
                            >
                                <XIcon size={18} />
                                Reddet
                            </button>
                            <button
                                onClick={() => onApprove(listing.id)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
                            >
                                <Check size={18} />
                                Onayla
                            </button>
                        </>
                    )}
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-white transition-colors"
                    >
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ListingPreviewModal;
