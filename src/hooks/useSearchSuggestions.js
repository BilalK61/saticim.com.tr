import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

/**
 * Custom hook for search suggestions with debouncing
 * @param {string} query - Search query
 * @param {number} minLength - Minimum query length to trigger search
 * @returns {Object} - { suggestions, loading }
 */
export const useSearchSuggestions = (query, minLength = 2) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Clear suggestions if query is too short
        if (query.length < minLength) {
            setSuggestions([]);
            setLoading(false);
            return;
        }

        // Debounce search with 300ms delay
        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                // Parallel search: Listings and Profiles
                const [listingsResponse, profilesResponse] = await Promise.all([
                    supabase
                        .from('listings')
                        .select('id, title, price, currency, images, category, cities(name)')
                        .eq('status', 'approved')
                        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
                        .order('created_at', { ascending: false })
                        .limit(5),

                    supabase
                        .from('profiles')
                        .select('id, username, full_name, avatar_url')
                        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
                        .limit(3)
                ]);

                if (listingsResponse.error) throw listingsResponse.error;
                if (profilesResponse.error) throw profilesResponse.error;

                const listings = (listingsResponse.data || []).map(item => ({ ...item, type: 'listing' }));
                const profiles = (profilesResponse.data || []).map(item => ({ ...item, type: 'user' }));

                setSuggestions([...profiles, ...listings]);
            } catch (error) {
                console.error('Search suggestions error:', error);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        // Cleanup: cancel previous timer
        return () => clearTimeout(timer);
    }, [query, minLength]);

    return { suggestions, loading };
};
