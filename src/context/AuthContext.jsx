import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { signalRService } from '../services/signalRService';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Check if user is logged in on mount
        const storedUser = authService.getStoredUser();
        if (storedUser) {
            setUser(storedUser);
            // Initialize SignalR connections
            initializeSignalR();
        }
        setLoading(false);
    }, []);

    const initializeSignalR = async () => {
        // Start notification connection
        await signalRService.startNotificationConnection((notification) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
        });
    };

    const login = async (email, password) => {
        const data = await authService.login(email, password);
        setUser(data.user);
        // Initialize SignalR after login
        await initializeSignalR();
        return data;
    };

    const register = async (userData) => {
        const data = await authService.register(userData);
        setUser(data.user);
        // Initialize SignalR after registration
        await initializeSignalR();
        return data;
    };

    const logout = async () => {
        authService.logout();
        setUser(null);
        setNotifications([]);
        setUnreadCount(0);
        // Stop SignalR connections
        await signalRService.stopConnections();
    };

    const value = {
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        loading,
        notifications,
        unreadCount,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
