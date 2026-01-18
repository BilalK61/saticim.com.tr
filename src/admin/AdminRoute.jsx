import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
    const { user } = useAuth();

    // If not authenticated, redirect to admin login
    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }

    // Check for admin privileges
    // Note: Ensure your 'profiles' table has an 'is_admin' boolean column
    if (user.is_admin !== true) {
        // You might want to show a "Not Authorized" page instead, but redirecting to home is safe
        return <Navigate to="/" replace />;
    }

    // If authenticated and is admin, render the child routes
    return <Outlet />;
};

export default AdminRoute;
