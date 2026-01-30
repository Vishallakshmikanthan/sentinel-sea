import React, { useState, useRef, useEffect } from 'react';

const SARImageViewer = ({ detection, onHover, isHovered }) => {
    const [contrast, setContrast] = useState(100);
    const [zoom, setZoom] = useState(1);

    // Simulate SAR imagery with canvas
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || !detection) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.fillStyle = '#0A0A0A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Simulate grainy SAR texture
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const noise = Math.random() * 30 + 10; // Low noise
            imageData.data[i] = noise;
            imageData.data[i + 1] = noise;
            imageData.data[i + 2] = noise;
            imageData.data[i + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);

        // Apply contrast filter
        ctx.filter = `contrast(${contrast}%)`;

        // Draw vessel backscatter (bright white signature)
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const vesselWidth = 40 * zoom;
        const vesselLength = 100 * zoom;

        // Bright vessel return
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, vesselLength / 2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(220, 220, 220, 0.8)');
        gradient.addColorStop(1, 'rgba(100, 100, 100, 0.3)');

        ctx.fillStyle = gradient;
        ctx.fillRect(
            centerX - vesselWidth / 2,
            centerY - vesselLength / 2,
            vesselWidth,
            vesselLength
        );

        // Draw bounding box if hovered
        if (isHovered) {
            ctx.strokeStyle = '#FFA116';
            ctx.lineWidth = 3;
            ctx.strokeRect(
                centerX - vesselWidth / 2 - 10,
                centerY - vesselLength / 2 - 10,
                vesselWidth + 20,
                vesselLength + 20
            );
        }

    }, [detection, contrast, zoom, isHovered]);

    if (!detection) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-[#0A0A0A]">
                <div className="text-center">
                    <div className="text-4xl mb-3">🛰️</div>
                    <p className="text-muted-gray text-sm">Select a vessel to view SAR imagery</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-[#0A0A0A]">
            {/* SAR Image */}
            <div className="flex-1 relative flex items-center justify-center p-4">
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={300}
                    className="border border-[#333] cursor-crosshair"
                    onMouseEnter={() => onHover && onHover(true)}
                    onMouseLeave={() => onHover && onHover(false)}
                />

                {/* SAR Metadata Overlay */}
                <div className="absolute top-6 left-6 bg-[#1A1A1A]/90 border border-[#333] rounded p-3">
                    <div className="text-xs space-y-1">
                        <div className="text-[#FFA116] font-semibold">SENTINEL-1 SAR</div>
                        <div className="text-[#A0A0A0]">Mode: IW (Interferometric Wide)</div>
                        <div className="text-[#A0A0A0]">Pol: VV</div>
                        <div className="text-[#A0A0A0]">
                            Position: {detection.latitude}°N, {detection.longitude}°E
                        </div>
                    </div>
                </div>

                {/* Detection Info */}
                {detection.sarFeatures && (
                    <div className="absolute bottom-6 left-6 bg-[#1A1A1A]/90 border border-[#333] rounded p-3">
                        <div className="text-xs space-y-1">
                            <div className="text-[#FFA116] font-semibold">SAR Features</div>
                            <div className="text-[#E8E8E8]">Area: {detection.sarFeatures.area.toFixed(2)} m²</div>
                            <div className="text-[#E8E8E8]">Intensity: {detection.sarFeatures.intensity.toFixed(2)}</div>
                            <div className="text-[#E8E8E8]">Elongation: {detection.sarFeatures.elongation.toFixed(2)}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="border-t border-[#333] p-4 bg-[#1A1A1A]">
                <div className="space-y-3">
                    {/* Contrast Control */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs text-[#A0A0A0]">Contrast</label>
                            <span className="text-xs text-[#E8E8E8] font-mono">{contrast}%</span>
                        </div>
                        <input
                            type="range"
                            min="50"
                            max="200"
                            value={contrast}
                            onChange={(e) => setContrast(Number(e.target.value))}
                            className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer 
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 
                         [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full 
                         [&::-webkit-slider-thumb]:bg-[#FFA116]"
                        />
                    </div>

                    {/* Zoom Control */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs text-[#A0A0A0]">Zoom</label>
                            <span className="text-xs text-[#E8E8E8] font-mono">{zoom.toFixed(1)}x</span>
                        </div>
                        <input
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.1"
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer 
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 
                         [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full 
                         [&::-webkit-slider-thumb]:bg-[#FFA116]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const AISCorrelationViewer = ({ detection, isHovered }) => {
    if (!detection) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-[#1A1A1A]">
                <div className="text-center">
                    <div className="text-4xl mb-3">📡</div>
                    <p className="text-muted-gray text-sm">Select a vessel to view AIS correlation</p>
                </div>
            </div>
        );
    }

    const hasAIS = detection.aisStatus === 'ON';

    return (
        <div className="w-full h-full flex flex-col bg-[#1A1A1A]">
            {/* Nautical Map View */}
            <div className="flex-1 relative">
                {/* Simple coordinate grid */}
                <div className="w-full h-full bg-[#0F1419] flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 400 300">
                        {/* Grid lines */}
                        {[...Array(10)].map((_, i) => (
                            <line
                                key={`v-${i}`}
                                x1={i * 40}
                                y1={0}
                                x2={i * 40}
                                y2={300}
                                stroke="#1A2530"
                                strokeWidth="1"
                            />
                        ))}
                        {[...Array(8)].map((_, i) => (
                            <line
                                key={`h-${i}`}
                                x1={0}
                                y1={i * 37.5}
                                x2={400}
                                y2={i * 37.5}
                                stroke="#1A2530"
                                strokeWidth="1"
                            />
                        ))}

                        {/* Vessel Position */}
                        <circle
                            cx={200}
                            cy={150}
                            r={isHovered ? 12 : 8}
                            fill={hasAIS ? '#4CAF50' : '#FF0000'}
                            opacity={isHovered ? 1 : 0.8}
                            className="transition-all duration-200"
                        />

                        {/* AIS Track (if available) */}
                        {hasAIS && (
                            <g>
                                <path
                                    d="M 150,180 L 170,165 L 185,155 L 200,150"
                                    stroke="#4CAF50"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeDasharray="5,5"
                                    opacity="0.6"
                                />
                                <text x="150" y="175" fill="#4CAF50" fontSize="10">
                                    Track History
                                </text>
                            </g>
                        )}

                        {/* Crosshair */}
                        <line x1={200} y1={140} x2={200} y2={160} stroke="#FFA116" strokeWidth="1" />
                        <line x1={190} y1={150} x2={210} y2={150} stroke="#FFA116" strokeWidth="1" />
                    </svg>
                </div>

                {/* AIS Status Overlay */}
                <div className="absolute top-6 left-6 bg-[#1A1A1A]/90 border border-[#333] rounded p-3">
                    <div className="text-xs space-y-1">
                        <div className="text-[#FFA116] font-semibold">AIS CORRELATION</div>
                        <div className="text-[#A0A0A0]">
                            Position: {detection.latitude}°N, {detection.longitude}°E
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <div className={`w-2 h-2 rounded-full ${hasAIS ? 'bg-[#4CAF50]' : 'bg-[#FF0000]'}`}></div>
                            <span className={hasAIS ? 'text-[#4CAF50]' : 'text-[#FF0000]'}>
                                {hasAIS ? 'AIS Signal Detected' : 'No AIS Signal Detected'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* No AIS Message */}
                {!hasAIS && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-[#FF0000]/10 border-2 border-[#FF0000]/30 rounded p-4 max-w-sm">
                            <div className="text-[#FF0000] font-semibold text-sm mb-2">⚠️ Anomalous Vessel</div>
                            <p className="text-xs text-[#A0A0A0]">
                                SAR detection at this location has no corresponding AIS broadcast within ±500m tolerance.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SplitViewAnalyzer = ({ detection, onClose }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [selectedTimestamp, setSelectedTimestamp] = useState(0);

    // Mock historical timestamps
    const timestamps = detection ? [
        { time: 'Current', label: 'Live Detection' },
        { time: '-5min', label: '5 minutes ago' },
        { time: '-10min', label: '10 minutes ago' },
        { time: '-15min', label: '15 minutes ago' },
    ] : [];

    if (!detection) return null;

    return (
        <div className="fixed inset-0 bg-[#000]/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-6">
            <div className="bg-[#1A1A1A] border border-[#333] rounded-lg w-full max-w-7xl h-[85vh] flex flex-col">
                {/* Header */}
                <div className="border-b border-[#333] p-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-off-white">SAR / AIS Correlation Analysis</h2>
                        <p className="text-xs text-muted-gray mt-1">Vessel ID: {detection.vesselId}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[#A0A0A0] hover:text-[#FFA116] transition-colors text-xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Split View */}
                <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden">
                    {/* Left: SAR Image Viewer */}
                    <div className="border-r border-[#333]">
                        <div className="border-b border-[#333] p-3 bg-[#0F0F0F]">
                            <h3 className="text-sm font-semibold text-[#FFA116]">SAR IMAGE VIEWER</h3>
                        </div>
                        <SARImageViewer
                            detection={detection}
                            onHover={setIsHovered}
                            isHovered={isHovered}
                        />
                    </div>

                    {/* Right: AIS Correlation */}
                    <div>
                        <div className="border-b border-[#333] p-3 bg-[#0F0F0F]">
                            <h3 className="text-sm font-semibold text-[#FFA116]">AIS CORRELATION</h3>
                        </div>
                        <AISCorrelationViewer
                            detection={detection}
                            isHovered={isHovered}
                        />
                    </div>
                </div>

                {/* Timeline Selector */}
                <div className="border-t border-[#333] p-4 bg-[#0F0F0F]">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-[#A0A0A0] uppercase">Historical Timeline</h3>
                        <span className="text-xs text-[#E8E8E8]">{timestamps[selectedTimestamp]?.label}</span>
                    </div>
                    <div className="flex gap-2">
                        {timestamps.map((ts, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedTimestamp(index)}
                                className={`flex-1 py-2 px-3 rounded border text-xs font-semibold transition-colors ${selectedTimestamp === index
                                        ? 'bg-[#FFA116] border-[#FFA116] text-[#1A1A1A]'
                                        : 'bg-[#262626] border-[#444] text-[#E8E8E8] hover:border-[#FFA116]'
                                    }`}
                            >
                                {ts.time}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SplitViewAnalyzer;
