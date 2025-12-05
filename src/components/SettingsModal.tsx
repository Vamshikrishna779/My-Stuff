import React, { useState } from 'react';
import { Sun, Moon, Skull, Key, Download, Upload, Trash2, X } from 'lucide-react';
import tmdbService from '../services/tmdbService';
import { type Theme } from '../hooks/useTheme';
import './SettingsModal.css';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: () => Promise<void>;
    onImport: (file: File) => Promise<number>;
    onClearAll: () => Promise<void>;
    theme: Theme;
    onThemeChange: (theme: Theme) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    onExport,
    onImport,
    onClearAll,
    theme,
    onThemeChange
}) => {
    const [apiKey, setApiKey] = useState(tmdbService.getApiKey() || '');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleSaveApiKey = () => {
        if (!apiKey.trim()) {
            setMessage('Please enter an API key');
            return;
        }

        setIsSaving(true);
        tmdbService.setApiKey(apiKey.trim());
        setMessage('API key saved successfully!');
        setTimeout(() => {
            setMessage('');
            setIsSaving(false);
        }, 2000);
    };

    const handleExport = async () => {
        try {
            await onExport();
            setMessage('Data exported successfully!');
            setTimeout(() => setMessage(''), 2000);
        } catch (err) {
            setMessage('Failed to export data');
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const count = await onImport(file);
            setMessage(`Imported ${count} items successfully!`);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Failed to import data');
        }
        e.target.value = '';
    };

    const handleClearAll = async () => {
        if (!confirm('Are you sure you want to delete all watched items? This cannot be undone!')) {
            return;
        }

        try {
            await onClearAll();
            setMessage('All data cleared');
            setTimeout(() => setMessage(''), 2000);
        } catch (err) {
            setMessage('Failed to clear data');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Settings</h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Theme Gallery Section */}
                    <div className="settings-section">
                        <h3>Theme Gallery</h3>
                        <div className="theme-gallery">
                            <div
                                className={`theme-card light ${theme === 'light' ? 'active' : ''}`}
                                onClick={() => onThemeChange('light')}
                            >
                                <div className="theme-preview">
                                    <Sun size={24} />
                                </div>
                                <span className="theme-name">Light</span>
                            </div>
                            <div
                                className={`theme-card dark ${theme === 'dark' ? 'active' : ''}`}
                                onClick={() => onThemeChange('dark')}
                            >
                                <div className="theme-preview">
                                    <Moon size={24} />
                                </div>
                                <span className="theme-name">Dark</span>
                            </div>
                            <div
                                className={`theme-card one-piece ${theme === 'one-piece' ? 'active' : ''}`}
                                onClick={() => onThemeChange('one-piece')}
                            >
                                <div className="theme-preview">
                                    <Skull size={24} />
                                </div>
                                <span className="theme-name">One Piece</span>
                            </div>
                        </div>
                    </div>

                    {/* API Key Section */}
                    <div className="settings-section">
                        <h3>TMDb API Key</h3>
                        <p className="section-description">
                            Get your free API key from{' '}
                            <a
                                href="https://www.themoviedb.org/settings/api"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                TMDb Settings
                            </a>
                        </p>
                        <div className="input-group">
                            <div className="input-wrapper">
                                <Key size={16} className="input-icon" />
                                <input
                                    type="text"
                                    className="settings-input with-icon"
                                    placeholder="Enter your TMDb API key"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                />
                            </div>
                            <button
                                className="primary-button"
                                onClick={handleSaveApiKey}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>

                    {/* Data Management Section */}
                    <div className="settings-section">
                        <h3>Data Management</h3>
                        <div className="button-group">
                            <button className="secondary-button" onClick={handleExport}>
                                <Download size={18} />
                                <span>Export Data</span>
                            </button>
                            <label className="secondary-button" htmlFor="import-file">
                                <Upload size={18} />
                                <span>Import Data</span>
                                <input
                                    id="import-file"
                                    type="file"
                                    accept=".json"
                                    onChange={handleImport}
                                    style={{ display: 'none' }}
                                />
                            </label>
                            <button className="danger-button" onClick={handleClearAll}>
                                <Trash2 size={18} />
                                <span>Clear All Data</span>
                            </button>
                        </div>
                    </div>

                    {message && (
                        <div className="settings-message">
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
