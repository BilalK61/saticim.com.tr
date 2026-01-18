import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const DebugListings = () => {
    const [allListings, setAllListings] = useState([]);
    const [approvedListings, setApprovedListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            // Tüm ilanları çek
            const { data: all, error: error1 } = await supabase
                .from('listings')
                .select('id, title, status, created_at, category')
                .order('created_at', { ascending: false });

            console.log('Tüm ilanlar:', all);
            setAllListings(all || []);
            
            // Sadece onaylı ilanları çek
            const { data: approved, error: error2 } = await supabase
                .from('listings')
                .select('id, title, status, created_at, category')
                .eq('status', 'approved')
                .order('created_at', { ascending: false });

            console.log('Onaylı ilanlar:', approved);
            setApprovedListings(approved || []);

            if (error1) console.error('Tüm ilanları çekerken hata:', error1);
            if (error2) console.error('Onaylı ilanları çekerken hata:', error2);

            setLoading(false);
        } catch (error) {
            console.error('Hata:', error);
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">İlan Debug Sayfası</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Tüm İlanlar */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">
                            Tüm İlanlar ({allListings.length})
                        </h2>
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Başlık</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {allListings.map((listing) => (
                                            <tr key={listing.id}>
                                                <td className="px-4 py-3 text-sm text-gray-900">{listing.id}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-xs">
                                                    {listing.title}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{listing.category}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(listing.status)}`}>
                                                        {listing.status || 'null'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Sadece Onaylı İlanlar */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">
                            Onaylı İlanlar ({approvedListings.length})
                        </h2>
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Başlık</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {approvedListings.map((listing) => (
                                            <tr key={listing.id}>
                                                <td className="px-4 py-3 text-sm text-gray-900">{listing.id}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-xs">
                                                    {listing.title}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{listing.category}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(listing.status)}`}>
                                                        {listing.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Konsol Mesajı */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 font-semibold">
                        Not: Tarayıcı konsolunu kontrol edin (F12). Tüm ilanlar ve onaylı ilanlar console.log ile yazdırılmıştır.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DebugListings;
