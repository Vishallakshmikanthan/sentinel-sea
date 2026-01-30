import React, { useState } from 'react';

const AdvancedFilterPanel = ({ onApplyFilters, detections = [] }) => {
    const [filters, setFilters] = useState({
        dateRange: { start: '', end: '' },
        threatLevel: { min: 0, max: 100 },
        aisStatus: 'all', // 'all', 'on', 'off'
        reviewStatus: 'all', // 'all', 'pending', 'confirmed', 'dismissed'
        insideMPA: 'all', // 'all', 'yes', 'no'
        vesselSize: 'all', // 'all', 'small', 'medium', 'large'
        searchQuery: ''
    });

    const [isExpanded, setIsExpanded] = useState(false);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleNestedFilterChange = (parent, key, value) => {
        setFilters(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [key]: value }
        }));
    };

    const applyFilters = () => {
        onApplyFilters(filters);
    };

    const resetFilters = () => {
        const defaultFilters = {
            dateRange: { start: '', end: '' },
            threatLevel: { min: 0, max: 100 },
            aisStatus: 'all',
            reviewStatus: 'all',
            insideMPA: 'all',
            vesselSize: 'all',
            searchQuery: ''
        };
        setFilters(defaultFilters);
        onApplyFilters(defaultFilters);
    };

    const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
        if (key === 'dateRange') return value.start || value.end;
        if (key === 'threatLevel') return value.min > 0 || value.max < 100;
        if (key === 'searchQuery') return value.length > 0;
        return value !== 'all';
    }).length;

    return (
        <div className="bg-[#262626] rounded-lg border border-zinc-800">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="text-sm font-semibold text-zinc-300">Advanced Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/30">
                            {activeFilterCount} active
                        </span>
                    )}
                </div>
                <svg
                    className={`w-4 h-4 text-zinc-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Filter Content */}
            {isExpanded && (
                <div className="p-4 border-t border-zinc-800 space-y-4">
                    {/* Search Query */}
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">
                            Search Detection ID
                        </label>
                        <input
                            type="text"
                            value={filters.searchQuery}
                            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                            placeholder="VSL-20240129-A001"
                            className="w-full px-3 py-2 bg-[#1A1A1A] border border-zinc-700 rounded text-sm text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                        />
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">
                            Date Range
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="date"
                                value={filters.dateRange.start}
                                onChange={(e) => handleNestedFilterChange('dateRange', 'start', e.target.value)}
                                className="px-3 py-2 bg-[#1A1A1A] border border-zinc-700 rounded text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                            />
                            <input
                                type="date"
                                value={filters.dateRange.end}
                                onChange={(e) => handleNestedFilterChange('dateRange', 'end', e.target.value)}
                                className="px-3 py-2 bg-[#1A1A1A] border border-zinc-700 rounded text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Threat Score Range */}
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">
                            Threat Score: {filters.threatLevel.min} - {filters.threatLevel.max}
                        </label>
                        <div className="space-y-2">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={filters.threatLevel.min}
                                onChange={(e) => handleNestedFilterChange('threatLevel', 'min', parseInt(e.target.value))}
                                className="w-full accent-orange-500"
                            />
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={filters.threatLevel.max}
                                onChange={(e) => handleNestedFilterChange('threatLevel', 'max', parseInt(e.target.value))}
                                className="w-full accent-orange-500"
                            />
                        </div>
                    </div>

                    {/* AIS Status */}
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">
                            AIS Status
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {['all', 'on', 'off'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => handleFilterChange('aisStatus', status)}
                                    className={`px-3 py-2 rounded text-xs font-semibold uppercase transition-colors ${filters.aisStatus === status
                                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                            : 'bg-[#1A1A1A] text-zinc-400 border border-zinc-700 hover:border-zinc-600'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Review Status */}
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">
                            Review Status
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {['all', 'pending', 'confirmed', 'dismissed'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => handleFilterChange('reviewStatus', status)}
                                    className={`px-3 py-2 rounded text-xs font-semibold uppercase transition-colors ${filters.reviewStatus === status
                                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                            : 'bg-[#1A1A1A] text-zinc-400 border border-zinc-700 hover:border-zinc-600'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Inside MPA */}
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">
                            Marine Protected Area
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {['all', 'yes', 'no'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => handleFilterChange('insideMPA', status)}
                                    className={`px-3 py-2 rounded text-xs font-semibold uppercase transition-colors ${filters.insideMPA === status
                                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                            : 'bg-[#1A1A1A] text-zinc-400 border border-zinc-700 hover:border-zinc-600'
                                        }`}
                                >
                                    {status === 'yes' ? 'Inside' : status === 'no' ? 'Outside' : 'All'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Vessel Size */}
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">
                            Vessel Size
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {['all', 'small', 'medium', 'large'].map(size => (
                                <button
                                    key={size}
                                    onClick={() => handleFilterChange('vesselSize', size)}
                                    className={`px-3 py-2 rounded text-xs font-semibold uppercase transition-colors ${filters.vesselSize === size
                                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                            : 'bg-[#1A1A1A] text-zinc-400 border border-zinc-700 hover:border-zinc-600'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-zinc-800">
                        <button
                            onClick={applyFilters}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold text-sm transition-colors"
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={resetFilters}
                            className="px-4 py-2 bg-[#1A1A1A] hover:bg-zinc-800 text-zinc-400 rounded font-semibold text-sm border border-zinc-700 hover:border-zinc-600 transition-colors"
                        >
                            Reset
                        </button>
                    </div>

                    {/* Results Count */}
                    <div className="text-xs text-zinc-500 text-center">
                        Showing {detections.length} detection{detections.length !== 1 ? 's' : ''}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedFilterPanel;
