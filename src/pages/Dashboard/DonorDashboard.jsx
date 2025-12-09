import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Avatar,
    Stack,
    Button,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Chip,
    LinearProgress,
    Alert,
} from '@mui/material';
import {
    AttachMoney,
    People,
    TrendingUp,
    Settings,
    Favorite,
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

const DonorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalDonated: 0,
        studentsSponsored: 0,
        thisMonthDonations: 0,
        impactScore: 0,
    });
    const [sponsoredStudents, setSponsoredStudents] = useState([]);
    const [recentDonations, setRecentDonations] = useState([]);
    const [monthlyTrends, setMonthlyTrends] = useState([]);
    const [donationDistribution, setDonationDistribution] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch donor stats
            const statsResponse = await api.get('/donors/my-stats');
            setStats(statsResponse.data || {
                totalDonated: 0,
                studentsSponsored: 0,
                thisMonthDonations: 0,
                impactScore: 0,
            });

            // Fetch sponsored students
            const studentsResponse = await api.get('/donors/my-students');
            setSponsoredStudents(studentsResponse.data || []);

            // Fetch recent donations
            const donationsResponse = await api.get('/donations/my-donations');
            const donationsData = donationsResponse.data?.donations || donationsResponse.data || [];
            setRecentDonations(donationsData);

            // Fetch monthly trends
            const trendsResponse = await api.get('/donors/monthly-trends');
            setMonthlyTrends(trendsResponse.data || []);

            // Calculate donation distribution by student
            const distributionMap = new Map();
            donationsData.forEach(donation => {
                const studentName = donation.studentName || 'Unknown';
                const amount = parseFloat(donation.amount) || 0;
                if (distributionMap.has(studentName)) {
                    distributionMap.set(studentName, distributionMap.get(studentName) + amount);
                } else {
                    distributionMap.set(studentName, amount);
                }
            });
            
            const distribution = Array.from(distributionMap.entries())
                .map(([name, amount]) => ({ name, value: amount }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 5); // Top 5 students
            
            setDonationDistribution(distribution);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

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
                        onClick={() => navigate('/students')}
                    >
                        Browse Students
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Settings />}
                        onClick={() => navigate('/donor/settings')}
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
                                        Total Donated
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                        ${stats.totalDonated?.toLocaleString() || 0}
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
                                        Students Sponsored
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                                        {stats.studentsSponsored || 0}
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
                                        This Month
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                                        ${stats.thisMonthDonations?.toLocaleString() || 0}
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
                    <Card sx={{ bgcolor: 'error.50', border: '1px solid', borderColor: 'error.light' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography color="text.secondary" variant="body2">
                                        Impact Score
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                                        {stats.impactScore || 0}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'error.main' }}>
                                    <Favorite />
                                </Avatar>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Charts Row */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Donation Distribution Donut Chart */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                Donation Distribution
                            </Typography>
                            {donationDistribution.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={donationDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                            >
                                                {donationDistribution.map((entry, index) => {
                                                    const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#0288d1'];
                                                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                                })}
                                            </Pie>
                                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <Stack spacing={1} sx={{ mt: 2 }}>
                                        {donationDistribution.map((item, index) => {
                                            const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#0288d1'];
                                            return (
                                                <Stack key={index} direction="row" justifyContent="space-between" alignItems="center">
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: colors[index % colors.length] }} />
                                                        <Typography variant="body2">{item.name}</Typography>
                                                    </Stack>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        ${item.value.toLocaleString()}
                                                    </Typography>
                                                </Stack>
                                            );
                                        })}
                                    </Stack>
                                </>
                            ) : (
                                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Alert severity="info">No donation data available</Alert>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Monthly Contribution Trends */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Monthly Contribution Trends
                            </Typography>
                    {monthlyTrends.length === 0 ? (
                        <Alert severity="info">No donation history yet. Start making a difference today!</Alert>
                    ) : (
                        <Box sx={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                            {monthlyTrends.slice(-6).map((trend, index) => {
                                const maxAmount = Math.max(...monthlyTrends.map(t => t.amount));
                                const height = maxAmount > 0 ? (trend.amount / maxAmount) * 100 : 0;

                                return (
                                    <Box key={index} sx={{ flex: 1, textAlign: 'center' }}>
                                        <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
                                            ${trend.amount}
                                        </Typography>
                                        <Box
                                            sx={{
                                                height: `${height}%`,
                                                minHeight: '20px',
                                                bgcolor: 'primary.main',
                                                borderRadius: 1,
                                                transition: 'all 0.3s',
                                                '&:hover': {
                                                    bgcolor: 'primary.dark',
                                                    transform: 'scaleY(1.05)',
                                                },
                                            }}
                                        />
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                            {trend.month}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Sponsored Students */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                My Sponsored Students
                            </Typography>
                            {sponsoredStudents.length === 0 ? (
                                <Alert severity="info">
                                    You haven't sponsored any students yet. Browse students to start making an impact!
                                </Alert>
                            ) : (
                                <List>
                                    {sponsoredStudents.slice(0, 5).map((student, index) => (
                                        <ListItem
                                            key={index}
                                            button
                                            onClick={() => navigate(`/students/${student.id}`)}
                                        >
                                            <ListItemAvatar>
                                                <Avatar src={student.photoUrl} sx={{ bgcolor: 'success.main' }}>
                                                    {student.fullName?.[0] || 'S'}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={student.fullName}
                                                secondary={`${student.fieldOfStudy || 'Student'} • $${student.totalDonated?.toLocaleString() || 0} donated`}
                                            />
                                            <Stack direction="column" alignItems="flex-end">
                                                <Chip
                                                    label={`${student.fundingProgress || 0}%`}
                                                    size="small"
                                                    color="primary"
                                                />
                                                <Typography variant="caption" color="text.secondary">
                                                    funded
                                                </Typography>
                                            </Stack>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                            {sponsoredStudents.length > 5 && (
                                <Button fullWidth sx={{ mt: 2 }} onClick={() => navigate('/donor/students')}>
                                    View All Students ({sponsoredStudents.length})
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Donations */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Recent Donations
                            </Typography>
                            {recentDonations.length === 0 ? (
                                <Alert severity="info">
                                    No donations yet. Start supporting students today!
                                </Alert>
                            ) : (
                                <List>
                                    {recentDonations.slice(0, 5).map((donation, index) => (
                                        <ListItem key={index}>
                                            <ListItemText
                                                primary={`$${donation.amount?.toLocaleString() || 0} to ${donation.studentName}`}
                                                secondary={new Date(donation.createdAt).toLocaleDateString()}
                                            />
                                            <Chip
                                                label={donation.status || 'Completed'}
                                                size="small"
                                                color={donation.status === 'Completed' ? 'success' : 'warning'}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                            {recentDonations.length > 5 && (
                                <Button fullWidth sx={{ mt: 2 }} onClick={() => navigate('/donor/donations')}>
                                    View All Donations ({recentDonations.length})
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Impact Metrics */}
            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Your Impact
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                                <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                    {stats.studentsSponsored || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Students Helped
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                                <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                                    ${stats.totalDonated?.toLocaleString() || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Contribution
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.50', borderRadius: 2 }}>
                                <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                                    {recentDonations.length || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Donations
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Quick Actions
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                        <Button variant="contained" onClick={() => navigate('/students')}>
                            Browse Students
                        </Button>
                        <Button variant="outlined" onClick={() => navigate('/donor/students')}>
                            My Sponsored Students
                        </Button>
                        <Button variant="outlined" onClick={() => navigate('/donor/donations')}>
                            Donation History
                        </Button>
                        <Button variant="outlined" color="error" onClick={() => navigate('/donor/settings')}>
                            Account Settings
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};

export default DonorDashboard;
