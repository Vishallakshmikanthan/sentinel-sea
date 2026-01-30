import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Hook for fetching and subscribing to vessel detections from Supabase
 * Falls back to mock data if Supabase is not configured
 */
export const useSupabaseDetections = () => {
    const [detections, setDetections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!isSupabaseConfigured()) {
            console.log('Supabase not configured, using mock data');
            setIsLoading(false);
            setIsConnected(false);
            return;
        }

        fetchDetections();

        // Subscribe to real-time updates
        const channel = supabase
            .channel('vessel_detections_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'vessel_detections'
                },
                (payload) => {
                    console.log('Real-time update:', payload);
                    handleRealtimeUpdate(payload);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    setIsConnected(true);
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchDetections = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('vessel_detections')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(50);

            if (error) throw error;

            // Transform Supabase data to match frontend format
            const transformed = data.map(d => ({
                vesselId: d.vessel_id,
                timestamp: new Date(d.timestamp).toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
                latitude: d.latitude,
                longitude: d.longitude,
                aisStatus: d.ais_status,
                threatScore: d.threat_score,
                vesselSize: d.vessel_size,
                reviewed: d.review_status !== 'pending',
                reviewStatus: d.review_status,
                inProtectedZone: d.inside_mpa,
                protectedAreaName: d.mpa_name,
                sarFeatures: {
                    area: d.sar_area,
                    intensity: d.sar_intensity,
                    elongation: d.sar_elongation,
                    backscatterIntensity: d.sar_backscatter,
                    confidenceScore: d.sar_confidence
                },
                // Keep original ID for updates
                _supabaseId: d.id
            }));

            setDetections(transformed);
            setError(null);
            setIsConnected(true);
        } catch (err) {
            console.error('Error fetching detections:', err);
            setError(err.message);
            setIsConnected(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRealtimeUpdate = (payload) => {
        if (payload.eventType === 'INSERT') {
            const newDetection = transformDetection(payload.new);
            setDetections(prev => [newDetection, ...prev].slice(0, 50));
        } else if (payload.eventType === 'UPDATE') {
            const updated = transformDetection(payload.new);
            setDetections(prev =>
                prev.map(d => d._supabaseId === updated._supabaseId ? updated : d)
            );
        } else if (payload.eventType === 'DELETE') {
            setDetections(prev => prev.filter(d => d._supabaseId !== payload.old.id));
        }
    };

    const transformDetection = (d) => ({
        vesselId: d.vessel_id,
        timestamp: new Date(d.timestamp).toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        latitude: d.latitude,
        longitude: d.longitude,
        aisStatus: d.ais_status,
        threatScore: d.threat_score,
        vesselSize: d.vessel_size,
        reviewed: d.review_status !== 'pending',
        reviewStatus: d.review_status,
        inProtectedZone: d.inside_mpa,
        protectedAreaName: d.mpa_name,
        sarFeatures: {
            area: d.sar_area,
            intensity: d.sar_intensity,
            elongation: d.sar_elongation,
            backscatterIntensity: d.sar_backscatter,
            confidenceScore: d.sar_confidence
        },
        _supabaseId: d.id
    });

    const confirmAnomaly = async (detection, analystId = 'analyst-001', notes = '') => {
        if (!isSupabaseConfigured()) {
            console.warn('Supabase not configured');
            return { success: false, error: 'Supabase not configured' };
        }

        try {
            // Update detection
            const { error: updateError } = await supabase
                .from('vessel_detections')
                .update({
                    review_status: 'confirmed',
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: analystId,
                    review_notes: notes
                })
                .eq('id', detection._supabaseId);

            if (updateError) throw updateError;

            // Log analyst action
            await supabase.from('analyst_actions').insert({
                vessel_detection_id: detection._supabaseId,
                action_type: 'confirm_anomaly',
                analyst_id: analystId,
                notes
            });

            return { success: true };
        } catch (err) {
            console.error('Error confirming anomaly:', err);
            return { success: false, error: err.message };
        }
    };

    const dismissFalsePositive = async (detection, analystId = 'analyst-001', notes = '') => {
        if (!isSupabaseConfigured()) {
            console.warn('Supabase not configured');
            return { success: false, error: 'Supabase not configured' };
        }

        try {
            const { error: updateError } = await supabase
                .from('vessel_detections')
                .update({
                    review_status: 'dismissed',
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: analystId,
                    review_notes: notes
                })
                .eq('id', detection._supabaseId);

            if (updateError) throw updateError;

            await supabase.from('analyst_actions').insert({
                vessel_detection_id: detection._supabaseId,
                action_type: 'dismiss_false_positive',
                analyst_id: analystId,
                notes
            });

            return { success: true };
        } catch (err) {
            console.error('Error dismissing detection:', err);
            return { success: false, error: err.message };
        }
    };

    return {
        detections,
        isLoading,
        error,
        isConnected,
        confirmAnomaly,
        dismissFalsePositive,
        refreshDetections: fetchDetections
    };
};

export default useSupabaseDetections;
