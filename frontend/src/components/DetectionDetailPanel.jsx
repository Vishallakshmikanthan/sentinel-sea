import React from 'react';

const DetectionDetailPanel = ({ detection, onConfirmAnomaly, onDismissFalsePositive, onClose }) => {
    if (!detection) {
        return (
            <div className="h-full flex items-center justify-center bg-[#1A1A1A] p-6">
                <div className="text-center">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-muted-gray text-sm">Select a detection to view details</p>
                </div>
            </div>
        );
    }

    const isAnomalous = detection.aisStatus === 'OFF';
    const getThreatLevel = (score) => {
        if (score >= 70) return { level: 'HIGH', color: 'text-[#FF0000]' };
        if (score >= 40) return { level: 'MEDIUM', color: 'text-[#FFA116]' };
        return { level: 'LOW', color: 'text-[#4CAF50]' };
    };

    const threat = detection.threatScore !== undefined ? getThreatLevel(detection.threatScore) : null;

    return (
        <div className="h-full flex flex-col bg-[#1A1A1A]">
            {/* Header */}
            <div className="border-b border-[#333] p-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-semibold text-[#A0A0A0] uppercase tracking-wide">
                        Detection Details
                    </h2>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-[#A0A0A0] hover:text-[#FFA116] transition-colors"
                        >
                            ✕
                        </button>
                    )}
                </div>
                <div className="text-lg font-mono text-[#FFA116]">{detection.vesselId}</div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Basic Information */}
                <div className="bg-[#262626] rounded p-4">
                    <h3 className="text-xs font-semibold text-[#A0A0A0] uppercase mb-3">
                        Basic Information
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-[#A0A0A0]">Detection Time:</span>
                            <span className="text-[#E8E8E8]">{detection.timestamp}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#A0A0A0]">Latitude:</span>
                            <span className="text-[#E8E8E8] font-mono">{detection.latitude}°N</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#A0A0A0]">Longitude:</span>
                            <span className="text-[#E8E8E8] font-mono">{detection.longitude}°E</span>
                        </div>
                        {detection.vesselSize && (
                            <div className="flex justify-between">
                                <span className="text-[#A0A0A0]">Vessel Size:</span>
                                <span className="text-[#E8E8E8]">{detection.vesselSize}</span>
                            </div>
                        )}
                        {detection.estimatedLength && (
                            <div className="flex justify-between">
                                <span className="text-[#A0A0A0]">Estimated Length:</span>
                                <span className="text-[#E8E8E8]">{detection.estimatedLength}m</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* AIS Status */}
                <div className="bg-[#262626] rounded p-4">
                    <h3 className="text-xs font-semibold text-[#A0A0A0] uppercase mb-3">
                        AIS Status
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                        <div className={`w-3 h-3 rounded-full ${isAnomalous ? 'bg-[#FF0000]' : 'bg-[#4CAF50]'}`}></div>
                        <span className={`text-sm font-semibold ${isAnomalous ? 'text-[#FF0000]' : 'text-[#4CAF50]'}`}>
                            {detection.aisStatus}
                        </span>
                    </div>
                    <p className="text-xs text-[#A0A0A0] leading-relaxed">
                        {isAnomalous ? (
                            <>
                                <strong className="text-[#FF0000]">Anomalous Vessel:</strong> This SAR detection has no
                                corresponding AIS broadcast within the spatial tolerance (±500m). Vessel may be operating
                                with transponder disabled, indicating potential IUU fishing activity.
                            </>
                        ) : (
                            <>
                                <strong className="text-[#4CAF50]">Cooperative Vessel:</strong> AIS signal detected matching
                                this SAR position. Vessel is broadcasting its identity and position as required by maritime law.
                            </>
                        )}
                    </p>
                </div>

                {/* SAR-Derived Features */}
                {detection.sarFeatures && (
                    <div className="bg-[#262626] rounded p-4">
                        <h3 className="text-xs font-semibold text-[#A0A0A0] uppercase mb-3">
                            SAR-Derived Features
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-[#A0A0A0]">Target Area:</span>
                                <span className="text-[#E8E8E8] font-mono">{detection.sarFeatures.area.toFixed(2)} m²</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#A0A0A0]">Backscatter Intensity:</span>
                                <span className="text-[#E8E8E8] font-mono">{detection.sarFeatures.intensity.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#A0A0A0]">Elongation Ratio:</span>
                                <span className="text-[#E8E8E8] font-mono">{detection.sarFeatures.elongation.toFixed(2)}</span>
                            </div>
                        </div>
                        <p className="text-xs text-[#A0A0A0] mt-3 leading-relaxed">
                            These features are extracted from Sentinel-1 SAR imagery and used by the Random Forest
                            classifier to estimate vessel size and compute the threat score.
                        </p>
                    </div>
                )}

                {/* Threat Score Breakdown */}
                {threat && (
                    <div className="bg-[#262626] rounded p-4">
                        <h3 className="text-xs font-semibold text-[#A0A0A0] uppercase mb-3">
                            Threat Assessment
                        </h3>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-[#A0A0A0]">Risk Level:</span>
                            <span className={`text-lg font-bold ${threat.color}`}>{threat.level}</span>
                        </div>
                        <div className="mb-3">
                            <div className="flex justify-between text-xs text-[#A0A0A0] mb-1">
                                <span>Threat Score</span>
                                <span className="text-[#FFA116] font-semibold">{detection.threatScore}%</span>
                            </div>
                            <div className="w-full bg-[#1A1A1A] rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-[#FFA116] h-full transition-all duration-300"
                                    style={{ width: `${detection.threatScore}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="space-y-2 text-xs text-[#A0A0A0]">
                            <div className="flex items-start gap-2">
                                <span className="text-[#FFA116]">•</span>
                                <span>
                                    <strong>Vessel Size:</strong> Larger vessels receive higher threat scores due to
                                    greater catch capacity.
                                </span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-[#FFA116]">•</span>
                                <span>
                                    <strong>AIS Behavior:</strong> Absence of AIS broadcast significantly increases the score.
                                </span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-[#FFA116]">•</span>
                                <span>
                                    <strong>MPA Proximity:</strong> Vessels operating inside Marine Protected Areas receive
                                    elevated scores.
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="border-t border-[#333] p-4 space-y-2 bg-[#0F0F0F]">
                <button
                    onClick={() => onConfirmAnomaly(detection)}
                    className="w-full bg-[#FF0000] hover:bg-[#CC0000] text-white 
                     py-3 rounded font-semibold text-sm transition-colors"
                >
                    ✓ CONFIRM ANOMALY
                </button>
                <button
                    onClick={() => onDismissFalsePositive(detection)}
                    className="w-full bg-[#262626] hover:bg-[#333] border border-[#444] text-[#E8E8E8] 
                     py-3 rounded font-semibold text-sm transition-colors"
                >
                    ✕ DISMISS AS FALSE POSITIVE
                </button>
            </div>
        </div>
    );
};

export default DetectionDetailPanel;
