import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './auth.context';

const ProtectedRoute = ({ children }) => {
    const { auth, appLoading } = useContext(AuthContext);
    const location = useLocation();

    if (appLoading) {
        return null;
    }

    if (!auth?.isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return children;
};

const RoleRoute = ({ roles = [], children }) => {
    const { auth, appLoading } = useContext(AuthContext);

    if (appLoading) {
        return null;
    }

    if (!auth?.isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const userRole = String(auth?.user?.role || '').toLowerCase();
    const normalizedRoles = roles.map((role) => String(role || '').toLowerCase());

    if (normalizedRoles.length > 0 && !normalizedRoles.includes(userRole)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export {
    ProtectedRoute,
    RoleRoute,
};
