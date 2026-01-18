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
                const { data, error } = await supabase
                    .from('listings')
                    .select('id, title, price, currency, images, category, cities(name)')
                    .eq('status', 'approved')
                    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
                    .order('created_at', { ascending: false })
                    .limit(8);

                if (error) throw error;
                setSuggestions(data || []);
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
