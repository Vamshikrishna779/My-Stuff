import React from 'react';
import { Moon, Sun, Settings, User, HelpCircle, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

interface HeaderProps {
    theme: string;
    onThemeToggle: () => void;
    onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, onThemeToggle, onSettingsClick }) => {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const isDarkMode = theme === 'dark' || theme === 'cyberpunk' || theme === 'forest' || theme === 'ocean' || theme === 'sunset' || theme === 'dracula' || theme === 'nord' || theme === 'midnight' || theme === 'retro';

    return (
        <header className="app-header">
            <div className="header-content">
                <div className="header-left" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <div className="app-logo">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="32" height="32" rx="8" fill="url(#gradient)" />
                            <path d="M16 8L20 12L16 16L12 12L16 8Z" fill="white" opacity="0.9" />
                            <path d="M16 16L20 20L16 24L12 20L16 16Z" fill="white" opacity="0.7" />
                            <defs>
                                <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                                    <stop offset="0%" stopColor="#f5d93aff" />
                                    <stop offset="100%" stopColor="#e2dc2aff" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <h1 className="app-title">My Stuff</h1>
                    </div>
                </div>
                <div className="header-right">
                    <button
                        className="icon-button"
                        onClick={() => navigate('/help')}
                        aria-label="Help"
                        title="Help & Support"
                    >
                        <HelpCircle size={20} />
                    </button>
                    <button
                        className="icon-button"
                        onClick={onThemeToggle}
                        aria-label="Toggle theme"
                        title="Toggle Theme"
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button
                        className="icon-button"
                        onClick={() => navigate('/profile')}
                        aria-label="Profile"
                        title="Profile"
                    >
                        <User size={20} />
                    </button>
                    {isAdmin && (
                        <button
                            className="icon-button admin-button"
                            onClick={() => navigate('/admin')}
                            aria-label="Admin Dashboard"
                            title="Admin Dashboard"
                        >
                            <Shield size={20} />
                        </button>
                    )}
                    <button
                        className="icon-button"
                        onClick={onSettingsClick}
                        aria-label="Settings"
                        title="Settings"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;

