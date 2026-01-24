import React from 'react';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const ListingCard = ({ listing }) => {
    // Helper helper for formatting currency
    const formatPrice = (price, currency) => {
        return new Intl.NumberFormat('tr-TR').format(price) + ' ' + (currency || 'TL');
    };

    return (
        <Link to={`/ilan/${listing.id}`} className="block group w-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition h-full flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                        src={listing.images && listing.images[0] ? listing.images[0] : 'https://placehold.co/400x300?text=Resim+Yok'}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <MapPin size={12} />
                        {listing.city?.name || listing.cities?.name} / {listing.district?.name || listing.districts?.name}
                    </div>
                    {listing.details?.status && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                            {listing.details.status === 'sifir' ? 'Sıfır' :
                                listing.details.status === 'ikinci-el' ? 'İkinci El' : listing.details.status}
                        </div>
                    )}
                </div>
                <div className="p-3 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm group-hover:text-blue-600 transition">
                            {listing.title}
                        </h3>
                    </div>
                    <div className="mt-auto">
                        <div className="text-lg font-bold text-blue-600 mb-2">
                            {formatPrice(listing.price, listing.currency)}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{listing.category}</span>
                            <span>{new Date(listing.created_at || Date.now()).toLocaleDateString('tr-TR')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ListingCard;
