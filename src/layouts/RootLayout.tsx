import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useTheme } from '../hooks/useTheme';

const RootLayout: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    return (
        <div className="app">
            <Header
                theme={theme}
                onThemeToggle={toggleTheme}
                onSettingsClick={() => navigate('/settings')}
            />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default RootLayout;
