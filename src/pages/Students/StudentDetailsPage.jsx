import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    LinearProgress,
    Chip,
    Stack,
    Button,
    AppBar,
    Toolbar,
    alpha,
    Skeleton,
    Grid,
    Divider,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
} from '@mui/material';
import {
    LocationOn,
    School,
    TrendingUp,
    ArrowBack,
    Favorite,
    Description,
    CalendarToday,
    AttachMoney,
    People,
    Download,
    FavoriteBorder,
} from '@mui/icons-material';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';
import DonationPayment from '../../components/Payment/DonationPayment';
import { getImageUrl } from '../../utils/imageUtils';
import api from '../../services/api';

const StudentDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [donationDialogOpen, setDonationDialogOpen] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followingLoading, setFollowingLoading] = useState(false);

    useEffect(() => {
        fetchStudent();
        if (isAuthenticated && user?.role === 'Donor') {
            checkFollowingStatus();
        }
    }, [id, isAuthenticated, user]);

    const fetchStudent = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await studentService.getStudent(parseInt(id));
            setStudent(data);
        } catch (err) {
            console.error('Error fetching student:', err);
            setError('Failed to load student details');
        } finally {
            setLoading(false);
        }
    };

    const handleDonationSuccess = () => {
        setDonationDialogOpen(false);
        // Refresh student data to show updated funding
        fetchStudent();
    };

    const checkFollowingStatus = async () => {
        try {
            const response = await api.get('/donors/following');
            const following = response.data || [];
            const isFollowingStudent = following.some(f => f.studentId === parseInt(id));
            setIsFollowing(isFollowingStudent);
        } catch (error) {
            console.error('Error checking follow status:', error);
        }
    };

    const handleFollowToggle = async () => {
        if (!isAuthenticated || user?.role !== 'Donor') {
            navigate('/login');
            return;
        }

        try {
            setFollowingLoading(true);
            if (isFollowing) {
                await api.delete(`/donors/follow/${id}`);
                setIsFollowing(false);
            } else {
                await api.post(`/donors/follow/${id}`);
                setIsFollowing(true);
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
            setError('Failed to update follow status');
        } finally {
            setFollowingLoading(false);
        }
    };

    const handleDownloadDocument = (doc) => {
        const url = getImageUrl(doc.filePath);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.fileName || `document-${doc.id}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <Box>
                <AppBar
                    position="sticky"
                    elevation={0}
                    sx={{
                        bgcolor: 'white',
                        borderBottom: 1,
                        borderColor: 'divider',
                    }}
                >
                    <Toolbar>
                        <Skeleton variant="text" width={200} height={40} />
                    </Toolbar>
                </AppBar>
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    <Skeleton variant="rectangular" height={400} sx={{ mb: 3, borderRadius: 2 }} />
                    <Skeleton variant="text" height={40} width="60%" />
                    <Skeleton variant="text" height={30} width="40%" />
                </Container>
            </Box>
        );
    }

    if (error || !student) {
        return (
            <Box>
                <AppBar
                    position="sticky"
                    elevation={0}
                    sx={{
                        bgcolor: 'white',
                        borderBottom: 1,
                        borderColor: 'divider',
                    }}
                >
                    <Toolbar>
                        <Button
                            startIcon={<ArrowBack />}
                            component={Link}
                            to="/students"
                            sx={{ color: 'text.primary' }}
                        >
                            Back to Students
                        </Button>
                    </Toolbar>
                </AppBar>
                <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
                    <Typography variant="h5" color="error" sx={{ mb: 2 }}>
                        {error || 'Student not found'}
                    </Typography>
                    <Button variant="contained" component={Link} to="/students">
                        Browse All Students
                    </Button>
                </Container>
            </Box>
        );
    }

    const fundingProgress = student.fundingProgress || 0;
    const isDonor = isAuthenticated && user?.role === 'Donor';

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
                <Toolbar>
                    <Button
                        startIcon={<ArrowBack />}
                        component={Link}
                        to="/students"
                        sx={{ color: 'text.primary', mr: 2 }}
                    >
                        Back to Students
                    </Button>
                    <Typography
                        variant="h6"
                        component={Link}
                        to="/"
                        sx={{
                            flexGrow: 1,
                            textDecoration: 'none',
                            color: 'primary.main',
                            fontWeight: 700,
                        }}
                    >
                        Student Charity Hub
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <Button color="inherit" component={Link} to="/" sx={{ color: 'text.primary' }}>
                            Home
                        </Button>
                        {!isAuthenticated && (
                            <>
                                <Button color="inherit" component={Link} to="/login" sx={{ color: 'text.primary' }}>
                                    Login
                                </Button>
                                <Button variant="contained" component={Link} to="/register" sx={{ borderRadius: 2 }}>
                                    Get Started
                                </Button>
                            </>
                        )}
                    </Stack>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Grid container spacing={4}>
                    {/* Left Column - Main Content */}
                    <Grid item xs={12} md={8}>
                        {/* Student Photo and Basic Info */}
                        <Card sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
                            <Box
                                sx={{
                                    position: 'relative',
                                    width: '100%',
                                    paddingTop: '75%', // 4:3 aspect ratio for full image visibility
                                    bgcolor: 'grey.100',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Box
                                    component="img"
                                    src={getImageUrl(student.photoUrl) || 'https://via.placeholder.com/800x600?text=Student+Photo'}
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
                                    }}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/800x600?text=Student+Photo';
                                    }}
                                />
                            </Box>
                            <CardContent sx={{ p: 4 }}>
                                <Stack spacing={3}>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                                            {student.fullName}
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                            <Chip
                                                icon={<LocationOn sx={{ fontSize: 16 }} />}
                                                label={student.location}
                                                sx={{ bgcolor: alpha('#1976d2', 0.1), color: 'primary.main' }}
                                            />
                                            <Chip
                                                label={`${student.age} years old`}
                                                sx={{ bgcolor: alpha('#1976d2', 0.1), color: 'primary.main' }}
                                            />
                                            {student.dreamCareer && (
                                                <Chip
                                                    icon={<School sx={{ fontSize: 16 }} />}
                                                    label={student.dreamCareer}
                                                    sx={{ bgcolor: alpha('#dc004e', 0.1), color: 'secondary.main' }}
                                                />
                                            )}
                                        </Stack>
                                    </Box>

                                    {/* Funding Progress */}
                                    <Box>
                                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                Funding Progress
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                                {fundingProgress.toFixed(1)}%
                                            </Typography>
                                        </Stack>
                                        <LinearProgress
                                            variant="determinate"
                                            value={Math.min(fundingProgress, 100)}
                                            sx={{
                                                height: 12,
                                                borderRadius: 6,
                                                bgcolor: alpha('#1976d2', 0.1),
                                                '& .MuiLinearProgress-bar': {
                                                    borderRadius: 6,
                                                },
                                            }}
                                        />
                                        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                ${student.amountRaised?.toLocaleString() || 0} raised
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Goal: ${student.fundingGoal?.toLocaleString() || 0}
                                            </Typography>
                                        </Stack>
                                    </Box>

                                    {/* Story */}
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                            My Story
                                        </Typography>
                                        <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                                            {student.story}
                                        </Typography>
                                    </Box>

                                    {/* My Gallery */}
                                    {student.galleryImageUrls && student.galleryImageUrls.length > 0 && (
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                                My Gallery
                                            </Typography>
                                            <Grid container spacing={2}>
                                                {student.galleryImageUrls.map((imgUrl, idx) => (
                                                    <Grid item xs={6} sm={4} md={3} key={idx}>
                                                        <Box
                                                            component="img"
                                                            src={getImageUrl(imgUrl)}
                                                            alt={`Gallery ${idx + 1}`}
                                                            sx={{
                                                                width: '100%',
                                                                height: '200px',
                                                                objectFit: 'cover',
                                                                borderRadius: 2,
                                                                cursor: 'pointer',
                                                                transition: 'transform 0.2s',
                                                                '&:hover': {
                                                                    transform: 'scale(1.05)',
                                                                },
                                                            }}
                                                            onClick={() => {
                                                                // Open image in full screen (you can add a lightbox here)
                                                                window.open(getImageUrl(imgUrl), '_blank');
                                                            }}
                                                        />
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Box>
                                    )}

                                    {/* Academic Background */}
                                    {student.academicBackground && (
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                                Academic Background
                                            </Typography>
                                            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                                                {student.academicBackground}
                                            </Typography>
                                        </Box>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>

                        {/* Progress Reports */}
                        {student.progressReports && student.progressReports.length > 0 && (
                            <Card sx={{ mb: 3, borderRadius: 3 }}>
                                <CardContent sx={{ p: 4 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                        Progress Updates
                                    </Typography>
                                    <Stack spacing={3}>
                                        {student.progressReports.map((report) => (
                                            <Paper
                                                key={report.id}
                                                elevation={0}
                                                sx={{
                                                    p: 3,
                                                    bgcolor: alpha('#1976d2', 0.05),
                                                    borderRadius: 2,
                                                }}
                                            >
                                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                        {report.title}
                                                    </Typography>
                                                    <Chip
                                                        icon={<CalendarToday sx={{ fontSize: 14 }} />}
                                                        label={new Date(report.reportDate).toLocaleDateString()}
                                                        size="small"
                                                    />
                                                </Stack>
                                                {report.grade && (
                                                    <Chip
                                                        icon={<School sx={{ fontSize: 14 }} />}
                                                        label={`Grade: ${report.grade}`}
                                                        size="small"
                                                        sx={{ mb: 2, bgcolor: alpha('#1976d2', 0.1) }}
                                                    />
                                                )}
                                                <Typography variant="body2" sx={{ mt: 1, lineHeight: 1.8 }}>
                                                    {report.description}
                                                </Typography>
                                            </Paper>
                                        ))}
                                    </Stack>
                                </CardContent>
                            </Card>
                        )}

                        {/* Documents */}
                        {student.documents && student.documents.length > 0 && (
                            <Card sx={{ borderRadius: 3 }}>
                                <CardContent sx={{ p: 4 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                        Documents
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {student.documents.map((doc) => (
                                            <Grid item xs={12} sm={6} key={doc.id}>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 2,
                                                        border: 1,
                                                        borderColor: 'divider',
                                                        borderRadius: 2,
                                                        '&:hover': {
                                                            bgcolor: alpha('#1976d2', 0.05),
                                                        },
                                                    }}
                                                >
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Description sx={{ color: 'primary.main' }} />
                                                        <Box flex={1}>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                {doc.fileName}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {new Date(doc.uploadedAt).toLocaleDateString()}
                                                            </Typography>
                                                        </Box>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDownloadDocument(doc)}
                                                            title="Download document"
                                                        >
                                                            <Download />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            component="a"
                                                            href={getImageUrl(doc.filePath)}
                                                            target="_blank"
                                                            title="View document"
                                                        >
                                                            <Description />
                                                        </IconButton>
                                                    </Stack>
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </CardContent>
                            </Card>
                        )}
                    </Grid>

                    {/* Right Column - Donation Card & Stats */}
                    <Grid item xs={12} md={4}>
                        <Card
                            sx={{
                                position: 'sticky',
                                top: 80,
                                borderRadius: 3,
                                border: 2,
                                borderColor: 'primary.main',
                            }}
                        >
                            <CardContent sx={{ p: 4 }}>
                                <Stack spacing={3}>
                                    <Box textAlign="center">
                                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                                            Support {student.fullName.split(' ')[0]}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Help make their educational dreams come true
                                        </Typography>
                                    </Box>

                                    <Divider />

                                    {/* Stats */}
                                    <Stack spacing={2}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <People sx={{ color: 'primary.main' }} />
                                                <Typography variant="body2">Supporters</Typography>
                                            </Stack>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                {student.donorCount || 0}
                                            </Typography>
                                        </Stack>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <AttachMoney sx={{ color: 'primary.main' }} />
                                                <Typography variant="body2">Raised</Typography>
                                            </Stack>
                                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                ${student.amountRaised?.toLocaleString() || 0}
                                            </Typography>
                                        </Stack>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <TrendingUp sx={{ color: 'primary.main' }} />
                                                <Typography variant="body2">Goal</Typography>
                                            </Stack>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                ${student.fundingGoal?.toLocaleString() || 0}
                                            </Typography>
                                        </Stack>
                                    </Stack>

                                    <Divider />

                                    {/* Donation Button */}
                                    {isDonor ? (
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            startIcon={<Favorite />}
                                            onClick={() => setDonationDialogOpen(true)}
                                            sx={{
                                                py: 1.5,
                                                fontWeight: 600,
                                                borderRadius: 2,
                                            }}
                                        >
                                            Make a Donation
                                        </Button>
                                    ) : (
                                        <Stack spacing={2}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                size="large"
                                                startIcon={<Favorite />}
                                                onClick={() => setDonationDialogOpen(true)}
                                                sx={{
                                                    py: 1.5,
                                                    fontWeight: 600,
                                                    borderRadius: 2,
                                                }}
                                            >
                                                Donate as Guest
                                            </Button>
                                            <Divider>or</Divider>
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                size="medium"
                                                component={Link}
                                                to="/register/donor"
                                                sx={{ borderRadius: 2 }}
                                            >
                                                Register to Donate
                                            </Button>
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                size="medium"
                                                component={Link}
                                                to="/login"
                                                sx={{ borderRadius: 2 }}
                                            >
                                                Sign In
                                            </Button>
                                        </Stack>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            {/* Donation Dialog */}
            <Dialog
                open={donationDialogOpen}
                onClose={() => setDonationDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Make a Donation</DialogTitle>
                <DialogContent>
                    <DonationPayment
                        student={student}
                        onSuccess={handleDonationSuccess}
                        onCancel={() => setDonationDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default StudentDetailsPage;

