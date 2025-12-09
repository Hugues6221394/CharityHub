import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard,
    TrendingUp,
    People,
    Settings,
    Notifications,
    Message,
    Logout,
    Person,
    Description,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';

const drawerWidth = 260;

const StudentLayout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { hasPermission } = usePermissions();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Define menu items with their required permissions
    const allMenuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/student/dashboard', permission: null },
        { text: 'Application Tracking', icon: <Description />, path: '/student/application-tracking', permission: null }, // Always visible
        { text: 'Progress Updates', icon: <TrendingUp />, path: '/student/progress', permission: 'progress.manage' },
        { text: 'My Donors', icon: <People />, path: '/student/donors', permission: null }, // Always visible
        { text: 'Messages', icon: <Message />, path: '/student/messages', permission: 'messages.view' },
        { text: 'Notifications', icon: <Notifications />, path: '/student/notifications', permission: 'notifications.view' },
        { text: 'Settings', icon: <Settings />, path: '/student/settings', permission: null },
    ];

    // Filter menu items based on permissions
    const menuItems = allMenuItems.filter(item => {
        if (!item.permission) return true;
        return hasPermission(item.permission);
    });

    const drawer = (
        <Box>
            <Toolbar 
                sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    minHeight: { xs: 56, sm: 64 },
                }}
            >
                <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    Student Portal
                </Typography>
            </Toolbar>
            <Divider />
            <List sx={{ px: 1, py: 2 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                selected={isActive}
                                onClick={() => {
                                    navigate(item.path);
                                    if (isMobile) setMobileOpen(false);
                                }}
                                sx={{
                                    borderRadius: 2,
                                    '&:hover': {
                                        bgcolor: 'rgba(25, 118, 210, 0.08)',
                                    },
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        borderRight: '4px solid',
                                        borderColor: 'primary.dark',
                                        '&:hover': {
                                            bgcolor: 'primary.dark',
                                        },
                                        '& .MuiListItemIcon-root': {
                                            color: 'white',
                                        },
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ color: isActive ? 'white' : 'inherit', minWidth: 40 }}>
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
        <Box sx={{ display: 'flex' }}>
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
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                    >
                        {menuItems.find(item => item.path === location.pathname)?.text || 'Student Dashboard'}
                    </Typography>

                    <IconButton 
                        onClick={() => navigate('/student/notifications')}
                        sx={{
                            color: 'text.primary',
                            '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                            },
                        }}
                    >
                        <Badge badgeContent={0} color="error">
                            <Notifications />
                        </Badge>
                    </IconButton>

                    <IconButton 
                        onClick={() => navigate('/student/messages')}
                        sx={{
                            color: 'text.primary',
                            '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                            },
                        }}
                    >
                        <Badge badgeContent={0} color="error">
                            <Message />
                        </Badge>
                    </IconButton>

                    <IconButton 
                        onClick={handleProfileMenuOpen} 
                        sx={{ 
                            ml: 2,
                            '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                            },
                        }}
                    >
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </Avatar>
                    </IconButton>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleProfileMenuClose}
                    >
                        <MenuItem onClick={() => { navigate('/student/settings'); handleProfileMenuClose(); }}>
                            <ListItemIcon><Person /></ListItemIcon>
                            Profile Settings
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon><Logout /></ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            >
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

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3 },
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    mt: { xs: 7, md: 8 },
                }}
            >
                <Box sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default StudentLayout;
