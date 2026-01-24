import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Search, MoreVertical, Trash2, Mail, Calendar, User, Eye, UserCog, Ban, CheckCircle, X } from 'lucide-react';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null);
    const [banModal, setBanModal] = useState({ open: false, user: null });
    const [banReason, setBanReason] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setOpenDropdown(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Kullanıcılar yüklenirken hata:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setUsers(users.filter(u => u.id !== id));
            alert('Kullanıcı başarıyla silindi.');
        } catch (error) {
            console.error('Silme hatası:', error.message);
            alert('Kullanıcı silinirken bir hata oluştu. Yetkiniz olmayabilir.');
        }
    };

    const handleBanUser = async () => {
        const { user } = banModal;
        if (!user) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    is_banned: true,
                    ban_reason: banReason || 'Sebep belirtilmemiş',
                    banned_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;

            setUsers(users.map(u =>
                u.id === user.id
                    ? { ...u, is_banned: true, ban_reason: banReason, banned_at: new Date().toISOString() }
                    : u
            ));
            setBanModal({ open: false, user: null });
            setBanReason('');
            alert('Kullanıcı başarıyla banlandı.');
        } catch (error) {
            console.error('Ban hatası:', error);
            console.error('Error message:', error.message);
            console.error('Error details:', error.details);
            console.error('Error hint:', error.hint);
            console.error('Error code:', error.code);
            alert(`Kullanıcı banlanırken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
        }
    };

    const handleUnbanUser = async (userId) => {
        if (!window.confirm('Bu kullanıcının banını kaldırmak istediğinizden emin misiniz?')) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    is_banned: false,
                    ban_reason: null,
                    banned_at: null
                })
                .eq('id', userId);

            if (error) throw error;

            setUsers(users.map(u =>
                u.id === userId
                    ? { ...u, is_banned: false, ban_reason: null, banned_at: null }
                    : u
            ));
            alert('Kullanıcının banı başarıyla kaldırıldı.');
        } catch (error) {
            console.error('Unban hatası:', error);
            console.error('Error message:', error.message);
            console.error('Error details:', error.details);
            console.error('Error hint:', error.hint);
            console.error('Error code:', error.code);
            alert(`Ban kaldırılırken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        if (!window.confirm(`Kullanıcının rolünü "${newRole}" olarak değiştirmek istediğinizden emin misiniz?`)) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            setUsers(users.map(u =>
                u.id === userId ? { ...u, role: newRole } : u
            ));
            alert(`Kullanıcının rolü "${newRole}" olarak güncellendi.`);
        } catch (error) {
            console.error('Rol değiştirme hatası:', error.message);
            alert('Rol değiştirilirken bir hata oluştu.');
        }
    };

    const handleSendEmail = (user) => {
        // Placeholder - Bu özellik daha sonra genişletilebilir
        alert(`${user.username || user.full_name} kullanıcısına e-posta gönderme özelliği yakında eklenecek.`);
    };

    const handleViewProfile = (userId) => {
        window.open(`/profil/${userId}`, '_blank');
    };

    const toggleDropdown = (e, userId) => {
        e.stopPropagation();
        setOpenDropdown(openDropdown === userId ? null : userId);
    };

    const filteredUsers = users.filter(user =>
        (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (role) => {
        const badges = {
            admin: { text: 'Admin', class: 'bg-purple-100 text-purple-800' },
            moderator: { text: 'Moderatör', class: 'bg-blue-100 text-blue-800' },
            user: { text: 'Kullanıcı', class: 'bg-gray-100 text-gray-800' }
        };
        const badge = badges[role] || badges.user;
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.class} ml-2`}>
                {badge.text}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Kullanıcı ara..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm">
                        Kullanıcı Ekle
                    </button>
                    <button className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                        Dışa Aktar
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kullanıcı</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Son Güncelleme</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Durum</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                        Yükleniyor...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                        Kullanıcı bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 overflow-hidden">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center">
                                                        <span className="font-semibold text-gray-900">{user.full_name || user.username || 'İsimsiz'}</span>
                                                        {user.role && getRoleBadge(user.role)}
                                                    </div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                                        @{user.username || 'username'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} />
                                                {user.updated_at ? new Date(user.updated_at).toLocaleDateString('tr-TR') : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.is_banned ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    <Ban size={12} className="mr-1" />
                                                    Banlı
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircle size={12} className="mr-1" />
                                                    Aktif
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => toggleDropdown(e, user.id)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>

                                                    {openDropdown === user.id && (
                                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                                                            <button
                                                                onClick={() => handleViewProfile(user.id)}
                                                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition"
                                                            >
                                                                <Eye size={16} className="text-gray-500" />
                                                                <span>Profili Görüntüle</span>
                                                            </button>

                                                            <button
                                                                onClick={() => handleSendEmail(user)}
                                                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition"
                                                            >
                                                                <Mail size={16} className="text-gray-500" />
                                                                <span>E-posta Gönder</span>
                                                            </button>

                                                            <div className="border-t border-gray-100">
                                                                <div className="px-4 py-2 text-xs text-gray-500 font-semibold">Rol Değiştir</div>
                                                                {['user', 'moderator', 'admin'].map(role => (
                                                                    <button
                                                                        key={role}
                                                                        onClick={() => handleChangeRole(user.id, role)}
                                                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition ${user.role === role ? 'bg-blue-50 text-blue-600' : ''}`}
                                                                    >
                                                                        <UserCog size={16} className={user.role === role ? 'text-blue-600' : 'text-gray-500'} />
                                                                        <span className="capitalize">
                                                                            {role === 'admin' ? 'Admin' : role === 'moderator' ? 'Moderatör' : 'Kullanıcı'}
                                                                        </span>
                                                                        {user.role === role && <CheckCircle size={14} className="ml-auto" />}
                                                                    </button>
                                                                ))}
                                                            </div>

                                                            <div className="border-t border-gray-100">
                                                                {user.is_banned ? (
                                                                    <button
                                                                        onClick={() => handleUnbanUser(user.id)}
                                                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 text-green-600 transition"
                                                                    >
                                                                        <CheckCircle size={16} />
                                                                        <span>Banı Kaldır</span>
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => setBanModal({ open: true, user })}
                                                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-orange-50 flex items-center gap-2 text-orange-600 transition"
                                                                    >
                                                                        <Ban size={16} />
                                                                        <span>Kullanıcıyı Banla</span>
                                                                    </button>
                                                                )}
                                                            </div>

                                                            <div className="border-t border-gray-100">
                                                                <button
                                                                    onClick={() => handleDeleteUser(user.id)}
                                                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 transition"
                                                                >
                                                                    <Trash2 size={16} />
                                                                    <span>Kullanıcıyı Sil</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Static for now) */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                        Toplam {filteredUsers.length} kullanıcı gösteriliyor
                    </span>
                    <div className="flex gap-2">
                        <button disabled className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50">Önceki</button>
                        <button disabled className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50">Sonraki</button>
                    </div>
                </div>
            </div>

            {/* Ban Modal */}
            {banModal.open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Kullanıcıyı Banla</h3>
                            <button
                                onClick={() => {
                                    setBanModal({ open: false, user: null });
                                    setBanReason('');
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-gray-600 mb-4">
                            <span className="font-semibold">{banModal.user?.username || banModal.user?.full_name}</span> kullanıcısını banlamak istediğinizden emin misiniz?
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ban Nedeni (isteğe bağlı)
                            </label>
                            <textarea
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                                placeholder="Ban nedenini buraya yazabilirsiniz..."
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                                rows="4"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setBanModal({ open: false, user: null });
                                    setBanReason('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleBanUser}
                                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition"
                            >
                                Banla
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
