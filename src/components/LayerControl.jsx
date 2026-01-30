import React from 'react';

const LayerControl = ({ layers, onToggleLayer }) => {
    return (
        <div className="absolute top-24 right-6 z-[1000] bg-[#262626] border border-[#333] rounded p-4 min-w-[200px]">
            <h3 className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wide mb-3">
                Map Layers
            </h3>
            <div className="space-y-2">
                <LayerToggle
                    label="SAR Detections"
                    checked={layers.sarDetections}
                    onChange={() => onToggleLayer('sarDetections')}
                    icon="🛰️"
                />
                <LayerToggle
                    label="AIS Tracks"
                    checked={layers.aisTracks}
                    onChange={() => onToggleLayer('aisTracks')}
                    icon="📡"
                />
                <LayerToggle
                    label="MPA Boundaries"
                    checked={layers.mpaBoundaries}
                    onChange={() => onToggleLayer('mpaBoundaries')}
                    icon="🌊"
                />
            </div>
        </div>
    );
};

const LayerToggle = ({ label, checked, onChange, icon }) => {
    return (
        <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="sr-only peer"
                />
                <div className="w-4 h-4 border-2 border-[#444] rounded peer-checked:border-[#FFA116] 
                        peer-checked:bg-[#FFA116] transition-colors flex items-center justify-center">
                    {checked && (
                        <svg className="w-3 h-3 text-[#1A1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </div>
            </div>
            <span className="text-xs">{icon}</span>
            <span className="text-sm text-[#E8E8E8] group-hover:text-[#FFA116] transition-colors flex-1">
                {label}
            </span>
        </label>
    );
};

export default LayerControl;
