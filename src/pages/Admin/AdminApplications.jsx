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
    Tabs,
    Tab,
    Divider,
    TextField,
} from '@mui/material';
import {
    Visibility,
    CheckCircle,
    Cancel,
    School,
    Description,
    Warning,
    Message,
} from '@mui/icons-material';
import { studentApplicationService } from '../../services/studentApplicationService';
import api from '../../services/api';
import ImageGallery from '../../components/ImageGallery';
import DocumentViewer from '../../components/DocumentViewer';
import { useNavigate } from 'react-router-dom';

const AdminApplications = () => {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0); // 0: Under Review, 1: Approved (Ready to Post)
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
    }, [tabValue]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            // Tab 0: Pending/UnderReview, Tab 1: Approved
            let status = null;
            if (tabValue === 0) {
                // Get both Pending and UnderReview applications
                const pendingResponse = await api.get('/admin/applications?status=0');
                const underReviewResponse = await api.get('/admin/applications?status=1');
                const apps = [...(pendingResponse.data || []), ...(underReviewResponse.data || [])];
                setApplications(apps);
            } else {
                status = 2; // Approved
                const response = await api.get(`/admin/applications?status=${status}`);
                const apps = response.data || [];
                // Filter out already posted students if in "Approved" tab
                const filtered = apps.filter(app => !app.isPostedAsStudent);
                setApplications(filtered);
            }
        } catch (error) {
            setError('Failed to fetch applications');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewApplication = async (app) => {
        try {
            const response = await api.get(`/admin/applications/${app.id}`);
            setSelectedApp(response.data);
            setOpenViewDialog(true);
        } catch (error) {
            setError('Failed to load application details');
        }
    };

    const handleApprove = async (id) => {
        if (window.confirm('Approve this application?')) {
            try {
                await api.put(`/admin/applications/${id}/approve`);
                setSuccess('Application approved');
                fetchApplications();
                setOpenViewDialog(false);
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to approve application');
            }
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            setError(`Please provide a ${actionType === 'incomplete' ? 'reason for marking incomplete' : 'rejection reason'}`);
            return;
        }

        try {
            if (actionType === 'incomplete') {
                // Mark as incomplete - need to check if this endpoint exists for admin
                await api.put(`/admin/applications/${selectedApp.id}/mark-incomplete`, { reason: rejectionReason });
                setSuccess('Application marked as incomplete');
            } else {
                await api.put(`/admin/applications/${selectedApp.id}/reject`, { reason: rejectionReason });
                setSuccess('Application rejected');
            }
            setOpenRejectDialog(false);
            setOpenViewDialog(false);
            setRejectionReason('');
            fetchApplications();
        } catch (error) {
            setError(error.response?.data?.message || `Failed to ${actionType} application`);
        }
    };

    const handlePostAsStudent = async (id) => {
        if (window.confirm('Create a public student profile from this application?')) {
            try {
                await studentApplicationService.postAsStudent(id);
                setSuccess('Student profile created successfully');
                fetchApplications();
                setOpenViewDialog(false);
            } catch (error) {
                setError('Failed to post student profile');
            }
        }
    };

    const getStatusLabel = (status) => {
        const statuses = {
            0: 'Pending',
            1: 'Under Review',
            2: 'Approved',
            3: 'Rejected',
            4: 'Incomplete'
        };
        return statuses[status] || 'Unknown';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 0: return 'warning';
            case 1: return 'info';
            case 2: return 'success';
            case 3: return 'error';
            case 4: return 'warning';
            default: return 'default';
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                Application Review
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                    <Tab label="Pending & Under Review" />
                    <Tab label="Approved (Ready to Post)" />
                </Tabs>
            </Box>

            <Grid container spacing={3}>
                {applications.length === 0 ? (
                    <Grid item xs={12}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 6 }}>
                                <Typography variant="h6" color="text.secondary">
                                    No applications found in this category
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

                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<Visibility />}
                                        onClick={() => handleViewApplication(app)}
                                        fullWidth
                                    >
                                        View Details & Action
                                    </Button>
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
                                {selectedApp.familySituation && (
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">Family Situation</Typography>
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                            {selectedApp.familySituation}
                                        </Typography>
                                    </Grid>
                                )}
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
                                    <Typography variant="body2" color="text.secondary">Current Education Level</Typography>
                                    <Typography variant="body1">{selectedApp.currentEducationLevel || 'Not specified'}</Typography>
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
                            <Grid container spacing={2} sx={{ mb: 3 }}>
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
                        {/* Optional: Message Manager button */}
                        {selectedApp?.reviewedByManagerId && (
                            <Button
                                variant="outlined"
                                color="info"
                                startIcon={<Message />}
                                onClick={() => {
                                    navigate('/admin/messages', {
                                        state: {
                                            recipientId: selectedApp.reviewedByManagerId,
                                            recipientName: selectedApp.reviewedByManager?.firstName + ' ' + selectedApp.reviewedByManager?.lastName || 'Manager'
                                        }
                                    });
                                }}
                            >
                                Message Manager
                            </Button>
                        )}
                    </Stack>

                    {/* Actions for Pending (0) or Under Review (1) */}
                    {(selectedApp?.status === 0 || selectedApp?.status === 1 || 
                      selectedApp?.status === 'Pending' || selectedApp?.status === 'UnderReview') && (
                        <Stack direction="row" spacing={2} justifyContent="flex-end" width="100%" flexWrap="wrap">
                            <Button
                                variant="outlined"
                                color="warning"
                                startIcon={<Warning />}
                                onClick={() => {
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
                                Approve
                            </Button>
                        </Stack>
                    )}

                    {/* Action for Approved (2) - Post as Student */}
                    {(selectedApp?.status === 2 || selectedApp?.status === 'Approved') && !selectedApp.isPostedAsStudent && (
                        <Stack direction="row" spacing={2} justifyContent="flex-end" width="100%">
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<School />}
                                onClick={() => handlePostAsStudent(selectedApp.id)}
                            >
                                Post as Student Profile
                            </Button>
                        </Stack>
                    )}
                </DialogActions>
            </Dialog>

            {/* Reject/Incomplete Dialog */}
            <Dialog open={openRejectDialog} onClose={() => { setOpenRejectDialog(false); setRejectionReason(''); }} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {actionType === 'incomplete' ? 'Mark Application as Incomplete' : 'Reject Application'}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        {actionType === 'incomplete' 
                            ? 'Please provide details about what information or documents are missing:'
                            : 'Please provide a reason for rejecting this application:'}
                    </Typography>
                    <TextField
                        label={actionType === 'incomplete' ? 'Missing Information/Requirements' : 'Rejection Reason'}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        fullWidth
                        multiline
                        rows={4}
                        required
                        placeholder={actionType === 'incomplete' 
                            ? 'e.g., Missing academic transcripts, incomplete personal story, etc.'
                            : 'e.g., Does not meet eligibility criteria, incomplete documentation, etc.'}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setOpenRejectDialog(false); setRejectionReason(''); }}>Cancel</Button>
                    <Button 
                        onClick={handleReject} 
                        variant="contained" 
                        color={actionType === 'incomplete' ? 'warning' : 'error'}
                    >
                        {actionType === 'incomplete' ? 'Mark Incomplete' : 'Confirm Rejection'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminApplications;
