import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AddDetectionModal = ({ onClose, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        vesselId: '',
        latitude: '',
        longitude: '',
        aisStatus: 'OFF',
        vesselSize: 'Medium (30-40m)',
        threatScore: 50,
        insideMPA: false,
        mpaName: '',
        maritimeZone: 'Bay of Bengal',
        sarArea: '',
        sarIntensity: '',
        sarElongation: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const generateVesselId = () => {
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `VSL-${date}-M${random}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!isSupabaseConfigured()) {
            setError('Supabase not configured. Please add credentials to .env file.');
            return;
        }

        // Validation
        if (!formData.latitude || !formData.longitude) {
            setError('Latitude and Longitude are required');
            return;
        }

        const lat = parseFloat(formData.latitude);
        const lon = parseFloat(formData.longitude);

        if (isNaN(lat) || lat < -90 || lat > 90) {
            setError('Latitude must be between -90 and 90');
            return;
        }

        if (isNaN(lon) || lon < -180 || lon > 180) {
            setError('Longitude must be between -180 and 180');
            return;
        }

        setIsSubmitting(true);

        try {
            const detectionData = {
                vessel_id: formData.vesselId || generateVesselId(),
                latitude: lat,
                longitude: lon,
                ais_status: formData.aisStatus,
                vessel_size: formData.vesselSize,
                threat_score: parseInt(formData.threatScore),
                inside_mpa: formData.insideMPA,
                mpa_name: formData.insideMPA ? formData.mpaName : null,
                maritime_zone: formData.maritimeZone,
                sar_area: formData.sarArea ? parseFloat(formData.sarArea) : null,
                sar_intensity: formData.sarIntensity ? parseFloat(formData.sarIntensity) : null,
                sar_elongation: formData.sarElongation ? parseFloat(formData.sarElongation) : null,
                detection_source: 'Manual Entry',
                review_status: 'pending'
            };

            const { data, error: insertError } = await supabase
                .from('vessel_detections')
                .insert([detectionData])
                .select();

            if (insertError) throw insertError;

            onSuccess && onSuccess(data[0]);
            onClose();
        } catch (err) {
            console.error('Error inserting detection:', err);
            setError(err.message || 'Failed to save detection');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[#1A1A1A] border border-zinc-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="sticky top-0 bg-[#1A1A1A] border-b border-zinc-800 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-100">Add Manual Detection</h2>
                        <p className="text-sm text-zinc-500 mt-1">Enter vessel sighting information</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded p-4 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Location */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Location</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-2">
                                    Latitude * <span className="text-zinc-600">(e.g., 9.1234)</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    name="latitude"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-zinc-700 rounded text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                                    placeholder="9.1234"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-2">
                                    Longitude * <span className="text-zinc-600">(e.g., 79.5678)</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    name="longitude"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-zinc-700 rounded text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                                    placeholder="79.5678"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vessel Details */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Vessel Information</h3>

                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-2">
                                Vessel ID <span className="text-zinc-600">(Leave blank for auto-generate)</span>
                            </label>
                            <input
                                type="text"
                                name="vesselId"
                                value={formData.vesselId}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-[#0A0A0A] border border-zinc-700 rounded text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                                placeholder="VSL-20260130-M001"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-2">AIS Status</label>
                                <select
                                    name="aisStatus"
                                    value={formData.aisStatus}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-zinc-700 rounded text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                                >
                                    <option value="OFF">OFF (Dark Vessel)</option>
                                    <option value="ON">ON (Cooperative)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-2">Vessel Size</label>
                                <select
                                    name="vesselSize"
                                    value={formData.vesselSize}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-zinc-700 rounded text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                                >
                                    <option value="Small (15-25m)">Small (15-25m)</option>
                                    <option value="Medium (30-40m)">Medium (30-40m)</option>
                                    <option value="Large (45-60m)">Large (45-60m)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-2">
                                Threat Score: {formData.threatScore}%
                            </label>
                            <input
                                type="range"
                                name="threatScore"
                                min="0"
                                max="100"
                                value={formData.threatScore}
                                onChange={handleChange}
                                className="w-full accent-orange-500"
                            />
                            <div className="flex justify-between text-xs text-zinc-600 mt-1">
                                <span>Low</span>
                                <span>Medium</span>
                                <span>High</span>
                            </div>
                        </div>
                    </div>

                    {/* MPA Status */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Protected Area</h3>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="insideMPA"
                                checked={formData.insideMPA}
                                onChange={handleChange}
                                className="w-4 h-4 rounded border-zinc-700 bg-[#0A0A0A] text-orange-500 focus:ring-orange-500"
                            />
                            <label className="text-sm text-zinc-300">Inside Marine Protected Area</label>
                        </div>

                        {formData.insideMPA && (
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-2">MPA Name</label>
                                <input
                                    type="text"
                                    name="mpaName"
                                    value={formData.mpaName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-zinc-700 rounded text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                                    placeholder="Gulf of Mannar Marine National Park"
                                />
                            </div>
                        )}
                    </div>

                    {/* SAR Features (Optional) */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
                            SAR Features <span className="text-zinc-600 font-normal">(Optional)</span>
                        </h3>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-2">Area (m²)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="sarArea"
                                    value={formData.sarArea}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-zinc-700 rounded text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                                    placeholder="250.50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-2">Intensity (dB)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="sarIntensity"
                                    value={formData.sarIntensity}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-zinc-700 rounded text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                                    placeholder="-14.5"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-2">Elongation</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="sarElongation"
                                    value={formData.sarElongation}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-zinc-700 rounded text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                                    placeholder="2.8"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-6 border-t border-zinc-800">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="spinner"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Add Detection
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-[#262626] hover:bg-zinc-800 disabled:opacity-50 text-zinc-400 rounded font-semibold text-sm border border-zinc-700 hover:border-zinc-600 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddDetectionModal;
