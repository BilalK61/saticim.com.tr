import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Profil = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        if (user) {
            const fetchProfile = async () => {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('user_no')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setProfileData(data);
                } else if (error) {
                    console.error("Error fetching profile:", error);
                }
            };
            fetchProfile();
        }
    }, [user]);

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p>Lütfen profilinizi görüntülemek için giriş yapın.</p>
                <button
                    onClick={() => navigate('/login')}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Giriş Yap
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto"
            >
                <div className="flex items-center space-x-4 mb-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                        {user.email ? user.email[0].toUpperCase() : 'K'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Kullanıcı Profil</h2>
                        <p className="text-gray-600">{user.email}</p>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold mb-4">Hesap Bilgileri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-md">
                            <span className="block text-sm text-gray-500">Üyelik Tipi</span>
                            <span className="font-medium">Standart</span>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-md">
                            <span className="block text-sm text-gray-500">Kayıt Tarihi</span>
                            <span className="font-medium">{new Date(user.created_at).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-md">
                            <span className="block text-sm text-gray-500">Kullanıcı No</span>
                            <span className="font-medium text-lg text-blue-600">
                                {profileData?.user_no ? `#${profileData.user_no}` : (
                                    <span className="text-xs text-gray-400">Yükleniyor... (SQL Çalıştırın)</span>
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Profil;
