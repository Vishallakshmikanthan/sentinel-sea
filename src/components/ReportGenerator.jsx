import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

/**
 * Report Generator - Create and export surveillance reports
 */
const ReportGenerator = ({ detections, onClose }) => {
    const [reportType, setReportType] = useState('daily');
    const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
    const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
    const [title, setTitle] = useState('Maritime Surveillance Report');
    const [generating, setGenerating] = useState(false);

    const generateReport = async () => {
        setGenerating(true);

        try {
            // Filter detections by date range
            const filteredData = detections.filter(d => {
                const detectionDate = new Date(d.timestamp);
                return detectionDate >= new Date(dateFrom) && detectionDate <= new Date(dateTo + 'T23:59:59');
            });

            // Calculate statistics
            const stats = {
                total: filteredData.length,
                highThreat: filteredData.filter(d => d.threatScore >= 70).length,
                mpaIntrusions: filteredData.filter(d => d.insideMPA).length,
                darkVessels: filteredData.filter(d => d.aisStatus === 'OFF').length,
                avgThreat: (filteredData.reduce((sum, d) => sum + d.threatScore, 0) / filteredData.length || 0).toFixed(2)
            };

            // Generate PDF
            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.setTextColor(255, 107, 0); // Orange
            doc.text(title, 20, 20);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Report Period: ${format(new Date(dateFrom), 'MMM dd, yyyy')} - ${format(new Date(dateTo), 'MMM dd, yyyy')}`, 20, 30);
            doc.text(`Generated: ${format(new Date(), 'MMM dd, yyyy  HH:mm')}`, 20, 36);
            doc.text('System: Sentinel-Sea Maritime Surveillance', 20, 42);

            // Executive Summary
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text('Executive Summary', 20, 55);

            doc.setFontSize(10);
            const summaryData = [
                ['Total Detections', stats.total.toString()],
                ['High Threat Detections (≥70%)', stats.highThreat.toString()],
                ['MPA Intrusions', stats.mpaIntrusions.toString()],
                ['Dark Vessels (AIS OFF)', stats.darkVessels.toString()],
                ['Average Threat Score', stats.avgThreat + '%']
            ];

            doc.autoTable({
                startY: 60,
                head: [['Metric', 'Value']],
                body: summaryData,
                theme: 'grid',
                headStyles: { fillColor: [255, 107, 0], textColor: 255 },
                styles: { fontSize: 10 }
            });

            // Detection Details Table
            doc.setFontSize(14);
            doc.text('Detection Details', 20, doc.lastAutoTable.finalY + 15);

            const tableData = filteredData.slice(0, 50).map(d => [
                d.vesselId,
                format(new Date(d.timestamp), 'MMM dd HH:mm'),
                d.aisStatus,
                `${d.threatScore}%`,
                d.insideMPA ? 'Yes' : 'No',
                d.reviewStatus || 'Pending'
            ]);

            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 20,
                head: [['Vessel ID', 'Time', 'AIS', 'Threat', 'In MPA', 'Status']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [40, 40, 40], textColor: 255 },
                styles: { fontSize: 8 },
                columnStyles: {
                    3: {
                        textColor: (rowIndex, columnIndex, cellValue) => {
                            const threat = parseInt(cellValue);
                            return threat >= 70 ? [255, 0, 0] : threat >= 40 ? [255, 165, 0] : [0, 128, 0];
                        }
                    }
                }
            });

            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(
                    `Page ${i} of ${pageCount} | Sentinel-Sea © ${new Date().getFullYear()}`,
                    105,
                    290,
                    { align: 'center' }
                );
            }

            // Save PDF
            const filename = `sentinel-sea-report-${dateFrom}-to-${dateTo}.pdf`;
            doc.save(filename);

            // Save to Supabase if configured
            if (isSupabaseConfigured()) {
                const { error } = await supabase.from('generated_reports').insert([{
                    report_type: reportType,
                    report_title: title,
                    date_from: dateFrom,
                    date_to: dateTo,
                    summary: `Generated report covering ${stats.total} detections with ${stats.highThreat} high-threat alerts.`,
                    total_detections: stats.total,
                    high_threat_count: stats.highThreat,
                    mpa_intrusions: stats.mpaIntrusions,
                    dark_vessels: stats.darkVessels,
                    avg_threat_score: parseFloat(stats.avgThreat),
                    report_data: stats,
                    generated_by: 'analyst-001'
                }]);

                if (error) console.error('Error saving report:', error);
            }

            onClose();
        } catch (err) {
            console.error('Error generating report:', err);
            alert('Failed to generate report. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-[#1A1A1A] border border-zinc-800 rounded-lg shadow-2xl max-w-lg w-full">
                {/* Header */}
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-100">Generate Report</h2>
                        <p className="text-sm text-zinc-500 mt-1">Create PDF surveillance report</p>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                    {/* Report Title */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-2">Report Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-[#0A0A0A] border border-zinc-700 rounded text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                        />
                    </div>

                    {/* Report Type */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-2">Report Type</label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="w-full px-3 py-2 bg-[#0A0A0A] border border-zinc-700 rounded text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                        >
                            <option value="daily">Daily Report</option>
                            <option value="weekly">Weekly Report</option>
                            <option value="monthly">Monthly Report</option>
                            <option value="custom">Custom Period</option>
                            <option value="incident">Incident Report</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-2">From Date</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full px-3 py-2 bg-[#0A0A0A] border border-zinc-700 rounded text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-2">To Date</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full px-3 py-2 bg-[#0A0A0A] border border-zinc-700 rounded text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 text-xs text-blue-400">
                        📄 Report will include detection summary, statistics, and detailed table (max 50 entries)
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-zinc-800 flex gap-3">
                    <button
                        onClick={generateReport}
                        disabled={generating}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        {generating ? (
                            <>
                                <div className="spinner"></div>
                                Generating...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Generate PDF Report
                            </>
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={generating}
                        className="px-6 py-3 bg-[#262626] hover:bg-zinc-800 disabled:opacity-50 text-zinc-400 rounded font-semibold text-sm border border-zinc-700 hover:border-zinc-600 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportGenerator;
