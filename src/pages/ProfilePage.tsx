import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Shield, Lock, BarChart2, LogOut, Settings, Bell, PlayCircle, LayoutList } from 'lucide-react';
import storageService from '../services/storageService';
import AuthModal from '../components/auth/AuthModal';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total: 0, movies: 0, shows: 0 });
    const [hasPin, setHasPin] = useState(!!localStorage.getItem('app_pin'));
    const [isSettingPin, setIsSettingPin] = useState(false);
    const [pinInput, setPinInput] = useState('');

    // Auth State
    const [user, setUser] = useState<any>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Preferences State
    const [preferences, setPreferences] = useState({
        compactMode: false,
        autoplayTrailers: true,
        notifications: false
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', email: '' });

    useEffect(() => {
        loadStats();
        checkUser();
    }, []);

    const checkUser = () => {
        const savedUser = localStorage.getItem('user_profile');
        if (savedUser) {
            const parsed = JSON.parse(savedUser);
            setUser(parsed);
            setEditForm({ name: parsed.name, email: parsed.email });
        }
    };

    const loadStats = async () => {
        const allItems = await storageService.getAllItems();
        const movies = allItems.filter(i => i.category === 'movies' || i.category === 'animated').length;
        const shows = allItems.filter(i => i.category === 'shows' || i.category === 'anime' || i.category === 'kdrama').length;
        setStats({ total: allItems.length, movies, shows });
    };

    const handleSetPin = () => {
        if (pinInput.length === 4) {
            localStorage.setItem('app_pin', pinInput);
            setHasPin(true);
            setIsSettingPin(false);
            setPinInput('');
            alert('PIN set successfully!');
        } else {
            alert('PIN must be 4 digits');
        }
    };

    const handleRemovePin = () => {
        if (confirm('Remove App Lock?')) {
            localStorage.removeItem('app_pin');
            setHasPin(false);
        }
    };

    const handleLogin = (userData: any) => {
        localStorage.setItem('user_profile', JSON.stringify(userData));
        setUser(userData);
        setEditForm({ name: userData.name, email: userData.email });
    };

    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('user_profile');
            setUser(null);
        }
    };

    const handleSaveProfile = () => {
        if (!user) return;
        const updatedUser = { ...user, ...editForm };
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
                const updatedUser = { ...user, avatar: reader.result as string };
                localStorage.setItem('user_profile', JSON.stringify(updatedUser));
                setUser(updatedUser);
            };
            reader.readAsDataURL(file);
        }
    };

    // ... existing handlers ...

    return (
        <div className="profile-page">
            <div className="page-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>My Profile</h1>
            </div>

            {/* Account Section */}
            <div className={`profile-card ${isEditing ? 'editing' : ''}`}>
                <div className="profile-avatar-wrapper">
                    <div className="profile-avatar">
                        {user ? (
                            <img src={user.avatar} alt="Avatar" className="avatar-img" />
                        ) : (
                            <User size={48} />
                        )}
                    </div>
                    {user && (
                        <label className="avatar-edit-btn">
                            <Settings size={16} />
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
                                <span className="join-date">Member since {user.joinDate}</span>
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
                                <button className="primary-button small" onClick={handleSaveProfile}>Save</button>
                                <button className="secondary-button small" onClick={() => setIsEditing(false)}>Cancel</button>
                            </>
                        ) : (
                            <>
                                <button className="icon-button" onClick={() => setIsEditing(true)} title="Edit Profile">
                                    <Settings size={20} />
                                </button>
                                <button className="icon-button danger" onClick={handleLogout} title="Logout">
                                    <LogOut size={20} />
                                </button>
                            </>
                        )
                    ) : (
                        <button className="primary-button" onClick={() => setShowAuthModal(true)}>
                            Login / Sign Up
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Section */}
            <div className="stats-grid">
                <div className="stat-card">
                    <BarChart2 size={24} className="stat-icon" />
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total Items</div>
                </div>
                <div className="stat-card">
                    <span className="stat-emoji">🎬</span>
                    <div className="stat-value">{stats.movies}</div>
                    <div className="stat-label">Movies</div>
                </div>
                <div className="stat-card">
                    <span className="stat-emoji">📺</span>
                    <div className="stat-value">{stats.shows}</div>
                    <div className="stat-label">Shows</div>
                </div>
            </div>

            {/* Preferences Section */}
            <div className="settings-group">
                <h3>Preferences</h3>
                <div className="settings-card">
                    <div className="setting-item">
                        <div className="setting-info">
                            <LayoutList size={20} />
                            <span>Compact Mode</span>
                        </div>
                        <ToggleSwitch
                            checked={preferences.compactMode}
                            onChange={v => setPreferences({ ...preferences, compactMode: v })}
                        />
                    </div>
                    <div className="setting-item">
                        <div className="setting-info">
                            <PlayCircle size={20} />
                            <span>Autoplay Trailers</span>
                        </div>
                        <ToggleSwitch
                            checked={preferences.autoplayTrailers}
                            onChange={v => setPreferences({ ...preferences, autoplayTrailers: v })}
                        />
                    </div>
                    <div className="setting-item">
                        <div className="setting-info">
                            <Bell size={20} />
                            <span>Notifications</span>
                        </div>
                        <ToggleSwitch
                            checked={preferences.notifications}
                            onChange={v => setPreferences({ ...preferences, notifications: v })}
                        />
                    </div>
                </div>
            </div>

            {/* Security Section */}
            <div className="settings-group">
                <h3>Security</h3>
                <div className="security-card">
                    <div className="security-info">
                        <Lock size={24} />
                        <div>
                            <h3>App Lock</h3>
                            <p>{hasPin ? 'PIN Protection Enabled' : 'Secure your app with a PIN'}</p>
                        </div>
                    </div>

                    {hasPin ? (
                        <button className="danger-button" onClick={handleRemovePin}>Remove PIN</button>
                    ) : (
                        !isSettingPin ? (
                            <button className="primary-button" onClick={() => setIsSettingPin(true)}>Set PIN</button>
                        ) : (
                            <div className="pin-setup">
                                <input
                                    type="password"
                                    maxLength={4}
                                    placeholder="Enter 4 digits"
                                    value={pinInput}
                                    onChange={e => setPinInput(e.target.value)}
                                    className="pin-input"
                                />
                                <button className="primary-button" onClick={handleSetPin}>Save</button>
                                <button className="secondary-button" onClick={() => setIsSettingPin(false)}>Cancel</button>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Support Section */}
            <div className="settings-group">
                <h3>Support</h3>
                <div className="settings-card">
                    <button className="setting-link" onClick={() => navigate('/help')}>
                        <Shield size={20} />
                        <span>Privacy Policy</span>
                    </button>
                    <button className="setting-link">
                        <Settings size={20} />
                        <span>Terms of Service</span>
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
