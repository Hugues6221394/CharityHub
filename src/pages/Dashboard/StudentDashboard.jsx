import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Avatar,
    Stack,
    LinearProgress,
    Button,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Chip,
    Alert,
    alpha,
} from '@mui/material';
import {
    AttachMoney,
    People,
    TrendingUp,
    Settings,
    Notifications,
    Description,
    CheckCircle,
    Cancel,
    Pending,
    Warning,
    Message,
} from '@mui/icons-material';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { studentApplicationService } from '../../services/studentApplicationService';
import { getImageUrl } from '../../utils/imageUtils';

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalFunds: 0,
        fundingGoal: 0,
        donorCount: 0,
        progressUpdates: 0,
    });
    const [donors, setDonors] = useState([]);
    const [recentUpdates, setRecentUpdates] = useState([]);
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch student profile and stats
            const profileResponse = await api.get('/students/my-profile');
            const profile = profileResponse.data;

            setStats({
                totalFunds: profile.amountRaised || 0,
                fundingGoal: profile.fundingGoal || 0,
                donorCount: profile.donorCount || 0,
                progressUpdates: profile.progressUpdateCount || 0,
            });

            // Fetch donors
            const donorsResponse = await api.get('/students/my-donors');
            setDonors(donorsResponse.data || []);

            // Fetch recent progress updates
            const updatesResponse = await api.get('/progress/my-progress-updates');
            setRecentUpdates(updatesResponse.data || []);

            // Fetch application status
            try {
                const appResponse = await studentApplicationService.getMyApplication();
                setApplication(appResponse);
            } catch (error) {
                // Application might not exist yet
                setApplication(null);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Rejected': return 'error';
            case 'UnderReview': return 'info';
            case 'Incomplete': return 'warning';
            default: return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Approved': return <CheckCircle />;
            case 'Rejected': return <Cancel />;
            case 'UnderReview': return <Pending />;
            case 'Incomplete': return <Warning />;
            default: return <Pending />;
        }
    };

    const handleContactManager = async () => {
        try {
            // Get managers list and navigate to messages
            navigate('/student/messages?contact=manager');
        } catch (error) {
            console.error('Error contacting manager:', error);
            alert('Failed to open messaging. Please try again.');
        }
    };

    const fundingProgress = stats.fundingGoal > 0
        ? (stats.totalFunds / stats.fundingGoal) * 100
        : 0;

    const fundingProgressData = [
        { name: 'Raised', value: stats.totalFunds, color: '#2e7d32' },
        { name: 'Remaining', value: Math.max(0, stats.fundingGoal - stats.totalFunds), color: '#e0e0e0' },
    ];

    const donorDistributionData = donors.slice(0, 5).map((donor, index) => {
        const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#0288d1'];
        return {
            name: donor.name || 'Anonymous',
            value: parseFloat(donor.totalAmount) || 0,
            color: colors[index % colors.length],
        };
    });

    if (loading) {
        return (
            <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Welcome back, {user?.firstName}!
                </Typography>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<Message />}
                        onClick={() => handleContactManager()}
                    >
                        Contact Manager
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<Notifications />}
                        onClick={() => navigate('/student/notifications')}
                    >
                        Notifications
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Settings />}
                        onClick={() => navigate('/student/settings')}
                    >
                        Settings
                    </Button>
                </Stack>
            </Stack>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.light' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography color="text.secondary" variant="body2">
                                        Total Funds Received
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                        ${stats.totalFunds.toLocaleString()}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                    <AttachMoney />
                                </Avatar>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: 'success.50', border: '1px solid', borderColor: 'success.light' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography color="text.secondary" variant="body2">
                                        Total Donors
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                                        {stats.donorCount}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'success.main' }}>
                                    <People />
                                </Avatar>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.light' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography color="text.secondary" variant="body2">
                                        Funding Goal
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                                        ${stats.fundingGoal.toLocaleString()}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'warning.main' }}>
                                    <TrendingUp />
                                </Avatar>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: 'info.50', border: '1px solid', borderColor: 'info.light' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography color="text.secondary" variant="body2">
                                        Progress Updates
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                                        {stats.progressUpdates}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'info.main' }}>
                                    <Notifications />
                                </Avatar>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Funding Progress with Donut Chart */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                Funding Progress
                            </Typography>
                            {stats.fundingGoal > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={fundingProgressData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                                startAngle={90}
                                                endAngle={-270}
                                            >
                                                {fundingProgressData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                                            {fundingProgress.toFixed(1)}%
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            of goal reached
                                        </Typography>
                                    </Box>
                                </>
                            ) : (
                                <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Alert severity="info">No funding goal set</Alert>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Funding Details
                            </Typography>
                            <Stack spacing={2}>
                                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'success.50' }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2" color="text.secondary">
                                            Total Raised
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                                            ${stats.totalFunds.toLocaleString()}
                                        </Typography>
                                    </Stack>
                                </Box>
                                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'warning.50' }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2" color="text.secondary">
                                            Funding Goal
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main' }}>
                                            ${stats.fundingGoal.toLocaleString()}
                                        </Typography>
                                    </Stack>
                                </Box>
                                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'info.50' }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2" color="text.secondary">
                                            Remaining
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'info.main' }}>
                                            ${Math.max(0, stats.fundingGoal - stats.totalFunds).toLocaleString()}
                                        </Typography>
                                    </Stack>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Donor Distribution Donut Chart */}
            {donors.length > 0 && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                            Top Donors Distribution
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={donorDistributionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                        >
                                            {donorDistributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Stack spacing={2}>
                                    {donorDistributionData.map((item, index) => (
                                        <Box key={index} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(item.color, 0.1) }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: item.color }} />
                                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                        {item.name}
                                                    </Typography>
                                                </Stack>
                                                <Typography variant="h6" sx={{ fontWeight: 700, color: item.color }}>
                                                    ${item.value.toLocaleString()}
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    ))}
                                </Stack>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            <Grid container spacing={3}>
                {/* My Donors */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                My Donors & Sponsors
                            </Typography>
                            {donors.length === 0 ? (
                                <Alert severity="info">
                                    No donors yet. Share your profile to attract supporters!
                                </Alert>
                            ) : (
                                <List>
                                    {donors.slice(0, 5).map((donor, index) => (
                                        <ListItem key={donor.donorId || index}>
                                            <ListItemAvatar>
                                                <Avatar 
                                                    src={getImageUrl(donor.profilePictureUrl)} 
                                                    sx={{ bgcolor: 'primary.main' }}
                                                >
                                                    {donor.name?.[0] || 'D'}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={donor.name || 'Anonymous Donor'}
                                                secondary={
                                                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                                        <Typography variant="caption">
                                                            Donated ${donor.totalAmount?.toLocaleString() || 0}
                                                        </Typography>
                                                        <Typography variant="caption">•</Typography>
                                                        <Typography variant="caption">
                                                            {donor.donationCount || 1} donation{donor.donationCount > 1 ? 's' : ''}
                                                        </Typography>
                                                    </Stack>
                                                }
                                            />
                                            <Chip 
                                                label={`$${donor.totalAmount?.toLocaleString() || 0}`} 
                                                size="small" 
                                                color="primary"
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                            {donors.length > 5 && (
                                <Button 
                                    fullWidth 
                                    sx={{ mt: 2 }}
                                    onClick={() => navigate('/student/donors')}
                                >
                                    View All Donors ({donors.length})
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Progress Updates */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Recent Progress Updates
                                </Typography>
                                <Button size="small" onClick={() => navigate('/student/progress')}>
                                    Create Update
                                </Button>
                            </Stack>
                            {recentUpdates.length === 0 ? (
                                <Alert severity="info">
                                    No progress updates yet. Share your journey with your donors!
                                </Alert>
                            ) : (
                                <List>
                                    {recentUpdates.slice(0, 3).map((update) => (
                                        <ListItem key={update.id || update.reportDate}>
                                            <ListItemText
                                                primary={update.title}
                                                secondary={
                                                    <>
                                                        <Typography variant="body2" component="span">
                                                            {update.description?.substring(0, 50)}...
                                                        </Typography>
                                                        <br />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {new Date(update.reportDate || update.createdAt).toLocaleDateString()}
                                                        </Typography>
                                                    </>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Application Status Card */}
            {application && (
                <Card sx={{ mt: 3, border: 2, borderColor: `${getStatusColor(application.status)}.main` }}>
                    <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Application Status
                            </Typography>
                            <Chip
                                icon={getStatusIcon(application.status)}
                                label={application.status}
                                color={getStatusColor(application.status)}
                                sx={{ fontWeight: 600 }}
                            />
                        </Stack>
                        {application.status === 'Incomplete' && application.rejectionReason && (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                    Missing Information:
                                </Typography>
                                <Typography variant="body2">
                                    {application.rejectionReason}
                                </Typography>
                            </Alert>
                        )}
                        {application.status === 'Rejected' && application.rejectionReason && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                    Rejection Reason:
                                </Typography>
                                <Typography variant="body2">
                                    {application.rejectionReason}
                                </Typography>
                            </Alert>
                        )}
                        <Button
                            variant="contained"
                            startIcon={<Description />}
                            onClick={() => navigate('/student/application-tracking')}
                            fullWidth
                        >
                            View Application Details
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Gallery and Documents Card */}
            {application && (application.galleryImageUrls?.length > 0 || application.proofDocumentUrls?.length > 0) && (
                <Card sx={{ mt: 3 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            My Gallery & Documents
                        </Typography>
                        <Grid container spacing={2}>
                            {/* Gallery Images */}
                            {application.galleryImageUrls && application.galleryImageUrls.length > 0 && (
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                        Gallery Images ({application.galleryImageUrls.length})
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {application.galleryImageUrls.slice(0, 4).map((imgUrl, idx) => (
                                            <Box
                                                key={idx}
                                                component="img"
                                                src={getImageUrl(imgUrl)}
                                                alt={`Gallery ${idx + 1}`}
                                                sx={{
                                                    width: '80px',
                                                    height: '80px',
                                                    objectFit: 'cover',
                                                    borderRadius: 2,
                                                    cursor: 'pointer',
                                                    border: 1,
                                                    borderColor: 'divider',
                                                    '&:hover': {
                                                        borderColor: 'primary.main',
                                                        transform: 'scale(1.05)',
                                                    },
                                                    transition: 'all 0.2s',
                                                }}
                                                onClick={() => window.open(getImageUrl(imgUrl), '_blank')}
                                            />
                                        ))}
                                        {application.galleryImageUrls.length > 4 && (
                                            <Box
                                                sx={{
                                                    width: '80px',
                                                    height: '80px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    bgcolor: 'grey.200',
                                                    borderRadius: 2,
                                                    border: 1,
                                                    borderColor: 'divider',
                                                }}
                                            >
                                                <Typography variant="caption">
                                                    +{application.galleryImageUrls.length - 4}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Grid>
                            )}

                            {/* Documents */}
                            {application.proofDocumentUrls && application.proofDocumentUrls.length > 0 && (
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                        Documents ({application.proofDocumentUrls.length})
                                    </Typography>
                                    <Stack spacing={1}>
                                        {application.proofDocumentUrls.map((docUrl, idx) => (
                                            <Button
                                                key={idx}
                                                variant="outlined"
                                                startIcon={<Description />}
                                                component="a"
                                                href={docUrl}
                                                target="_blank"
                                                fullWidth
                                                sx={{ justifyContent: 'flex-start' }}
                                            >
                                                Document {idx + 1}
                                            </Button>
                                        ))}
                                    </Stack>
                                </Grid>
                            )}
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* Quick Actions */}
            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Quick Actions
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                        {!application && (
                            <Button variant="contained" onClick={() => navigate('/student/application')}>
                                Submit Application
                            </Button>
                        )}
                        <Button variant="contained" onClick={() => navigate('/student/progress/new')}>
                            Post Progress Update
                        </Button>
                        <Button variant="outlined" onClick={() => navigate('/student/settings')}>
                            Edit Profile
                        </Button>
                        <Button variant="outlined" onClick={() => navigate('/student/donors')}>
                            View All Donors
                        </Button>
                        <Button variant="outlined" color="error" onClick={() => navigate('/student/settings')}>
                            Account Settings
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};

export default StudentDashboard;
