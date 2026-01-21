import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, List, Settings, LogOut, Package, Flag, Trophy } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const menuItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Panel' },
        { path: '/admin/listings', icon: List, label: 'İlanlar' },
        { path: '/admin/game-scores', icon: Trophy, label: 'Oyun Skorları' }, // NEW
        { path: '/admin/reports', icon: Flag, label: 'Şikayetler' },
        { path: '/admin/users', icon: Users, label: 'Kullanıcılar' },
        { path: '/admin/settings', icon: Settings, label: 'Ayarlar' },
    ];

    const { user } = useAuth(); // Get user from context

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Package className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg">Admin Paneli</h1>
                        <p className="text-xs text-slate-400">Yönetim Sistemi</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-xl w-full transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Çıkış Yap</span>
                    </button>
                    <div className="mt-4 px-4 text-xs text-slate-500">
                        v1.0.0
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white px-8 py-4 shadow-sm border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-gray-800">
                        {menuItems.find(i => i.path === location.pathname)?.label || 'Yönetim'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold text-gray-900">
                                {user?.username || 'Admin User'}
                            </span>
                            <span className="text-xs text-gray-500">
                                {user?.email || 'admin@saticim.com'}
                            </span>
                        </div>
                        <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Admin" className="w-full h-full object-cover" />
                            ) : (
                                <img src={`https://ui-avatars.com/api/?name=${user?.username || 'Admin'}&background=0D8ABC&color=fff`} alt="Admin" />
                            )}
                        </div>
                    </div>
                </header>
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
