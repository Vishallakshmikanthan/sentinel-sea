import React from 'react';

const Sidebar = ({ detections = [] }) => {
    return (
        <aside className="w-80 h-screen bg-[#1A1A1A] border-l border-[#333] flex flex-col overflow-hidden">
            {/* Threat Level Indicator */}
            <div className="p-6 border-b border-[#333]">
                <h2 className="text-sm font-semibold text-[#A0A0A0] uppercase tracking-wide mb-4">
                    Threat Level
                </h2>
                <div className="flex gap-2">
                    <ThreatBadge level="low" active={false} />
                    <ThreatBadge level="medium" active={false} />
                    <ThreatBadge level="high" active={true} />
                </div>
            </div>

            {/* System Status */}
            <div className="p-6 border-b border-[#333]">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <span className="text-sm text-[#E8E8E8]">Scanning Sentinel-1 SAR Data</span>
                </div>
            </div>

            {/* Recent Detections */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-6 pb-3">
                    <h2 className="text-sm font-semibold text-[#A0A0A0] uppercase tracking-wide">
                        Recent Detections
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
                    {detections.map((detection, index) => (
                        <DetectionCard key={index} detection={detection} />
                    ))}
                </div>
            </div>
        </aside>
    );
};

// Threat Badge Component
const ThreatBadge = ({ level, active }) => {
    const configs = {
        low: {
            label: 'Low',
            bgColor: active ? 'bg-[#4A4A4A]' : 'bg-[#262626]',
            textColor: active ? 'text-[#A0A0A0]' : 'text-[#666]',
            borderColor: active ? 'border-[#666]' : 'border-[#333]'
        },
        medium: {
            label: 'Medium',
            bgColor: active ? 'bg-[#FFA116]' : 'bg-[#262626]',
            textColor: active ? 'text-[#1A1A1A]' : 'text-[#666]',
            borderColor: active ? 'border-[#FFA116]' : 'border-[#333]'
        },
        high: {
            label: 'High',
            bgColor: active ? 'bg-[#FF0000]' : 'bg-[#262626]',
            textColor: active ? 'text-white' : 'text-[#666]',
            borderColor: active ? 'border-[#FF0000]' : 'border-[#333]'
        }
    };

    const config = configs[level];

    return (
        <div
            className={`flex-1 px-3 py-2 rounded border ${config.bgColor} ${config.borderColor} 
                  transition-all duration-200`}
        >
            <span className={`text-xs font-semibold uppercase ${config.textColor}`}>
                {config.label}
            </span>
        </div>
    );
};

// Detection Card Component
const DetectionCard = ({ detection }) => {
    const { timestamp, latitude, longitude, aisStatus, vesselId } = detection;

    return (
        <div className="bg-[#262626] rounded p-4 border border-[#333] hover:border-[#444] transition-colors">
            {/* Timestamp */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-[#A0A0A0] font-mono">
                    {timestamp}
                </span>
                <span className="text-xs text-[#666]">
                    #{vesselId}
                </span>
            </div>

            {/* Coordinates */}
            <div className="space-y-1 mb-3">
                <div className="flex justify-between items-center">
                    <span className="text-xs text-[#A0A0A0]">Latitude:</span>
                    <span className="text-sm text-[#E8E8E8] font-mono">{latitude}°N</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-[#A0A0A0]">Longitude:</span>
                    <span className="text-sm text-[#E8E8E8] font-mono">{longitude}°E</span>
                </div>
            </div>

            {/* AIS Status */}
            <div className="flex items-center justify-between pt-3 border-t border-[#333]">
                <span className="text-xs text-[#A0A0A0]">AIS Status:</span>
                <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${aisStatus === 'OFF'
                            ? 'bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/30'
                            : 'bg-[#4A4A4A] text-[#A0A0A0] border border-[#666]'
                        }`}
                >
                    {aisStatus}
                </span>
            </div>
        </div>
    );
};

export default Sidebar;
