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
import { auth, rtdb } from './config/firebase'; // Direct auth import for listener
import { ref, onValue } from 'firebase/database';
import presenceService from './services/presenceService';

function App() {
    useEffect(() => {
        // Initialize anonymous or authenticated presence
        // We listen to auth state to switch ID if they login
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                presenceService.initialize(user.uid);

                // Listen for Block Status
                const blockRef = ref(rtdb, `users/${user.uid}/isBlocked`);
                onValue(blockRef, async (snapshot) => {
                    if (snapshot.exists() && snapshot.val() === true) {
                        await auth.signOut();
                        alert('Your account has been blocked by the administrator.');
                        window.location.href = '/';
                    }
                });

            } else {
                presenceService.initialize(); // Anonymous
            }
        });

        // Also init immediately (will be Anon first usually)
        presenceService.initialize();

        return () => unsubscribe();
    }, []);

    return (
        <AuthProvider>
            <InstallPrompt />
            <RouterProvider router={router} />
        </AuthProvider>
    );
}

export default App;
