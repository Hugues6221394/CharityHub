import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CardMedia,
    AppBar,
    Toolbar,
    Stack,
    alpha,
    Avatar,
    Menu,
    MenuItem,
    LinearProgress,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Divider,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Favorite,
    School,
    TrendingUp,
    People,
    ArrowForward,
    Logout,
    Dashboard,
    Menu as MenuIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import { getImageUrl } from '../../utils/imageUtils';
import { Link as RouterLink } from 'react-router-dom';

const HomePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [featuredStudents, setFeaturedStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleMenuClose();
        navigate('/');
    };

    useEffect(() => {
        fetchFeaturedStudents();
    }, []);

    const fetchFeaturedStudents = async () => {
        try {
            setLoadingStudents(true);
            const response = await studentService.getStudents({ pageSize: 6, page: 1 });
            // API returns { students: [], totalCount: ..., page: ..., pageSize: ..., totalPages: ... }
            setFeaturedStudents(response?.students || response || []);
        } catch (error) {
            console.error('Error fetching featured students:', error);
            setFeaturedStudents([]);
        } finally {
            setLoadingStudents(false);
        }
    };
    const stats = [
        { icon: <People />, value: '500+', label: 'Students Supported' },
        { icon: <Favorite />, value: '1000+', label: 'Generous Donors' },
        { icon: <TrendingUp />, value: '$2M+', label: 'Funds Raised' },
        { icon: <School />, value: '95%', label: 'Success Rate' },
    ];

    const features = [
        {
            title: 'Transparent Donations',
            description: 'Track every dollar and see the real impact of your contribution',
            icon: '💎',
        },
        {
            title: 'Direct Connection',
            description: 'Connect directly with students and follow their journey',
            icon: '🤝',
        },
        {
            title: 'Verified Students',
            description: 'All students are carefully vetted and verified by our team',
            icon: '✅',
        },
        {
            title: 'Progress Updates',
            description: 'Receive regular updates on student achievements and milestones',
            icon: '📈',
        },
    ];

    return (
        <Box>
            {/* Navigation */}
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    bgcolor: 'white',
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                <Toolbar sx={{ px: { xs: 1, sm: 3 } }}>
                    <Typography
                        variant="h6"
                        component={Link}
                        to="/"
                        sx={{
                            flexGrow: 1,
                            textDecoration: 'none',
                            color: 'primary.main',
                            fontWeight: 700,
                            fontSize: { xs: '1.125rem', sm: '1.5rem' },
                        }}
                    >
                        Student Charity Hub
                    </Typography>
                    
                    {/* Desktop Navigation */}
                    <Stack 
                        direction="row" 
                        spacing={2} 
                        alignItems="center"
                        sx={{ display: { xs: 'none', md: 'flex' } }}
                    >
                        <Button color="inherit" component={Link} to="/about" sx={{ color: 'text.primary' }}>
                            About Us
                        </Button>
                        <Button color="inherit" component={Link} to="/contact" sx={{ color: 'text.primary' }}>
                            Contact Us
                        </Button>
                        <Button color="inherit" component={Link} to="/students" sx={{ color: 'text.primary' }}>
                            Browse Students
                        </Button>
                        {!user ? (
                            <>
                                <Button color="inherit" component={Link} to="/login" sx={{ color: 'text.primary' }}>
                                    Login
                                </Button>
                                <Button variant="contained" component={Link} to="/register" sx={{ borderRadius: 2 }}>
                                    Get Started
                                </Button>
                            </>
                        ) : user.role !== 'Student' ? (
                            <>
                                <Button
                                    color="inherit"
                                    onClick={handleMenuOpen}
                                    sx={{ color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}
                                >
                                    <Avatar src={user.profilePictureUrl} sx={{ width: 32, height: 32 }}>
                                        {user.firstName?.[0]}{user.lastName?.[0]}
                                    </Avatar>
                                    {user.firstName} {user.lastName}
                                </Button>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                >
                                    {user.role === 'Admin' && (
                                        <MenuItem onClick={() => { navigate('/admin/dashboard'); handleMenuClose(); }}>
                                            <Dashboard sx={{ mr: 1 }} /> Admin Dashboard
                                        </MenuItem>
                                    )}
                                    {user.role === 'Manager' && (
                                        <MenuItem onClick={() => { navigate('/manager/dashboard'); handleMenuClose(); }}>
                                            <Dashboard sx={{ mr: 1 }} /> Manager Dashboard
                                        </MenuItem>
                                    )}
                                    {user.role === 'Donor' && (
                                        <MenuItem onClick={() => { navigate('/donor/dashboard'); handleMenuClose(); }}>
                                            <Dashboard sx={{ mr: 1 }} /> Donor Dashboard
                                        </MenuItem>
                                    )}
                                    <MenuItem onClick={handleLogout}>
                                        <Logout sx={{ mr: 1 }} /> Logout
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <Button variant="contained" component={Link} to="/student/dashboard" sx={{ borderRadius: 2 }}>
                                Student Dashboard
                            </Button>
                        )}
                    </Stack>

                    {/* Mobile Menu Button */}
                    <IconButton
                        edge="end"
                        onClick={() => setMobileMenuOpen(true)}
                        sx={{ 
                            display: { xs: 'flex', md: 'none' }, 
                            ml: 1,
                            color: 'text.primary',
                            '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                            },
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                </Toolbar>

                {/* Mobile Drawer */}
                <Drawer
                    anchor="right"
                    open={mobileMenuOpen}
                    onClose={() => setMobileMenuOpen(false)}
                >
                    <Box sx={{ width: 280, pt: 2 }}>
                        <List>
                            <ListItem>
                                <ListItemButton component={Link} to="/about" onClick={() => setMobileMenuOpen(false)}>
                                    <ListItemText primary="About Us" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem>
                                <ListItemButton component={Link} to="/contact" onClick={() => setMobileMenuOpen(false)}>
                                    <ListItemText primary="Contact Us" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem>
                                <ListItemButton component={Link} to="/students" onClick={() => setMobileMenuOpen(false)}>
                                    <ListItemText primary="Browse Students" />
                                </ListItemButton>
                            </ListItem>
                            <Divider sx={{ my: 1 }} />
                            {!user ? (
                                <>
                                    <ListItem>
                                        <ListItemButton component={Link} to="/login" onClick={() => setMobileMenuOpen(false)}>
                                            <ListItemText primary="Login" />
                                        </ListItemButton>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemButton component={Link} to="/register" onClick={() => setMobileMenuOpen(false)}>
                                            <ListItemText primary="Get Started" />
                                        </ListItemButton>
                                    </ListItem>
                                </>
                            ) : (
                                <>
                                    {user.role === 'Admin' && (
                                        <ListItem>
                                            <ListItemButton onClick={() => { navigate('/admin/dashboard'); setMobileMenuOpen(false); }}>
                                                <Dashboard sx={{ mr: 2 }} />
                                                <ListItemText primary="Admin Dashboard" />
                                            </ListItemButton>
                                        </ListItem>
                                    )}
                                    {user.role === 'Manager' && (
                                        <ListItem>
                                            <ListItemButton onClick={() => { navigate('/manager/dashboard'); setMobileMenuOpen(false); }}>
                                                <Dashboard sx={{ mr: 2 }} />
                                                <ListItemText primary="Manager Dashboard" />
                                            </ListItemButton>
                                        </ListItem>
                                    )}
                                    {user.role === 'Donor' && (
                                        <ListItem>
                                            <ListItemButton onClick={() => { navigate('/donor/dashboard'); setMobileMenuOpen(false); }}>
                                                <Dashboard sx={{ mr: 2 }} />
                                                <ListItemText primary="Donor Dashboard" />
                                            </ListItemButton>
                                        </ListItem>
                                    )}
                                    {user.role === 'Student' && (
                                        <ListItem>
                                            <ListItemButton onClick={() => { navigate('/student/dashboard'); setMobileMenuOpen(false); }}>
                                                <Dashboard sx={{ mr: 2 }} />
                                                <ListItemText primary="Student Dashboard" />
                                            </ListItemButton>
                                        </ListItem>
                                    )}
                                    <Divider sx={{ my: 1 }} />
                                    <ListItem>
                                        <ListItemButton onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                                            <Logout sx={{ mr: 2 }} />
                                            <ListItemText primary="Logout" />
                                        </ListItemButton>
                                    </ListItem>
                                </>
                            )}
                        </List>
                    </Box>
                </Drawer>
            </AppBar>

            {/* Hero Section */}
            <Box
                sx={{
                    position: 'relative',
                    color: 'white',
                    py: { xs: 8, md: 12 },
                    overflow: 'hidden',
                    minHeight: { xs: '60vh', md: '80vh' },
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                {/* Background Image - Fully Visible */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `url(${getImageUrl('/images/homepage/default.jpg')})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        zIndex: 0,
                    }}
                />
                {/* Subtle Dark Overlay for Text Readability - Very Light */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(135deg, ${alpha('#000', 0.15)} 0%, ${alpha('#000', 0.25)} 100%)`,
                        zIndex: 0,
                    }}
                />
                {/* Additional gradient from left for better text contrast */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: '50%',
                        bottom: 0,
                        background: `linear-gradient(to right, ${alpha('#000', 0.3)} 0%, ${alpha('#000', 0)} 100%)`,
                        zIndex: 0,
                        display: { xs: 'none', md: 'block' },
                    }}
                />
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, px: { xs: 2, sm: 3 } }}>
                    <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography
                                variant="h2"
                                sx={{
                                    fontWeight: 800,
                                    mb: 2,
                                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem', lg: '4rem' },
                                    lineHeight: 1.2,
                                    color: 'white',
                                    textShadow: '2px 2px 8px rgba(0,0,0,0.5), 0px 0px 20px rgba(0,0,0,0.3)',
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                Empower Dreams Through Education
                            </Typography>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    mb: { xs: 3, md: 4 }, 
                                    color: 'white',
                                    lineHeight: 1.7,
                                    textShadow: '1px 1px 4px rgba(0,0,0,0.5), 0px 0px 10px rgba(0,0,0,0.3)',
                                    fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                                    fontWeight: 400,
                                }}
                            >
                                Connect with students who need your support. Make a lasting impact on their
                                educational journey and help them achieve their dreams.
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
                                <Button
                                    component={Link}
                                    to="/students"
                                    variant="contained"
                                    size="large"
                                    endIcon={<ArrowForward />}
                                    sx={{
                                        bgcolor: 'white',
                                        color: 'primary.main',
                                        px: { xs: 3, sm: 4 },
                                        py: { xs: 1.25, sm: 1.5 },
                                        borderRadius: 3,
                                        fontWeight: 700,
                                        fontSize: { xs: '0.95rem', sm: '1rem' },
                                        boxShadow: '0px 4px 20px rgba(0,0,0,0.3)',
                                        textTransform: 'none',
                                        '&:hover': {
                                            bgcolor: '#f5f5f5',
                                            transform: 'translateY(-3px)',
                                            boxShadow: '0px 6px 25px rgba(0,0,0,0.4)',
                                        },
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                >
                                    Find Students
                                </Button>
                                <Button
                                    component={Link}
                                    to="/register/student"
                                    variant="outlined"
                                    size="large"
                                    sx={{
                                        borderColor: 'white',
                                        borderWidth: 2.5,
                                        color: 'white',
                                        px: { xs: 3, sm: 4 },
                                        py: { xs: 1.25, sm: 1.5 },
                                        borderRadius: 3,
                                        fontWeight: 700,
                                        fontSize: { xs: '0.95rem', sm: '1rem' },
                                        textTransform: 'none',
                                        backdropFilter: 'blur(10px)',
                                        bgcolor: alpha('#fff', 0.1),
                                        '&:hover': {
                                            borderColor: 'white',
                                            bgcolor: alpha('#fff', 0.25),
                                            transform: 'translateY(-3px)',
                                            boxShadow: '0px 6px 25px rgba(255,255,255,0.2)',
                                        },
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                >
                                    Apply as Student
                                </Button>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box
                                sx={{
                                    position: 'relative',
                                    height: { xs: 300, md: 500 },
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {/* Decorative floating elements - More subtle and elegant */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: { xs: 20, md: 50 },
                                        right: { xs: 20, md: 50 },
                                        width: { xs: 120, md: 200 },
                                        height: { xs: 120, md: 200 },
                                        borderRadius: '50%',
                                        bgcolor: alpha('#fff', 0.08),
                                        backdropFilter: 'blur(20px)',
                                        border: `1px solid ${alpha('#fff', 0.2)}`,
                                        animation: 'float 8s ease-in-out infinite',
                                        '@keyframes float': {
                                            '0%, 100%': { transform: 'translateY(0px) rotate(0deg) scale(1)' },
                                            '50%': { transform: 'translateY(-30px) rotate(180deg) scale(1.1)' },
                                        },
                                    }}
                                />
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: { xs: 20, md: 50 },
                                        left: { xs: 20, md: 50 },
                                        width: { xs: 100, md: 150 },
                                        height: { xs: 100, md: 150 },
                                        borderRadius: '50%',
                                        bgcolor: alpha('#fff', 0.06),
                                        backdropFilter: 'blur(20px)',
                                        border: `1px solid ${alpha('#fff', 0.15)}`,
                                        animation: 'float 10s ease-in-out infinite',
                                        animationDelay: '1s',
                                    }}
                                />
                                {/* Additional small decorative element */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        right: { xs: 60, md: 100 },
                                        width: { xs: 60, md: 100 },
                                        height: { xs: 60, md: 100 },
                                        borderRadius: '50%',
                                        bgcolor: alpha('#fff', 0.05),
                                        backdropFilter: 'blur(15px)',
                                        border: `1px solid ${alpha('#fff', 0.1)}`,
                                        animation: 'float 12s ease-in-out infinite',
                                        animationDelay: '2s',
                                    }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Stats Section with Image Background */}
            <Box
                sx={{
                    position: 'relative',
                    py: { xs: 4, sm: 6, md: 8 },
                    overflow: 'hidden',
                    bgcolor: 'grey.50',
                }}
            >
                {/* Background Image - More Visible */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `url(${getImageUrl('/images/homepage/default1.jpg')})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.15,
                        filter: 'blur(0.5px)',
                    }}
                />
                {/* Very subtle overlay */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: alpha('#fff', 0.85),
                    }}
                />
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, px: { xs: 2, sm: 3 } }}>
                    <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
                        {stats.map((stat, index) => (
                            <Grid item xs={6} sm={6} md={3} key={index}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        textAlign: 'center',
                                        p: { xs: 2.5, sm: 3.5 },
                                        bgcolor: 'white',
                                        borderRadius: 4,
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        border: '1px solid',
                                        borderColor: alpha('#1976d2', 0.15),
                                        height: '100%',
                                        boxShadow: '0px 4px 12px rgba(0,0,0,0.08)',
                                        '&:hover': {
                                            transform: 'translateY(-10px) scale(1.02)',
                                            boxShadow: '0px 12px 30px rgba(25, 118, 210, 0.2)',
                                            borderColor: 'primary.main',
                                        },
                                    }}
                                >
                                    <Box 
                                        sx={{ 
                                            color: 'primary.main', 
                                            mb: { xs: 1.5, sm: 2 }, 
                                            fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                                            display: 'flex',
                                            justifyContent: 'center',
                                            transition: 'transform 0.3s',
                                            '&:hover': {
                                                transform: 'scale(1.1) rotate(5deg)',
                                            },
                                        }}
                                    >
                                        {stat.icon}
                                    </Box>
                                    <Typography 
                                        variant="h3" 
                                        sx={{ 
                                            fontWeight: 800, 
                                            mb: 1, 
                                            color: 'primary.main',
                                            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >
                                        {stat.value}
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary"
                                        sx={{ 
                                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                            fontWeight: 500,
                                        }}
                                    >
                                        {stat.label}
                                    </Typography>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Featured Students Section - Always Visible */}
            <Box sx={{ bgcolor: 'grey.50', py: { xs: 4, sm: 6, md: 10 } }}>
                <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 2, md: 3 } }}>
                    <Typography
                        variant="h3"
                        align="center"
                        sx={{ 
                            fontWeight: 700, 
                            mb: { xs: 1, sm: 2 }, 
                            color: 'primary.main',
                            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' }
                        }}
                    >
                        Students Seeking Support
                    </Typography>
                    <Typography
                        variant="h6"
                        align="center"
                        color="text.secondary"
                        sx={{ 
                            mb: { xs: 4, sm: 5, md: 6 }, 
                            maxWidth: 600, 
                            mx: 'auto',
                            fontSize: { xs: '1rem', sm: '1.25rem' },
                            px: { xs: 2, sm: 0 }
                        }}
                    >
                        Meet the students who need your help to achieve their dreams
                    </Typography>
                    {loadingStudents ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="h6" color="text.secondary">
                                Loading students...
                            </Typography>
                        </Box>
                    ) : featuredStudents.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <School sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                No students posted yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Check back soon to see students seeking support
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { 
                                        xs: '1fr', 
                                        sm: 'repeat(2, 1fr)', 
                                        md: 'repeat(3, 1fr)' 
                                    },
                                    gap: { xs: 2, sm: 2.5, md: 3 },
                                    width: '100%',
                                }}
                            >
                                {featuredStudents.map((student) => (
                                    <Card
                                        key={student.id}
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            textDecoration: 'none',
                                            borderRadius: 3,
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease-in-out',
                                            '&:hover': {
                                                transform: 'translateY(-8px)',
                                                boxShadow: 6,
                                            },
                                        }}
                                    >
                                            {/* Image Container with Fixed Aspect Ratio */}
                                            <Box
                                                sx={{
                                                    position: 'relative',
                                                    width: '100%',
                                                    paddingTop: '75%', // 4:3 aspect ratio
                                                    bgcolor: 'grey.100',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <Box
                                                    component="img"
                                                    src={getImageUrl(student.photoUrl) || 'https://via.placeholder.com/400x300?text=Student+Photo'}
                                                    alt={student.fullName}
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain',
                                                        objectPosition: 'center center',
                                                        transition: 'transform 0.3s ease-in-out',
                                                        '&:hover': {
                                                            transform: 'scale(1.05)',
                                                        },
                                                    }}
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/400x300?text=Student+Photo';
                                                    }}
                                                />

                                                {/* Gradient Overlay with Student Info */}
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        bottom: 0,
                                                        left: 0,
                                                        right: 0,
                                                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                                                        p: 2,
                                                        color: 'white',
                                                    }}
                                                >
                                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                                        {student.fullName}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ opacity: 0.95, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        📍 {student.location || 'Location not specified'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            
                                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                                                {/* Student Story/Description */}
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        mb: 2,
                                                        flexGrow: 1,
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 3,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        lineHeight: 1.6,
                                                        minHeight: '4.8em', // 3 lines * 1.6 line height
                                                    }}
                                                >
                                                    {student.story || 'No story available'}
                                                </Typography>
                                                
                                                {/* Funding Information */}
                                                <Box sx={{ mt: 'auto' }}>
                                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-end" spacing={2}>
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                                Funding Goal
                                                            </Typography>
                                                            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                                                ${student.fundingGoal?.toLocaleString() || '0'}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ textAlign: 'right' }}>
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                                Raised
                                                            </Typography>
                                                            <Typography variant="h6" color="success.main" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                                                ${student.amountRaised?.toLocaleString() || '0'}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                    
                                                    {/* Progress Bar */}
                                                    {student.fundingGoal > 0 && (
                                                        <Box sx={{ mt: 2 }}>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={Math.min(((student.amountRaised || 0) / student.fundingGoal) * 100, 100)}
                                                                sx={{
                                                                    height: 8,
                                                                    borderRadius: 4,
                                                                    bgcolor: 'grey.200',
                                                                    '& .MuiLinearProgress-bar': {
                                                                        borderRadius: 4,
                                                                        background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                                                                    },
                                                                }}
                                                            />
                                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}>
                                                                {Math.round(((student.amountRaised || 0) / student.fundingGoal) * 100)}% funded
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                    
                                                    {/* Action Buttons */}
                                                    <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
                                                        <Button
                                                            component={RouterLink}
                                                            to={`/students/${student.id}`}
                                                            variant="outlined"
                                                            size="medium"
                                                            fullWidth
                                                            sx={{
                                                                borderRadius: 2,
                                                                textTransform: 'none',
                                                                fontWeight: 600,
                                                                borderColor: 'primary.main',
                                                                color: 'primary.main',
                                                                '&:hover': {
                                                                    borderColor: 'primary.dark',
                                                                    bgcolor: alpha('#1976d2', 0.08),
                                                                },
                                                            }}
                                                        >
                                                            View Profile
                                                        </Button>
                                                        <Button
                                                            component={RouterLink}
                                                            to={`/students/${student.id}`}
                                                            variant="contained"
                                                            size="medium"
                                                            fullWidth
                                                            sx={{
                                                                borderRadius: 2,
                                                                textTransform: 'none',
                                                                fontWeight: 600,
                                                                bgcolor: '#dc004e',
                                                                color: 'white',
                                                                '&:hover': {
                                                                    bgcolor: '#c51162',
                                                                    boxShadow: 4,
                                                                },
                                                            }}
                                                        >
                                                            Donate
                                                        </Button>
                                                    </Stack>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                ))}
                            </Box>
                            
                            {/* View All Button */}
                            <Box sx={{ textAlign: 'center', mt: 6 }}>
                                <Button
                                    component={RouterLink}
                                    to="/students"
                                    variant="contained"
                                    size="large"
                                    endIcon={<ArrowForward />}
                                    sx={{ 
                                        px: 4, 
                                        py: 1.5, 
                                        borderRadius: 3,
                                        fontWeight: 600,
                                        boxShadow: 2,
                                        '&:hover': {
                                            boxShadow: 4,
                                            transform: 'translateY(-2px)',
                                        },
                                        transition: 'all 0.3s ease-in-out',
                                    }}
                                >
                                    View All Students
                                </Button>
                            </Box>
                        </>
                    )}
                </Container>
            </Box>

            {/* Features Section with Image Background */}
            <Box 
                sx={{ 
                    position: 'relative',
                    py: { xs: 4, sm: 6, md: 10 },
                    overflow: 'hidden',
                    bgcolor: 'white',
                }}
            >
                {/* Background Image - More Visible */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `url(${getImageUrl('/images/homepage/default2.jpg')})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.12,
                        filter: 'blur(0.5px)',
                    }}
                />
                {/* Very subtle overlay */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: alpha('#fff', 0.88),
                    }}
                />
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, px: { xs: 2, sm: 3 } }}>
                    <Typography
                        variant="h3"
                        align="center"
                        sx={{ 
                            fontWeight: 700, 
                            mb: { xs: 1, sm: 2 },
                            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' }
                        }}
                    >
                        Why Choose Us
                    </Typography>
                    <Typography
                        variant="h6"
                        align="center"
                        color="text.secondary"
                        sx={{ 
                            mb: { xs: 4, sm: 5, md: 6 }, 
                            maxWidth: 600, 
                            mx: 'auto',
                            fontSize: { xs: '1rem', sm: '1.25rem' },
                            px: { xs: 2, sm: 0 }
                        }}
                    >
                        We provide a transparent, secure, and impactful way to support students in need
                    </Typography>
                    <Grid
                        container
                        spacing={{ xs: 2, sm: 3, md: 4 }}
                        justifyContent="center"
                        alignItems="stretch"
                    >
                        {features.map((feature, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        height: '100%',
                                        p: { xs: 2.5, sm: 3.5 },
                                        borderRadius: 4,
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        bgcolor: 'white',
                                        border: '1px solid',
                                        borderColor: alpha('#1976d2', 0.15),
                                        boxShadow: '0px 4px 12px rgba(0,0,0,0.08)',
                                        '&:hover': {
                                            transform: 'translateY(-10px) scale(1.02)',
                                            boxShadow: '0px 12px 30px rgba(25, 118, 210, 0.2)',
                                            borderColor: 'primary.main',
                                            bgcolor: alpha('#1976d2', 0.02),
                                        },
                                    }}
                                >
                                    <Typography 
                                        variant="h2" 
                                        sx={{ 
                                            mb: { xs: 1.5, sm: 2 }, 
                                            textAlign: 'center',
                                            fontSize: { xs: '3rem', sm: '3.5rem', md: '4rem' },
                                            transition: 'transform 0.3s',
                                            '&:hover': {
                                                transform: 'scale(1.15) rotate(5deg)',
                                            },
                                        }}
                                    >
                                        {feature.icon}
                                    </Typography>
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            fontWeight: 700, 
                                            mb: 1.5, 
                                            textAlign: 'center',
                                            fontSize: { xs: '1.125rem', sm: '1.375rem' },
                                            color: 'primary.main',
                                        }}
                                    >
                                        {feature.title}
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary" 
                                        sx={{ 
                                            textAlign: 'center',
                                            fontSize: { xs: '0.9rem', sm: '1rem' },
                                            lineHeight: 1.7,
                                            flexGrow: 1,
                                        }}
                                    >
                                        {feature.description}
                                    </Typography>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${alpha('#dc004e', 0.95)} 0%, ${alpha('#f73378', 0.9)} 100%)`,
                    color: 'white',
                    py: { xs: 6, sm: 8, md: 12 },
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                    },
                }}
            >
                <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
                    <Typography 
                        variant="h3" 
                        align="center" 
                        sx={{ 
                            fontWeight: 800, 
                            mb: { xs: 1.5, sm: 2 },
                            fontSize: { xs: '1.875rem', sm: '2.5rem', md: '3.25rem' },
                            textShadow: '2px 2px 8px rgba(0,0,0,0.2)',
                            letterSpacing: '-0.02em',
                            color: 'white',
                        }}
                    >
                        Ready to Make a Difference?
                    </Typography>
                    <Typography 
                        variant="h6" 
                        align="center" 
                        sx={{ 
                            mb: { xs: 4, sm: 5 }, 
                            opacity: 0.95,
                            fontSize: { xs: '1.0625rem', sm: '1.25rem' },
                            textShadow: '1px 1px 4px rgba(0,0,0,0.2)',
                            lineHeight: 1.6,
                            color: 'white',
                        }}
                    >
                        Join thousands of donors who are changing lives through education
                    </Typography>
                    <Stack 
                        direction={{ xs: 'column', sm: 'row' }} 
                        spacing={2} 
                        justifyContent="center"
                        sx={{ maxWidth: { xs: '100%', sm: 'auto' } }}
                    >
                        <Button
                            component={Link}
                            to="/register/donor"
                            variant="contained"
                            size="large"
                            sx={{
                                bgcolor: 'white',
                                color: 'secondary.main',
                                px: { xs: 3, sm: 4 },
                                py: { xs: 1.25, sm: 1.5 },
                                borderRadius: 3,
                                fontWeight: 700,
                                fontSize: { xs: '0.95rem', sm: '1rem' },
                                textTransform: 'none',
                                boxShadow: '0px 4px 20px rgba(0,0,0,0.3)',
                                '&:hover': {
                                    bgcolor: '#f5f5f5',
                                    transform: 'translateY(-3px)',
                                    boxShadow: '0px 6px 25px rgba(0,0,0,0.4)',
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        >
                            Become a Donor
                        </Button>
                    </Stack>
                </Container>
            </Box>

            {/* Footer */}
            <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 6 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                                Student Charity Hub
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                Empowering students through education and connecting them with generous donors
                                worldwide.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Quick Links
                            </Typography>
                            <Stack spacing={1}>
                                <Link to="/students" style={{ color: 'inherit', textDecoration: 'none' }}>
                                    <Typography variant="body2" sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}>
                                        Browse Students
                                    </Typography>
                                </Link>
                                <Link to="/register" style={{ color: 'inherit', textDecoration: 'none' }}>
                                    <Typography variant="body2" sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}>
                                        Get Started
                                    </Typography>
                                </Link>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Contact
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                Email: support@studentcharityhub.com
                            </Typography>
                        </Grid>
                    </Grid>
                    <Typography
                        variant="body2"
                        align="center"
                        sx={{ mt: 4, pt: 4, borderTop: 1, borderColor: 'grey.800', opacity: 0.6 }}
                    >
                        © 2024 Student Charity Hub. All rights reserved.
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default HomePage;
