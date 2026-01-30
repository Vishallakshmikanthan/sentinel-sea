import React, { useState } from 'react';

const DetectionList = ({ detections, selectedDetection, onSelect }) => {
    const [sortBy, setSortBy] = useState('time'); // 'time' or 'threat'
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

    // Sort detections
    const sortedDetections = [...detections].sort((a, b) => {
        if (sortBy === 'time') {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
        } else {
            const scoreA = a.threatScore || 0;
            const scoreB = b.threatScore || 0;
            return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB;
        }
    });

    const handleSort = (newSortBy) => {
        if (sortBy === newSortBy) {
            setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('desc');
        }
    };

    const getThreatColor = (score) => {
        if (score >= 70) return 'text-[#FF0000]';
        if (score >= 40) return 'text-[#FFA116]';
        return 'text-[#4CAF50]';
    };

    return (
        <div className="flex flex-col h-full bg-[#1A1A1A]">
            {/* Header */}
            <div className="border-b border-[#333] p-4">
                <h2 className="text-sm font-semibold text-[#A0A0A0] uppercase tracking-wide mb-3">
                    Detection Queue
                </h2>

                {/* Sort Controls */}
                <div className="flex gap-2">
                    <button
                        onClick={() => handleSort('time')}
                        className={`flex-1 py-2 px-3 rounded text-xs font-semibold transition-colors ${sortBy === 'time'
                                ? 'bg-[#FFA116] text-[#1A1A1A]'
                                : 'bg-[#262626] text-[#E8E8E8] hover:bg-[#333]'
                            }`}
                    >
                        Time {sortBy === 'time' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </button>
                    <button
                        onClick={() => handleSort('threat')}
                        className={`flex-1 py-2 px-3 rounded text-xs font-semibold transition-colors ${sortBy === 'threat'
                                ? 'bg-[#FFA116] text-[#1A1A1A]'
                                : 'bg-[#262626] text-[#E8E8E8] hover:bg-[#333]'
                            }`}
                    >
                        Threat {sortBy === 'threat' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </button>
                </div>
            </div>

            {/* Detection List */}
            <div className="flex-1 overflow-y-auto">
                {sortedDetections.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-muted-gray text-sm">No detections available</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-2">
                        {sortedDetections.map((detection) => {
                            const isSelected = selectedDetection?.vesselId === detection.vesselId;
                            const isAnomalous = detection.aisStatus === 'OFF';
                            const isUnreviewed = detection.reviewed !== true;

                            return (
                                <button
                                    key={detection.vesselId}
                                    onClick={() => onSelect(detection)}
                                    className={`w-full text-left p-3 rounded border transition-all ${isSelected
                                            ? 'bg-[#FFA116]/10 border-[#FFA116]'
                                            : 'bg-[#262626] border-[#333] hover:border-[#FFA116]/50'
                                        }`}
                                >
                                    {/* Header Row */}
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono text-[#E8E8E8]">
                                                {detection.vesselId}
                                            </span>
                                            {isUnreviewed && (
                                                <span className="w-2 h-2 rounded-full bg-[#FFA116]"></span>
                                            )}
                                        </div>

                                        {detection.threatScore !== undefined && (
                                            <span className={`text-sm font-bold ${getThreatColor(detection.threatScore)}`}>
                                                {detection.threatScore}%
                                            </span>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="text-xs text-[#A0A0A0] space-y-1">
                                        <div className="flex justify-between">
                                            <span>Time:</span>
                                            <span className="text-[#E8E8E8]">{detection.timestamp}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>AIS:</span>
                                            <span className={isAnomalous ? 'text-[#FF0000]' : 'text-[#4CAF50]'}>
                                                {detection.aisStatus}
                                            </span>
                                        </div>
                                        {detection.vesselSize && (
                                            <div className="flex justify-between">
                                                <span>Size:</span>
                                                <span className="text-[#E8E8E8]">{detection.vesselSize}</span>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer Stats */}
            <div className="border-t border-[#333] p-3 bg-[#0F0F0F]">
                <div className="flex justify-between text-xs">
                    <span className="text-[#A0A0A0]">Total Detections:</span>
                    <span className="text-[#E8E8E8] font-semibold">{detections.length}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                    <span className="text-[#A0A0A0]">Unreviewed:</span>
                    <span className="text-[#FFA116] font-semibold">
                        {detections.filter(d => d.reviewed !== true).length}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default DetectionList;
