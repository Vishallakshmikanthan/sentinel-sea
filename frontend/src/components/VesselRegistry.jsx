import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { format } from 'date-fns';

/**
 * Vessel Registry - Database of known vessels
 */
const VesselRegistry = ({ onClose }) => {
    const [vessels, setVessels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTrust, setFilterTrust] = useState('all');
    const [selectedVessel, setSelectedVessel] = useState(null);

    useEffect(() => {
        if (isSupabaseConfigured()) {
            fetchVessels();
        }
    }, []);

    const fetchVessels = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('vessel_registry')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setVessels(data || []);
        } catch (err) {
            console.error('Error fetching vessels:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter vessels
    const filteredVessels = vessels.filter(v => {
        const matchesSearch = !searchTerm ||
            v.vessel_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.vessel_name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTrust = filterTrust === 'all' || v.trust_level === filterTrust;

        return matchesSearch && matchesTrust;
    });

    const trustLevelColors = {
        whitelisted: 'bg-green-500/20 text-green-400 border-green-500/30',
        trusted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        unknown: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
        suspicious: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        blacklisted: 'bg-red-500/20 text-red-400 border-red-500/30'
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-[#1A1A1A] border border-zinc-800 rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-100">Vessel Registry</h2>
                        <p className="text-sm text-zinc-500 mt-1">{vessels.length} vessels in database</p>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="p-4 border-b border-zinc-800 flex gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search by vessel ID or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 bg-[#0A0A0A] border border-zinc-700 rounded text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                        />
                    </div>
                    <select
                        value={filterTrust}
                        onChange={(e) => setFilterTrust(e.target.value)}
                        className="px-4 py-2 bg-[#0A0A0A] border border-zinc-700 rounded text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                    >
                        <option value="all">All Trust Levels</option>
                        <option value="whitelisted">Whitelisted</option>
                        <option value="trusted">Trusted</option>
                        <option value="unknown">Unknown</option>
                        <option value="suspicious">Suspicious</option>
                        <option value="blacklisted">Blacklisted</option>
                    </select>
                </div>

                {/* Vessel List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-64 text-zinc-500">
                            <div className="spinner mr-2"></div>
                            Loading vessels...
                        </div>
                    ) : filteredVessels.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
                            <svg className="w-16 h-16 mb-4 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p>No vessels found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                            {filteredVessels.map(vessel => (
                                <div
                                    key={vessel.id}
                                    className="bg-[#262626] border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors cursor-pointer"
                                    onClick={() => setSelectedVessel(vessel)}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-zinc-100">{vessel.vessel_name || vessel.vessel_id}</h3>
                                            <p className="text-xs text-zinc-500 font-mono">{vessel.vessel_id}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${trustLevelColors[vessel.trust_level] || trustLevelColors.unknown}`}>
                                            {vessel.trust_level?.toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="text-zinc-500">Type:</span>
                                            <span className="text-zinc-300 ml-2">{vessel.vessel_type || 'Unknown'}</span>
                                        </div>
                                        <div>
                                            <span className="text-zinc-500">Flag:</span>
                                            <span className="text-zinc-300 ml-2">{vessel.flag_country || 'Unknown'}</span>
                                        </div>
                                        {vessel.length_m && (
                                            <div>
                                                <span className="text-zinc-500">Length:</span>
                                                <span className="text-zinc-300 ml-2">{vessel.length_m}m</span>
                                            </div>
                                        )}
                                        {vessel.last_seen && (
                                            <div>
                                                <span className="text-zinc-500">Last Seen:</span>
                                                <span className="text-zinc-300 ml-2">{format(new Date(vessel.last_seen), 'MMM dd')}</span>
                                            </div>
                                        )}
                                    </div>

                                    {vessel.notes && (
                                        <div className="mt-3 pt-3 border-t border-zinc-800">
                                            <p className="text-xs text-zinc-400 italic line-clamp-2">{vessel.notes}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VesselRegistry;
