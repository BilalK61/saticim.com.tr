import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async (session) => {
            if (session?.user) {
                try {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    setUser({ ...session.user, ...profile });
                } catch (error) {
                    console.error('Profil verisi çekilemedi:', error);
                    setUser(session.user);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        // Mevcut oturumu kontrol et
        const checkUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                await fetchProfile(session);
            } catch (error) {
                console.error('Oturum kontrolü hatası:', error);
                setLoading(false);
            }
        };

        checkUser();

        // Oturum değişikliklerini dinle
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            fetchProfile(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const value = {
        signUp: (data) => supabase.auth.signUp(data),
        signIn: (data) => supabase.auth.signInWithPassword(data),
        signOut: () => supabase.auth.signOut(),
        user,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
