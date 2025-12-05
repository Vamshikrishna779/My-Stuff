import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Key, Download, Upload, Trash2, Check } from 'lucide-react';
import tmdbService from '../services/tmdbService';
import storageService from '../services/storageService';
import { useTheme } from '../hooks/useTheme';
import { THEMES } from '../utils/themes';
import './SettingsPage.css';

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const [apiKey, setApiKey] = useState(tmdbService.getApiKey() || '');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

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
            const jsonData = await storageService.exportToJSON();
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `my-stuff-backup-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
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
            const text = await file.text();
            const count = await storageService.importFromJSON(text);
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
            await storageService.clearAll();
            setMessage('All data cleared');
            setTimeout(() => setMessage(''), 2000);
        } catch (err) {
            setMessage('Failed to clear data');
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Settings</h1>
            </div>

            <div className="settings-content">
                {/* Theme Store Section */}
                <section className="settings-section">
                    <h2>Theme Store</h2>
                    <p className="section-desc">Choose from our collection of premium themes.</p>

                    <div className="theme-grid">
                        {THEMES.map((t) => (
                            <div
                                key={t.id}
                                className={`theme-item ${theme === t.id ? 'active' : ''}`}
                                onClick={() => setTheme(t.id)}
                                style={{
                                    '--preview-bg': t.colors['--bg-color'],
                                    '--preview-primary': t.colors['--primary-color'],
                                    '--preview-card': t.colors['--card-bg']
                                } as React.CSSProperties}
                            >
                                <div className="theme-preview-box">
                                    <div className="preview-header"></div>
                                    <div className="preview-body">
                                        <div className="preview-card"></div>
                                        <div className="preview-card"></div>
                                    </div>
                                    {theme === t.id && (
                                        <div className="active-badge">
                                            <Check size={16} />
                                        </div>
                                    )}
                                </div>
                                <div className="theme-info">
                                    <span className="theme-name">{t.name}</span>
                                    <span className="theme-type">{t.type}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* API Key Section */}
                <section className="settings-section">
                    <h2>TMDb API Key</h2>
                    <p className="section-desc">Required to fetch movie and TV show data.</p>
                    <div className="input-group">
                        <div className="input-wrapper">
                            <Key size={18} className="input-icon" />
                            <input
                                type="text"
                                className="settings-input"
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
                </section>

                {/* Data Management Section */}
                <section className="settings-section">
                    <h2>Data Management</h2>
                    <p className="section-desc">Export your data for backup or transfer.</p>
                    <div className="action-buttons">
                        <button className="action-button" onClick={handleExport}>
                            <Download size={20} />
                            <span>Export Data</span>
                        </button>
                        <label className="action-button">
                            <Upload size={20} />
                            <span>Import Data</span>
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                style={{ display: 'none' }}
                            />
                        </label>
                        <button className="action-button danger" onClick={handleClearAll}>
                            <Trash2 size={20} />
                            <span>Clear All Data</span>
                        </button>
                    </div>
                </section>
            </div>

            {message && (
                <div className="toast-message">
                    {message}
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
