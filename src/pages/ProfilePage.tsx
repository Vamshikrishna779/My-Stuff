import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    Shield,
    Lock,
    BarChart2,
    LogOut,
    Settings,
    Bell,
    PlayCircle,
    LayoutList,
    Film,      // ⬅️ added
    Tv,        // ⬅️ added
} from 'lucide-react';
import storageService from '../services/storageService';
import AuthModal from '../components/auth/AuthModal';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import './ProfilePage.css';

interface ProfileStats {
    total: number;
    movies: number;
    shows: number;
}

interface UserProfile {
    name: string;
    email: string;
    joinDate?: string;
    avatar?: string;
}

interface Preferences {
    compactMode: boolean;
    autoplayTrailers: boolean;
    notifications: boolean;
}

const PREF_KEY = 'myStuff_profile_preferences';

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();

    const [stats, setStats] = useState<ProfileStats>({ total: 0, movies: 0, shows: 0 });
    const [hasPin, setHasPin] = useState<boolean>(!!localStorage.getItem('app_pin'));
    const [isSettingPin, setIsSettingPin] = useState(false);
    const [pinInput, setPinInput] = useState('');

    // Auth State
    const [user, setUser] = useState<UserProfile | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Preferences State
    const [preferences, setPreferences] = useState<Preferences>({
        compactMode: false,
        autoplayTrailers: true,
        notifications: false,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<{ name: string; email: string }>({
        name: '',
        email: '',
    });

    useEffect(() => {
        loadStats();
        checkUser();
        loadPreferences();
    }, []);

    const checkUser = () => {
        const savedUser = localStorage.getItem('user_profile');
        if (savedUser) {
            const parsed: UserProfile = JSON.parse(savedUser);
            setUser(parsed);
            setEditForm({ name: parsed.name, email: parsed.email });
        }
    };

    const loadStats = async () => {
        try {
            const allItems = await storageService.getAllItems();
            const movies = allItems.filter(
                (i: any) => i.category === 'movie'
            ).length;
            const shows = allItems.filter(
                (i: any) =>
                    i.category === 'show' ||
                    i.category === 'anime' ||
                    i.category === 'kdrama' ||
                    i.category === 'jdrama'
            ).length;

            setStats({ total: allItems.length, movies, shows });
        } catch (err) {
            console.error('Error loading stats:', err);
        }
    };

    const loadPreferences = () => {
        try {
            const raw = localStorage.getItem(PREF_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw) as Preferences;
            setPreferences(prev => ({ ...prev, ...parsed }));
        } catch {
            // ignore
        }
    };

    const persistPreferences = (next: Preferences) => {
        setPreferences(next);
        localStorage.setItem(PREF_KEY, JSON.stringify(next));
    };

    const handleSetPin = () => {
        if (pinInput.length === 4 && /^\d{4}$/.test(pinInput)) {
            localStorage.setItem('app_pin', pinInput);
            setHasPin(true);
            setIsSettingPin(false);
            setPinInput('');
            alert('PIN set successfully!');
        } else {
            alert('PIN must be exactly 4 digits (0–9).');
        }
    };

    const handleRemovePin = () => {
        if (confirm('Remove App Lock?')) {
            localStorage.removeItem('app_pin');
            setHasPin(false);
        }
    };

    const handleLogin = (userData: UserProfile) => {
        const withJoinDate: UserProfile = {
            ...userData,
            joinDate: userData.joinDate || new Date().toLocaleDateString(),
        };
        localStorage.setItem('user_profile', JSON.stringify(withJoinDate));
        setUser(withJoinDate);
        setEditForm({ name: withJoinDate.name, email: withJoinDate.email });
    };

    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('user_profile');
            setUser(null);
        }
    };

    const handleSaveProfile = () => {
        if (!user) return;
        const updatedUser: UserProfile = { ...user, ...editForm };
        localStorage.setItem('user_profile', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
        alert('Profile updated successfully!');
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && user) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const updatedUser: UserProfile = { ...user, avatar: reader.result as string };
                localStorage.setItem('user_profile', JSON.stringify(updatedUser));
                setUser(updatedUser);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="profile-page">
            {/* Header */}
            <div className="page-header">
                <button className="back-button" onClick={() => navigate(-1)} type="button">
                    <ArrowLeft size={22} />
                </button>
                <h1>My Profile</h1>
            </div>

            {/* Account Section */}
            <div className={`profile-card ${isEditing ? 'editing' : ''}`}>
                <div className="profile-avatar-wrapper">
                    <div className="profile-avatar">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="avatar-img" />
                        ) : (
                            <User size={40} />
                        )}
                    </div>
                    {user && (
                        <label className="avatar-edit-btn">
                            <Settings size={16} />
                            <span>Edit</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                style={{ display: 'none' }}
                            />
                        </label>
                    )}
                </div>

                <div className="profile-info">
                    {user ? (
                        isEditing ? (
                            <div className="edit-form">
                                <input
                                    type="text"
                                    className="edit-input"
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    placeholder="Your Name"
                                />
                                <input
                                    type="email"
                                    className="edit-input"
                                    value={editForm.email}
                                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                    placeholder="Your Email"
                                />
                            </div>
                        ) : (
                            <>
                                <h2>{user.name}</h2>
                                <p>{user.email}</p>
                                {user.joinDate && (
                                    <span className="join-date">Member since {user.joinDate}</span>
                                )}
                            </>
                        )
                    ) : (
                        <>
                            <h2>Guest User</h2>
                            <p>Sign in to sync your data</p>
                        </>
                    )}
                </div>

                <div className="profile-actions">
                    {user ? (
                        isEditing ? (
                            <>
                                <button
                                    className="primary-button small"
                                    onClick={handleSaveProfile}
                                    type="button"
                                >
                                    Save
                                </button>
                                <button
                                    className="secondary-button small"
                                    onClick={() => setIsEditing(false)}
                                    type="button"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className="icon-button subtle"
                                    onClick={() => setIsEditing(true)}
                                    title="Edit Profile"
                                    type="button"
                                >
                                    <Settings size={18} />
                                </button>
                                <button
                                    className="icon-button danger"
                                    onClick={handleLogout}
                                    title="Logout"
                                    type="button"
                                >
                                    <LogOut size={18} />
                                </button>
                            </>
                        )
                    ) : (
                        <button
                            className="primary-button"
                            onClick={() => setShowAuthModal(true)}
                            type="button"
                        >
                            Login / Sign Up
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Section */}
            <div className="stats-grid">
                <div className="stat-card">
                    <BarChart2 size={22} className="stat-icon" />
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total Items</div>
                </div>
                <div className="stat-card">
                    <Film size={22} className="stat-icon" />
                    <div className="stat-value">{stats.movies}</div>
                    <div className="stat-label">Movies</div>
                </div>
                <div className="stat-card">
                    <Tv size={22} className="stat-icon" />
                    <div className="stat-value">{stats.shows}</div>
                    <div className="stat-label">Shows, Anime & Dramas</div>
                </div>
            </div>

            {/* Preferences Section */}
            <div className="settings-group">
                <h3>
                    <Settings size={18} /> Preferences
                </h3>
                <div className="settings-card">
                    <div className="setting-item">
                        <div className="setting-info">
                            <LayoutList size={18} />
                            <div>
                                <span>Compact Mode</span>
                                <p className="setting-description">
                                    Smaller cards so you can see more items at once.
                                </p>
                            </div>
                        </div>
                        <ToggleSwitch
                            checked={preferences.compactMode}
                            onChange={v => {
                                const next = { ...preferences, compactMode: v };
                                persistPreferences(next);
                            }}
                        />
                    </div>

                    <div className="setting-item">
                        <div className="setting-info">
                            <PlayCircle size={18} />
                            <div>
                                <span>Autoplay Trailers</span>
                                <p className="setting-description">
                                    Automatically play trailers in the detail view (when available).
                                </p>
                            </div>
                        </div>
                        <ToggleSwitch
                            checked={preferences.autoplayTrailers}
                            onChange={v => {
                                const next = { ...preferences, autoplayTrailers: v };
                                persistPreferences(next);
                            }}
                        />
                    </div>

                    <div className="setting-item">
                        <div className="setting-info">
                            <Bell size={18} />
                            <div>
                                <span>Notifications</span>
                                <p className="setting-description">
                                    Get gentle reminders for backups and watch stats.
                                </p>
                            </div>
                        </div>
                        <ToggleSwitch
                            checked={preferences.notifications}
                            onChange={v => {
                                const next = { ...preferences, notifications: v };
                                persistPreferences(next);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Security Section */}
            <div className="settings-group">
                <h3>
                    <Lock size={18} /> Security
                </h3>
                <div className="security-card">
                    <div className="security-info">
                        <Lock size={22} />
                        <div>
                            <h3>App Lock</h3>
                            <p>{hasPin ? 'PIN protection enabled.' : 'Secure your app with a 4-digit PIN.'}</p>
                        </div>
                    </div>

                    {hasPin ? (
                        <button className="danger-button" onClick={handleRemovePin} type="button">
                            Remove PIN
                        </button>
                    ) : !isSettingPin ? (
                        <button
                            className="primary-button"
                            onClick={() => setIsSettingPin(true)}
                            type="button"
                        >
                            Set PIN
                        </button>
                    ) : (
                        <div className="pin-setup">
                            <input
                                type="password"
                                maxLength={4}
                                placeholder="••••"
                                value={pinInput}
                                onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                                className="pin-input"
                            />
                            <button className="primary-button small" onClick={handleSetPin} type="button">
                                Save
                            </button>
                            <button
                                className="secondary-button small"
                                onClick={() => {
                                    setIsSettingPin(false);
                                    setPinInput('');
                                }}
                                type="button"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Support Section */}
            <div className="settings-group">
                <h3>
                    <Shield size={18} /> Support
                </h3>
                <div className="settings-card">
                    <button className="setting-link" onClick={() => navigate('/')} type="button">
                        <Shield size={18} />
                        <div>
                            <span>Privacy Policy</span>
                            <p className="setting-description">Learn how your data is handled locally.</p>
                        </div>
                    </button>
                    <button className="setting-link" type="button">
                        <Settings size={18} />
                        <div>
                            <span>Terms of Service</span>
                            <p className="setting-description">Basic terms for using this app.</p>
                        </div>
                    </button>
                </div>
            </div>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onLogin={handleLogin}
            />
        </div>
    );
};

export default ProfilePage;
