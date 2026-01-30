import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Hook for fetching Marine Protected Areas from Supabase
 */
export const useSupabaseMPAs = () => {
    const [mpas, setMpas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isSupabaseConfigured()) {
            console.log('Supabase not configured, MPAs unavailable');
            setIsLoading(false);
            return;
        }

        fetchMPAs();
    }, []);

    const fetchMPAs = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('marine_protected_areas')
                .select('*');

            if (error) throw error;

            // Parse coordinates JSON
            const parsed = data.map(mpa => ({
                ...mpa,
                coordinates: typeof mpa.coordinates === 'string'
                    ? JSON.parse(mpa.coordinates)
                    : mpa.coordinates
            }));

            setMpas(parsed);
            setError(null);
        } catch (err) {
            console.error('Error fetching MPAs:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return { mpas, isLoading, error, refreshMPAs: fetchMPAs };
};

export default useSupabaseMPAs;
