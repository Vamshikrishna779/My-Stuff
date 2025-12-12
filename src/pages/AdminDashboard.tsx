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
    RefreshCw,
    Monitor,
    Trash2,
    Search,
    Shield,
    ShieldAlert,
    CheckCircle,
    XCircle,
    Mail
} from 'lucide-react';
import { ref, onValue, query, orderByChild, limitToLast, type DataSnapshot, off, get, update, remove, serverTimestamp as rtdbTimestamp } from 'firebase/database';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { rtdb } from '../config/firebase';
import './AdminDashboard.css';

interface Metrics {
    userCount: number;
    installCount: number;
    monthlyActiveUsers: number;
    liveUsers?: number; // New field
    lastUpdated: any;
}

interface RecentUser {
    uid: string;
    email: string;
    displayName: string;
    createdAt: any;
    lastLogin: any;
    deviceInfo?: any;
    isBlocked?: boolean;
    emailVerified?: boolean;
    providerId?: string;
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
    const [syncing, setSyncing] = useState(false);
    const [usersLimit, setUsersLimit] = useState(20);
    const [installsLimit, setInstallsLimit] = useState(20);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
    const [selectedUser, setSelectedUser] = useState<RecentUser | null>(null);

    // Manual Sync for "Ghost Counts"
    const handleRecalculateMetrics = async () => {
        if (syncing) return;
        setSyncing(true);
        try {
            // Fetch real counts
            const usersSnap = await get(ref(rtdb, 'users'));
            const installsSnap = await get(ref(rtdb, 'installs'));

            const realUserCount = usersSnap.size;
            const realInstallCount = installsSnap.size;

            // Update dashboard metrics
            await update(ref(rtdb, 'dashboard/metrics'), {
                userCount: realUserCount,
                installCount: realInstallCount,
                lastUpdated: rtdbTimestamp()
            });

            console.log('Metrics synced successfully:', { realUserCount, realInstallCount });
            alert(`Synced! Users: ${realUserCount}, Installs: ${realInstallCount}`);
        } catch (error) {
            console.error('Error syncing metrics:', error);
            alert('Failed to sync metrics');
        } finally {
            setSyncing(false);
        }
    };

    // Prune Inactive Installs (> 60 days)
    const handlePruneInstalls = async () => {
        if (!window.confirm('Are you sure you want to delete installs inactive for > 60 days? This cannot be undone.')) {
            return;
        }

        setSyncing(true);
        try {
            const installsRef = ref(rtdb, 'installs');
            const snapshot = await get(installsRef);

            if (!snapshot.exists()) {
                alert('No installs found.');
                setSyncing(false);
                return;
            }

            let deletedCount = 0;
            const now = Date.now();
            const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;
            // const sixtyDaysMs = 0; // DEBUG: Delete all for testing

            const updates: Record<string, null> = {};

            snapshot.forEach((child) => {
                const val = child.val();
                let lastActiveTime = 0;

                // Handle serverTimestamp which might be a number or not present
                if (typeof val.lastActive === 'number') {
                    lastActiveTime = val.lastActive;
                } else if (val.installedAt && typeof val.installedAt === 'number') {
                    lastActiveTime = val.installedAt;
                }

                // If inactive for > 60 days
                if (now - lastActiveTime > sixtyDaysMs) {
                    updates[child.key!] = null;
                    deletedCount++;
                }
            });

            if (deletedCount > 0) {
                await update(installsRef, updates);
                // Trigger sync to update counts
                handleRecalculateMetrics();
                alert(`Cleaned up ${deletedCount} inactive installs.`);
            } else {
                alert('No inactive installs found (older than 60 days).');
            }

        } catch (error) {
            console.error('Error pruning installs:', error);
            alert('Failed to prune installs');
        } finally {
            setSyncing(false);
        }
    };

    // 1. Static Listeners (Metrics, Analyics, Presence)
    useEffect(() => {
        const metricsRef = ref(rtdb, 'dashboard/metrics');
        const handleMetrics = (snapshot: DataSnapshot) => {
            if (snapshot.exists()) {
                setMetrics(snapshot.val() as Metrics);
            }
        };
        onValue(metricsRef, handleMetrics);

        const presenceRef = ref(rtdb, 'status/online');
        onValue(presenceRef, (snapshot) => {
            if (snapshot.exists()) {
                setMetrics(prev => ({ ...prev, liveUsers: snapshot.size }));
            } else {
                setMetrics(prev => ({ ...prev, liveUsers: 0 }));
            }
        });

        const analyticsQuery = query(ref(rtdb, 'analytics/daily'), limitToLast(30));
        const handleAnalytics = (snapshot: DataSnapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const analyticsArray = Object.values(data) as DailyAnalytics[];
                const sorted = analyticsArray.sort((a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                );
                setDailyAnalytics(sorted);
            } else {
                setDailyAnalytics([]);
            }
        };
        onValue(analyticsQuery, handleAnalytics);

        return () => {
            off(metricsRef);
            off(presenceRef);
            off(analyticsQuery);
        };
    }, []);

    // 2. Users Listener (Dynamic Limit)
    useEffect(() => {
        const usersRef = query(ref(rtdb, 'users'), orderByChild('createdAt'), limitToLast(usersLimit));
        const handleUsers = (snapshot: DataSnapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const usersList = Object.values(data) as RecentUser[];
                const sorted = usersList.sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setRecentUsers(sorted);
                setLoading(false);
            } else {
                setRecentUsers([]);
                setLoading(false);
            }
        };
        onValue(usersRef, handleUsers);
        return () => off(usersRef);
    }, [usersLimit]);

    // 3. Installs Listener (Dynamic Limit)
    useEffect(() => {
        const installsRef = query(ref(rtdb, 'installs'), orderByChild('installedAt'), limitToLast(installsLimit));
        const handleInstalls = (snapshot: DataSnapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const installs = Object.values(data)
                    .map((install: any) => ({
                        ...install,
                        installId: install.installId || install.id
                    }))
                    .sort((a: any, b: any) => b.installedAt - a.installedAt);
                setRecentInstalls(installs);
            } else {
                setRecentInstalls([]);
            }
        };
        onValue(installsRef, handleInstalls);
        return () => off(installsRef);
    }, [installsLimit]);

    const formatDate = (timestamp: any): string => {
        if (!timestamp) return 'N/A';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleString();
        } catch {
            return 'Invalid date';
        }
    };

    const getPlatformIcon = (platform: string) => {
        const p = (platform || '').toLowerCase();
        if (p.includes('win') || p.includes('desktop') || p.includes('mac') || p.includes('linux')) {
            return <Monitor size={14} />;
        }
        return <Smartphone size={14} />;
    };



    // Helper: Map Timezone to Flag
    const getCountryFlag = (timezone: string) => {
        if (!timezone) return '🌍';
        if (timezone.includes('Kolkata') || timezone.includes('India')) return '🇮🇳';
        if (timezone.includes('America') || timezone.includes('US')) return '🇺🇸';
        if (timezone.includes('London') || timezone.includes('Europe')) return '🇪🇺';
        if (timezone.includes('Sydney') || timezone.includes('Australia')) return '🇦🇺';
        if (timezone.includes('Tokyo')) return '🇯🇵';
        return '🌍';
    };

    // Action: Delete User
    const handleDeleteUser = async (uid: string) => {
        if (!confirm('Are you sure you want to delete this user? This removes them from the database.')) return;
        try {
            await remove(ref(rtdb, `users/${uid}`));
            alert('User deleted.');
            handleRecalculateMetrics();
        } catch (err) {
            console.error(err);
            alert('Failed to delete user.');
        }
    };

    // Action: Block/Unblock User
    const handleBlockUser = async (user: RecentUser) => {
        const newStatus = !user.isBlocked;
        if (!confirm(`Are you sure you want to ${newStatus ? 'BLOCK' : 'UNBLOCK'} this user?`)) return;
        try {
            await update(ref(rtdb, `users/${user.uid}`), { isBlocked: newStatus });
            alert(`User ${newStatus ? 'blocked' : 'unblocked'}.`);
        } catch (err) {
            console.error(err);
            alert('Failed to update block status.');
        }
    };

    // Filtering & Sorting
    const getFilteredUsers = () => {
        let filtered = [...recentUsers];

        // Search
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter(u =>
                (u.displayName || '').toLowerCase().includes(lower) ||
                (u.email || '').toLowerCase().includes(lower) ||
                (u.uid || '').toLowerCase().includes(lower)
            );
        }

        // Sort
        if (sortConfig) {
            filtered.sort((a: any, b: any) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    };

    const handleSort = (key: string) => {
        setSortConfig(current => {
            if (current?.key === key) {
                return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
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
                <div className="stat-card">
                    <div className="stat-icon users">
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Total Users</h3>
                        <p>{metrics.userCount || 0}</p>
                    </div>
                </div>

                <div className="stat-card highlight-green">
                    <div className="stat-icon">
                        <Globe size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Live Now</h3>
                        <p>{metrics.liveUsers || 0}</p>
                        <span className="stat-label">Online Users</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <Activity size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Installs</h3>
                        <p>{metrics.installCount}</p>
                    </div>
                </div>
            </div>

            {/* Analytics Chart */}
            <div className="admin-section">
                <div className="section-header">
                    <h2>
                        <TrendingUp size={20} />
                        Growth Analytics (Last 30 Days)
                    </h2>
                </div>
                <div className="chart-container" style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dailyAnalytics}>
                            <defs>
                                <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorInstalls" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                            <YAxis stroke="#9ca3af" fontSize={12} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                itemStyle={{ color: '#e5e7eb' }}
                            />
                            <Area type="monotone" dataKey="signups" stroke="#8884d8" fillOpacity={1} fill="url(#colorSignups)" name="Signups" />
                            <Area type="monotone" dataKey="installs" stroke="#82ca9d" fillOpacity={1} fill="url(#colorInstalls)" name="Installs" />
                        </AreaChart>
                    </ResponsiveContainer>
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


            {/* Daily Analytics Chart */}
            {
                dailyAnalytics.length > 0 && (
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
                )
            }

            {/* Recent Users */}
            <div className="admin-section">
                <div className="admin-header">
                    <div>
                        <h1>Admin Dashboard</h1>
                        <p className="admin-subtitle">Platform overview and user analytics</p>
                    </div>
                </div>

                {/* Search & Stats Row */}
                <div className="search-stats-container" style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div className="search-box" style={{ flex: 1, minWidth: '300px' }}>
                        <div className="input-group" style={{ display: 'flex', alignItems: 'center', background: '#1f2937', padding: '10px', borderRadius: '8px' }}>
                            <Search size={20} color="#9ca3af" />
                            <input
                                type="text"
                                placeholder="Search users by name, email, or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ background: 'transparent', border: 'none', color: 'white', marginLeft: '10px', width: '100%', outline: 'none' }}
                            />
                        </div>
                    </div>

                    {/* Platform Distribution Chart */}
                    <div className="platform-chart" style={{ width: '300px', height: '200px', background: '#1f2937', borderRadius: '8px', padding: '10px' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#9ca3af' }}>Platform Distribution</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        {
                                            name: 'Mobile', value: recentInstalls.filter(i => {
                                                const p = (i.deviceInfo?.platform || '').toLowerCase();
                                                return !p.includes('win') && !p.includes('mac') && !p.includes('linux');
                                            }).length
                                        },
                                        {
                                            name: 'Desktop', value: recentInstalls.filter(i => {
                                                const p = (i.deviceInfo?.platform || '').toLowerCase();
                                                return p.includes('win') || p.includes('mac') || p.includes('linux');
                                            }).length
                                        },
                                    ]}
                                    innerRadius={40}
                                    outerRadius={60}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell fill="#8884d8" />
                                    <Cell fill="#82ca9d" />
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#111827', border: 'none' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="admin-header">
                    <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
                        <button
                            className="admin-action-btn"
                            onClick={handleRecalculateMetrics}
                            disabled={syncing}
                            title="Force update of User/Install counts from database"
                        >
                            <RefreshCw size={18} className={syncing ? 'spin' : ''} />
                            {syncing ? 'Syncing...' : 'Sync Counts'}
                        </button>
                        <button className="download-btn">
                            <Download size={18} />
                            Export Data
                        </button>
                    </div>
                </div>
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>Email ↕</th>
                                <th onClick={() => handleSort('displayName')} style={{ cursor: 'pointer' }}>Name ↕</th>
                                <th>Platform</th>
                                <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }}>Joined ↕</th>
                                <th>Verified</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getFilteredUsers().map(user => (
                                <tr key={user.uid} style={{ opacity: user.isBlocked ? 0.5 : 1 }}>
                                    <td className="email-cell">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {user.providerId?.includes('google') ? <span title="Google">G</span> : <Mail size={14} />}
                                            {user.email}
                                        </div>
                                    </td>
                                    <td>
                                        <div
                                            style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                                            onClick={() => setSelectedUser(user)}
                                        >
                                            <span style={{ fontWeight: 'bold', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span>{getCountryFlag(user.deviceInfo?.timezone)}</span>
                                                {user.displayName || 'N/A'}
                                            </span>
                                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>{user.deviceInfo?.timezone || ''}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="platform-badge">
                                            {getPlatformIcon(user.deviceInfo?.platform)}
                                            {user.deviceInfo?.platform || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="date-cell">
                                        {formatRelativeTime(user.createdAt)}
                                    </td>
                                    <td>
                                        {user.emailVerified ?
                                            <span title="Verified"><CheckCircle size={16} color="#10b981" /></span> :
                                            <span title="Not Verified"><XCircle size={16} color="#ef4444" /></span>
                                        }
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => handleBlockUser(user)}
                                                className="icon-btn"
                                                title={user.isBlocked ? "Unblock User" : "Block User"}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: user.isBlocked ? '#10b981' : '#f59e0b' }}
                                            >
                                                {user.isBlocked ? <Shield size={18} /> : <ShieldAlert size={18} />}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.uid)}
                                                className="icon-btn"
                                                title="Delete User"
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {recentUsers.length === 0 ? (
                        <div className="empty-state">
                            <Users size={48} />
                            <p>No users yet</p>
                        </div>
                    ) : (
                        <div className="pagination-container">
                            <button
                                className="load-more-btn"
                                onClick={() => setUsersLimit(prev => prev + 20)}
                            >
                                Load More Users ({usersLimit} visible)
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Installs */}
            <div className="admin-section">
                <div className="section-header">
                    <h2>
                        <Globe size={20} />
                        Installation History ({recentInstalls.filter(i => i.version).length})
                    </h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            className="export-btn"
                            onClick={handlePruneInstalls}
                            type="button"
                            title="Delete installs inactive > 60 days"
                            style={{ backgroundColor: '#ef4444', border: 'none', color: 'white' }}
                        >
                            <Trash2 size={16} />
                            Prune Inactive
                        </button>
                        <button className="export-btn" onClick={exportInstallsCSV} type="button">
                            <Download size={16} />
                            Export CSV
                        </button>
                    </div>
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
                                    <td className="mono-cell" title={install.installId}>
                                        <span className="id-badge">
                                            #{(install.installId || '').split('_').pop()?.toUpperCase().substring(0, 8) || 'UNKNOWN'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="platform-badge">
                                            {getPlatformIcon(install.deviceInfo?.platform)}
                                            {install.deviceInfo?.platform || 'Unknown'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`pwa-badge ${install.deviceInfo?.isPWA ? 'yes' : 'no'}`}>
                                            {install.deviceInfo?.isPWA ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ color: install.version ? 'inherit' : '#ef4444' }}>
                                            {install.version || 'Not Installed'}
                                        </span>
                                    </td>
                                    <td className="date-cell">{formatRelativeTime(install.installedAt)}</td>
                                    <td className="date-cell">{formatRelativeTime(install.lastActive)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {recentInstalls.length === 0 ? (
                        <div className="empty-state">
                            <Download size={48} />
                            <p>No installs yet</p>
                        </div>
                    ) : (
                        <div className="pagination-container">
                            <button
                                className="load-more-btn"
                                onClick={() => setInstallsLimit(prev => prev + 20)}
                            >
                                Load More Installs ({installsLimit} visible)
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {/* User Details Modal */}
            {selectedUser && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setSelectedUser(null)}>
                    <div className="modal-content" style={{
                        backgroundColor: '#1f2937', padding: '24px', borderRadius: '12px',
                        maxWidth: '500px', width: '90%', color: 'white', border: '1px solid #374151'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0 }}>{selectedUser.displayName}</h2>
                            <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ color: '#9ca3af', fontSize: '12px' }}>Email</label>
                                <p>{selectedUser.email}</p>
                            </div>
                            <div>
                                <label style={{ color: '#9ca3af', fontSize: '12px' }}>UID</label>
                                <p style={{ fontSize: '12px', fontFamily: 'monospace' }}>{selectedUser.uid}</p>
                            </div>
                            <div>
                                <label style={{ color: '#9ca3af', fontSize: '12px' }}>Provider</label>
                                <p>{selectedUser.providerId || 'password'}</p>
                            </div>
                            <div>
                                <label style={{ color: '#9ca3af', fontSize: '12px' }}>Verified</label>
                                <p>{selectedUser.emailVerified ? 'Yes ✅' : 'No ❌'}</p>
                            </div>
                            <div>
                                <label style={{ color: '#9ca3af', fontSize: '12px' }}>Joined</label>
                                <p>{formatDate(selectedUser.createdAt)}</p>
                            </div>
                            <div>
                                <label style={{ color: '#9ca3af', fontSize: '12px' }}>Last Login</label>
                                <p>{formatDate(selectedUser.lastLogin)}</p>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', borderTop: '1px solid #374151', paddingTop: '16px' }}>
                            <h4 style={{ margin: '0 0 10px 0' }}>Device Info</h4>
                            <pre style={{ background: '#111827', padding: '10px', borderRadius: '6px', fontSize: '12px', overflow: 'auto' }}>
                                {JSON.stringify(selectedUser.deviceInfo, null, 2)}
                            </pre>
                        </div>

                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                onClick={() => {
                                    handleBlockUser(selectedUser);
                                    setSelectedUser(null);
                                }}
                                style={{
                                    padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                    backgroundColor: selectedUser.isBlocked ? '#10b981' : '#f59e0b', color: 'white'
                                }}
                            >
                                {selectedUser.isBlocked ? 'Unblock User' : 'Block User'}
                            </button>
                            <button
                                onClick={() => {
                                    handleDeleteUser(selectedUser.uid);
                                    setSelectedUser(null);
                                }}
                                style={{
                                    padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                    backgroundColor: '#ef4444', color: 'white'
                                }}
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default AdminDashboard;
