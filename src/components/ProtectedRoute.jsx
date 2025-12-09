import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role, or home
        if (user.role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
        if (user.role === 'Manager') return <Navigate to="/manager/dashboard" replace />;
        if (user.role === 'Student') return <Navigate to="/student/dashboard" replace />;
        if (user.role === 'Donor') return <Navigate to="/donor/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
};
