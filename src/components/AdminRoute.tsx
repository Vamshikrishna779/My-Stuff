import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps {
    children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { user, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Verifying admin access...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (!isAdmin) {
        return (
            <div className="access-denied">
                <h1>Access Denied</h1>
                <p>You don't have permission to access this page.</p>
                <p>Admin privileges required.</p>
            </div>
        );
    }

    return <>{children}</>;
};

export default AdminRoute;
