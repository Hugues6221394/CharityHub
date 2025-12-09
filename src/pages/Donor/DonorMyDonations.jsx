import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Stack,
    Button,
    Chip,
    Alert,
    Grid,
} from '@mui/material';
import {
    History,
    ArrowBack,
    CheckCircle,
    Pending,
    Cancel,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const DonorMyDonations = () => {
    const navigate = useNavigate();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        totalDonated: 0,
        totalDonations: 0,
        completedDonations: 0,
    });

    useEffect(() => {
        fetchMyDonations();
    }, []);

    const fetchMyDonations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/donors/my-donations');
            const donationsData = response.data || [];
            setDonations(donationsData);

            // Calculate stats
            const totalDonated = donationsData
                .filter(d => d.status === 'Completed')
                .reduce((sum, d) => sum + (d.amount || 0), 0);
            const completedDonations = donationsData.filter(d => d.status === 'Completed').length;

            setStats({
                totalDonated,
                totalDonations: donationsData.length,
                completedDonations,
            });
        } catch (error) {
            setError('Failed to fetch donation history');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed': return <CheckCircle color="success" />;
            case 'Pending': return <Pending color="warning" />;
            case 'Failed': return <Cancel color="error" />;
            default: return <Pending />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'success';
            case 'Pending': return 'warning';
            case 'Failed': return 'error';
            default: return 'default';
        }
    };

    return (
        <Box>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/donor/dashboard')}>
                    Back to Dashboard
                </Button>
                <Typography variant="h4" sx={{ fontWeight: 700, flexGrow: 1 }}>
                    My Donation History
                </Typography>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">
                                Total Donated
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                ${stats.totalDonated.toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">
                                Total Donations
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                {stats.totalDonations}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">
                                Completed
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                                {stats.completedDonations}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {loading ? (
                <Typography>Loading...</Typography>
            ) : donations.length === 0 ? (
                <Card>
                    <CardContent>
                        <Alert severity="info">
                            You haven't made any donations yet. Browse students to start supporting!
                        </Alert>
                        <Button
                            variant="contained"
                            sx={{ mt: 2 }}
                            onClick={() => navigate('/students')}
                        >
                            Browse Students
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Student</TableCell>
                                        <TableCell>Amount</TableCell>
                                        <TableCell>Payment Method</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Transaction ID</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {donations.map((donation) => (
                                        <TableRow key={donation.id} hover>
                                            <TableCell>
                                                {new Date(donation.createdAt || donation.completedAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {donation.studentName || 'Unknown Student'}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>
                                                ${donation.amount?.toLocaleString() || 0}
                                            </TableCell>
                                            <TableCell>
                                                {donation.paymentMethod || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={getStatusIcon(donation.status)}
                                                    label={donation.status}
                                                    color={getStatusColor(donation.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                                    {donation.transactionId || 'N/A'}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default DonorMyDonations;

