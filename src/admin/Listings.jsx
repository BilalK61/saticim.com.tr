import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import { supabase } from '../supabaseClient';
import { Search, Filter, MoreVertical, Check, X, Eye, Trash2 } from 'lucide-react'; // Added Trash2
import Modal from '../components/Modal';
import ListingPreviewModal from './ListingPreviewModal'; // NEW

const Listings = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null); // State for active dropdown
    const menuRef = useRef(null); // Ref for click outside handling

    // Preview Modal State
    const [selectedListing, setSelectedListing] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

    useEffect(() => {
        fetchListings();

        // Realtime Subscription
        const channel = supabase
            .channel('listings-changes')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'listings'
                },
                (payload) => {
                    console.log('Realtime change:', payload);
                    // Refresh data on any change
                    fetchListings();
                }
            )
            .subscribe();

        // Click outside listener to close menu
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            supabase.removeChannel(channel);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchListings = async () => {
        // Only show spinner on initial load, not background refresh
        if (listings.length === 0) setLoading(true);
        setError(null);

        try {
            // First fetch listings
            console.log("Fetching listings...");

            // DEBUG: Check current user
            const { data: { user } } = await supabase.auth.getUser();
            console.log("Current User:", user);
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
                console.log("Current Profile Admin Status:", profile?.is_admin);
            }

            const { data: listingsData, error: listingsError } = await supabase
                .from('listings')
                .select('*')
                .order('created_at', { ascending: false });

            if (listingsError) {
                console.error("Supabase listings error:", listingsError);
                throw listingsError;
            }

            console.log("Listings data fetched:", listingsData);

            // If no listings, just set empty
            if (!listingsData || listingsData.length === 0) {
                setListings([]);
                return;
            }

            // Extract unique user_ids
            const userIds = [...new Set(listingsData.map(l => l.user_id).filter(Boolean))];

            // Fetch profiles for these users
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .in('id', userIds);

            if (profilesError) {
                console.error("Supabase profiles error:", profilesError);
                throw profilesError;
            }

            // Map profiles to a lookup object
            const profilesMap = (profilesData || []).reduce((acc, profile) => {
                acc[profile.id] = profile;
                return acc;
            }, {});

            // Merge datas
            const mergedListings = listingsData.map(listing => ({
                ...listing,
                profiles: profilesMap[listing.user_id] || { full_name: 'Bilinmiyor', email: '' }
            }));

            setListings(mergedListings);

        } catch (err) {
            console.error("Error fetching listings:", err);
            setError(err.message || 'Veri çekilirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        // Optimistic update
        setListings(listings.map(l => l.id === id ? { ...l, status: newStatus } : l));

        try {
            const { data, error } = await supabase
                .from('listings')
                .update({ status: newStatus })
                .eq('id', id)
                .select();

            if (error) throw error;

            if (!data || data.length === 0) {
                throw new Error("Güncelleme başarısız oldu (Yetki sorunu olabilir).");
            }

        } catch (error) {
            console.error('Error updating status:', error);
            showModal('Hata', "Durum güncellenemedi: " + error.message, 'error');
            // Revert on error
            fetchListings();
        }
    };

    const handleDelete = async (id) => {
        setOpenMenuId(null);
        showModal(
            'İlanı Sil',
            'Bu ilanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
            'warning',
            async () => {
                try {
                    // Optimistic update
                    setListings(prev => prev.filter(l => l.id !== id));

                    const { error } = await supabase
                        .from('listings')
                        .delete()
                        .eq('id', id);

                    if (error) throw error;

                    // Success modal could be annoying if frequent, maybe just toast or nothing
                    // showModal('Başarılı', 'İlan başarıyla silindi.', 'success');

                } catch (error) {
                    console.error("Error deleting listing:", error);
                    showModal('Hata', 'İlan silinemedi.', 'error');
                    fetchListings();
                }
            },
            true // showCancel
        );
    };

    const handlePreviewOpen = (listing) => {
        setSelectedListing(listing);
        setIsPreviewOpen(true);
    };

    const handlePreviewClose = () => {
        setIsPreviewOpen(false);
        setTimeout(() => setSelectedListing(null), 200); // Clear data after animation
    };

    const handlePreviewAction = async (id, action) => {
        await handleStatusChange(id, action);
        handlePreviewClose();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-orange-100 text-orange-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading && listings.length === 0) {
        return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;
    }

    if (error) {
        return (
            <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                <span className="font-medium">Hata!</span> {error}
                <button
                    onClick={fetchListings}
                    className="ml-4 font-semibold hover:underline"
                >
                    Tekrar Dene
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">İlan Yönetimi</h2>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="İlan Ara..."
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Filter size={18} />
                        Filtrele
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden" style={{ minHeight: '400px' }}> {/* Keep min height for menu */}
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700">İlan Başlığı</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Kategori</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Kullanıcı</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Fiyat</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Durum</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Tarih</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {listings.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{item.title}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="capitalize bg-gray-100 px-2 py-1 rounded text-xs font-semibold text-gray-600">
                                        {item.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    <div className="text-sm font-medium">{item.profiles?.full_name || 'Bilinmiyor'}</div>
                                    <div className="text-xs text-gray-400">{item.profiles?.email}</div>
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900">
                                    {parseFloat(item.price).toLocaleString()} {item.currency}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                                        {item.status === 'approved' ? 'Onaylandı' : item.status === 'pending' ? 'Onay Bekliyor' : 'Reddedildi'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-sm">
                                    {new Date(item.created_at).toLocaleDateString('tr-TR')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 relative">
                                        <button
                                            onClick={() => handlePreviewOpen(item)} // Changed to open modal
                                            title="Önizle"
                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        {item.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusChange(item.id, 'approved')}
                                                    title="Onayla"
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(item.id, 'rejected')}
                                                    title="Reddet"
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </>
                                        )}

                                        {/* Dropdown Menu */}
                                        <div className="relative" ref={openMenuId === item.id ? menuRef : null}>
                                            <button
                                                onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                                                className={`p-2 rounded-lg transition ${openMenuId === item.id ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {openMenuId === item.id && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1 origin-top-right">

                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        <Trash2 size={16} />
                                                        İlanı Sil
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </td>
                            </tr>
                        ))}
                        {listings.length === 0 && !loading && (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                    Henüz hiç ilan bulunmuyor.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={modal.isOpen}
                onClose={closeModal}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                onConfirm={modal.onConfirm}
                showCancel={modal.showCancel}
            />

            <ListingPreviewModal
                isOpen={isPreviewOpen}
                onClose={handlePreviewClose}
                listing={selectedListing}
                onApprove={(id) => handlePreviewAction(id, 'approved')}
                onReject={(id) => handlePreviewAction(id, 'rejected')}
            />
        </div>
    );
};

export default Listings;
