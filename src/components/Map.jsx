import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import LayerControl from './LayerControl';
import HeatmapLayer from './HeatmapLayer';
import VesselHistoryTracker from './VesselHistoryTracker';
import MapStyleSwitcher from './MapStyleSwitcher';

// Map style controller to apply dark theme
const MapStyleController = () => {
    const map = useMap();

    useEffect(() => {
        const mapContainer = map.getContainer();
        mapContainer.style.background = '#1A1A1A';
    }, [map]);

    return null;
};

const Map = ({ detections = [], marineProtectedAreas = [], onVesselSelect }) => {
    const [selectedDetection, setSelectedDetection] = useState(null);
    const [layers, setLayers] = useState({
        sarDetections: true,
        aisTracks: true,
        mpaBoundaries: true,
        heatmap: false
    });
    const [showHistory, setShowHistory] = useState(null); // vessel ID to show history for
    const [mapStyle, setMapStyle] = useState('dark');
    const [tileUrl, setTileUrl] = useState('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png');


    // Default center on Gulf of Mannar ocean area (between India and Sri Lanka)
    const defaultCenter = [9.0, 78.5];
    const defaultZoom = 8;

    const handleToggleLayer = (layerName) => {
        setLayers(prev => ({
            ...prev,
            [layerName]: !prev[layerName]
        }));
    };

    const handleVesselClick = (detection) => {
        setSelectedDetection(detection);
        if (onVesselSelect) {
            onVesselSelect(detection);
        }
    };

    const handleShowHistory = (vesselId) => {
        setShowHistory(vesselId);
    };

    const handleMapStyleChange = (styleId, url) => {
        setMapStyle(styleId);
        setTileUrl(url);
    };

    return (
        <div className="relative w-full h-full">
            <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                className="w-full h-full"
                zoomControl={true}
                attributionControl={false}
            >
                {/* Dark-themed map tiles */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                <MapStyleController />

                {/* Marine Protected Areas - subtle gray outline */}
                {layers.mpaBoundaries && marineProtectedAreas.map((mpa, index) => (
                    <Polygon
                        key={`mpa-${index}`}
                        positions={mpa.coordinates}
                        pathOptions={{
                            color: '#666',
                            weight: 2,
                            fillColor: '#262626',
                            fillOpacity: 0.1,
                            dashArray: '5, 10'
                        }}
                    />
                ))}

                {/* Vessel detections - show based on layer settings */}
                {detections.map((detection, index) => {
                    const isAnomalous = detection.aisStatus === 'OFF';
                    const markerColor = isAnomalous ? '#FF0000' : '#4CAF50';

                    // Filter based on layer toggles
                    const showSAR = layers.sarDetections && isAnomalous;
                    const showAIS = layers.aisTracks && !isAnomalous;

                    if (!showSAR && !showAIS) return null;

                    // Parse coordinates as numbers
                    const lat = parseFloat(detection.latitude);
                    const lon = parseFloat(detection.longitude);

                    return (
                        <CircleMarker
                            key={`detection-${detection.vesselId}`}
                            center={[lat, lon]}
                            radius={8}
                            pathOptions={{
                                color: markerColor,
                                fillColor: markerColor,
                                fillOpacity: 0.7,
                                weight: 2
                            }}
                            eventHandlers={{
                                click: () => handleVesselClick(detection),
                            }}
                        >
                            <Popup className="dark-popup">
                                <div className="bg-[#262626] p-2 rounded text-white">
                                    <div className="text-xs font-semibold mb-2 text-[#FFA116]">
                                        {isAnomalous ? '⚠️ Anomalous Vessel' : '✓ Cooperative Vessel'}
                                    </div>
                                    <div className="text-xs space-y-1">
                                        <div><span className="text-[#A0A0A0]">ID:</span> {detection.vesselId}</div>
                                        <div><span className="text-[#A0A0A0]">Time:</span> {detection.timestamp}</div>
                                        <div><span className="text-[#A0A0A0]">Lat:</span> {detection.latitude}°N</div>
                                        <div><span className="text-[#A0A0A0]">Lon:</span> {detection.longitude}°E</div>
                                        <div>
                                            <span className="text-[#A0A0A0]">AIS:</span>{' '}
                                            <span className={isAnomalous ? 'text-[#FF0000]' : 'text-[#4CAF50]'}>
                                                {detection.aisStatus}
                                            </span>
                                        </div>
                                        {detection.threatScore && (
                                            <div>
                                                <span className="text-[#A0A0A0]">Threat:</span>{' '}
                                                <span className="text-[#FFA116]">{detection.threatScore}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>

            {/* Layer Control */}
            <LayerControl layers={layers} onToggleLayer={handleToggleLayer} />

            {/* Map Legend */}
            <div className="absolute bottom-6 left-6 bg-[#262626] border border-[#333] rounded p-4 z-[1000]">
                <h3 className="text-xs font-semibold text-[#A0A0A0] uppercase mb-3">Legend</h3>
                <div className="space-y-2">
                    {layers.sarDetections && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#FF0000]"></div>
                            <span className="text-xs text-[#E8E8E8]">Dark Vessel (AIS OFF)</span>
                        </div>
                    )}
                    {layers.aisTracks && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#4CAF50]"></div>
                            <span className="text-xs text-[#E8E8E8]">Cooperative Vessel</span>
                        </div>
                    )}
                    {layers.mpaBoundaries && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-0.5 border-t-2 border-dashed border-[#666]"></div>
                            <span className="text-xs text-[#E8E8E8]">Marine Protected Area</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Map;
