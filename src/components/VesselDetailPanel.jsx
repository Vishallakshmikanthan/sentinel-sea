import React from 'react';

const VesselDetailPanel = ({ vessel, onClose, onMarkReviewed, onEscalate }) => {
    if (!vessel) {
        return (
            <div className="h-full flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="text-4xl mb-3">🗺️</div>
                    <p className="text-muted-gray text-sm">
                        Click on a vessel marker to view details
                    </p>
                </div>
            </div>
        );
    }

    const isAnomalous = vessel.aisStatus === 'OFF';

    return (
        <div className="h-full flex flex-col bg-[#1A1A1A]">
            {/* Header */}
            <div className="border-b border-[#333] p-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-semibold text-[#A0A0A0] uppercase tracking-wide">
                        Vessel Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-[#A0A0A0] hover:text-[#FFA116] transition-colors"
                    >
                        ✕
                    </button>
                </div>
                <div className="h-0.5 bg-[#FFA116] w-16"></div>
            </div>

            {/* Details Section */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Status Alert */}
                {isAnomalous && (
                    <div className="bg-[#FF0000]/10 border border-[#FF0000]/30 rounded p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[#FF0000] text-lg">⚠️</span>
                            <span className="text-[#FF0000] font-semibold text-sm">Anomalous Vessel Detected</span>
                        </div>
                        <p className="text-xs text-[#A0A0A0]">No AIS broadcast detected for this SAR target</p>
                    </div>
                )}

                {/* Vessel Information */}
                <div className="bg-[#262626] rounded p-4 space-y-3">
                    <DetailRow label="Vessel ID" value={vessel.vesselId} mono />
                    <DetailRow label="Detection Time" value={vessel.timestamp} />
                    <DetailRow label="Latitude" value={`${vessel.latitude}°N`} mono />
                    <DetailRow label="Longitude" value={`${vessel.longitude}°E`} mono />

                    {vessel.estimatedLength && (
                        <DetailRow label="Estimated Length" value={`${vessel.estimatedLength}m`} />
                    )}

                    {vessel.vesselSize && (
                        <DetailRow label="Vessel Size" value={vessel.vesselSize} />
                    )}

                    <div className="pt-3 border-t border-[#333]">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-[#A0A0A0]">AIS Status:</span>
                            <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${isAnomalous
                                    ? 'bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/30'
                                    : 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30'
                                    }`}
                            >
                                {vessel.aisStatus}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Threat Assessment */}
                {vessel.threatScore !== undefined && (
                    <div className="bg-[#262626] rounded p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-[#E8E8E8]">Threat Score</span>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-[#FFA116]">{vessel.threatScore}%</span>
                                <div className="group relative">
                                    <button className="text-[#A0A0A0] hover:text-[#FFA116] text-xs">ⓘ</button>
                                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-48 bg-[#1A1A1A] border border-[#333] rounded p-2 text-xs text-[#A0A0A0] z-50">
                                        Threat score is computed using vessel size, location proximity to MPA, and AIS behavior
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Threat Progress Bar */}
                        <div className="w-full bg-[#1A1A1A] rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-[#FFA116] h-full transition-all duration-300"
                                style={{ width: `${vessel.threatScore}%` }}
                            ></div>
                        </div>

                        {/* Threat Category */}
                        <div className="mt-3">
                            <span className="text-xs text-[#A0A0A0]">Risk Level: </span>
                            <span
                                className={`text-xs font-semibold ${vessel.threatScore >= 70
                                    ? 'text-[#FF0000]'
                                    : vessel.threatScore >= 40
                                        ? 'text-[#FFA116]'
                                        : 'text-[#4CAF50]'
                                    }`}
                            >
                                {vessel.threatScore >= 70 ? 'HIGH' : vessel.threatScore >= 40 ? 'MEDIUM' : 'LOW'}
                            </span>
                        </div>
                    </div>
                )}

                {/* SAR Features (if available) */}
                {vessel.sarFeatures && (
                    <div className="bg-[#262626] rounded p-4">
                        <h3 className="text-xs font-semibold text-[#A0A0A0] uppercase mb-3">SAR Features</h3>
                        <div className="space-y-2">
                            <DetailRow label="Target Area" value={`${vessel.sarFeatures.area.toFixed(2)} m²`} mono />
                            <DetailRow label="Backscatter Intensity" value={vessel.sarFeatures.intensity.toFixed(2)} mono />
                            <DetailRow label="Elongation Ratio" value={vessel.sarFeatures.elongation.toFixed(2)} mono />
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="border-t border-[#333] p-4 space-y-2">
                <button
                    onClick={() => onMarkReviewed(vessel)}
                    className="w-full bg-[#262626] hover:bg-[#333] border border-[#444] text-[#E8E8E8] 
                     py-2.5 rounded font-semibold text-sm transition-colors"
                >
                    MARK AS REVIEWED
                </button>
                <button
                    onClick={() => onEscalate(vessel)}
                    className="w-full bg-[#FFA116] hover:bg-[#FF8800] text-[#1A1A1A] 
                     py-2.5 rounded font-semibold text-sm transition-colors"
                >
                    ESCALATE ALERT
                </button>
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('openSplitView', { detail: vessel }))}
                    className="w-full bg-[#1A1A1A] hover:bg-[#262626] border border-[#FFA116] text-[#FFA116] 
                     py-2.5 rounded font-semibold text-sm transition-colors"
                >
                    🔍 ANALYZE SAR/AIS
                </button>
            </div>
        </div>
    );
};

// Helper component for detail rows
const DetailRow = ({ label, value, mono = false }) => (
    <div className="flex justify-between items-center">
        <span className="text-xs text-[#A0A0A0]">{label}:</span>
        <span className={`text-sm text-[#E8E8E8] ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
);

export default VesselDetailPanel;
