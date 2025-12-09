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
    Assignment,
    Assessment,
    Settings,
    Notifications,
    Message,
    Logout,
    Person,
    School,
    TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';

const drawerWidth = 260;

const ManagerLayout = () => {
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
        { text: 'Dashboard', icon: <Dashboard />, path: '/manager/dashboard', permission: null },
        { text: 'Users', icon: <Person />, path: '/manager/users', permission: 'users.view' },
        { text: 'Applications', icon: <Assignment />, path: '/manager/applications', permission: 'students.view' },
        { text: 'Students', icon: <School />, path: '/manager/students', permission: 'students.view' },
        { text: 'Student Progress', icon: <TrendingUp />, path: '/manager/progress', permission: 'progress.view' },
        { text: 'Reports', icon: <Assessment />, path: '/manager/reports', permission: 'reports.view' },
        { text: 'Messages', icon: <Message />, path: '/manager/messages', permission: 'messages.view' },
        { text: 'Notifications', icon: <Notifications />, path: '/manager/notifications', permission: 'notifications.view' },
        { text: 'Settings', icon: <Settings />, path: '/manager/settings', permission: null },
    ];

    // Filter menu items based on permissions
    const menuItems = allMenuItems.filter(item => {
        if (!item.permission) return true; // Always show items without permission requirement
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
                    Manager Portal
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => {
                                navigate(item.path);
                                if (isMobile) setMobileOpen(false);
                            }}
                            sx={{
                                '&.Mui-selected': {
                                    bgcolor: 'primary.50',
                                    borderRight: '4px solid',
                                    borderColor: 'primary.main',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
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
                        {menuItems.find(item => item.path === location.pathname)?.text || 'Manager Dashboard'}
                    </Typography>

                    <IconButton 
                        onClick={() => navigate('/manager/notifications')}
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
                        onClick={() => navigate('/manager/messages')}
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
                        <MenuItem onClick={() => { navigate('/manager/settings'); handleProfileMenuClose(); }}>
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

export default ManagerLayout;
