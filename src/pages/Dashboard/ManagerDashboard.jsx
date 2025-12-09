import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Stack,
    AppBar,
    Toolbar,
    alpha,
    Chip,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
} from '@mui/material';
import {
    Assignment,
    HourglassEmpty,
    CheckCircle,
    Logout,
    Visibility,
    ThumbDown,
    Send,
} from '@mui/icons-material';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import { studentApplicationService } from '../../services/studentApplicationService';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ManagerDashboard = () => {
    const { user, logout } = useAuth();
    const [applications, setApplications] = useState([]);
    const [donations, setDonations] = useState([]);
    const [donationStats, setDonationStats] = useState({
        totalDonations: 0,
        completedDonations: 0,
        pendingDonations: 0,
        totalAmount: 0,
    });
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Fetch applications
            const appsData = await studentApplicationService.getAllApplications();
            setApplications(appsData);

            // Fetch donations
            try {
                const donationsResponse = await api.get('/donations');
                const donationsData = donationsResponse.data?.donations || donationsResponse.data || [];
                setDonations(donationsData);

                // Calculate donation statistics
                const completed = donationsData.filter(d => d.status === 'Completed');
                const pending = donationsData.filter(d => d.status === 'Pending' || d.status === 'Processing');
                const totalAmount = completed.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);

                setDonationStats({
                    totalDonations: donationsData.length,
                    completedDonations: completed.length,
                    pendingDonations: pending.length,
                    totalAmount: totalAmount,
                });
            } catch (donationError) {
                console.error('Error fetching donations:', donationError);
                // Donations might not be accessible, that's okay
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewApplication = (app) => {
        setSelectedApp(app);
        setViewDialogOpen(true);
    };

    const handleForwardToAdmin = async (id) => {
        try {
            await studentApplicationService.forwardToAdmin(id);
            fetchApplications();
            setViewDialogOpen(false);
        } catch (error) {
            console.error('Error forwarding application:', error);
        }
    };

    const handleReject = async () => {
        if (!selectedApp) return;
        try {
            await studentApplicationService.rejectApplication(selectedApp.id, rejectReason);
            fetchApplications();
            setRejectDialogOpen(false);
            setViewDialogOpen(false);
            setRejectReason('');
        } catch (error) {
            console.error('Error rejecting application:', error);
        }
    };

    const pendingCount = applications.filter(a => a.status === 'Pending').length;
    const underReviewCount = applications.filter(a => a.status === 'UnderReview').length;
    const approvedCount = applications.filter(a => a.status === 'Approved').length;
    const rejectedCount = applications.filter(a => a.status === 'Rejected').length;

    const applicationStatusData = [
        { name: 'Approved', value: approvedCount, color: '#2e7d32' },
        { name: 'Pending', value: pendingCount, color: '#ed6c02' },
        { name: 'Under Review', value: underReviewCount, color: '#0288d1' },
        { name: 'Rejected', value: rejectedCount, color: '#d32f2f' },
    ];

    const donationStatusData = [
        { name: 'Completed', value: donationStats.completedDonations, color: '#2e7d32' },
        { name: 'Pending', value: donationStats.pendingDonations, color: '#ed6c02' },
    ];

    return (
        <Box>
            {/* Navigation */}
            <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider' }}>
                <Toolbar>
                    <Typography
                        variant="h6"
                        component={Link}
                        to="/"
                        sx={{ flexGrow: 1, textDecoration: 'none', color: 'primary.main', fontWeight: 700, fontSize: '1.5rem' }}
                    >
                        Student Charity Hub
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                            {user?.firstName} {user?.lastName} (Manager)
                        </Typography>
                        <Button startIcon={<Logout />} onClick={logout} sx={{ color: 'text.primary' }}>
                            Logout
                        </Button>
                    </Stack>
                </Toolbar>
            </AppBar>

            {/* Hero Section */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${alpha('#ed6c02', 0.95)} 0%, ${alpha('#ff9800', 0.9)} 100%)`,
                    color: 'white',
                    py: 6,
                }}
            >
                <Container maxWidth="lg">
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                        Manager Dashboard
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.95 }}>
                        Review and manage student applications
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 6 }}>
                {/* Stats */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card elevation={0} sx={{ p: 3, bgcolor: alpha('#ed6c02', 0.05), borderRadius: 3 }}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Box
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 2,
                                        bgcolor: alpha('#ed6c02', 0.1),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Assignment sx={{ fontSize: 28, color: '#ed6c02' }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#ed6c02' }}>
                                        {applications.length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Applications
                                    </Typography>
                                </Box>
                            </Stack>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <Card elevation={0} sx={{ p: 3, bgcolor: alpha('#1976d2', 0.05), borderRadius: 3 }}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Box
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 2,
                                        bgcolor: alpha('#1976d2', 0.1),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <HourglassEmpty sx={{ fontSize: 28, color: 'primary.main' }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                        {pendingCount}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Pending Review
                                    </Typography>
                                </Box>
                            </Stack>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <Card elevation={0} sx={{ p: 3, bgcolor: alpha('#2e7d32', 0.05), borderRadius: 3 }}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Box
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 2,
                                        bgcolor: alpha('#2e7d32', 0.1),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Send sx={{ fontSize: 28, color: '#2e7d32' }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                                        {underReviewCount}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Forwarded to Admin
                                    </Typography>
                                </Box>
                            </Stack>
                        </Card>
                    </Grid>
                </Grid>

                {/* Application Status Donut Chart */}
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    <Grid item xs={12} md={6}>
                        <Card elevation={0} sx={{ borderRadius: 3, height: '100%' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                                    Application Status Overview
                                </Typography>
                                {applications.length > 0 ? (
                                    <>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={applicationStatusData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {applicationStatusData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => value} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <Stack spacing={1.5} sx={{ mt: 3 }}>
                                            {applicationStatusData.map((item, index) => (
                                                <Stack key={index} direction="row" justifyContent="space-between" alignItems="center">
                                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                                        <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: item.color }} />
                                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                            {item.name}
                                                        </Typography>
                                                    </Stack>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: item.color }}>
                                                        {item.value}
                                                    </Typography>
                                                </Stack>
                                            ))}
                                        </Stack>
                                    </>
                                ) : (
                                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography color="text.secondary">No applications yet</Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card elevation={0} sx={{ borderRadius: 3, height: '100%' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                                    Quick Statistics
                                </Typography>
                                <Stack spacing={3}>
                                    <Box sx={{ p: 3, borderRadius: 2, bgcolor: alpha('#ed6c02', 0.1) }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                Total Applications
                                            </Typography>
                                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#ed6c02' }}>
                                                {applications.length}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                    <Box sx={{ p: 3, borderRadius: 2, bgcolor: alpha('#1976d2', 0.1) }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                Pending Review
                                            </Typography>
                                            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                                {pendingCount}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                    <Box sx={{ p: 3, borderRadius: 2, bgcolor: alpha('#2e7d32', 0.1) }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                Approved
                                            </Typography>
                                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                                                {approvedCount}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Donation Statistics Donut Chart */}
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    <Grid item xs={12} md={6}>
                        <Card elevation={0} sx={{ borderRadius: 3, height: '100%' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                                    Donation Status Overview
                                </Typography>
                                {donationStats.totalDonations > 0 ? (
                                    <>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={donationStatusData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {donationStatusData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => value} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <Stack spacing={1.5} sx={{ mt: 3 }}>
                                            {donationStatusData.map((item, index) => (
                                                <Stack key={index} direction="row" justifyContent="space-between" alignItems="center">
                                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                                        <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: item.color }} />
                                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                            {item.name}
                                                        </Typography>
                                                    </Stack>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: item.color }}>
                                                        {item.value}
                                                    </Typography>
                                                </Stack>
                                            ))}
                                        </Stack>
                                    </>
                                ) : (
                                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography color="text.secondary">No donation data available</Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card elevation={0} sx={{ borderRadius: 3, height: '100%' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                                    Donation Statistics
                                </Typography>
                                <Stack spacing={3}>
                                    <Box sx={{ p: 3, borderRadius: 2, bgcolor: alpha('#9c27b0', 0.1) }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                Total Donations
                                            </Typography>
                                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                                                {donationStats.totalDonations}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                    <Box sx={{ p: 3, borderRadius: 2, bgcolor: alpha('#2e7d32', 0.1) }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                Completed Donations
                                            </Typography>
                                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                                                {donationStats.completedDonations}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                    <Box sx={{ p: 3, borderRadius: 2, bgcolor: alpha('#1976d2', 0.1) }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                Total Amount Raised
                                            </Typography>
                                            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                                ${donationStats.totalAmount.toLocaleString()}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Applications List */}
                <Card elevation={0} sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                            Student Applications
                        </Typography>

                        {loading ? (
                            <Typography color="text.secondary">Loading...</Typography>
                        ) : applications.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography variant="h6" color="text.secondary">
                                    No applications yet
                                </Typography>
                            </Box>
                        ) : (
                            <Stack spacing={2}>
                                {applications.map((app) => (
                                    <Box
                                        key={app.id}
                                        sx={{
                                            p: 3,
                                            borderRadius: 2,
                                            bgcolor: alpha('#1976d2', 0.02),
                                            border: 1,
                                            borderColor: 'divider',
                                        }}
                                    >
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar sx={{ width: 56, height: 56 }}>
                                                    {app.fullName?.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                        {app.fullName}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {app.age} years • {app.currentResidency}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Chip
                                                    label={app.status}
                                                    color={
                                                        app.status === 'Pending' ? 'info' :
                                                            app.status === 'UnderReview' ? 'warning' :
                                                                app.status === 'Approved' ? 'success' : 'error'
                                                    }
                                                />
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<Visibility />}
                                                    onClick={() => handleViewApplication(app)}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    View
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </CardContent>
                </Card>
            </Container>

            {/* View Application Dialog */}
            <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Application Details</DialogTitle>
                <DialogContent>
                    {selectedApp && (
                        <Stack spacing={2}>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
                                <Typography variant="body1">{selectedApp.fullName}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Personal Story</Typography>
                                <Typography variant="body2">{selectedApp.personalStory}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Academic Background</Typography>
                                <Typography variant="body2">{selectedApp.academicBackground}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Requested Funding</Typography>
                                <Typography variant="body1">${selectedApp.requestedFundingAmount?.toLocaleString()}</Typography>
                            </Box>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
                    {selectedApp?.status === 'Pending' && (
                        <>
                            <Button
                                color="error"
                                startIcon={<ThumbDown />}
                                onClick={() => {
                                    setRejectDialogOpen(true);
                                    setViewDialogOpen(false);
                                }}
                            >
                                Reject
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<Send />}
                                onClick={() => handleForwardToAdmin(selectedApp.id)}
                            >
                                Forward to Admin
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Reject Application</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Rejection Reason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleReject}>
                        Reject Application
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ManagerDashboard;
