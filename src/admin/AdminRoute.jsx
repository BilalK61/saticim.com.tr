import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
    const { user, loading } = useAuth();

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    // If not authenticated, redirect to admin login
    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }

    // Check for admin privileges
    // Note: Ensure your 'profiles' table has a 'role' column with values: 'user', 'moderator', 'admin'
    if (user.role !== 'admin' && user.role !== 'moderator') {
        // You might want to show a "Not Authorized" page instead, but redirecting to home is safe
        return <Navigate to="/" replace />;
    }

    // If authenticated and is admin, render the child routes
    return <Outlet />;
};

export default AdminRoute;

