import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Chip,
    Stack,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Divider,
} from '@mui/material';
import {
    Visibility,
    CheckCircle,
    Cancel,
    ArrowBack,
    Message,
    Warning,
    Delete,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { studentApplicationService } from '../../services/studentApplicationService';
import api from '../../services/api';
import ImageGallery from '../../components/ImageGallery';
import DocumentViewer from '../../components/DocumentViewer';

const ManagerApplications = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [openRejectDialog, setOpenRejectDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionType, setActionType] = useState('reject'); // 'reject' or 'incomplete'
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await studentApplicationService.getApplicationsForManager();
            setApplications(response || []);
        } catch (error) {
            setError('Failed to fetch applications');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewApplication = async (app) => {
        try {
            // Fetch full application details from API
            const response = await api.get(`/manager/applications/${app.id}`);
            setSelectedApp(response.data);
            setOpenViewDialog(true);
        } catch (error) {
            setError('Failed to load application details');
            console.error('Error:', error);
        }
    };

    const handleApprove = async (id) => {
        if (window.confirm('Forward this application to admin for final review?')) {
            try {
                const response = await api.put(`/manager/applications/${id}/review`);
                setSuccess('Application forwarded to admin');
                fetchApplications();
                setOpenViewDialog(false);
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to forward application');
            }
        }
    };

    const handleRejectOrIncomplete = async () => {
        if (!rejectionReason.trim()) {
            setError('Please provide a reason/explanation');
            return;
        }

        try {
            if (actionType === 'reject') {
                await api.put(`/manager/applications/${selectedApp.id}/reject`, { reason: rejectionReason });
                setSuccess('Application rejected');
            } else {
                await api.put(`/manager/applications/${selectedApp.id}/mark-incomplete`, { reason: rejectionReason });
                setSuccess('Application marked as incomplete');
            }

            setOpenRejectDialog(false);
            setOpenViewDialog(false);
            setRejectionReason('');
            fetchApplications();
        } catch (error) {
            setError(error.response?.data?.message || `Failed to ${actionType} application`);
        }
    };

    const handleDeleteRejected = async (id) => {
        if (window.confirm('Are you sure you want to delete this rejected application? This action cannot be undone.')) {
            try {
                await api.delete(`/manager/applications/${id}`);
                setSuccess('Application deleted successfully');
                fetchApplications();
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to delete application');
            }
        }
    };

    const handleMessageStudent = () => {
        navigate('/manager/messages', {
            state: {
                recipientId: selectedApp.applicationUserId,
                recipientEmail: selectedApp.email,
                recipientName: selectedApp.fullName
            }
        });
    };

    const getStatusLabel = (status) => {
        const statuses = {
            0: 'Pending',
            1: 'UnderReview',
            2: 'Approved',
            3: 'Rejected',
            4: 'Incomplete'
        };
        // Handle both integer and string status
        return statuses[status] || status || 'Unknown';
    };

    const getStatusColor = (status) => {
        // Handle both integer and string status
        const s = typeof status === 'number' ? getStatusLabel(status) : status;
        switch (s) {
            case 'Pending': return 'warning';
            case 'UnderReview': return 'info';
            case 'Approved': return 'success';
            case 'Rejected': return 'error';
            case 'Incomplete': return 'warning';
            default: return 'default';
        }
    };

    return (
        <Box>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/manager/dashboard')}>
                    Back to Dashboard
                </Button>
                <Typography variant="h4" sx={{ fontWeight: 700, flexGrow: 1 }}>
                    Student Applications
                </Typography>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Grid container spacing={3}>
                {applications.length === 0 ? (
                    <Grid item xs={12}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 6 }}>
                                <Typography variant="h6" color="text.secondary">
                                    No applications to review
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ) : (
                    applications.map((app) => (
                        <Grid item xs={12} md={6} key={app.id}>
                            <Card>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                {app.fullName}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {app.email}
                                            </Typography>
                                        </Box>
                                        <Chip label={getStatusLabel(app.status)} color={getStatusColor(app.status)} size="small" />
                                    </Stack>

                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Field of Study:</strong> {app.fieldOfStudy || 'Not specified'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Funding Requested:</strong> ${app.requestedFundingAmount?.toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                        <strong>Submitted:</strong> {new Date(app.submittedAt).toLocaleDateString()}
                                    </Typography>

                                    <Stack direction="row" spacing={1}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<Visibility />}
                                            onClick={() => handleViewApplication(app)}
                                            fullWidth
                                        >
                                            View Details
                                        </Button>
                                        {(app.status === 3 || app.status === 'Rejected') && (
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                onClick={() => handleDeleteRejected(app.id)}
                                            >
                                                Delete
                                            </Button>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>

            {/* View Application Dialog */}
            <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Application Details</Typography>
                        <Chip label={getStatusLabel(selectedApp?.status)} color={getStatusColor(selectedApp?.status)} />
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    {selectedApp && (
                        <Box sx={{ mt: 2 }}>
                            {/* Personal Information */}
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Personal Information</Typography>
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Full Name</Typography>
                                    <Typography variant="body1">{selectedApp.fullName}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Age</Typography>
                                    <Typography variant="body1">{selectedApp.age}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Email</Typography>
                                    <Typography variant="body1">{selectedApp.email}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                                    <Typography variant="body1">{selectedApp.phoneNumber || 'Not provided'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Place of Birth</Typography>
                                    <Typography variant="body1">{selectedApp.placeOfBirth}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Current Residency</Typography>
                                    <Typography variant="body1">{selectedApp.currentResidency}</Typography>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            {/* Family Information */}
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Family Information</Typography>
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Father's Name</Typography>
                                    <Typography variant="body1">{selectedApp.fatherName}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Mother's Name</Typography>
                                    <Typography variant="body1">{selectedApp.motherName}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">Parents Annual Salary</Typography>
                                    <Typography variant="body1">${selectedApp.parentsAnnualSalary?.toLocaleString()}</Typography>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            {/* Academic Information */}
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Academic Information</Typography>
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">Personal Story</Typography>
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {selectedApp.personalStory}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">Academic Background</Typography>
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {selectedApp.academicBackground}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Field of Study</Typography>
                                    <Typography variant="body1">{selectedApp.fieldOfStudy || 'Not specified'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Dream Career</Typography>
                                    <Typography variant="body1">{selectedApp.dreamCareer || 'Not specified'}</Typography>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            {/* Funding Information */}
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Funding Request</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Requested Amount</Typography>
                                    <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700 }}>
                                        ${selectedApp.requestedFundingAmount?.toLocaleString()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">Funding Purpose</Typography>
                                    <Typography variant="body1">{selectedApp.fundingPurpose || 'Not specified'}</Typography>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            {/* My Gallery - Instagram/Facebook Style */}
                            {selectedApp.galleryImageUrls && selectedApp.galleryImageUrls.length > 0 && (
                                <>
                                    <ImageGallery 
                                        images={selectedApp.galleryImageUrls} 
                                        title="Student Gallery" 
                                    />
                                    <Divider sx={{ my: 3 }} />
                                </>
                            )}

                            {/* Documents - Card View */}
                            <DocumentViewer 
                                documents={selectedApp.proofDocumentUrls || []} 
                                title="Proof Documents" 
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, flexDirection: 'column', gap: 2, alignItems: 'stretch' }}>
                    <Stack direction="row" spacing={2} justifyContent="flex-end" width="100%">
                        <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
                        <Button
                            variant="outlined"
                            startIcon={<Message />}
                            onClick={handleMessageStudent}
                        >
                            Message Student
                        </Button>
                    </Stack>

                    {/* Actions for Pending/Incomplete apps */}
                    {(selectedApp?.status === 0 || selectedApp?.status === 'Pending' ||
                        selectedApp?.status === 4 || selectedApp?.status === 'Incomplete') && (
                            <Stack direction="row" spacing={2} justifyContent="flex-end" width="100%">
                                <Button
                                    variant="outlined"
                                    color="warning"
                                    startIcon={<Warning />}
                                    onClick={() => {
                                        setRejectionReason('');
                                        setActionType('incomplete');
                                        setOpenRejectDialog(true);
                                    }}
                                >
                                    Mark Incomplete
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<Cancel />}
                                    onClick={() => {
                                        setRejectionReason('');
                                        setActionType('reject');
                                        setOpenRejectDialog(true);
                                    }}
                                >
                                    Reject
                                </Button>
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<CheckCircle />}
                                    onClick={() => handleApprove(selectedApp.id)}
                                >
                                    Forward to Admin
                                </Button>
                            </Stack>
                        )}
                    
                    {/* Delete button for rejected applications */}
                    {(selectedApp?.status === 3 || selectedApp?.status === 'Rejected') && (
                        <Stack direction="row" spacing={2} justifyContent="flex-end" width="100%">
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<Delete />}
                                onClick={() => handleDeleteRejected(selectedApp.id)}
                            >
                                Delete Application
                            </Button>
                        </Stack>
                    )}
                </DialogActions>
            </Dialog>

            {/* Reject/Incomplete Dialog */}
            <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {actionType === 'reject' ? 'Reject Application' : 'Mark Application as Incomplete'}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        {actionType === 'reject'
                            ? 'Please provide a reason for rejecting this application:'
                            : 'Please specify what information or documents are missing:'}
                    </Typography>
                    <TextField
                        label={actionType === 'reject' ? 'Rejection Reason' : 'Missing Information'}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        fullWidth
                        multiline
                        rows={4}
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleRejectOrIncomplete}
                        variant="contained"
                        color={actionType === 'reject' ? 'error' : 'warning'}
                    >
                        {actionType === 'reject' ? 'Confirm Rejection' : 'Mark Incomplete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ManagerApplications;
