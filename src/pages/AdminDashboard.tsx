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
    liveUsers?: number;
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
        liveUsers: 0,
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

            const realUserCount = usersSnap.exists() ? Object.keys(usersSnap.val()).length : 0;
            const realInstallCount = installsSnap.exists() ? Object.keys(installsSnap.val()).length : 0;

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

    // Listeners for metrics, presence, and analytics
    useEffect(() => {
        const metricsRef = ref(rtdb, 'dashboard/metrics');
        const handleMetrics = (snapshot: DataSnapshot) => {
            if (snapshot.exists()) {
                setMetrics(prev => ({ ...prev, ...snapshot.val() }));
            }
        };
        onValue(metricsRef, handleMetrics);

        const presenceRef = ref(rtdb, 'status/online');
        const handlePresence = (snapshot: DataSnapshot) => {
            setMetrics(prev => ({
                ...prev,
                liveUsers: snapshot.exists() ? Object.keys(snapshot.val()).length : 0
            }));
        };
        onValue(presenceRef, handlePresence);

        const analyticsRef = query(ref(rtdb, 'analytics/daily'), limitToLast(30));
        const handleAnalytics = (snapshot: DataSnapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const analyticsArray = Object.entries(data).map(([key, value]) => ({
                    ...value as DailyAnalytics,
                    id: key
                })).sort((a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                );
                setDailyAnalytics(analyticsArray);
            } else {
                setDailyAnalytics([]);
            }
        };
        onValue(analyticsRef, handleAnalytics);

        return () => {
            off(metricsRef);
            off(presenceRef);
            off(analyticsRef);
        };
    }, []);

    // Users Listener
    useEffect(() => {
        const usersRef = query(ref(rtdb, 'users'), orderByChild('createdAt'), limitToLast(usersLimit));
        const handleUsers = (snapshot: DataSnapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const usersList = Object.entries(data).map(([key, value]) => ({
                    uid: key,
                    ...(value as Omit<RecentUser, 'uid'>)
                })).sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setRecentUsers(usersList);
            } else {
                setRecentUsers([]);
            }
            setLoading(false);
        };
        onValue(usersRef, handleUsers);
        return () => off(usersRef);
    }, [usersLimit]);

    // Installs Listener
    useEffect(() => {
        const installsRef = query(ref(rtdb, 'installs'), orderByChild('installedAt'), limitToLast(installsLimit));
        const handleInstalls = (snapshot: DataSnapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const installs = Object.entries(data).map(([key, value]) => ({
                    installId: key,
                    ...(value as Omit<RecentInstall, 'installId'>)
                })).sort((a, b) => b.installedAt - a.installedAt);
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
            const date = typeof timestamp === 'number' ? new Date(timestamp) :
                timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
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

    const getCountryFlag = (timezone: string) => {
        if (!timezone) return '🌍';
        if (timezone.includes('Kolkata') || timezone.includes('India')) return '🇮🇳';
        if (timezone.includes('America') || timezone.includes('US')) return '🇺🇸';
        if (timezone.includes('London') || timezone.includes('Europe')) return '🇪🇺';
        if (timezone.includes('Sydney') || timezone.includes('Australia')) return '🇦🇺';
        if (timezone.includes('Tokyo')) return '🇯🇵';
        return '🌍';
    };

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

    const handleDeleteInstall = async (installId: string) => {
        if (!confirm('Delete this installation record?')) return;
        try {
            await remove(ref(rtdb, `installs/${installId}`));
            alert('Install deleted.');
            handleRecalculateMetrics();
        } catch (err) {
            console.error(err);
            alert('Failed to delete install record.');
        }
    };

    const getFilteredUsers = () => {
        let filtered = [...recentUsers];

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter(u =>
                (u.displayName || '').toLowerCase().includes(lower) ||
                (u.email || '').toLowerCase().includes(lower) ||
                (u.uid || '').toLowerCase().includes(lower)
            );
        }

        if (sortConfig) {
            filtered.sort((a: any, b: any) => {
                const aVal = a[sortConfig.key] || '';
                const bVal = b[sortConfig.key] || '';

                if (sortConfig.key === 'createdAt') {
                    const aDate = new Date(aVal).getTime();
                    const bDate = new Date(bVal).getTime();
                    return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
                }

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
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
            const date = typeof timestamp === 'number' ? new Date(timestamp) :
                timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
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
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `installs_${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleRefresh = () => {
        handleRecalculateMetrics();
    };

    const platformData = [
        {
            name: 'Mobile',
            value: recentInstalls.filter(i => {
                const p = (i.deviceInfo?.platform || '').toLowerCase();
                return !p.includes('win') && !p.includes('mac') && !p.includes('linux') && !p.includes('desktop');
            }).length
        },
        {
            name: 'Desktop',
            value: recentInstalls.filter(i => {
                const p = (i.deviceInfo?.platform || '').toLowerCase();
                return p.includes('win') || p.includes('mac') || p.includes('linux') || p.includes('desktop');
            }).length
        },
    ];

    const COLORS = ['#8884d8', '#82ca9d'];

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
                    <RefreshCw size={20} className={syncing ? 'spin' : ''} />
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

                <div className="stat-card">
                    <div className="stat-icon">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Monthly Active</h3>
                        <p>{metrics.monthlyActiveUsers || 0}</p>
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
                <div className="chart-container">
                    {dailyAnalytics.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
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
                                <XAxis
                                    dataKey="date"
                                    stroke="#9ca3af"
                                    fontSize={12}
                                    tickFormatter={(val) => {
                                        const date = new Date(val);
                                        return `${date.getMonth() + 1}/${date.getDate()}`;
                                    }}
                                />
                                <YAxis stroke="#9ca3af" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e5e7eb' }}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="signups"
                                    stroke="#8884d8"
                                    fillOpacity={1}
                                    fill="url(#colorSignups)"
                                    name="Signups"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="installs"
                                    stroke="#82ca9d"
                                    fillOpacity={1}
                                    fill="url(#colorInstalls)"
                                    name="Installs"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-chart">
                            <p>No analytics data available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Search & Platform Distribution */}
            <div className="admin-section">
                <div className="section-header">
                    <h2>
                        <Users size={20} />
                        Recent Users
                    </h2>
                </div>

                <div className="search-stats-container">
                    <div className="search-box">
                        <div className="input-group">
                            <Search size={20} color="#9ca3af" />
                            <input
                                type="text"
                                placeholder="Search users by name, email, or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="platform-chart">
                        <h4>Platform Distribution</h4>
                        {recentInstalls.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={platformData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={60}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {platformData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-chart">
                                <p>No install data</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="action-buttons">
                    <button
                        className="admin-action-btn"
                        onClick={handleRecalculateMetrics}
                        disabled={syncing}
                    >
                        <RefreshCw size={18} className={syncing ? 'spin' : ''} />
                        {syncing ? 'Syncing...' : 'Sync Counts'}
                    </button>
                </div>

                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                                    Email {sortConfig?.key === 'email' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                                </th>
                                <th onClick={() => handleSort('displayName')} style={{ cursor: 'pointer' }}>
                                    Name {sortConfig?.key === 'displayName' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                                </th>
                                <th>Platform</th>
                                <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }}>
                                    Joined {sortConfig?.key === 'createdAt' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                                </th>
                                <th>Verified</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getFilteredUsers().map(user => (
                                <tr key={user.uid} className={user.isBlocked ? 'blocked-user' : ''}>
                                    <td className="email-cell">
                                        <div className="email-content">
                                            {user.providerId?.includes('google') ?
                                                <span className="google-badge" title="Google">G</span> :
                                                <Mail size={14} />
                                            }
                                            {user.email}
                                        </div>
                                    </td>
                                    <td>
                                        <div
                                            className="user-name-cell"
                                            onClick={() => setSelectedUser(user)}
                                        >
                                            <span className="user-name">{user.displayName || 'N/A'}</span>
                                            <span className="user-timezone">
                                                {getCountryFlag(user.deviceInfo?.timezone)} {user.deviceInfo?.timezone || ''}
                                            </span>
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
                                            <span className="verified-badge" title="Verified">
                                                <CheckCircle size={16} />
                                            </span> :
                                            <span className="not-verified-badge" title="Not Verified">
                                                <XCircle size={16} />
                                            </span>
                                        }
                                    </td>
                                    <td>
                                        <div className="action-buttons-cell">
                                            <button
                                                onClick={() => handleBlockUser(user)}
                                                className="icon-btn"
                                                title={user.isBlocked ? "Unblock User" : "Block User"}
                                            >
                                                {user.isBlocked ? <Shield size={18} /> : <ShieldAlert size={18} />}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.uid)}
                                                className="icon-btn delete-btn"
                                                title="Delete User"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {getFilteredUsers().length === 0 ? (
                        <div className="empty-state">
                            <Users size={48} />
                            <p>No users found</p>
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
                    <div className="section-actions">
                        <button
                            className="export-btn danger"
                            onClick={handlePruneInstalls}
                            type="button"
                            disabled={syncing}
                        >
                            <Trash2 size={16} />
                            {syncing ? 'Pruning...' : 'Prune Inactive'}
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
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentInstalls.map(install => (
                                <tr key={install.installId}>
                                    <td className="mono-cell">
                                        <span className="id-badge">
                                            #{(install.installId || '').substring(0, 8).toUpperCase()}
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
                                        <span className={install.version ? 'version-ok' : 'version-missing'}>
                                            {install.version || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="date-cell">{formatRelativeTime(install.installedAt)}</td>
                                    <td className="date-cell">{formatRelativeTime(install.lastActive)}</td>
                                    <td>
                                        <button
                                            onClick={() => handleDeleteInstall(install.installId)}
                                            className="icon-btn delete-btn"
                                            title="Delete Record"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
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
                <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedUser.displayName || 'User Details'}</h2>
                            <button className="modal-close" onClick={() => setSelectedUser(null)}>
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="modal-grid">
                            <div className="modal-field">
                                <label>Email</label>
                                <p>{selectedUser.email}</p>
                            </div>
                            <div className="modal-field">
                                <label>UID</label>
                                <p className="uid-text">{selectedUser.uid}</p>
                            </div>
                            <div className="modal-field">
                                <label>Provider</label>
                                <p>{selectedUser.providerId || 'password'}</p>
                            </div>
                            <div className="modal-field">
                                <label>Verified</label>
                                <p className={selectedUser.emailVerified ? 'verified' : 'not-verified'}>
                                    {selectedUser.emailVerified ? 'Yes ✅' : 'No ❌'}
                                </p>
                            </div>
                            <div className="modal-field">
                                <label>Joined</label>
                                <p>{formatDate(selectedUser.createdAt)}</p>
                            </div>
                            <div className="modal-field">
                                <label>Last Login</label>
                                <p>{formatDate(selectedUser.lastLogin)}</p>
                            </div>
                            <div className="modal-field">
                                <label>Block Status</label>
                                <p className={selectedUser.isBlocked ? 'blocked' : 'active'}>
                                    {selectedUser.isBlocked ? 'Blocked 🔒' : 'Active ✅'}
                                </p>
                            </div>
                        </div>

                        <div className="modal-section">
                            <h4>Device Info</h4>
                            <pre className="device-info">
                                {JSON.stringify(selectedUser.deviceInfo, null, 2)}
                            </pre>
                        </div>

                        <div className="modal-footer">
                            <button
                                onClick={() => {
                                    handleBlockUser(selectedUser);
                                    setSelectedUser(null);
                                }}
                                className={`modal-btn ${selectedUser.isBlocked ? 'unblock-btn' : 'block-btn'}`}
                            >
                                {selectedUser.isBlocked ? 'Unblock User' : 'Block User'}
                            </button>
                            <button
                                onClick={() => {
                                    handleDeleteUser(selectedUser.uid);
                                    setSelectedUser(null);
                                }}
                                className="modal-btn delete-btn"
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;