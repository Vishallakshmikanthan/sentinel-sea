import React, { useMemo } from 'react';

const AnalyticsDashboard = ({ detections = [] }) => {
    // Calculate statistics
    const stats = useMemo(() => {
        const total = detections.length;
        const anomalous = detections.filter(d => d.aisStatus === 'OFF').length;
        const highThreat = detections.filter(d => d.threatScore >= 70).length;
        const mediumThreat = detections.filter(d => d.threatScore >= 40 && d.threatScore < 70).length;
        const lowThreat = detections.filter(d => d.threatScore < 40).length;
        const inMPA = detections.filter(d => d.inProtectedZone).length;
        const unreviewed = detections.filter(d => !d.reviewed).length;

        // Calculate avg threat score
        const avgThreat = total > 0
            ? Math.round(detections.reduce((sum, d) => sum + d.threatScore, 0) / total)
            : 0;

        // Time-based distribution (last 24 hours)
        const now = new Date();
        const last24h = detections.filter(d => {
            const detTime = new Date(d.timestamp);
            return (now - detTime) / (1000 * 60 * 60) <= 24;
        }).length;

        return {
            total,
            anomalous,
            highThreat,
            mediumThreat,
            lowThreat,
            inMPA,
            unreviewed,
            avgThreat,
            last24h,
            anomalousPercent: total > 0 ? Math.round((anomalous / total) * 100) : 0,
            mpaPercent: total > 0 ? Math.round((inMPA / total) * 100) : 0
        };
    }, [detections]);

    // Chart data for threat distribution
    const threatDistribution = [
        { label: 'High', count: stats.highThreat, color: 'bg-red-500', percent: stats.total > 0 ? (stats.highThreat / stats.total) * 100 : 0 },
        { label: 'Medium', count: stats.mediumThreat, color: 'bg-orange-500', percent: stats.total > 0 ? (stats.mediumThreat / stats.total) * 100 : 0 },
        { label: 'Low', count: stats.lowThreat, color: 'bg-zinc-600', percent: stats.total > 0 ? (stats.lowThreat / stats.total) * 100 : 0 }
    ];

    const StatCard = ({ title, value, subtitle, trend, icon }) => (
        <div className="bg-[#262626] rounded-lg p-4 border border-zinc-800">
            <div className="flex items-start justify-between mb-2">
                <div className="text-zinc-500 text-xs uppercase tracking-wide">{title}</div>
                {icon && <div className="text-zinc-600">{icon}</div>}
            </div>
            <div className="text-3xl font-bold text-zinc-100 mb-1">{value}</div>
            {subtitle && <div className="text-sm text-zinc-400">{subtitle}</div>}
            {trend && (
                <div className={`text-xs mt-2 ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
                    {trend.positive ? '↑' : '↓'} {trend.text}
                </div>
            )}
        </div>
    );

    return (
        <div className="h-full bg-[#1A1A1A] overflow-y-auto">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-100">Analytics Dashboard</h2>
                        <p className="text-sm text-zinc-500 mt-1">Detection statistics and threat assessment overview</p>
                    </div>
                    <div className="text-xs text-zinc-500">
                        Last updated: {new Date().toLocaleTimeString()}
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-4 gap-4">
                    <StatCard
                        title="Total Detections"
                        value={stats.total}
                        subtitle={`${stats.last24h} in last 24h`}
                        icon="📊"
                    />
                    <StatCard
                        title="Anomalous Vessels"
                        value={stats.anomalous}
                        subtitle={`${stats.anomalousPercent}% of total`}
                        icon="⚠️"
                    />
                    <StatCard
                        title="Average Threat"
                        value={`${stats.avgThreat}%`}
                        subtitle={stats.avgThreat >= 50 ? 'Elevated' : 'Normal'}
                        icon="📈"
                    />
                    <StatCard
                        title="Unreviewed"
                        value={stats.unreviewed}
                        subtitle={stats.unreviewed > 0 ? 'Requires attention' : 'All reviewed'}
                        icon="👁️"
                    />
                </div>

                {/* Threat Distribution Chart */}
                <div className="bg-[#262626] rounded-lg p-6 border border-zinc-800">
                    <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-4">
                        Threat Level Distribution
                    </h3>

                    {/* Horizontal Bar Chart */}
                    <div className="space-y-4">
                        {threatDistribution.map((item) => (
                            <div key={item.label}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-zinc-400">{item.label} Threat</span>
                                    <span className="text-sm font-semibold text-zinc-300">
                                        {item.count} ({item.percent.toFixed(1)}%)
                                    </span>
                                </div>
                                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${item.color} transition-all duration-500`}
                                        style={{ width: `${item.percent}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary Stats */}
                    <div className="mt-6 pt-6 border-t border-zinc-800 grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-xs text-zinc-500 mb-1">Critical Priority</div>
                            <div className="text-2xl font-bold text-red-400">{stats.highThreat}</div>
                        </div>
                        <div>
                            <div className="text-xs text-zinc-500 mb-1">Inside MPAs</div>
                            <div className="text-2xl font-bold text-orange-400">
                                {stats.inMPA} <span className="text-sm text-zinc-500">({stats.mpaPercent}%)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AIS Status Breakdown */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#262626] rounded-lg p-6 border border-zinc-800">
                        <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-4">
                            AIS Status
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <span className="text-sm text-zinc-400">AIS OFF</span>
                                </div>
                                <span className="text-lg font-bold text-zinc-100">{stats.anomalous}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-zinc-400">AIS ON</span>
                                </div>
                                <span className="text-lg font-bold text-zinc-100">{stats.total - stats.anomalous}</span>
                            </div>
                        </div>

                        {/* Visual Pie */}
                        <div className="mt-6 flex items-center gap-1 h-4 rounded-full overflow-hidden">
                            <div
                                className="bg-red-500 h-full transition-all duration-500"
                                style={{ width: `${stats.anomalousPercent}%` }}
                                title={`${stats.anomalousPercent}% AIS OFF`}
                            />
                            <div
                                className="bg-green-500 h-full transition-all duration-500"
                                style={{ width: `${100 - stats.anomalousPercent}%` }}
                                title={`${100 - stats.anomalousPercent}% AIS ON`}
                            />
                        </div>
                    </div>

                    <div className="bg-[#262626] rounded-lg p-6 border border-zinc-800">
                        <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-4">
                            Review Status
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm text-zinc-400">Pending</span>
                                </div>
                                <span className="text-lg font-bold text-orange-400">{stats.unreviewed}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-zinc-600 rounded-full"></div>
                                    <span className="text-sm text-zinc-400">Reviewed</span>
                                </div>
                                <span className="text-lg font-bold text-zinc-100">{stats.total - stats.unreviewed}</span>
                            </div>
                        </div>

                        {stats.unreviewed > 0 && (
                            <div className="mt-6 p-3 bg-orange-500/10 border border-orange-500/20 rounded">
                                <p className="text-xs text-orange-400">
                                    <strong>{stats.unreviewed}</strong> detection{stats.unreviewed !== 1 ? 's' : ''} awaiting analyst review
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detection Timeline (Simple) */}
                <div className="bg-[#262626] rounded-lg p-6 border border-zinc-800">
                    <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-4">
                        Detection Activity (Last 24 Hours)
                    </h3>
                    <div className="flex items-end gap-1 h-32">
                        {Array.from({ length: 24 }, (_, i) => {
                            const hourAgo = new Date(Date.now() - i * 60 * 60 * 1000);
                            const hourStart = new Date(hourAgo.getFullYear(), hourAgo.getMonth(), hourAgo.getDate(), hourAgo.getHours());
                            const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

                            const count = detections.filter(d => {
                                const dTime = new Date(d.timestamp);
                                return dTime >= hourStart && dTime < hourEnd;
                            }).length;

                            const maxCount = Math.max(...Array.from({ length: 24 }, (_, j) => {
                                const hAgo = new Date(Date.now() - j * 60 * 60 * 1000);
                                const hStart = new Date(hAgo.getFullYear(), hAgo.getMonth(), hAgo.getDate(), hAgo.getHours());
                                const hEnd = new Date(hStart.getTime() + 60 * 60 * 1000);
                                return detections.filter(d => {
                                    const dTime = new Date(d.timestamp);
                                    return dTime >= hStart && dTime < hEnd;
                                }).length;
                            }), 1);

                            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;

                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                    <div
                                        className="w-full bg-orange-500 rounded-t transition-all duration-300 hover:bg-orange-400"
                                        style={{ height: `${height}%` }}
                                        title={`${count} detection${count !== 1 ? 's' : ''} at ${hourStart.getHours()}:00`}
                                    />
                                </div>
                            );
                        }).reverse()}
                    </div>
                    <div className="flex justify-between text-xs text-zinc-500 mt-2">
                        <span>24h ago</span>
                        <span>Now</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
