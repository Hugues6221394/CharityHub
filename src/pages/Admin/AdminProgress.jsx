import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
    Grid,
    Alert,
    Avatar,
    Chip,
    CircularProgress,
    Button,
    TextField,
    InputAdornment,
} from '@mui/material';
import {
    School,
    TrendingUp,
    CalendarToday,
    Search,
} from '@mui/icons-material';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';
import { useNavigate } from 'react-router-dom';

const AdminProgress = () => {
    const navigate = useNavigate();
    const [progressUpdates, setProgressUpdates] = useState([]);
    const [filteredUpdates, setFilteredUpdates] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProgressUpdates();
    }, []);

    useEffect(() => {
        filterUpdates();
    }, [progressUpdates, searchTerm]);

    const fetchProgressUpdates = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get('/progress/all');
            setProgressUpdates(response.data || []);
        } catch (error) {
            console.error('Error fetching progress updates:', error);
            setError('Failed to load progress updates');
        } finally {
            setLoading(false);
        }
    };

    const filterUpdates = () => {
        if (searchTerm) {
            const filtered = progressUpdates.filter(
                (update) =>
                    update.student?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    update.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    update.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUpdates(filtered);
        } else {
            setFilteredUpdates(progressUpdates);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Student Progress Updates
                </Typography>
            </Stack>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Search */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <TextField
                        placeholder="Search by student name, title, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                    />
                </CardContent>
            </Card>

            {filteredUpdates.length === 0 ? (
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <Typography variant="h6" color="text.secondary">
                            {searchTerm ? 'No matching progress updates found' : 'No progress updates yet'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {searchTerm ? 'Try a different search term' : 'Students will post their progress updates here'}
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {filteredUpdates.map((update) => (
                        <Grid item xs={12} key={update.id}>
                            <Card>
                                <CardContent>
                                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                                        <Avatar
                                            src={getImageUrl(update.student?.photoUrl)}
                                            sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}
                                        >
                                            <School />
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                {update.student?.fullName || 'Student'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {update.student?.location || ''}
                                            </Typography>
                                        </Box>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => navigate(`/admin/students/${update.student?.id}`)}
                                        >
                                            View Profile
                                        </Button>
                                    </Stack>

                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                        {update.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {update.description}
                                    </Typography>

                                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                        {update.grade && (
                                            <Chip
                                                icon={<TrendingUp />}
                                                label={`Grade: ${update.grade}`}
                                                size="small"
                                                color="success"
                                            />
                                        )}
                                        {update.achievement && (
                                            <Chip
                                                icon={<School />}
                                                label={`Achievement: ${update.achievement}`}
                                                size="small"
                                                color="primary"
                                            />
                                        )}
                                        <Chip
                                            icon={<CalendarToday />}
                                            label={new Date(update.reportDate || update.createdAt).toLocaleDateString()}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Stack>

                                    {/* Media Preview */}
                                    {(update.photoUrl || update.videoUrl) && (
                                        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                            {update.photoUrl && (
                                                <Box
                                                    component="img"
                                                    src={getImageUrl(update.photoUrl)}
                                                    alt={update.title}
                                                    sx={{
                                                        maxWidth: '100%',
                                                        maxHeight: 300,
                                                        objectFit: 'contain',
                                                        borderRadius: 1,
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() => window.open(getImageUrl(update.photoUrl), '_blank')}
                                                />
                                            )}
                                            {update.videoUrl && (
                                                <Box
                                                    component="video"
                                                    src={getImageUrl(update.videoUrl)}
                                                    controls
                                                    sx={{
                                                        maxWidth: '100%',
                                                        maxHeight: 300,
                                                        borderRadius: 1,
                                                    }}
                                                />
                                            )}
                                        </Stack>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default AdminProgress;

