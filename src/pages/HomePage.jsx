import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import HeroSection from '../components/home/HeroSection';
import CategoriesSection from '../components/home/CategoriesSection';
import FeaturesSection from '../components/home/FeaturesSection';
import RecentListings from '../components/home/RecentListings';
import CTASection from '../components/home/CTASection';
import Footer from '../components/Footer';

const HomePage = () => {
    const [recentListings, setRecentListings] = useState([]);
    const [stats, setStats] = useState({ totalListings: 0, activeUsers: 0, todayListings: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Son ilanları çek (sadece onaylı olanlar)
            const { data: listings } = await supabase
                .from('listings')
                .select('*')
                .eq('status', 'approved')
                .order('created_at', { ascending: false })
                .limit(8);

            setRecentListings(listings || []);

            // İstatistikler (sadece onaylı ilanlar)
            const { count: total } = await supabase
                .from('listings')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'approved');

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const { count: todayCount } = await supabase
                .from('listings')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'approved')
                .gte('created_at', today.toISOString());

            setStats({
                totalListings: total || 0,
                activeUsers: Math.floor((total || 0) / 3), // Yaklaşık hesap
                todayListings: todayCount || 0
            });

            setLoading(false);
        } catch (error) {
            console.error('Veri çekme hatası:', error);
            setLoading(false);
        }
    };

    return (
        <>
            <HeroSection stats={stats} />
            <CategoriesSection />
            <FeaturesSection />
            <RecentListings listings={recentListings} loading={loading} />
            <CTASection />
            <Footer />
        </>
    );
};

export default HomePage;