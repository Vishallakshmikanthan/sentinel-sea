import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Bulk Actions Panel - Select multiple detections and perform actions
 */
const BulkActionsPanel = ({ selectedDetections, onClearSelection, onSuccess }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    if (!selectedDetections || selectedDetections.length === 0) return null;

    const handleBulkConfirm = async () => {
        if (!isSupabaseConfigured()) return;
        setIsProcessing(true);

        try {
            const ids = selectedDetections.map(d => d._supabaseId).filter(Boolean);

            // Update all selected detections
            const { error } = await supabase
                .from('vessel_detections')
                .update({ review_status: 'confirmed', reviewed_at: new Date().toISOString(), reviewed_by: 'analyst-001' })
                .in('id', ids);

            if (error) throw error;

            // Log analyst actions
            const actions = ids.map(id => ({
                vessel_detection_id: id,
                action_type: 'confirm_anomaly',
                analyst_id: 'analyst-001'
            }));

            await supabase.from('analyst_actions').insert(actions);

            onSuccess && onSuccess('confirmed', selectedDetections.length);
            onClearSelection();
        } catch (err) {
            console.error('Bulk confirm error:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBulkDismiss = async () => {
        if (!isSupabaseConfigured()) return;
        setIsProcessing(true);

        try {
            const ids = selectedDetections.map(d => d._supabaseId).filter(Boolean);

            const { error } = await supabase
                .from('vessel_detections')
                .update({ review_status: 'dismissed', reviewed_at: new Date().toISOString(), reviewed_by: 'analyst-001' })
                .in('id', ids);

            if (error) throw error;

            const actions = ids.map(id => ({
                vessel_detection_id: id,
                action_type: 'dismiss_false_positive',
                analyst_id: 'analyst-001'
            }));

            await supabase.from('analyst_actions').insert(actions);

            onSuccess && onSuccess('dismissed', selectedDetections.length);
            onClearSelection();
        } catch (err) {
            console.error('Bulk dismiss error:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBulkTag = async (tag) => {
        if (!isSupabaseConfigured()) return;
        setIsProcessing(true);

        try {
            const ids = selectedDetections.map(d => d._supabaseId).filter(Boolean);

            const tags = ids.map(id => ({
                vessel_detection_id: id,
                tag: tag,
                added_by: 'analyst-001'
            }));

            const { error } = await supabase.from('detection_tags').insert(tags);

            if (error) throw error;

            onSuccess && onSuccess('tagged', selectedDetections.length);
        } catch (err) {
            console.error('Bulk tag error:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#1A1A1A] border border-zinc-700 rounded-lg shadow-2xl p-4 z-[1000] animate-slide-up">
            <div className="flex items-center gap-4">
                {/* Selection Info */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <span className="text-orange-400 font-bold text-sm">{selectedDetections.length}</span>
                    </div>
                    <span className="text-sm text-zinc-300 font-medium">
                        {selectedDetections.length} detection{selectedDetections.length !== 1 ? 's' : ''} selected
                    </span>
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-zinc-700"></div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={handleBulkConfirm}
                        disabled={isProcessing || !isSupabaseConfigured()}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Confirm All
                    </button>

                    <button
                        onClick={handleBulkDismiss}
                        disabled={isProcessing || !isSupabaseConfigured()}
                        className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 text-sm font-semibold rounded transition-colors"
                    >
                        Dismiss All
                    </button>

                    {/* Tag Dropdown */}
                    <div className="relative group">
                        <button
                            disabled={isProcessing || !isSupabaseConfigured()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Tag All
                        </button>

                        {/* Dropdown Menu */}
                        <div className="absolute bottom-full mb-2 left-0 bg-[#262626] border border-zinc-700 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all w-48">
                            {['fishing', 'cargo', 'suspicious', 'verified', 'priority', 'follow_up_required'].map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => handleBulkTag(tag)}
                                    className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 first:rounded-t last:rounded-b transition-colors"
                                >
                                    {tag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-zinc-700"></div>

                {/* Clear Selection */}
                <button
                    onClick={onClearSelection}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                    title="Clear selection"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default BulkActionsPanel;
