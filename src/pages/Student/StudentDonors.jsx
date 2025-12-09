import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Chip,
    Stack,
    Alert,
    Button,
} from '@mui/material';
import {
    People,
    ArrowBack,
    AttachMoney,
    Email,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';

const StudentDonors = () => {
    const navigate = useNavigate();
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDonors();
    }, []);

    const fetchDonors = async () => {
        try {
            setLoading(true);
            const response = await api.get('/students/my-donors');
            setDonors(response.data || []);
        } catch (error) {
            setError('Failed to fetch donors');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/student/dashboard')}>
                    Back to Dashboard
                </Button>
                <Typography variant="h4" sx={{ fontWeight: 700, flexGrow: 1 }}>
                    My Donors & Sponsors
                </Typography>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Card>
                <CardContent>
                    {loading ? (
                        <Typography>Loading...</Typography>
                    ) : donors.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <People sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                No donors yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Share your profile to attract supporters and donors!
                            </Typography>
                        </Box>
                    ) : (
                        <List>
                            {donors.map((donor, index) => (
                                <ListItem key={donor.donorId || index} divider={index < donors.length - 1}>
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
                                            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                                {donor.email && (
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <Email sx={{ fontSize: 14 }} />
                                                        <Typography variant="caption">{donor.email}</Typography>
                                                    </Stack>
                                                )}
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <AttachMoney sx={{ fontSize: 14 }} />
                                                    <Typography variant="caption">
                                                        Total: ${donor.totalAmount?.toLocaleString() || 0}
                                                    </Typography>
                                                    <Typography variant="caption">•</Typography>
                                                    <Typography variant="caption">
                                                        {donor.donationCount || 1} donation{donor.donationCount > 1 ? 's' : ''}
                                                    </Typography>
                                                </Stack>
                                                <Typography variant="caption" color="text.secondary">
                                                    First donation: {new Date(donor.firstDonation).toLocaleDateString()}
                                                </Typography>
                                            </Stack>
                                        }
                                    />
                                    <Stack spacing={1} alignItems="flex-end">
                                        <Chip
                                            label={`$${donor.totalAmount?.toLocaleString() || 0}`}
                                            size="small"
                                            color="primary"
                                            icon={<AttachMoney />}
                                        />
                                        <Chip
                                            label={`${donor.donationCount || 1} donation${donor.donationCount > 1 ? 's' : ''}`}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Stack>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default StudentDonors;
