import { useState, useEffect } from 'react';

/**
 * Mock detection stream for demo purposes
 * Generates realistic vessel detections in Indian Ocean / Bay of Bengal coastal areas
 */
export const useDetectionStream = (apiUrl) => {
    const [detections, setDetections] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!apiUrl) {
            setDetections([]);
            setIsConnected(false);
            return;
        }

        // Generate initial mock detections with realistic coastal coordinates
        const initialDetections = generateMockDetections(8);
        setDetections(initialDetections);
        setIsConnected(true);

        // Simulate periodic new detections
        const interval = setInterval(() => {
            const newDetection = generateSingleDetection();
            setDetections(prev => [newDetection, ...prev].slice(0, 25));
        }, 15000); // New detection every 15 seconds

        return () => clearInterval(interval);
    }, [apiUrl]);

    return { detections, isConnected };
};

// Counter for unique vessel IDs
let detectionCounter = 1;

// Realistic coastal coordinates for Bay of Bengal / Indian Ocean
const MARITIME_ZONES = [
    {
        name: 'Gulf of Mannar',
        lat: [8.5, 9.5],
        lon: [78.0, 79.5],
        mpa: true
    },
    {
        name: 'Palk Bay',
        lat: [9.0, 10.0],
        lon: [79.0, 80.0],
        mpa: true
    },
    {
        name: 'Andaman Sea',
        lat: [11.0, 13.0],
        lon: [92.5, 94.0],
        mpa: false
    },
    {
        name: 'Bay of Bengal - East Coast',
        lat: [12.0, 15.0],
        lon: [80.0, 82.5],
        mpa: false
    }
];

function generateSingleDetection() {
    const zone = MARITIME_ZONES[Math.floor(Math.random() * MARITIME_ZONES.length)];
    const lat = (zone.lat[0] + Math.random() * (zone.lat[1] - zone.lat[0])).toFixed(4);
    const lon = (zone.lon[0] + Math.random() * (zone.lon[1] - zone.lon[0])).toFixed(4);

    const aisStatus = Math.random() > 0.4 ? 'OFF' : 'ON';
    const vesselSizes = ['Small (15-25m)', '25m', 'Medium (30-40m)', '38m', 'Large (45-60m)', '52m'];
    const vesselSize = vesselSizes[Math.floor(Math.random() * vesselSizes.length)];

    // Calculate threat score based on AIS status and location
    let baseThreat = Math.floor(Math.random() * 40) + 20; // 20-60 base
    if (aisStatus === 'OFF') baseThreat += 30;
    if (zone.mpa) baseThreat += 20;
    const threatScore = Math.min(100, baseThreat);

    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const vesselId = `VSL-${dateStr}-A${String(detectionCounter++).padStart(3, '0')}`;

    return {
        vesselId,
        timestamp: date.toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        latitude: lat,
        longitude: lon,
        aisStatus,
        threatScore,
        vesselSize,
        reviewed: false,
        inProtectedZone: zone.mpa,
        protectedAreaName: zone.mpa ? zone.name : null,
        sarFeatures: {
            area: parseFloat((150 + Math.random() * 400).toFixed(2)),
            intensity: parseFloat((-16 + Math.random() * 8).toFixed(2)),
            elongation: parseFloat((2 + Math.random() * 2).toFixed(2)),
            backscatterIntensity: parseFloat((-16 + Math.random() * 8).toFixed(2)),
            targetArea: parseFloat((150 + Math.random() * 400).toFixed(2)),
            shapeRatio: parseFloat((2 + Math.random() * 2).toFixed(2)),
            confidenceScore: parseFloat((0.75 + Math.random() * 0.24).toFixed(2))
        }
    };
}

function generateMockDetections(count) {
    const detections = [];
    for (let i = 0; i < count; i++) {
        detections.push(generateSingleDetection());
    }
    return detections;
}
