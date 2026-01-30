import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

/**
 * Heatmap Layer - Shows detection density visualization
 */
const HeatmapLayer = ({ detections, enabled = true, intensity = 0.5 }) => {
    const map = useMap();
    const heatLayerRef = useRef(null);

    useEffect(() => {
        if (!enabled || !detections || detections.length === 0) {
            // Remove existing heat layer
            if (heatLayerRef.current) {
                map.removeLayer(heatLayerRef.current);
                heatLayerRef.current = null;
            }
            return;
        }

        // Prepare heatmap data
        const heatData = detections.map(detection => [
            parseFloat(detection.latitude),
            parseFloat(detection.longitude),
            detection.threatScore / 100 // Normalized intensity based on threat score
        ]).filter(point =>
            !isNaN(point[0]) && !isNaN(point[1]) && point[0] !== 0 && point[1] !== 0
        );

        if (heatData.length === 0) return;

        // Remove old layer
        if (heatLayerRef.current) {
            map.removeLayer(heatLayerRef.current);
        }

        // Create new heatmap layer
        heatLayerRef.current = L.heatLayer(heatData, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            max: 1.0,
            gradient: {
                0.0: 'blue',
                0.3: '#00ff00',
                0.5: 'yellow',
                0.7: 'orange',
                1.0: 'red'
            }
        }).addTo(map);

        // Cleanup on unmount
        return () => {
            if (heatLayerRef.current) {
                map.removeLayer(heatLayerRef.current);
                heatLayerRef.current = null;
            }
        };
    }, [map, detections, enabled, intensity]);

    return null; // This component doesn't render anything directly
};

export default HeatmapLayer;
