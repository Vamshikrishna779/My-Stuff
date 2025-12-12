import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Users,
    Download,
    TrendingUp,
    Activity,
    Calendar,
    Globe,
    Smartphone,
    RefreshCw
} from 'lucide-react';
import { ref, onValue, query, orderByChild, limitToLast, type DataSnapshot, off } from 'firebase/database';
import { rtdb } from '../config/firebase';
import './AdminDashboard.css';

interface Metrics {
    userCount: number;
    installCount: number;
    monthlyActiveUsers: number;
    lastUpdated: any;
}

interface RecentUser {
    uid: string;
    email: string;
    displayName: string;
    createdAt: any;
    lastLogin: any;
    deviceInfo?: any;
}

interface RecentInstall {
    installId: string;
    installedAt: any;
    lastActive: any;
    deviceInfo: any;
    userId?: string;
    version?: string;
}

interface DailyAnalytics {
    date: string;
    signups: number;
    installs: number;
    timestamp: any;
}

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState<Metrics>({
        userCount: 0,
        installCount: 0,
        monthlyActiveUsers: 0,
        lastUpdated: null
    });
    const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
    const [recentInstalls, setRecentInstalls] = useState<RecentInstall[]>([]);
    const [dailyAnalytics, setDailyAnalytics] = useState<DailyAnalytics[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        // 1. Listen to dashboard metrics (RTDB)
        const metricsRef = ref(rtdb, 'dashboard/metrics');
        const handleMetrics = (snapshot: DataSnapshot) => {
            if (snapshot.exists()) {
                setMetrics(snapshot.val() as Metrics);
            }
            setLoading(false);
        };
        onValue(metricsRef, handleMetrics, (error) => {
            console.error('Error listening to metrics:', error);
            setLoading(false);
        });

        // 2. Listen to daily analytics (RTDB) - Get all and slice last 30
        const analyticsRef = ref(rtdb, 'analytics/daily');
        const handleAnalytics = (snapshot: DataSnapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const analyticsArray = Object.values(data) as DailyAnalytics[];
                // Sort by date and take last 30
                const sorted = analyticsArray.sort((a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                );
                setDailyAnalytics(sorted.slice(-30));
            } else {
                setDailyAnalytics([]);
            }
        };
        onValue(analyticsRef, handleAnalytics, (error) => {
            console.error('Error listening to analytics:', error);
        });

        // 3. Listen to recent users (RTDB)
        const usersRef = query(
            ref(rtdb, 'users'),
            orderByChild('createdAt'),
            limitToLast(20)
        );
        const handleUsers = (snapshot: DataSnapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                // Convert object to array and reverse to show newest first
                const users = Object.values(data)
                    .map((user: any) => ({
                        ...user,
                        uid: user.uid // Ensure uid is present
                    }))
                    .sort((a: any, b: any) => b.createdAt - a.createdAt);
                setRecentUsers(users);
            } else {
                setRecentUsers([]);
            }
        };
        onValue(usersRef, handleUsers, (error) => {
            console.error('Error listening to users:', error);
        });

        // 4. Listen to recent installs (RTDB)
        const installsRef = query(
            ref(rtdb, 'installs'),
            orderByChild('installedAt'),
            limitToLast(20)
        );
        const handleInstalls = (snapshot: DataSnapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const installs = Object.values(data)
                    .map((install: any) => ({
                        ...install,
                        installId: install.installId || install.id // Mapped from ID
                    }))
                    .sort((a: any, b: any) => b.installedAt - a.installedAt);
                setRecentInstalls(installs);
            } else {
                setRecentInstalls([]);
            }
        };
        onValue(installsRef, handleInstalls, (error) => {
            console.error('Error listening to installs:', error);
        });

        // Cleanup all listeners
        return () => {
            off(metricsRef, 'value', handleMetrics);
            off(analyticsRef, 'value', handleAnalytics);
            off(usersRef, 'value', handleUsers);
            off(installsRef, 'value', handleInstalls);
        };
    }, []);

    const formatDate = (timestamp: any): string => {
        if (!timestamp) return 'N/A';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleString();
        } catch {
            return 'Invalid date';
        }
    };

    const formatRelativeTime = (timestamp: any): string => {
        if (!timestamp) return 'N/A';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            const now = new Date();
            const diff = now.getTime() - date.getTime();
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);

            if (minutes < 1) return 'Just now';
            if (minutes < 60) return `${minutes}m ago`;
            if (hours < 24) return `${hours}h ago`;
            return `${days}d ago`;
        } catch {
            return 'N/A';
        }
    };

    const exportUsersCSV = () => {
        const headers = ['UID', 'Email', 'Display Name', 'Created At', 'Last Login', 'Platform'];
        const rows = recentUsers.map(u => [
            u.uid,
            u.email,
            u.displayName,
            formatDate(u.createdAt),
            formatDate(u.lastLogin),
            u.deviceInfo?.platform || 'N/A'
        ]);

        const csv = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        downloadCSV(csv, `users_${Date.now()}.csv`);
    };

    const exportInstallsCSV = () => {
        const headers = ['Install ID', 'Installed At', 'Last Active', 'Platform', 'User Agent', 'Version'];
        const rows = recentInstalls.map(i => [
            i.installId,
            formatDate(i.installedAt),
            formatDate(i.lastActive),
            i.deviceInfo?.platform || 'N/A',
            i.deviceInfo?.userAgent || 'N/A',
            i.version || 'N/A'
        ]);

        const csv = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        downloadCSV(csv, `installs_${Date.now()}.csv`);
    };

    const downloadCSV = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleRefresh = () => {
        // Listeners will automatically update with real-time data
    };

    if (loading) {
        return (
            <div className="admin-dashboard loading">
                <div className="loading-spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            {/* Header */}
            <div className="admin-header">
                <button className="back-button" onClick={() => navigate(-1)} type="button">
                    <ArrowLeft size={22} />
                </button>
                <div className="header-content">
                    <h1>Admin Dashboard</h1>
                    <p className="last-refresh">
                        Last updated: {formatRelativeTime(metrics.lastUpdated)}
                    </p>
                </div>
                <button className="refresh-button" onClick={handleRefresh} type="button">
                    <RefreshCw size={20} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Metrics Cards */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon users">
                        <Users size={28} />
                    </div>
                    <div className="metric-content">
                        <div className="metric-value">{metrics.userCount}</div>
                        <div className="metric-label">Total Users</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon installs">
                        <Download size={28} />
                    </div>
                    <div className="metric-content">
                        <div className="metric-value">{metrics.installCount}</div>
                        <div className="metric-label">Total Installs</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon active">
                        <Activity size={28} />
                    </div>
                    <div className="metric-content">
                        <div className="metric-value">{metrics.monthlyActiveUsers || 0}</div>
                        <div className="metric-label">Monthly Active</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon growth">
                        <TrendingUp size={28} />
                    </div>
                    <div className="metric-content">
                        <div className="metric-value">
                            {dailyAnalytics.length > 0 ? dailyAnalytics[dailyAnalytics.length - 1]?.signups || 0 : 0}
                        </div>
                        <div className="metric-label">Signups Today</div>
                    </div>
                </div>
            </div>

            {/* Daily Analytics Chart */}
            {dailyAnalytics.length > 0 && (
                <div className="analytics-section">
                    <h2>
                        <Calendar size={20} />
                        Daily Activity (Last 30 Days)
                    </h2>
                    <div className="chart-container">
                        <div className="simple-chart">
                            {dailyAnalytics.map((day, index) => {
                                const maxValue = Math.max(...dailyAnalytics.map(d => (d.signups || 0) + (d.installs || 0)));
                                const height = maxValue > 0 ? ((day.signups || 0) + (day.installs || 0)) / maxValue * 100 : 0;
                                return (
                                    <div key={index} className="chart-bar-group">
                                        <div className="chart-bar" style={{ height: `${height}%` }}>
                                            <div className="bar-signups" style={{ height: `${(day.signups || 0) / ((day.signups || 0) + (day.installs || 0)) * 100}%` }}></div>
                                            <div className="bar-installs" style={{ height: `${(day.installs || 0) / ((day.signups || 0) + (day.installs || 0)) * 100}%` }}></div>
                                        </div>
                                        <div className="chart-label">{day.date.split('-')[2]}</div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="chart-legend">
                            <div className="legend-item">
                                <div className="legend-color signups"></div>
                                <span>Signups</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color installs"></div>
                                <span>Installs</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Users */}
            <div className="admin-section">
                <div className="section-header">
                    <h2>
                        <Users size={20} />
                        Recent Users ({recentUsers.length})
                    </h2>
                    <button className="export-btn" onClick={exportUsersCSV} type="button">
                        <Download size={16} />
                        Export CSV
                    </button>
                </div>
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Display Name</th>
                                <th>Platform</th>
                                <th>Created</th>
                                <th>Last Login</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentUsers.map(user => (
                                <tr key={user.uid}>
                                    <td className="email-cell">{user.email}</td>
                                    <td>{user.displayName || 'N/A'}</td>
                                    <td>
                                        <span className="platform-badge">
                                            <Smartphone size={14} />
                                            {user.deviceInfo?.platform || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="date-cell">{formatRelativeTime(user.createdAt)}</td>
                                    <td className="date-cell">{formatRelativeTime(user.lastLogin)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {recentUsers.length === 0 && (
                        <div className="empty-state">
                            <Users size={48} />
                            <p>No users yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Installs */}
            <div className="admin-section">
                <div className="section-header">
                    <h2>
                        <Globe size={20} />
                        Recent Installs ({recentInstalls.length})
                    </h2>
                    <button className="export-btn" onClick={exportInstallsCSV} type="button">
                        <Download size={16} />
                        Export CSV
                    </button>
                </div>
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Install ID</th>
                                <th>Platform</th>
                                <th>PWA</th>
                                <th>Version</th>
                                <th>Installed</th>
                                <th>Last Active</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentInstalls.map(install => (
                                <tr key={install.installId}>
                                    <td className="mono-cell">{(install.installId || 'unknown').substring(0, 20)}...</td>
                                    <td>
                                        <span className="platform-badge">
                                            <Smartphone size={14} />
                                            {install.deviceInfo?.platform || 'Unknown'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`pwa-badge ${install.deviceInfo?.isPWA ? 'yes' : 'no'}`}>
                                            {install.deviceInfo?.isPWA ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td>{install.version || 'N/A'}</td>
                                    <td className="date-cell">{formatRelativeTime(install.installedAt)}</td>
                                    <td className="date-cell">{formatRelativeTime(install.lastActive)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {recentInstalls.length === 0 && (
                        <div className="empty-state">
                            <Download size={48} />
                            <p>No installs yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
