import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import {
    User,
    MapPin,
    Calendar,
    Package,
    Heart,
    Settings,
    LogOut,
    Plus,
    Edit,
    Trash2,
    Grid,
    List
} from 'lucide-react';

const ProfilPage = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('listings');
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profileStats, setProfileStats] = useState({
        totalListings: 0,
        totalViews: 0,
        favorites: 0
    });

    // Profile Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        username: '',
        full_name: '',
        phone: '',
        avatar_url: ''
    });

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
        if (user) {
            setEditForm({
                username: user.username || '',
                full_name: user.full_name || '',
                phone: user.phone || '',
                avatar_url: user.avatar_url || ''
            });
            fetchUserListings();
        }
    }, [user]);

    const fetchUserListings = async () => {
        try {
            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setListings(data || []);
            setProfileStats(prev => ({ ...prev, totalListings: data?.length || 0 }));
        } catch (error) {
            console.error('İlanlar yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteListing = (id) => {
        showModal(
            'İlanı Sil',
            'Bu ilanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
            'warning',
            async () => {
                try {
                    const { error } = await supabase
                        .from('listings')
                        .delete()
                        .eq('id', id);

                    if (error) throw error;
                    setListings(listings.filter(l => l.id !== id));
                    setProfileStats(prev => ({ ...prev, totalListings: prev.totalListings - 1 }));
                    showModal('Başarılı', 'İlan başarıyla silindi.', 'success');
                } catch (error) {
                    console.error('Silme işlemi başarısız:', error);
                    showModal('Hata', 'İlan silinirken bir hata oluştu.', 'error');
                }
            },
            true
        );
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            // Check if username is being changed and if it's already taken
            if (editForm.username !== user.username) {
                const { data: existingUser, error: checkError } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('username', editForm.username)
                    .maybeSingle();

                if (checkError) throw checkError;

                if (existingUser) {
                    showModal('Kullanıcı Adı Alınmış', 'Bu kullanıcı adı zaten kullanılmaktadır. Lütfen farklı bir kullanıcı adı seçiniz.', 'warning');
                    return;
                }
            }

            const { error } = await supabase
                .from('profiles')
                .update({
                    username: editForm.username,
                    full_name: editForm.full_name,
                    updated_at: new Date()
                })
                .eq('id', user.id);

            if (error) {
                if (error.code === '23505') {
                    showModal('Kullanıcı Adı Alınmış', 'Bu kullanıcı adı zaten kullanılmaktadır.', 'warning');
                    return;
                }
                throw error;
            }

            showModal('Başarılı', 'Profil başarıyla güncellendi.', 'success', () => {
                setIsEditing(false);
                window.location.reload();
            });
        } catch (error) {
            console.error('Güncelleme hatası:', error.message);
            showModal('Hata', 'Profil güncellenirken bir hata oluştu: ' + error.message, 'error');
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Oturum Açmanız Gerekiyor</h2>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                    >
                        Giriş Yap
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-6 pb-12">
            <div className="container mx-auto px-4">

                {/* Profile Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                        {/* Cover Image Placeholder */}
                    </div>
                    <div className="px-6 pb-6 relative">
                        <div className="flex flex-col md:flex-row items-end -mt-12 mb-4 gap-4">
                            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-md">
                                <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-500 overflow-hidden">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        user.email?.[0].toUpperCase()
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 mt-12">
                                <h1 className="text-2xl font-bold text-gray-900">{user.full_name || user.username || 'İsimsiz Kullanıcı'}</h1>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                    <span className="flex items-center gap-1">
                                        <User size={14} /> @{user.username || user.email?.split('@')[0]}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} /> Katılım: {new Date(user.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2 mb-2">
                                <button
                                    onClick={() => navigate('/ilan-ekle')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
                                >
                                    <Plus size={16} /> İlan Ver
                                </button>
                                <button
                                    onClick={() => { setActiveTab('settings'); setIsEditing(true); }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center gap-2"
                                >
                                    <Settings size={16} /> Düzenle
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-100 pt-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{profileStats.totalListings}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Aktif İlan</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{profileStats.favorites}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Favoriler</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">0</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Mesajlar</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">Standart</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Üyelik</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">

                    {/* Sidebar Tabs */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <nav className="flex flex-col p-2">
                                <button
                                    onClick={() => setActiveTab('listings')}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'listings' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Package size={18} /> İlanlarım
                                </button>
                                <button
                                    onClick={() => setActiveTab('favorites')}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'favorites' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Heart size={18} /> Favorilerim
                                </button>
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Settings size={18} /> Ayarlar
                                </button>
                                <hr className="my-2 border-gray-100" />
                                <button
                                    onClick={() => { signOut(); navigate('/'); }}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
                                >
                                    <LogOut size={18} /> Çıkış Yap
                                </button>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1">

                        {/* My Listings Tab */}
                        {activeTab === 'listings' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-800">Yayındaki İlanlarım</h2>
                                </div>

                                {loading ? (
                                    <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>
                                ) : listings.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {listings.map(listing => (
                                            <div key={listing.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4 group">
                                                <div className="w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                                    <img
                                                        src={listing.images?.[0] || 'https://placehold.co/150'}
                                                        alt={listing.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition"
                                                    />
                                                    {/* Status Badge */}
                                                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${listing.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        listing.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {listing.status === 'approved' ? 'Onaylandı' :
                                                            listing.status === 'pending' ? 'Beklemede' :
                                                                'Reddedildi'}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
                                                        <p className="text-blue-600 font-bold">{listing.price} {listing.currency}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <button
                                                            onClick={() => navigate(`/ilan-ekle/${listing.id}`)}
                                                            className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition flex items-center gap-1"
                                                        >
                                                            <Edit size={12} /> Düzenle
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteListing(listing.id)}
                                                            className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition flex items-center gap-1"
                                                        >
                                                            <Trash2 size={12} /> Sil
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/ilan-detay/${listing.id}`)}
                                                            className="ml-auto text-xs text-blue-600 hover:underline"
                                                        >
                                                            Görüntüle
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                            <Package size={32} />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900">Henüz ilanın yok</h3>
                                        <p className="text-gray-500 mb-6">Satmak istediğin ürünleri hemen listele.</p>
                                        <button onClick={() => navigate('/ilan-ekle')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">İlan Ver</button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Favorites Tab */}
                        {activeTab === 'favorites' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-500">
                                    <Heart size={32} />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Favoriler</h3>
                                <p className="text-gray-500">Favori ilanlarınızı burada görebilirsiniz.</p>
                            </div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'settings' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-6">Profil Ayarları</h2>
                                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
                                        <input
                                            type="text"
                                            value={editForm.username}
                                            onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                                        <input
                                            type="text"
                                            value={editForm.full_name}
                                            onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                                        <input
                                            type="email"
                                            value={user.email}
                                            disabled
                                            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">E-posta adresi değiştirilemez.</p>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                                        >
                                            Değişiklikleri Kaydet
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                    </main>
                </div>
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
            <Footer />
        </div>
    );
};

export default ProfilPage;