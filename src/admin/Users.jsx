import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Search, MoreVertical, Trash2, Mail, Calendar, User, Eye, UserCog, Ban, CheckCircle, X } from 'lucide-react';
import Modal from '../components/Modal';

const Users = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null);
    const [banModal, setBanModal] = useState({ open: false, user: null });
    const [banReason, setBanReason] = useState('');
    const [roleVerifyModal, setRoleVerifyModal] = useState({
        open: false,
        user: null,
        newRole: null,
        verificationCode: '',
        enteredCode: '',
        loading: false
    });
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        confirmText: 'Tamam',
        cancelText: 'İptal',
        showCancel: false,
        onConfirm: null
    });

    const showModal = ({ title, message, type = 'info', confirmText = 'Tamam', cancelText = 'İptal', showCancel = false, onConfirm = null }) => {
        setModalConfig({
            isOpen: true,
            title,
            message,
            type,
            confirmText,
            cancelText,
            showCancel,
            onConfirm
        });
    };

    const closeModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    };

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
        // Moderator Safety Check
        const targetUser = users.find(u => u.id === id);
        if (currentUser?.role === 'moderator' && targetUser?.role === 'admin') {
            showModal({
                title: 'Yetkisiz İşlem',
                message: 'Moderatörler adminleri silemez!',
                type: 'error'
            });
            return;
        }

        showModal({
            title: 'Kullanıcıyı Sil',
            message: 'Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
            type: 'warning',
            confirmText: 'Sil',
            cancelText: 'Vazgeç',
            showCancel: true,
            onConfirm: async () => {
                try {
                    const { error } = await supabase
                        .from('profiles')
                        .delete()
                        .eq('id', id);

                    if (error) throw error;
                    setUsers(users.filter(u => u.id !== id));
                    showModal({
                        title: 'Başarılı',
                        message: 'Kullanıcı başarıyla silindi.',
                        type: 'success'
                    });
                } catch (error) {
                    console.error('Silme hatası:', error.message);
                    showModal({
                        title: 'Hata',
                        message: 'Kullanıcı silinirken bir hata oluştu. Yetkiniz olmayabilir.',
                        type: 'error'
                    });
                }
            }
        });
    };

    const handleBanUser = async () => {
        const { user } = banModal;
        if (!user) return;

        // Moderator Safety Check
        if (currentUser?.role === 'moderator' && user.role === 'admin') {
            showModal({
                title: 'Yetkisiz İşlem',
                message: 'Moderatörler adminleri banlayamaz!',
                type: 'error'
            });
            setBanModal({ open: false, user: null });
            return;
        }

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
            showModal({
                title: 'Başarılı',
                message: 'Kullanıcı başarıyla banlandı.',
                type: 'success'
            });
        } catch (error) {
            console.error('Ban hatası:', error);
            showModal({
                title: 'Hata',
                message: `Kullanıcı banlanırken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`,
                type: 'error'
            });
        }
    };

    const handleUnbanUser = async (userId) => {
        // Moderator Safety Check
        const targetUser = users.find(u => u.id === userId);
        if (currentUser?.role === 'moderator' && targetUser?.role === 'admin') {
            showModal({
                title: 'Yetkisiz İşlem',
                message: 'Moderatörler adminlerin banını kaldıramaz!',
                type: 'error'
            });
            return;
        }

        showModal({
            title: 'Banı Kaldır',
            message: 'Bu kullanıcının banını kaldırmak istediğinizden emin misiniz?',
            type: 'info',
            confirmText: 'Kaldır',
            cancelText: 'Vazgeç',
            showCancel: true,
            onConfirm: async () => {
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
                    showModal({
                        title: 'Başarılı',
                        message: 'Kullanıcının banı başarıyla kaldırıldı.',
                        type: 'success'
                    });
                } catch (error) {
                    console.error('Unban hatası:', error);
                    showModal({
                        title: 'Hata',
                        message: `Ban kaldırılırken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`,
                        type: 'error'
                    });
                }
            }
        });
    };

    const handleChangeRole = async (userId, newRole) => {
        // Moderator Safety Check
        const targetUser = users.find(u => u.id === userId);
        if (currentUser?.role === 'moderator') {
            if (targetUser?.role === 'admin') {
                showModal({
                    title: 'Yetkisiz İşlem',
                    message: 'Moderatörler adminlerin rolünü değiştiremez!',
                    type: 'error'
                });
                return;
            }
            if (newRole === 'admin') {
                showModal({
                    title: 'Yetkisiz İşlem',
                    message: 'Moderatörler kullanıcıları admin yapamaz!',
                    type: 'error'
                });
                return;
            }
        }

        // Demoting to 'user' - send notification and update role
        if (newRole === 'user') {
            showModal({
                title: 'Rol Değiştir',
                message: `Kullanıcının rolünü "Kullanıcı" olarak değiştirmek istediğinizden emin misiniz?`,
                type: 'warning',
                confirmText: 'Değiştir',
                cancelText: 'Vazgeç',
                showCancel: true,
                onConfirm: async () => {
                    try {
                        const { error } = await supabase
                            .from('profiles')
                            .update({ role: newRole })
                            .eq('id', userId);

                        if (error) throw error;

                        // Send notification to the user about role change to 'user'
                        const previousRole = targetUser?.role === 'admin' ? 'Admin' : 'Moderatör';
                        await supabase
                            .from('notifications')
                            .insert({
                                user_id: userId,
                                type: 'role_changed',
                                title: 'Rol Değişikliği',
                                message: `Hesabınızın ${previousRole} yetkisi kaldırıldı ve rolünüz "Kullanıcı" olarak değiştirildi.`,
                                link: null,
                                is_read: false
                            });

                        setUsers(users.map(u =>
                            u.id === userId ? { ...u, role: newRole } : u
                        ));
                        showModal({
                            title: 'Başarılı',
                            message: `Kullanıcının rolü "Kullanıcı" olarak güncellendi.`,
                            type: 'success'
                        });
                    } catch (error) {
                        console.error('Rol değiştirme hatası:', error.message);
                        showModal({
                            title: 'Hata',
                            message: 'Rol değiştirilirken bir hata oluştu.',
                            type: 'error'
                        });
                    }
                }
            });
            return;
        }

        // Generate 6-digit verification code for moderator/admin promotion
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        try {
            // Send notification to the target user with the verification code
            const roleText = newRole === 'admin' ? 'Admin' : 'Moderatör';
            const { error: notifError } = await supabase
                .from('notifications')
                .insert({
                    user_id: userId,
                    type: 'role_verification',
                    title: `${roleText} Yetkilendirme Kodu`,
                    message: `Hesabınız ${roleText} olarak yetkilendirilmek üzere. Doğrulama kodunuz: ${verificationCode}`,
                    link: null,
                    is_read: false
                });

            if (notifError) throw notifError;

            // Open the verification modal
            setRoleVerifyModal({
                open: true,
                user: targetUser,
                newRole: newRole,
                verificationCode: verificationCode,
                enteredCode: '',
                loading: false
            });
            setOpenDropdown(null);

        } catch (error) {
            console.error('Bildirim gönderme hatası:', error);
            showModal({
                title: 'Hata',
                message: 'Doğrulama kodu gönderilemedi. Lütfen tekrar deneyin.',
                type: 'error'
            });
        }
    };

    const handleVerifyRoleChange = async () => {
        if (roleVerifyModal.enteredCode !== roleVerifyModal.verificationCode) {
            showModal({
                title: 'Hatalı Kod',
                message: 'Girdiğiniz doğrulama kodu yanlış. Lütfen kullanıcının bildirimlerindeki kodu kontrol edin.',
                type: 'error'
            });
            return;
        }

        setRoleVerifyModal(prev => ({ ...prev, loading: true }));

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: roleVerifyModal.newRole })
                .eq('id', roleVerifyModal.user.id);

            if (error) throw error;

            setUsers(users.map(u =>
                u.id === roleVerifyModal.user.id ? { ...u, role: roleVerifyModal.newRole } : u
            ));

            const roleText = roleVerifyModal.newRole === 'admin' ? 'Admin' : 'Moderatör';

            // Send success notification to the user
            await supabase
                .from('notifications')
                .insert({
                    user_id: roleVerifyModal.user.id,
                    type: 'role_changed',
                    title: 'Rol Değişikliği',
                    message: `Tebrikler! Hesabınız ${roleText} olarak yetkilendirildi.`,
                    link: null,
                    is_read: false
                });

            setRoleVerifyModal({
                open: false,
                user: null,
                newRole: null,
                verificationCode: '',
                enteredCode: '',
                loading: false
            });

            showModal({
                title: 'Başarılı',
                message: `Kullanıcının rolü "${roleText}" olarak güncellendi.`,
                type: 'success'
            });
        } catch (error) {
            console.error('Rol değiştirme hatası:', error.message);
            setRoleVerifyModal(prev => ({ ...prev, loading: false }));
            showModal({
                title: 'Hata',
                message: 'Rol değiştirilirken bir hata oluştu.',
                type: 'error'
            });
        }
    };

    const handleSendEmail = (user) => {
        showModal({
            title: 'Yakında',
            message: `${user.username || user.full_name} kullanıcısına e-posta gönderme özelliği yakında eklenecek.`,
            type: 'info'
        });
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
                {role === 'admin' && <CheckCircle size={12} className="mr-1 text-green-600" />}
                {role === 'moderator' && <CheckCircle size={12} className="mr-1 text-blue-600" />}
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
            <Modal
                isOpen={banModal.open}
                onClose={() => {
                    setBanModal({ open: false, user: null });
                    setBanReason('');
                }}
                title="Kullanıcıyı Banla"
                type="warning"
                customIcon={<Ban size={32} className="text-orange-500" />}
                size="md"
                showCancel={true}
                cancelText="İptal"
                confirmText="Banla"
                onConfirm={handleBanUser}
            >
                <p className="text-gray-500 leading-relaxed mb-6">
                    <span className="font-semibold text-gray-700">{banModal.user?.username || banModal.user?.full_name}</span> kullanıcısını banlamak istediğinizden emin misiniz?
                </p>

                <div className="text-left">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ban Nedeni (isteğe bağlı)
                    </label>
                    <textarea
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        placeholder="Ban nedenini buraya yazabilirsiniz..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none transition"
                        rows="3"
                    />
                </div>
            </Modal>

            {/* Role Verification Modal */}
            <Modal
                isOpen={roleVerifyModal.open}
                onClose={() => {
                    setRoleVerifyModal({
                        open: false,
                        user: null,
                        newRole: null,
                        verificationCode: '',
                        enteredCode: '',
                        loading: false
                    });
                }}
                title="Doğrulama Kodu"
                type="info"
                customIcon={<UserCog size={32} className="text-blue-500" />}
                size="md"
                showCancel={true}
                cancelText="İptal"
                confirmText={roleVerifyModal.loading ? 'Doğrulanıyor...' : 'Doğrula'}
                confirmDisabled={roleVerifyModal.enteredCode.length !== 6}
                confirmLoading={roleVerifyModal.loading}
                onConfirm={handleVerifyRoleChange}
            >
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-left mb-4">
                    <p className="text-blue-800 text-sm">
                        <span className="font-semibold">{roleVerifyModal.user?.username || roleVerifyModal.user?.full_name}</span> kullanıcısına
                        <span className="font-semibold"> {roleVerifyModal.newRole === 'admin' ? 'Admin' : 'Moderatör'}</span> yetkisi vermek için
                        doğrulama kodu gönderildi.
                    </p>
                    <p className="text-blue-700 text-sm mt-2">
                        Kullanıcıdan bildirimlerindeki 6 haneli kodu alın ve aşağıya girin.
                    </p>
                </div>

                <div className="text-left">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        6 Haneli Doğrulama Kodu
                    </label>
                    <input
                        type="text"
                        value={roleVerifyModal.enteredCode}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setRoleVerifyModal(prev => ({ ...prev, enteredCode: value }));
                        }}
                        placeholder="______"
                        maxLength={6}
                        className="w-full px-4 py-4 text-center text-2xl font-mono tracking-widest border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>
            </Modal>

            {/* General Modal */}
            <Modal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                confirmText={modalConfig.confirmText}
                cancelText={modalConfig.cancelText}
                showCancel={modalConfig.showCancel}
                onConfirm={modalConfig.onConfirm}
            />
        </div>
    );
};

export default Users;
