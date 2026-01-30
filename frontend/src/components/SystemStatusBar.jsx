import React from 'react';

const SystemStatusBar = ({
    sarIngestionStatus = 'active',
    aisIngestionStatus = 'active',
    lastRefresh = new Date(),
    isLive = true,
    onToggleLive
}) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-[#4CAF50]';
            case 'paused':
                return 'bg-[#FFA116]';
            case 'error':
                return 'bg-[#FF0000]';
            default:
                return 'bg-[#666]';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'active':
                return 'Active';
            case 'paused':
                return 'Paused';
            case 'error':
                return 'Error';
            default:
                return 'Unknown';
        }
    };

    const formatTimestamp = (date) => {
        const now = new Date();
        const diffSeconds = Math.floor((now - new Date(date)) / 1000);

        if (diffSeconds < 60) return `${diffSeconds}s ago`;
        if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
        if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
        return new Date(date).toLocaleString();
    };

    return (
        <div className="bg-[#0F0F0F] border-b border-[#333] px-6 py-3">
            <div className="flex items-center justify-between">
                {/* Left: Ingestion Status */}
                <div className="flex items-center gap-6">
                    {/* SAR Status */}
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(sarIngestionStatus)} 
                            ${sarIngestionStatus === 'active' ? 'animate-pulse' : ''}`}></div>
                        <span className="text-xs text-[#A0A0A0]">SAR:</span>
                        <span className="text-xs text-[#E8E8E8] font-semibold">
                            {getStatusLabel(sarIngestionStatus)}
                        </span>
                    </div>

                    {/* AIS Status */}
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(aisIngestionStatus)}
                            ${aisIngestionStatus === 'active' ? 'animate-pulse' : ''}`}></div>
                        <span className="text-xs text-[#A0A0A0]">AIS:</span>
                        <span className="text-xs text-[#E8E8E8] font-semibold">
                            {getStatusLabel(aisIngestionStatus)}
                        </span>
                    </div>

                    {/* Divider */}
                    <div className="h-4 w-px bg-[#333]"></div>

                    {/* Last Refresh */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[#A0A0A0]">Last Refresh:</span>
                        <span className="text-xs text-[#E8E8E8] font-mono">
                            {formatTimestamp(lastRefresh)}
                        </span>
                    </div>
                </div>

                {/* Right: Live/Paused Toggle */}
                <button
                    onClick={onToggleLive}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded border transition-all ${isLive
                            ? 'bg-[#4CAF50]/10 border-[#4CAF50] text-[#4CAF50]'
                            : 'bg-[#FFA116]/10 border-[#FFA116] text-[#FFA116]'
                        }`}
                >
                    <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-[#4CAF50] animate-pulse' : 'bg-[#FFA116]'}`}></div>
                    <span className="text-xs font-semibold uppercase">
                        {isLive ? 'Live' : 'Paused'}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default SystemStatusBar;
