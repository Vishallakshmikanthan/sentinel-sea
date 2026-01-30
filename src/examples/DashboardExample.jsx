import React, { useState } from 'react';
import DetectionList from '../components/DetectionList';
import DetectionDetailPanel from '../components/DetectionDetailPanel';
import SystemStatusBar from '../components/SystemStatusBar';

/**
 * Example showing how to use the three maritime surveillance dashboard components together
 * 
 * Components:
 * 1. DetectionList - Sortable list with threat scoring and unreviewed indicators
 * 2. DetectionDetailPanel - Detailed view with SAR features, AIS explanation, and actions
 * 3. SystemStatusBar - Live ingestion status with data refresh tracking
 */
const DashboardExample = () => {
    // Mock detection data
    const [detections] = useState([
        {
            vesselId: 'VSL-20240129-A001',
            timestamp: '2024-01-29 14:30 UTC',
            latitude: '12.4567',
            longitude: '78.9012',
            aisStatus: 'OFF',
            threatScore: 87,
            vesselSize: '45m',
            reviewed: false,
            inProtectedZone: true,
            estimatedLength: 45,
            sarFeatures: {
                area: 320.5,
                intensity: 15.8,
                elongation: 3.2,
                backscatterIntensity: -12.5,
                targetArea: 320.5,
                shapeRatio: 3.2,
                confidenceScore: 0.89
            }
        },
        {
            vesselId: 'VSL-20240129-A002',
            timestamp: '2024-01-29 14:25 UTC',
            latitude: '12.4890',
            longitude: '78.8765',
            aisStatus: 'ON',
            threatScore: 23,
            vesselSize: '28m',
            reviewed: true,
            inProtectedZone: false,
            estimatedLength: 28,
            sarFeatures: {
                area: 180.2,
                intensity: 12.3,
                elongation: 2.8,
                backscatterIntensity: -14.2,
                targetArea: 180.2,
                shapeRatio: 2.8,
                confidenceScore: 0.92
            }
        },
        {
            vesselId: 'VSL-20240129-A003',
            timestamp: '2024-01-29 14:20 UTC',
            latitude: '12.5123',
            longitude: '78.9543',
            aisStatus: 'OFF',
            threatScore: 65,
            vesselSize: '38m',
            reviewed: false,
            inProtectedZone: true,
            estimatedLength: 38,
            sarFeatures: {
                area: 275.8,
                intensity: 14.1,
                elongation: 3.0,
                backscatterIntensity: -13.1,
                targetArea: 275.8,
                shapeRatio: 3.0,
                confidenceScore: 0.85
            }
        }
    ]);

    const [selectedDetection, setSelectedDetection] = useState(null);
    const [isLive, setIsLive] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    // Handler for selecting a detection
    const handleSelectDetection = (detection) => {
        setSelectedDetection(detection);
    };

    // Handler for confirming anomaly
    const handleConfirmAnomaly = (detection) => {
        console.log('Confirmed anomaly:', detection.vesselId);
        alert(`Anomaly confirmed: ${detection.vesselId}\nThis vessel has been flagged for investigation.`);
        // In real app: Send to backend API, update detection status, notify authorities
    };

    // Handler for dismissing false positive
    const handleDismissFalsePositive = (detection) => {
        console.log('Dismissed as false positive:', detection.vesselId);
        alert(`False positive dismissed: ${detection.vesselId}\nThis detection has been removed from the queue.`);
        // In real app: Update detection status, remove from active list, log to database
    };

    // Handler for toggling live/paused mode
    const handleToggleLive = () => {
        setIsLive(!isLive);
        if (!isLive) {
            setLastRefresh(new Date());
        }
    };

    // Handler for closing detail panel
    const handleCloseDetailPanel = () => {
        setSelectedDetection(null);
    };

    return (
        <div className="h-screen flex flex-col bg-[#1A1A1A]">
            {/* System Status Bar - Top */}
            <SystemStatusBar
                sarIngestionStatus="active"
                aisIngestionStatus="active"
                lastRefresh={lastRefresh}
                isLive={isLive}
                onToggleLive={handleToggleLive}
            />

            {/* Main Content - Detection List + Detail Panel */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Detection List */}
                <div className="w-96 border-r border-zinc-800">
                    <DetectionList
                        detections={detections}
                        selectedDetection={selectedDetection}
                        onSelect={handleSelectDetection}
                    />
                </div>

                {/* Right: Detection Detail Panel */}
                <div className="flex-1">
                    <DetectionDetailPanel
                        detection={selectedDetection}
                        onConfirmAnomaly={handleConfirmAnomaly}
                        onDismissFalsePositive={handleDismissFalsePositive}
                        onClose={handleCloseDetailPanel}
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardExample;

/**
 * COMPONENT FEATURES:
 * 
 * 1. DetectionList:
 *    - ✓ Sortable by threat score and time
 *    - ✓ Click to select detection
 *    - ✓ Visual indicator for unreviewed items (orange dot)
 *    - ✓ Threat color coding (red/orange/green)
 *    - ✓ Total count and unreviewed count in footer
 * 
 * 2. DetectionDetailPanel:
 *    - ✓ Displays SAR-derived features (area, intensity, elongation)
 *    - ✓ AIS status explanation (why OFF is suspicious)
 *    - ✓ Threat score breakdown with progress bar
 *    - ✓ "Confirm Anomaly" button (red)
 *    - ✓ "Dismiss False Positive" button (gray)
 *    - ✓ Contributing threat factors listed
 * 
 * 3. SystemStatusBar:
 *    - ✓ SAR/AIS ingestion status indicators
 *    - ✓ Last data refresh timestamp (relative time)
 *    - ✓ Live/Paused toggle button with visual feedback
 *    - ✓ Pulsing indicator for active status
 * 
 * THEME:
 * - ✓ Charcoal black background (#1A1A1A)
 * - ✓ Dark gray cards/panels (#262626)
 * - ✓ LeetCode orange accents (#FFA116)
 * - ✓ Off-white text (#E8E8E8) and muted gray (#A0A0A0)
 * - ✓ Accessible contrast throughout
 * 
 * STATE MANAGEMENT:
 * - ✓ Functional component with React hooks
 * - ✓ Clean separation of concerns
 * - ✓ No placeholder UI - all interactive
 */
