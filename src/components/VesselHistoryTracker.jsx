import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Polyline, CircleMarker, Popup } from 'react-leaflet';
import { format } from 'date-fns';

/**
 * Vessel History Tracker - Shows movement trail and timeline
 */
const VesselHistoryTracker = ({ vesselId, onClose }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('24h');

    useEffect(() => {
        if (vesselId && isSupabaseConfigured()) {
            fetchVesselHistory();
        }
    }, [vesselId, timeRange]);

    const fetchVesselHistory = async () => {
        setLoading(true);
        try {
            // Calculate date range
            const now = new Date();
            const ranges = {
                '24h': 24,
                '7d': 168,
                '30d': 720
            };
            const hoursAgo = ranges[timeRange] || 24;
            const startDate = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000));

            const { data, error } = await supabase
                .from('vessel_position_history')
                .select('*')
                .eq('vessel_id', vesselId)
                .gte('timestamp', startDate.toISOString())
                .order('timestamp', { ascending: true });

            if (error) throw error;

            setHistory(data || []);
        } catch (err) {
            console.error('Error fetching vessel history:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isSupabaseConfigured()) {
        return null;
    }

    // Generate polyline coordinates for vessel track
    const trackCoordinates = history.map(pos => [
        parseFloat(pos.latitude),
        parseFloat(pos.longitude)
    ]);

    // Color gradient from old (blue) to recent (red)
    const getColorForAge = (index, total) => {
        const ratio = index / Math.max(total - 1, 1);
        const r = Math.floor(ratio * 255);
        const b = Math.floor((1 - ratio) * 255);
        return `rgb(${r}, 100, ${b})`;
    };

    return (
        <>
            {/* Vessel Track Polyline */}
            {trackCoordinates.length > 1 && (
                <Polyline
                    positions={trackCoordinates}
                    color="#FFA116"
                    weight={3}
                    opacity={0.7}
                    dashArray="5, 10"
                />
            )}

            {/* Position Markers */}
            {history.map((pos, index) => (
                <CircleMarker
                    key={pos.id}
                    center={[parseFloat(pos.latitude), parseFloat(pos.longitude)]}
                    radius={index === history.length - 1 ? 8 : 4}
                    fillColor={index === history.length - 1 ? '#FF0000' : getColorForAge(index, history.length)}
                    color={index === history.length - 1 ? '#FFFFFF' : '#000000'}
                    fillOpacity={index === history.length - 1 ? 1 : 0.6}
                    weight={index === history.length - 1 ? 2 : 1}
                >
                    <Popup className="dark-popup">
                        <div className="bg-[#262626] p-2 rounded text-white text-xs">
                            <div className="font-semibold text-orange-400 mb-1">
                                {index === history.length - 1 ? '📍 Current Position' : '⏱️ Historical Position'}
                            </div>
                            <div><span className="text-zinc-400">Time:</span> {format(new Date(pos.timestamp), 'MMM dd, HH:mm')}</div>
                            <div><span className="text-zinc-400">Lat:</span> {pos.latitude}°</div>
                            <div><span className="text-zinc-400">Lon:</span> {pos.longitude}°</div>
                            {pos.speed && <div><span className="text-zinc-400">Speed:</span> {pos.speed} kn</div>}
                            {pos.heading && <div><span className="text-zinc-400">Heading:</span> {pos.heading}°</div>}
                        </div>
                    </Popup>
                </CircleMarker>
            ))}

            {/* History Info Panel */}
            {onClose && (
                <div className="absolute top-20 right-6 bg-[#1A1A1A] border border-zinc-800 rounded-lg shadow-2xl p-4 z-[1000] max-w-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-bold text-zinc-100">Vessel Track</h3>
                            <p className="text-xs text-zinc-500">{vesselId}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Time Range Selector */}
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-zinc-400 mb-2">Time Range</label>
                        <div className="flex gap-2">
                            {['24h', '7d', '30d'].map(range => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${timeRange === range
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-[#262626] text-zinc-400 hover:bg-zinc-700'
                                        }`}
                                >
                                    {range === '24h' ? 'Last 24h' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Statistics */}
                    {loading ? (
                        <div className="text-center py-4 text-zinc-500">Loading history...</div>
                    ) : history.length > 0 ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-400">Total Positions:</span>
                                <span className="text-zinc-100 font-semibold">{history.length}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-400">First Seen:</span>
                                <span className="text-zinc-100">{format(new Date(history[0].timestamp), 'MMM dd, HH:mm')}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-400">Last Seen:</span>
                                <span className="text-zinc-100">{format(new Date(history[history.length - 1].timestamp), 'MMM dd, HH:mm')}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4 text-zinc-500 text-xs">
                            No history available for this time range
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default VesselHistoryTracker;
