import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Clock, Filter, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all'); // all, unread, system
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Bildirimler yüklenirken hata:', error);
            } else {
                setNotifications(data || []);
            }
            setLoading(false);
        };

        fetchNotifications();

        // Real-time subscription
        const subscription = supabase
            .channel('public:notifications')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
            }, (payload) => {
                console.log('Real-time notification update:', payload);
                fetchNotifications(); // Refresh list on any change
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [user]);

    const handleMarkAsRead = async (id) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        window.dispatchEvent(new Event('notificationUpdate'));

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        if (error) console.error('Okundu işaretleme hatası:', error);
    };

    const handleDelete = async (id) => {
        // Optimistic update
        setNotifications(prev => prev.filter(n => n.id !== id));
        window.dispatchEvent(new Event('notificationUpdate'));

        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id);

        if (error) console.error('Silme hatası:', error);
    };

    const handleMarkAllAsRead = async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        window.dispatchEvent(new Event('notificationUpdate'));

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false); // Only update unread ones

        if (error) console.error('Tümünü okundu işaretleme hatası:', error);
    };

    // Helper to format time relative to now (e.g. "2 saat önce")
    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " yıl önce";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " ay önce";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " gün önce";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " saat önce";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " dakika önce";
        return "Az önce";
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.is_read;
        if (filter === 'system') return n.type === 'system' || n.type === 'security';
        return true;
    });

    if (loading && notifications.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                                <Bell className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Bildirimler</h1>
                                <p className="text-sm text-gray-500">Tüm aktiviteleriniz ve güncellemeler</p>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={handleMarkAllAsRead}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition text-sm font-medium"
                            >
                                <Check className="w-4 h-4" />
                                Tümünü Okundu İşaretle
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                            Tümü
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                            Okunmamış
                        </button>
                        <button
                            onClick={() => setFilter('system')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filter === 'system' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                            Sistem
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notification) => (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-md group ${!notification.is_read ? 'border-blue-100 bg-blue-50/10' : 'border-gray-100'}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${!notification.is_read ? 'bg-blue-600' : 'bg-gray-200'}`} />

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className={`font-semibold text-gray-900 ${!notification.is_read ? 'text-blue-900' : ''}`}>
                                                    {notification.title}
                                                </h3>
                                                <p className="text-gray-600 mt-1 text-sm leading-relaxed">
                                                    {notification.text || notification.content || notification.message}
                                                </p>
                                                {notification.action_url && (
                                                    <button
                                                        onClick={() => navigate(notification.action_url)}
                                                        className="mt-3 px-4 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition inline-flex items-center gap-2"
                                                    >
                                                        Hemen Düzenle
                                                    </button>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatTimeAgo(notification.created_at)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!notification.is_read && (
                                            <button
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                                                title="Okundu işaretle"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(notification.id)}
                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                                            title="Sil"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Bildirim Bulunamadı</h3>
                            <p className="text-gray-500 mt-1">Seçilen kriterlere uygun bildiriminiz yok.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
