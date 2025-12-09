import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
    Chip,
    Alert,
    Button,
    LinearProgress,
    Grid,
    Paper,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import {
    CheckCircle,
    Cancel,
    Pending,
    Warning,
    Description,
    Upload,
    Edit,
} from '@mui/icons-material';
import { studentApplicationService } from '../../services/studentApplicationService';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';

const ApplicationTracking = () => {
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [resubmitDialogOpen, setResubmitDialogOpen] = useState(false);
    const [resubmitData, setResubmitData] = useState({});
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchApplication();
    }, []);

    const fetchApplication = async () => {
        try {
            setLoading(true);
            const data = await studentApplicationService.getMyApplication();
            setApplication(data);
        } catch (error) {
            console.error('Error fetching application:', error);
            if (error.response?.status === 404) {
                setApplication(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResubmit = async () => {
        try {
            setUploading(true);
            await studentApplicationService.resubmitApplication(application.id, resubmitData);
            setResubmitDialogOpen(false);
            await fetchApplication();
        } catch (error) {
            console.error('Error resubmitting application:', error);
            alert('Failed to resubmit application. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleFileUpload = async (file, type) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const endpoint = type === 'image' 
                ? '/student-applications/upload-image'
                : '/student-applications/upload-document';

            const response = await api.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            return response.data.url;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    };

    const getStatusLabel = (status) => {
        // Handle both integer and string status
        if (typeof status === 'number') {
            const statuses = {
                0: 'Pending',
                1: 'UnderReview',
                2: 'Approved',
                3: 'Rejected',
                4: 'Incomplete'
            };
            return statuses[status] || 'Unknown';
        }
        // Handle string status
        const statusMap = {
            'Pending': 'Pending',
            'UnderReview': 'Under Review',
            'Approved': 'Approved',
            'Rejected': 'Rejected',
            'Incomplete': 'Marked Incomplete'
        };
        return statusMap[status] || status || 'Unknown';
    };

    const getStatusColor = (status) => {
        // Normalize status first
        let normalizedStatus = status;
        if (typeof status === 'number') {
            const statuses = {
                0: 'Pending',
                1: 'UnderReview',
                2: 'Approved',
                3: 'Rejected',
                4: 'Incomplete'
            };
            normalizedStatus = statuses[status] || status;
        }
        switch (normalizedStatus) {
            case 'Pending': return 'warning';
            case 'UnderReview': return 'info';
            case 'Approved': return 'success';
            case 'Rejected': return 'error';
            case 'Incomplete': return 'warning';
            default: return 'default';
        }
    };

    const getStatusIcon = (status) => {
        // Normalize status first
        let normalizedStatus = status;
        if (typeof status === 'number') {
            const statuses = {
                0: 'Pending',
                1: 'UnderReview',
                2: 'Approved',
                3: 'Rejected',
                4: 'Incomplete'
            };
            normalizedStatus = statuses[status] || status;
        }
        switch (normalizedStatus) {
            case 'Approved': return <CheckCircle />;
            case 'Rejected': return <Cancel />;
            case 'UnderReview': return <Pending />;
            case 'Incomplete': return <Warning />;
            case 'Pending': return <Pending />;
            default: return <Pending />;
        }
    };

    if (loading) {
        return (
            <Box>
                <LinearProgress />
            </Box>
        );
    }

    if (!application) {
        return (
            <Box>
                <Alert severity="info" sx={{ mb: 3 }}>
                    You haven't submitted an application yet.
                </Alert>
                <Button
                    variant="contained"
                    onClick={() => window.location.href = '/student/application'}
                >
                    Submit Application
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                Application Tracking
            </Typography>

            {/* Status Card */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Application Status
                        </Typography>
                        <Chip
                            icon={getStatusIcon(application.status)}
                            label={getStatusLabel(application.status)}
                            color={getStatusColor(application.status)}
                            sx={{ fontWeight: 600 }}
                        />
                    </Stack>

                    <Stack spacing={2}>
                        <Box>
                            <Typography variant="body2" color="text.secondary">
                                Submitted: {new Date(application.submittedAt).toLocaleString()}
                            </Typography>
                            {application.updatedAt && (
                                <Typography variant="body2" color="text.secondary">
                                    Last Updated: {new Date(application.updatedAt).toLocaleString()}
                                </Typography>
                            )}
                        </Box>

                        {(application.status === 'Incomplete' || application.status === 4) && application.rejectionReason && (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                    Missing Information:
                                </Typography>
                                <Typography variant="body2">
                                    {application.rejectionReason}
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<Edit />}
                                    onClick={() => setResubmitDialogOpen(true)}
                                    sx={{ mt: 2 }}
                                >
                                    Resubmit Application
                                </Button>
                            </Alert>
                        )}

                        {(application.status === 'Rejected' || application.status === 3) && application.rejectionReason && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                    Rejection Reason:
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 2 }}>
                                    {application.rejectionReason}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Edit />}
                                    onClick={() => navigate('/student/application')}
                                >
                                    Reapply for Support
                                </Button>
                            </Alert>
                        )}

                        {(application.status === 'Approved' || application.status === 2) && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                Congratulations! Your application has been approved. Your profile will be posted soon.
                            </Alert>
                        )}

                        {(application.status === 'UnderReview' || application.status === 1) && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                Your application is currently under review by administration. We will notify you once a decision has been made.
                            </Alert>
                        )}
                    </Stack>
                </CardContent>
            </Card>

            {/* Application Details */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Personal Information
                            </Typography>
                            <Stack spacing={1}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Full Name</Typography>
                                    <Typography variant="body1">{application.fullName}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Age</Typography>
                                    <Typography variant="body1">{application.age}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Email</Typography>
                                    <Typography variant="body1">{application.email}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Location</Typography>
                                    <Typography variant="body1">{application.currentResidency}</Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Academic Information
                            </Typography>
                            <Stack spacing={1}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Field of Study</Typography>
                                    <Typography variant="body1">{application.fieldOfStudy || 'Not specified'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Dream Career</Typography>
                                    <Typography variant="body1">{application.dreamCareer || 'Not specified'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Requested Funding</Typography>
                                    <Typography variant="body1">${application.requestedFundingAmount?.toLocaleString()}</Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Personal Story
                            </Typography>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                {application.personalStory}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* My Gallery */}
                {application.galleryImageUrls && application.galleryImageUrls.length > 0 && (
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    My Gallery ({application.galleryImageUrls.length} photos)
                                </Typography>
                                <Grid container spacing={2}>
                                    {application.galleryImageUrls.map((imgUrl, idx) => (
                                        <Grid item xs={6} sm={4} md={3} key={idx}>
                                            <Box
                                                component="img"
                                                src={getImageUrl(imgUrl)}
                                                alt={`Gallery ${idx + 1}`}
                                                sx={{
                                                    width: '100%',
                                                    height: '150px',
                                                    objectFit: 'cover',
                                                    borderRadius: 2,
                                                    cursor: 'pointer',
                                                    border: 1,
                                                    borderColor: 'divider',
                                                    '&:hover': {
                                                        borderColor: 'primary.main',
                                                    },
                                                }}
                                                onClick={() => window.open(getImageUrl(imgUrl), '_blank')}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {application.proofDocumentUrls && application.proofDocumentUrls.length > 0 && (
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    Submitted Documents
                                </Typography>
                                <Stack spacing={1}>
                                    {application.proofDocumentUrls.map((url, index) => (
                                        <Paper key={index} sx={{ p: 2 }}>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Description />
                                                <Box flex={1}>
                                                    <Typography variant="body2">
                                                        Document {index + 1}
                                                    </Typography>
                                                </Box>
                                                <Button
                                                    size="small"
                                                    component="a"
                                                    href={url}
                                                    target="_blank"
                                                >
                                                    View
                                                </Button>
                                            </Stack>
                                        </Paper>
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>

            {/* Resubmit Dialog */}
            <Dialog open={resubmitDialogOpen} onClose={() => setResubmitDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Resubmit Application</DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        You will be redirected to the application form where all your previous information will be pre-filled. You can edit and update any fields before resubmitting.
                    </Alert>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        <strong>Reason for rejection/incompleteness:</strong> {application.rejectionReason}
                    </Typography>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Please review and update your application with the missing information before resubmitting.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setResubmitDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setResubmitDialogOpen(false);
                            navigate('/student/application');
                        }}
                    >
                        Go to Application Form
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ApplicationTracking;

