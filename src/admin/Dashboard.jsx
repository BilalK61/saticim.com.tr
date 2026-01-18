import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Users, ShoppingBag, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalListings: 0,
        pendingListings: 0,
        totalRevenue: 0 // Mock revenue
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        // Fetch users count (approximate if using auth.users is restricted, or use profiles table)
        // Ensure you have a 'profiles' table for this to work perfectly, otherwise 0
        const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

        // Fetch listings
        const { count: listingsCount } = await supabase.from('listings').select('*', { count: 'exact', head: true });

        // Fetch pending listings logic (assuming a 'status' column)
        const { count: pendingCount } = await supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'pending');

        setStats({
            totalUsers: userCount || 124, // Mock fallback if table missing
            totalListings: listingsCount || 48, // Mock fallback
            pendingListings: pendingCount || 5, // Mock fallback
            totalRevenue: 154200
        });
    };

    const StatCard = ({ title, value, icon: Icon, color, trend }) => (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                        <TrendingUp size={12} />
                        {trend}
                    </span>
                )}
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
        </div>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Panel Özeti</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Toplam Kullanıcı"
                    value={stats.totalUsers}
                    icon={Users}
                    color="bg-blue-50 text-blue-600"
                    trend="+12%"
                />
                <StatCard
                    title="Toplam İlan"
                    value={stats.totalListings}
                    icon={ShoppingBag}
                    color="bg-purple-50 text-purple-600"
                    trend="+5%"
                />
                <StatCard
                    title="Onay Bekleyen"
                    value={stats.pendingListings}
                    icon={AlertCircle}
                    color="bg-orange-50 text-orange-600"
                />
                <StatCard
                    title="Aylık Ciro (Tahmini)"
                    value={`${stats.totalRevenue.toLocaleString()} TL`}
                    icon={DollarSign}
                    color="bg-green-50 text-green-600"
                    trend="+8%"
                />
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">Son Eklenen İlanlar</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                                <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">Satılık BMW 320i</div>
                                    <div className="text-xs text-gray-500">Vasıta • Az önce</div>
                                </div>
                                <span className="text-sm font-bold text-blue-600">3.250.000 ₺</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">Son Kayıt Olanlar</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                    AK
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">Ahmet Kaya</div>
                                    <div className="text-xs text-gray-500">ahmet@example.com</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
