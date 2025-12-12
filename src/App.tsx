import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AdminRoute from './components/AdminRoute';
import RootLayout from './layouts/RootLayout';
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import HelpPage from './pages/HelpPage';
import ItemAssignmentPage from './pages/ItemAssignmentPage';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';
import InstallPrompt from './components/InstallPrompt';

const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: 'settings', element: <SettingsPage /> },
            { path: 'profile', element: <ProfilePage /> },
            { path: 'help', element: <HelpPage /> },
            { path: 'assign-item', element: <ItemAssignmentPage /> },
            {
                path: 'admin',
                element: (
                    <AdminRoute>
                        <AdminDashboard />
                    </AdminRoute>
                )
            },
        ],
    },
]);

import { useEffect } from 'react';
import installTrackingService from './services/installTrackingService';

function App() {
    useEffect(() => {
        const handleAppInstalled = () => {
            installTrackingService.trackInstall();
        };
        window.addEventListener('appinstalled', handleAppInstalled);
        return () => window.removeEventListener('appinstalled', handleAppInstalled);
    }, []);

    return (
        <AuthProvider>
            <InstallPrompt />
            <RouterProvider router={router} />
        </AuthProvider>
    );
}

export default App;
