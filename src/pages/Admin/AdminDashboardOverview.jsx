import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    LinearProgress,
    Avatar,
    Stack,
    Chip,
    alpha,
    Button,
    IconButton,
    Paper,
    Divider,
    CircularProgress,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    People,
    School,
    AttachMoney,
    PersonAdd,
    TrendingUp,
    TrendingDown,
    Assignment,
    Message,
    BarChart,
    Assessment,
    Settings,
    ArrowForward,
    Refresh,
    CheckCircle,
    Pending,
    Cancel,
} from '@mui/icons-material';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    RadialBarChart,
    RadialBar,
} from 'recharts';
import { studentApplicationService } from '../../services/studentApplicationService';
import { adminService } from '../../services/adminService';

const COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f', '#0288d1'];

const AdminDashboardOverview = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStudents: 0,
        totalDonors: 0,
        totalRaised: 0,
        pendingApplications: 0,
        activeStudents: 0,
        newUsers: 0,
        donationGrowth: 0,
        averageDonation: 0,
    });
    const [donationTrends, setDonationTrends] = useState([]);
    const [userGrowth, setUserGrowth] = useState([]);
    const [applicationStats, setApplicationStats] = useState({
        total: 0,
        pending: 0,
        underReview: 0,
        approved: 0,
        rejected: 0,
    });
    const [recentApplications, setRecentApplications] = useState([]);
    const [userRoleDistribution, setUserRoleDistribution] = useState({
        Admin: 0,
        Manager: 0,
        Student: 0,
        Donor: 0,
    });
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');

    useEffect(() => {
        fetchDashboardData();
    }, [period]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch analytics overview
            const analyticsResponse = await adminService.getAnalytics(period);
            
            // Fetch donation trends
            const donationTrendsResponse = await adminService.getDonationTrends(period);
            
            // Fetch user growth
            const userGrowthResponse = await adminService.getUserGrowth(period);
            
            // Fetch application stats
            const appsResponse = await studentApplicationService.getApplicationsForAdmin();
            const pendingCount = appsResponse.data.filter(app => app.status === 'Pending').length;
            const underReviewCount = appsResponse.data.filter(app => app.status === 'UnderReview').length;
            const approvedCount = appsResponse.data.filter(app => app.status === 'Approved').length;
            const rejectedCount = appsResponse.data.filter(app => app.status === 'Rejected').length;

            // Fetch user role distribution
            const usersResponse = await adminService.getAllUsers();
            const userRoles = {
                Admin: 0,
                Manager: 0,
                Student: 0,
                Donor: 0,
            };
            if (usersResponse && Array.isArray(usersResponse)) {
                usersResponse.forEach(user => {
                    // API returns 'role' (singular) not 'roles' (array)
                    const role = user.role;
                    if (role && userRoles.hasOwnProperty(role)) {
                        userRoles[role]++;
                    }
                });
            }

            // Format donation trends data
            const formattedDonationTrends = donationTrendsResponse.map(item => ({
                name: `${new Date(item.year, item.month - 1).toLocaleString('default', { month: 'short' })} ${item.year}`,
                amount: parseFloat(item.total),
                count: item.count,
            }));

            // Format user growth data
            const formattedUserGrowth = userGrowthResponse.map(item => ({
                name: `${new Date(item.year, item.month - 1).toLocaleString('default', { month: 'short' })} ${item.year}`,
                users: item.count,
            }));

            setStats({
                totalUsers: analyticsResponse.totalUsers || 0,
                totalStudents: analyticsResponse.totalStudents || 0,
                totalDonors: analyticsResponse.totalDonors || 0,
                totalRaised: analyticsResponse.totalDonations || 0,
                pendingApplications: pendingCount,
                activeStudents: analyticsResponse.activeStudents || 0,
                newUsers: analyticsResponse.newUsers || 0,
                donationGrowth: analyticsResponse.donationGrowth || 0,
                averageDonation: analyticsResponse.averageDonation || 0,
            });

            setDonationTrends(formattedDonationTrends);
            setUserGrowth(formattedUserGrowth);
            setApplicationStats({
                total: appsResponse.data.length,
                pending: pendingCount,
                underReview: underReviewCount,
                approved: approvedCount,
                rejected: rejectedCount,
            });

            setUserRoleDistribution(userRoles);
            setRecentApplications(appsResponse.data.slice(0, 5));

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            change: stats.newUsers,
            changeLabel: 'New this period',
            icon: <People />,
            color: '#1976d2',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            path: '/admin/users',
        },
        {
            title: 'Active Students',
            value: stats.activeStudents,
            change: stats.totalStudents,
            changeLabel: 'Total Students',
            icon: <School />,
            color: '#2e7d32',
            gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            path: '/admin/students',
        },
        {
            title: 'Total Donors',
            value: stats.totalDonors,
            change: null,
            changeLabel: null,
            icon: <PersonAdd />,
            color: '#ed6c02',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            path: '/admin/users',
        },
        {
            title: 'Total Raised',
            value: `$${stats.totalRaised.toLocaleString()}`,
            change: stats.donationGrowth,
            changeLabel: 'Growth',
            icon: <AttachMoney />,
            color: '#9c27b0',
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            path: '/admin/donations',
        },
    ];

    const quickLinks = [
        { text: 'Applications', icon: <Assignment />, path: '/admin/applications', color: '#ed6c02' },
        { text: 'Students', icon: <School />, path: '/admin/students', color: '#2e7d32' },
        { text: 'Donations', icon: <AttachMoney />, path: '/admin/donations', color: '#9c27b0' },
        { text: 'Messages', icon: <Message />, path: '/admin/messages', color: '#1976d2' },
        { text: 'Analytics', icon: <BarChart />, path: '/admin/analytics', color: '#0288d1' },
        { text: 'Reports', icon: <Assessment />, path: '/admin/reports', color: '#d32f2f' },
    ];

    const applicationPieData = [
        { name: 'Approved', value: applicationStats.approved, color: '#2e7d32' },
        { name: 'Pending', value: applicationStats.pending, color: '#ed6c02' },
        { name: 'Under Review', value: applicationStats.underReview, color: '#0288d1' },
        { name: 'Rejected', value: applicationStats.rejected, color: '#d32f2f' },
    ];

    const userRolePieData = [
        { name: 'Students', value: userRoleDistribution.Student, color: '#2e7d32' },
        { name: 'Donors', value: userRoleDistribution.Donor, color: '#1976d2' },
        { name: 'Managers', value: userRoleDistribution.Manager, color: '#ed6c02' },
        { name: 'Admins', value: userRoleDistribution.Admin, color: '#9c27b0' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'warning';
            case 'UnderReview': return 'info';
            case 'Approved': return 'success';
            case 'Rejected': return 'error';
            default: return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Approved': return <CheckCircle />;
            case 'Pending': return <Pending />;
            case 'Rejected': return <Cancel />;
            default: return <Pending />;
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                justifyContent="space-between" 
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={2}
                sx={{ mb: { xs: 2, sm: 4 } }}
            >
                <Box>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 700, 
                            mb: 0.5,
                            fontSize: { xs: '1.5rem', sm: '2rem' }
                        }}
                    >
                        Dashboard Overview
                    </Typography>
                    <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                    >
                        Welcome back! Here's what's happening with your platform today.
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={fetchDashboardData}
                        disabled={loading}
                        size={isMobile ? 'small' : 'medium'}
                        fullWidth={isMobile}
                    >
                        Refresh
                    </Button>
                </Stack>
            </Stack>

            {/* Period Selector */}
            <Card sx={{ mb: { xs: 2, sm: 3 } }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Stack 
                        direction={{ xs: 'column', sm: 'row' }} 
                        spacing={{ xs: 1, sm: 2 }} 
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                    >
                        <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                            Period:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {['week', 'month', 'year'].map((p) => (
                                <Chip
                                    key={p}
                                    label={p.charAt(0).toUpperCase() + p.slice(1)}
                                    onClick={() => setPeriod(p)}
                                    color={period === p ? 'primary' : 'default'}
                                    variant={period === p ? 'filled' : 'outlined'}
                                    sx={{ 
                                        cursor: 'pointer',
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                    }}
                                />
                            ))}
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 4 } }}>
                {statCards.map((stat, index) => (
                    <Grid item xs={12} sm={6} lg={3} key={index}>
                        <Card
                            sx={{
                                height: '100%',
                                background: stat.gradient,
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 6,
                                },
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: -50,
                                    right: -50,
                                    width: 150,
                                    height: 150,
                                    borderRadius: '50%',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                },
                            }}
                            onClick={() => navigate(stat.path)}
                        >
                            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                                            {stat.title}
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {stat.value}
                                        </Typography>
                                        {stat.change !== null && (
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                                {stat.change >= 0 ? (
                                                    <TrendingUp sx={{ fontSize: 16 }} />
                                                ) : (
                                                    <TrendingDown sx={{ fontSize: 16 }} />
                                                )}
                                                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                                    {stat.change >= 0 ? '+' : ''}{stat.change}{stat.changeLabel === 'Growth' ? '%' : ''} {stat.changeLabel}
                                                </Typography>
                                            </Stack>
                                        )}
                                    </Box>
                                    <Avatar
                                        sx={{
                                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                                            width: 56,
                                            height: 56,
                                            backdropFilter: 'blur(10px)',
                                        }}
                                    >
                                        {stat.icon}
                                    </Avatar>
                                </Stack>
                                <Button
                                    size="small"
                                    endIcon={<ArrowForward />}
                                    sx={{
                                        color: 'white',
                                        textTransform: 'none',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                                        },
                                    }}
                                >
                                    View Details
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Charts Row */}
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 4 } }}>
                {/* Donation Trends */}
                <Grid item xs={12} lg={8}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Stack 
                                direction={{ xs: 'column', sm: 'row' }} 
                                justifyContent="space-between" 
                                alignItems={{ xs: 'flex-start', sm: 'center' }}
                                spacing={1}
                                sx={{ mb: { xs: 2, sm: 3 } }}
                            >
                                <Box>
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            fontWeight: 600, 
                                            mb: 0.5,
                                            fontSize: { xs: '1.125rem', sm: '1.25rem' }
                                        }}
                                    >
                                        Donation Trends
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary"
                                        sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                                    >
                                        Total donations over time
                                    </Typography>
                                </Box>
                                <IconButton 
                                    size="small" 
                                    onClick={() => navigate('/admin/analytics')}
                                    sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}
                                >
                                    <ArrowForward />
                                </IconButton>
                            </Stack>
                            {donationTrends.length > 0 ? (
                                <Box sx={{ width: '100%', height: { xs: 250, sm: 300 }, overflow: 'hidden' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={donationTrends}>
                                        <defs>
                                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="name" stroke="#666" />
                                        <YAxis stroke="#666" />
                                        <Tooltip
                                            formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                border: '1px solid #e0e0e0',
                                                borderRadius: '8px',
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#667eea"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorAmount)"
                                        />
                                    </AreaChart>
                                    </ResponsiveContainer>
                                </Box>
                            ) : (
                                <Box sx={{ height: { xs: 250, sm: 300 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography color="text.secondary">No donation data available</Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Application Status Donut Chart */}
                <Grid item xs={12} lg={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                Application Status
                            </Typography>
                            {applicationStats.total > 0 ? (
                                <Box sx={{ width: '100%', height: { xs: 250, sm: 300 }, overflow: 'hidden' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={applicationPieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={isMobile ? 40 : 60}
                                                outerRadius={isMobile ? 80 : 100}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                            >
                                                {applicationPieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => value} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                            ) : (
                                <Box sx={{ height: { xs: 250, sm: 300 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography color="text.secondary">No applications yet</Typography>
                                </Box>
                            )}
                            <Stack spacing={1} sx={{ mt: 2 }}>
                                {applicationPieData.map((item, index) => (
                                    <Stack key={index} direction="row" justifyContent="space-between" alignItems="center">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
                                            <Typography variant="body2">{item.name}</Typography>
                                        </Stack>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {item.value}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* User Role Distribution and User Growth Row */}
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 4 } }}>
                {/* User Role Distribution Donut Chart */}
                <Grid item xs={12} lg={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    fontWeight: 600, 
                                    mb: { xs: 2, sm: 3 },
                                    fontSize: { xs: '1.125rem', sm: '1.25rem' }
                                }}
                            >
                                User Distribution
                            </Typography>
                            {Object.values(userRoleDistribution).some(v => v > 0) ? (
                                <Box sx={{ width: '100%', height: { xs: 250, sm: 300 }, overflow: 'hidden' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={userRolePieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={isMobile ? 40 : 60}
                                                outerRadius={isMobile ? 80 : 100}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                            >
                                                {userRolePieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => value} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                            ) : (
                                <Box sx={{ height: { xs: 250, sm: 300 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography color="text.secondary">No user data available</Typography>
                                </Box>
                            )}
                            <Stack spacing={1} sx={{ mt: 2 }}>
                                {userRolePieData.map((item, index) => (
                                    <Stack key={index} direction="row" justifyContent="space-between" alignItems="center">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
                                            <Typography variant="body2">{item.name}</Typography>
                                        </Stack>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {item.value}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* User Growth */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                        User Growth
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        New user registrations over time
                                    </Typography>
                                </Box>
                                <IconButton size="small" onClick={() => navigate('/admin/analytics')}>
                                    <ArrowForward />
                                </IconButton>
                            </Stack>
                            {userGrowth.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={userGrowth}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="name" stroke="#666" />
                                        <YAxis stroke="#666" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                border: '1px solid #e0e0e0',
                                                borderRadius: '8px',
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="users"
                                            stroke="#2e7d32"
                                            strokeWidth={3}
                                            dot={{ fill: '#2e7d32', r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography color="text.secondary">No user growth data available</Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

            </Grid>

            {/* Recent Applications */}
            <Card>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Recent Applications
                        </Typography>
                        <Button
                            size="small"
                            endIcon={<ArrowForward />}
                            onClick={() => navigate('/admin/applications')}
                        >
                            View All
                        </Button>
                    </Stack>
                    {recentApplications.length === 0 ? (
                        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                            No recent applications
                        </Typography>
                    ) : (
                        <Stack spacing={2}>
                            {recentApplications.map((app) => (
                                <Paper
                                    key={app.id}
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: 'grey.50',
                                        border: '1px solid',
                                        borderColor: 'grey.200',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            bgcolor: 'grey.100',
                                            borderColor: 'primary.main',
                                            transform: 'translateX(4px)',
                                        },
                                    }}
                                >
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
                                            <Avatar sx={{ bgcolor: alpha('#1976d2', 0.1), color: '#1976d2' }}>
                                                {getStatusIcon(app.status)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    {app.fullName || `${app.firstName} ${app.lastName}`}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {app.email} • {new Date(app.submittedAt).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                        <Chip
                                            icon={getStatusIcon(app.status)}
                                            label={app.status}
                                            color={getStatusColor(app.status)}
                                            size="small"
                                        />
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default AdminDashboardOverview;
