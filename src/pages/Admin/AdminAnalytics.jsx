import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    alpha,
    Avatar,
    LinearProgress,
} from '@mui/material';
import {
    TrendingUp,
    People,
    AttachMoney,
    School,
} from '@mui/icons-material';
import api from '../../services/api';

const AdminAnalytics = () => {
    const [period, setPeriod] = useState('month');
    const [loading, setLoading] = useState(false);
    const [analytics, setAnalytics] = useState({
        totalUsers: 150,
        newUsers: 23,
        totalDonations: 125000,
        donationGrowth: 18,
        activeStudents: 45,
        studentGrowth: 12,
        averageDonation: 850,
        donationTrend: 15,
    });

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/analytics/overview?period=${period}`);
            const data = response.data;
            
            setAnalytics({
                totalUsers: data.totalUsers || 0,
                newUsers: data.newUsers || 0,
                totalDonations: data.totalDonations || 0,
                donationGrowth: data.donationGrowth || 0,
                activeStudents: data.activeStudents || 0,
                studentGrowth: 0, // Calculate if needed
                averageDonation: data.averageDonation || 0,
                donationTrend: data.donationGrowth || 0,
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Users',
            value: analytics.totalUsers,
            change: `+${analytics.newUsers} this ${period}`,
            icon: <People />,
            color: '#1976d2',
            trend: 'up',
        },
        {
            title: 'Total Donations',
            value: `$${analytics.totalDonations.toLocaleString()}`,
            change: `+${analytics.donationGrowth}% growth`,
            icon: <AttachMoney />,
            color: '#2e7d32',
            trend: 'up',
        },
        {
            title: 'Active Students',
            value: analytics.activeStudents,
            change: `+${analytics.studentGrowth}% growth`,
            icon: <School />,
            color: '#ed6c02',
            trend: 'up',
        },
        {
            title: 'Avg. Donation',
            value: `$${analytics.averageDonation}`,
            change: `+${analytics.donationTrend}% trend`,
            icon: <TrendingUp />,
            color: '#9c27b0',
            trend: 'up',
        },
    ];

    const monthlyData = [
        { month: 'Jan', donations: 8500, users: 12 },
        { month: 'Feb', donations: 12000, users: 18 },
        { month: 'Mar', donations: 15000, users: 25 },
        { month: 'Apr', donations: 18000, users: 32 },
        { month: 'May', donations: 22000, users: 38 },
        { month: 'Jun', donations: 28000, users: 45 },
    ];

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Analytics Dashboard
                </Typography>
                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Period</InputLabel>
                    <Select value={period} label="Period" onChange={(e) => setPeriod(e.target.value)}>
                        <MenuItem value="week">This Week</MenuItem>
                        <MenuItem value="month">This Month</MenuItem>
                        <MenuItem value="year">This Year</MenuItem>
                        <MenuItem value="all">All Time</MenuItem>
                    </Select>
                </FormControl>
            </Stack>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {statCards.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card
                            sx={{
                                background: `linear-gradient(135deg, ${alpha(stat.color, 0.1)} 0%, ${alpha(stat.color, 0.05)} 100%)`,
                                border: `1px solid ${alpha(stat.color, 0.2)}`,
                            }}
                        >
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Box>
                                        <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                                            {stat.title}
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color, mb: 0.5 }}>
                                            {stat.value}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'success.main' }}>
                                            {stat.change}
                                        </Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: stat.color, width: 48, height: 48 }}>
                                        {stat.icon}
                                    </Avatar>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Charts Placeholder */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                Donation Trends
                            </Typography>
                            <Box sx={{ height: 300, display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                                {monthlyData.map((data, index) => (
                                    <Box key={index} sx={{ flex: 1, textAlign: 'center' }}>
                                        <Box
                                            sx={{
                                                height: `${(data.donations / 30000) * 100}%`,
                                                bgcolor: 'primary.main',
                                                borderRadius: 1,
                                                mb: 1,
                                                transition: 'all 0.3s',
                                                '&:hover': {
                                                    bgcolor: 'primary.dark',
                                                    transform: 'scaleY(1.05)',
                                                },
                                            }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            {data.month}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                User Growth
                            </Typography>
                            <Stack spacing={2}>
                                {monthlyData.slice(-3).map((data, index) => (
                                    <Box key={index}>
                                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                            <Typography variant="body2">{data.month}</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {data.users} users
                                            </Typography>
                                        </Stack>
                                        <LinearProgress
                                            variant="determinate"
                                            value={(data.users / 50) * 100}
                                            sx={{ height: 8, borderRadius: 4 }}
                                        />
                                    </Box>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminAnalytics;
