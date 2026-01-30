import React, { useState, useMemo } from 'react';
import DetectionList from './components/DetectionList';
import DetectionDetailPanel from './components/DetectionDetailPanel';
import SystemStatusBar from './components/SystemStatusBar';
import Map from './components/Map';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AdvancedFilterPanel from './components/AdvancedFilterPanel';
import ExportPanel from './components/ExportPanel';
import SplitViewAnalyzer from './components/SplitViewAnalyzer';
import AddDetectionModal from './components/AddDetectionModal';
import { NotificationProvider, useNotifications } from './components/NotificationSystem';
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from './hooks/useKeyboardShortcuts.jsx';
import { useDetectionStream } from './hooks/useDetectionStream';
import useSupabaseDetections from './hooks/useSupabaseDetections';
import useSupabaseMPAs from './hooks/useSupabaseMPAs';
import { isSupabaseConfigured } from './lib/supabase';

function AnalystViewContent() {
    const { addNotification } = useNotifications();

    // View state
    const [view, setView] = useState('map'); // 'map' or 'analytics'
    const [showHelp, setShowHelp] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    // Data state
    const [selectedDetection, setSelectedDetection] = useState(null);
    const [analyzingVessel, setAnalyzingVessel] = useState(null);
    const [filters, setFilters] = useState(null);

    // System state
    const [isLive, setIsLive] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    // Use Supabase if configured, otherwise fall back to mock data
    const usingSupabase = isSupabaseConfigured();

    // Supabase data hooks
    const supabaseData = useSupabaseDetections();

    // Mock data hook (only used if Supabase not configured)
    const mockData = useDetectionStream(
        !usingSupabase && isLive ? 'http://localhost:8000/api/detections/stream' : null
    );

    // Choose data source
    const { detections: allDetections, isConnected } = usingSupabase ? supabaseData : mockData;

    // Marine Protected Areas - try Supabase first, then fallback
    const { mpas: supabaseMPAs } = useSupabaseMPAs();
    const [mockMPAs, setMockMPAs] = useState([]);
    const marineProtectedAreas = usingSupabase && supabaseMPAs.length > 0 ? supabaseMPAs : mockMPAs;

    // Apply filters to detections
    const filteredDetections = useMemo(() => {
        if (!filters) return allDetections;

        return allDetections.filter(d => {
            // Search filter
            if (filters.searchQuery && !d.vesselId.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
                return false;
            }

            // Date range filter
            if (filters.dateRange.start && new Date(d.timestamp) < new Date(filters.dateRange.start)) {
                return false;
            }
            if (filters.dateRange.end && new Date(d.timestamp) > new Date(filters.dateRange.end)) {
                return false;
            }

            // Threat level filter
            if (d.threatScore < filters.threatLevel.min || d.threatScore > filters.threatLevel.max) {
                return false;
            }

            // AIS status filter
            if (filters.aisStatus === 'on' && d.aisStatus === 'OFF') return false;
            if (filters.aisStatus === 'off' && d.aisStatus === 'ON') return false;

            // Review status filter
            if (filters.reviewStatus === 'pending' && d.reviewed) return false;
            if (filters.reviewStatus === 'confirmed' && !d.reviewed) return false;

            // MPA filter
            if (filters.insideMPA === 'yes' && !d.inProtectedZone) return false;
            if (filters.insideMPA === 'no' && d.inProtectedZone) return false;

            return true;
        });
    }, [allDetections, filters]);

    // Update last refresh when new detections arrive
    React.useEffect(() => {
        if (allDetections.length > 0) {
            setLastRefresh(new Date());

            // Notify on high-threat detections
            const latestDetection = allDetections[allDetections.length - 1];
            if (latestDetection.threatScore >= 70) {
                addNotification({
                    type: 'warning',
                    title: 'High Threat Detection',
                    message: `${latestDetection.vesselId} detected with threat score: ${latestDetection.threatScore}%`
                });
            }
        }
    }, [allDetections.length, addNotification]);


    // Initialize mock MPAs if not using Supabase
    React.useEffect(() => {
        if (!usingSupabase) {
            const mockMPAData = [
                {
                    name: 'Gulf of Mannar Marine National Park',
                    coordinates: [
                        [9.05, 78.8],
                        [9.05, 79.3],
                        [8.7, 79.3],
                        [8.7, 78.8],
                        [9.05, 78.8]
                    ]
                },
                {
                    name: 'Palk Bay Protected Zone',
                    coordinates: [
                        [9.3, 79.0],
                        [9.6, 79.4],
                        [9.2, 79.6],
                        [9.0, 79.2],
                        [9.3, 79.0]
                    ]
                }
            ];
            setMockMPAs(mockMPAData);
        }
    }, [usingSupabase]);

    // Show data source notification on mount
    React.useEffect(() => {
        if (usingSupabase) {
            addNotification({
                type: 'success',
                title: 'Supabase Connected',
                message: 'Real-time data streaming from Supabase backend'
            });
        } else {
            addNotification({
                type: 'info',
                title: 'Mock Data Mode',
                message: 'Configure Supabase in .env to use live backend'
            });
        }
    }, [usingSupabase, addNotification]);

    // Update last refresh when new detections arrive
    React.useEffect(() => {
        if (allDetections.length > 0) {
            setLastRefresh(new Date());

            // Notify on high-threat detections
            const latestDetection = allDetections[0];
            if (latestDetection.threatScore >= 70) {
                addNotification({
                    type: 'warning',
                    title: 'High Threat Detection',
                    message: `${latestDetection.vesselId} detected with threat score: ${latestDetection.threatScore}%`
                });
            }
        }
    }, [allDetections.length, addNotification]);

    // Listen for split-view analyzer requests
    React.useEffect(() => {
        const handleOpenSplitView = (event) => {
            setAnalyzingVessel(event.detail);
        };
        window.addEventListener('openSplitView', handleOpenSplitView);
        return () => window.removeEventListener('openSplitView', handleOpenSplitView);
    }, []);

    // Handlers - use Supabase methods if available
    const handleConfirmAnomaly = async (detection) => {
        if (usingSupabase && supabaseData.confirmAnomaly) {
            const result = await supabaseData.confirmAnomaly(detection);
            if (result.success) {
                addNotification({
                    type: 'success',
                    title: 'Anomaly Confirmed',
                    message: `${detection.vesselId} has been flagged for investigation`
                });
            } else {
                addNotification({
                    type: 'error',
                    title: 'Update Failed',
                    message: result.error || 'Could not update detection'
                });
            }
        } else {
            addNotification({
                type: 'success',
                title: 'Anomaly Confirmed',
                message: `${detection.vesselId} has been flagged for investigation`
            });
        }
    };

    const handleDismissFalsePositive = async (detection) => {
        if (usingSupabase && supabaseData.dismissFalsePositive) {
            const result = await supabaseData.dismissFalsePositive(detection);
            if (result.success) {
                addNotification({
                    type: 'info',
                    title: 'Detection Dismissed',
                    message: `${detection.vesselId} marked as false positive`
                });
            } else {
                addNotification({
                    type: 'error',
                    title: 'Update Failed',
                    message: result.error || 'Could not update detection'
                });
            }
        } else {
            addNotification({
                type: 'info',
                title: 'Detection Dismissed',
                message: `${detection.vesselId} marked as false positive`
            });
        }
    };

    const handleToggleLive = () => {
        setIsLive(!isLive);
        addNotification({
            type: 'info',
            title: isLive ? 'Stream Paused' : 'Stream Active',
            message: isLive ? 'Data stream paused' : 'Real-time data stream resumed'
        });
    };

    const handleApplyFilters = (newFilters) => {
        setFilters(newFilters);
        addNotification({
            type: 'info',
            title: 'Filters Applied',
            message: `Now showing ${filteredDetections.length} detections`
        });
    };

    // Navigation handlers
    const currentIndex = filteredDetections.findIndex(d => d.vesselId === selectedDetection?.vesselId);
    const handleNext = () => {
        if (currentIndex < filteredDetections.length - 1) {
            setSelectedDetection(filteredDetections[currentIndex + 1]);
        }
    };
    const handlePrevious = () => {
        if (currentIndex > 0) {
            setSelectedDetection(filteredDetections[currentIndex - 1]);
        }
    };

    // Keyboard shortcuts
    useKeyboardShortcuts({
        onToggleAnalytics: () => setView(view === 'map' ? 'analytics' : 'map'),
        onNext: handleNext,
        onPrevious: handlePrevious,
        onEscape: () => setSelectedDetection(null),
        onShowHelp: () => setShowHelp(true),
    });

    return (
        <div className="flex flex-col h-screen bg-charcoal">
            {/* System Status Bar */}
            <SystemStatusBar
                sarIngestionStatus="active"
                aisIngestionStatus="active"
                lastRefresh={lastRefresh}
                isLive={isLive}
                onToggleLive={handleToggleLive}
            />

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Filters & Detection List */}
                <div className="w-80 border-r border-[#333] flex flex-col bg-[#1A1A1A]">
                    <div className="p-3 border-b border-[#333]">
                        <AdvancedFilterPanel
                            onApplyFilters={handleApplyFilters}
                            detections={filteredDetections}
                        />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <DetectionList
                            detections={filteredDetections}
                            selectedDetection={selectedDetection}
                            onSelect={setSelectedDetection}
                        />
                    </div>
                </div>

                {/* Center -  Map/Analytics View + Add Detection Button */}
                <div className="flex-1 flex flex-col">
                    {/* View Toggle + Add Detection */}
                    <div className="flex items-center justify-between p-4 border-b border-[#333]">
                        {/* View Toggle Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setView('map')}
                                className={`px-6 py-2.5 rounded font-semibold text-sm transition-all ${view === 'map'
                                    ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg'
                                    : 'bg-[#262626] text-zinc-400 hover:bg-[#2A2A2A] border border-zinc-700'
                                    }`}
                            >
                                🗺️ Map View
                            </button>
                            <button
                                onClick={() => setView('analytics')}
                                className={`px-6 py-2.5 rounded font-semibold text-sm transition-all ${view === 'analytics'
                                    ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg'
                                    : 'bg-[#262626] text-zinc-400 hover:bg-[#2A2A2A] border border-zinc-700'
                                    }`}
                            >
                                📊 Analytics
                            </button>
                        </div>

                        {/* Add Detection Button */}
                        <button
                            onClick={() => setShowAddModal(true)}
                            disabled={!usingSupabase}
                            className="px-6 py-2.5 rounded font-semibold text-sm bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-400 disabled:from-zinc-700 disabled:to-zinc-600 disabled:text-zinc-400 disabled:cursor-not-allowed shadow-lg transition-all flex items-center gap-2"
                            title={!usingSupabase ? 'Configure Supabase to enable manual entry' : 'Add manual detection'}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Detection
                        </button>
                    </div>

                    {/* Map or Analytics Content */}
                    <div className="flex-1 relative">
                        {/* Help Button */}
                        <button
                            onClick={() => setShowHelp(true)}
                            className="absolute top-4 right-4 px-3 py-2 bg-[#262626] text-zinc-400 border border-zinc-700 hover:border-zinc-600 rounded font-semibold text-sm transition-colors z-10"
                            title="Keyboard Shortcuts (Press ?)"
                        >
                            ?
                        </button>

                        {view === 'map' ? (
                            <Map
                                detections={filteredDetections}
                                marineProtectedAreas={marineProtectedAreas}
                                onVesselSelect={setSelectedDetection}
                            />
                        ) : (
                            <AnalyticsDashboard detections={filteredDetections} />
                        )}
                    </div>
                </div>

                {/* Right Sidebar - Detection Detail & Export */}
                <div className="w-96 border-l border-[#333] flex flex-col bg-[#1A1A1A]">
                    <div className="flex-1 overflow-hidden">
                        <DetectionDetailPanel
                            detection={selectedDetection}
                            onConfirmAnomaly={handleConfirmAnomaly}
                            onDismissFalsePositive={handleDismissFalsePositive}
                            onClose={() => setSelectedDetection(null)}
                        />
                    </div>
                    <div className="p-3 border-t border-[#333]">
                        <ExportPanel
                            detections={filteredDetections}
                            selectedDetections={selectedDetection ? [selectedDetection] : []}
                        />
                    </div>
                </div>
            </div>

            {/* Keyboard Shortcuts Help */}
            {showHelp && (
                <KeyboardShortcutsHelp onClose={() => setShowHelp(false)} />
            )}

            {/* Add Detection Modal */}
            {showAddModal && (
                <AddDetectionModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={(detection) => {
                        addNotification({
                            type: 'success',
                            title: 'Detection Added',
                            message: `${detection.vessel_id} successfully added to database`
                        });
                        setShowAddModal(false);
                    }}
                />
            )}

            {/* Split View Analyzer */}
            {analyzingVessel && (
                <SplitViewAnalyzer
                    detection={analyzingVessel}
                    onClose={() => setAnalyzingVessel(null)}
                />
            )}
        </div >
    );
}

function AnalystView() {
    return (
        <NotificationProvider>
            <AnalystViewContent />
        </NotificationProvider>
    );
}

export default AnalystView;
