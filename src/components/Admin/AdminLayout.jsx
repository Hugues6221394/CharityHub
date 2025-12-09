import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Badge,
    Avatar,
    Menu,
    MenuItem,
    useTheme,
    useMediaQuery,
    ListItemAvatar,
    Chip,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard,
    People,
    School,
    AttachMoney,
    Message,
    Assessment,
    Settings,
    Notifications,
    Logout,
    PersonAdd,
    BarChart,
    Assignment,
    TrendingUp,
    Security,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { notificationService } from '../../services/notificationService';
import { signalRService } from '../../services/signalRService';

const drawerWidth = 260;

const AdminLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifAnchor, setNotifAnchor] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { hasPermission } = usePermissions();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        fetchNotifications();
        initializeNotificationConnection();
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const initializeNotificationConnection = async () => {
        await signalRService.startNotificationConnection((notification) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
        });
    };

    // Define menu items with their required permissions
    const allMenuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard', permission: null }, // Always visible
        { text: 'Users', icon: <People />, path: '/admin/users', permission: 'users.view' },
        { text: 'Applications', icon: <Assignment />, path: '/admin/applications', permission: 'students.view' },
        { text: 'Students', icon: <School />, path: '/admin/students', permission: 'students.view' },
        { text: 'Donations', icon: <AttachMoney />, path: '/admin/donations', permission: 'donations.view' },
        { text: 'Student Progress', icon: <TrendingUp />, path: '/admin/progress', permission: 'progress.view' },
        { text: 'Messages', icon: <Message />, path: '/admin/messages', permission: 'messages.view' },
        { text: 'Analytics', icon: <BarChart />, path: '/admin/analytics', permission: 'reports.view' },
        { text: 'Reports', icon: <Assessment />, path: '/admin/reports', permission: 'reports.view' },
        { text: 'Permissions', icon: <Security />, path: '/admin/permissions', permission: 'permissions.manage' },
        { text: 'Settings', icon: <Settings />, path: '/admin/settings', permission: null }, // Always visible
    ];

    // Filter menu items based on permissions
    const menuItems = allMenuItems.filter(item => {
        // If no permission required, always show
        if (!item.permission) return true;
        // Check if user has the required permission
        return hasPermission(item.permission);
    });

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleNotifOpen = (event) => {
        setNotifAnchor(event.currentTarget);
    };

    const handleNotifClose = () => {
        setNotifAnchor(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const drawer = (
        <Box>
            <Toolbar
                sx={{
                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    color: 'white',
                }}
            >
                <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
                    Admin Panel
                </Typography>
            </Toolbar>
            <Divider />
            <List sx={{ px: 1, py: 2 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                component={Link}
                                to={item.path}
                                selected={isActive}
                                sx={{
                                    borderRadius: 2,
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '&:hover': {
                                            bgcolor: 'primary.dark',
                                        },
                                        '& .MuiListItemIcon-root': {
                                            color: 'white',
                                        },
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        color: isActive ? 'white' : 'inherit',
                                        minWidth: 40,
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* App Bar */}
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    bgcolor: 'white',
                    color: 'text.primary',
                    boxShadow: '0px 1px 4px rgba(0,0,0,0.08)',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Toolbar>
                    <IconButton
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ 
                            mr: 2, 
                            display: { md: 'none' },
                            color: 'text.primary',
                            '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                            },
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography 
                        variant="h6" 
                        noWrap 
                        component="div" 
                        sx={{ 
                            flexGrow: 1, 
                            fontWeight: 600,
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                    >
                        {menuItems.find((item) => item.path === location.pathname)?.text || 'Admin'}
                    </Typography>

                    {/* Notifications */}
                    <IconButton 
                        onClick={handleNotifOpen}
                        sx={{
                            color: 'text.primary',
                            '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                            },
                        }}
                    >
                        <Badge badgeContent={unreadCount} color="error">
                            <Notifications />
                        </Badge>
                    </IconButton>

                    {/* Profile */}
                    <IconButton 
                        onClick={handleProfileMenuOpen} 
                        sx={{ 
                            ml: 1,
                            '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                            },
                        }}
                    >
                        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                            {user?.firstName?.[0] || 'A'}
                        </Avatar>
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* Sidebar Drawer */}
            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            >
                {/* Mobile drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                {/* Desktop drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3 },
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    bgcolor: 'grey.50',
                    minHeight: '100vh',
                }}
            >
                <Toolbar />
                <Box sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                    <Outlet />
                </Box>
            </Box>

            {/* Profile Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/admin/settings'); }}>
                    <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
                    Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>

            {/* Notifications Menu */}
            <Menu
                anchorEl={notifAnchor}
                open={Boolean(notifAnchor)}
                onClose={handleNotifClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{ sx: { width: 360, maxHeight: 500 } }}
            >
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Notifications</Typography>
                </Box>
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {notifications.length === 0 ? (
                        <MenuItem disabled>
                            <Typography variant="body2" color="text.secondary">No notifications</Typography>
                        </MenuItem>
                    ) : (
                        notifications.slice(0, 10).map((notification) => (
                            <MenuItem
                                key={notification.id}
                                onClick={() => {
                                    if (notification.linkUrl) {
                                        navigate(notification.linkUrl);
                                    }
                                    handleNotifClose();
                                }}
                                sx={{
                                    bgcolor: notification.isRead ? 'transparent' : 'primary.50',
                                    borderLeft: notification.isRead ? 'none' : '4px solid',
                                    borderColor: 'primary.main',
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                        <Notifications fontSize="small" />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: notification.isRead ? 400 : 600 }}>
                                                {notification.title}
                                            </Typography>
                                            <Chip label={notification.type} size="small" color="primary" variant="outlined" sx={{ mt: 0.5, height: 20 }} />
                                        </Box>
                                    }
                                    secondary={
                                        <>
                                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                {notification.message}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </Typography>
                                        </>
                                    }
                                />
                            </MenuItem>
                        ))
                    )}
                </Box>
                <Divider />
                <MenuItem onClick={() => { handleNotifClose(); navigate('/admin/notifications'); }} sx={{ justifyContent: 'center', color: 'primary.main' }}>
                    View All Notifications
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default AdminLayout;
