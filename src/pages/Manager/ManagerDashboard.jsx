import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Stack,
    Alert,
    Tabs,
    Tab,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    Send,
    CheckCircle,
    Cancel,
    Assessment,
    CloudUpload,
    Delete as DeleteIcon,
    Download,
    PictureAsPdf,
    TableChart,
    AttachMoney,
} from '@mui/icons-material';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import { studentApplicationService } from '../../services/studentApplicationService';
import api from '../../services/api';
import { alpha } from '@mui/material/styles';

const ManagerDashboard = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [applications, setApplications] = useState([]);
    const [donations, setDonations] = useState([]);
    const [donationStats, setDonationStats] = useState({
        totalDonations: 0,
        completedDonations: 0,
        pendingDonations: 0,
        totalAmount: 0,
    });
    const [studentsByStatus, setStudentsByStatus] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        placeOfBirth: '',
        currentResidency: '',
        email: '',
        phoneNumber: '',
        fatherName: '',
        motherName: '',
        parentsAnnualSalary: '',
        personalStory: '',
        academicBackground: '',
        fieldOfStudy: '',
        dreamCareer: '',
        requestedFundingAmount: '',
        fundingPurpose: '',
    });
    const [profileImage, setProfileImage] = useState(null);
    const [profileImageUrl, setProfileImageUrl] = useState('');
    const [documents, setDocuments] = useState([]);
    const [documentUrls, setDocumentUrls] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportStartDate, setReportStartDate] = useState('');
    const [reportEndDate, setReportEndDate] = useState('');
    const [reportStatus, setReportStatus] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Fetch ALL applications including approved ones (managers need to see approved students)
            // Using getAllApplications which returns all statuses for managers
            const response = await studentApplicationService.getAllApplications();
            const appsData = Array.isArray(response) ? response : (response.data || []);
            setApplications(appsData);

            // Also fetch students to get accurate counts including posted students
            // Posted students are approved students, so we need to count them
            try {
                const studentsResponse = await api.get('/students/by-status');
                const allStudents = studentsResponse.data || [];
                
                // Count students by application status (posted students are approved)
                // The endpoint returns applicationStatus as number (0=Pending, 1=UnderReview, 2=Approved, 3=Rejected, 4=Incomplete)
                // Posted students have status 2 (Approved) or 'Approved'
                const studentsByStatus = {
                    Approved: allStudents.filter(s => {
                        const status = s.applicationStatus;
                        return status === 2 || status === 'Approved' || status === '2';
                    }).length,
                    Pending: allStudents.filter(s => {
                        const status = s.applicationStatus;
                        return status === 0 || status === 'Pending' || status === '0';
                    }).length,
                    UnderReview: allStudents.filter(s => {
                        const status = s.applicationStatus;
                        return status === 1 || status === 'UnderReview' || status === '1';
                    }).length,
                    Rejected: allStudents.filter(s => {
                        const status = s.applicationStatus;
                        return status === 3 || status === 'Rejected' || status === '3';
                    }).length,
                };
                
                // Use student counts for the chart (more accurate as it includes posted students)
                // But keep applications for the table/list
                setStudentsByStatus(studentsByStatus);
            } catch (studentsError) {
                console.error('Error fetching students for counts:', studentsError);
                // Fallback to application counts if students endpoint fails
                setStudentsByStatus(null);
            }

            // Fetch donations from manager-specific endpoint
            try {
                let donationsData = [];
                let statsSet = false;
                
                // Try manager donations statistics endpoint first
                try {
                    const managerStatsResponse = await api.get('/manager/donations-statistics');
                    if (managerStatsResponse.data) {
                        donationsData = managerStatsResponse.data.donations || [];
                        // Use the statistics directly
                        setDonationStats({
                            totalDonations: managerStatsResponse.data.totalDonations || 0,
                            completedDonations: managerStatsResponse.data.completedDonations || 0,
                            pendingDonations: managerStatsResponse.data.pendingDonations || 0,
                            totalAmount: parseFloat(managerStatsResponse.data.totalAmount) || 0,
                        });
                        setDonations(donationsData);
                        statsSet = true;
                    }
                } catch (managerStatsError) {
                    console.log('Manager donations statistics endpoint not available, trying alternatives');
                }

                // Fallback: Try to get donations from statistics endpoint
                try {
                    const statsResponse = await api.get('/donations/statistics');
                    if (statsResponse.data?.recentDonations) {
                        donationsData = statsResponse.data.recentDonations.map(d => ({
                            ...d,
                            status: d.status || 'Completed',
                            amount: parseFloat(d.amount) || 0,
                        }));
                    }
                } catch (statsError) {
                    console.log('Statistics endpoint not available, trying direct donations endpoint');
                }

                // If no data from statistics, try direct donations endpoint
                if (donationsData.length === 0) {
                    try {
                        const donationsResponse = await api.get('/donations');
                        donationsData = donationsResponse.data?.donations || donationsResponse.data || [];
                    } catch (donationsError) {
                        console.log('Direct donations endpoint not available');
                    }
                }

                setDonations(donationsData);

                // Calculate donation statistics (only if not already set from manager endpoint)
                if (!statsSet && donationsData.length > 0) {
                    const completed = donationsData.filter(d => d.status === 'Completed' || d.status === 'completed');
                    const pending = donationsData.filter(d => 
                        d.status === 'Pending' || 
                        d.status === 'pending' || 
                        d.status === 'Processing' || 
                        d.status === 'processing'
                    );
                    const totalAmount = completed.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);

                    setDonationStats({
                        totalDonations: donationsData.length,
                        completedDonations: completed.length,
                        pendingDonations: pending.length,
                        totalAmount: totalAmount,
                    });
                }
            } catch (donationError) {
                console.error('Error fetching donations:', donationError);
                // Set default values if donations can't be fetched
                setDonationStats({
                    totalDonations: 0,
                    completedDonations: 0,
                    pendingDonations: 0,
                    totalAmount: 0,
                });
            }
        } catch (error) {
            setError('Failed to fetch dashboard data');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchApplications = async () => {
        try {
            setLoading(true);
            // Use getAllApplications to get all applications including approved ones
            const response = await studentApplicationService.getAllApplications();
            const appsData = Array.isArray(response) ? response : (response.data || []);
            setApplications(appsData);
        } catch (error) {
            setError('Failed to fetch applications');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (app = null) => {
        if (app) {
            setSelectedApp(app);
            setFormData({
                fullName: app.fullName || '',
                age: app.age || '',
                placeOfBirth: app.placeOfBirth || '',
                currentResidency: app.currentResidency || '',
                email: app.email || '',
                phoneNumber: app.phoneNumber || '',
                fatherName: app.fatherName || '',
                motherName: app.motherName || '',
                parentsAnnualSalary: app.parentsAnnualSalary || '',
                personalStory: app.personalStory || '',
                academicBackground: app.academicBackground || '',
                fieldOfStudy: app.fieldOfStudy || '',
                dreamCareer: app.dreamCareer || '',
                requestedFundingAmount: app.requestedFundingAmount || '',
                fundingPurpose: app.fundingPurpose || '',
            });
        } else {
            setSelectedApp(null);
            setFormData({
                fullName: '',
                age: '',
                placeOfBirth: '',
                currentResidency: '',
                email: '',
                phoneNumber: '',
                fatherName: '',
                motherName: '',
                parentsAnnualSalary: '',
                personalStory: '',
                academicBackground: '',
                fieldOfStudy: '',
                dreamCareer: '',
                requestedFundingAmount: '',
                fundingPurpose: '',
            });
        }
        setOpenDialog(true);
    };

    const handleSaveApplication = async () => {
        try {
            setError('');
            setSuccess('');
            
            // Validate required fields
            if (!formData.email || !formData.email.includes('@')) {
                setError('Please provide a valid email address');
                return;
            }
            if (!formData.fullName || formData.fullName.trim() === '') {
                setError('Full name is required');
                return;
            }
            if (!formData.age || parseInt(formData.age) <= 0) {
                setError('Please provide a valid age');
                return;
            }
            
            const applicationData = {
                ...formData,
                profileImageUrl,
                proofDocumentUrls: documentUrls,
            };
            if (selectedApp) {
                await studentApplicationService.updateApplication(selectedApp.id, applicationData);
                setSuccess('Application updated successfully');
            } else {
                await studentApplicationService.createApplicationAsManager(applicationData);
                setSuccess('Application created successfully');
            }
            setOpenDialog(false);
            // Reset form
            setProfileImageUrl('');
            setDocumentUrls([]);
            setFormData({
                fullName: '',
                age: '',
                placeOfBirth: '',
                currentResidency: '',
                email: '',
                phoneNumber: '',
                fatherName: '',
                motherName: '',
                parentsAnnualSalary: '',
                personalStory: '',
                academicBackground: '',
                fieldOfStudy: '',
                dreamCareer: '',
                requestedFundingAmount: '',
                fundingPurpose: '',
            });
            fetchApplications();
        } catch (error) {
            const errorResponse = error.response?.data;
            let errorMessage = 'Failed to save application';
            
            if (errorResponse) {
                if (errorResponse.message) {
                    errorMessage = errorResponse.message;
                } else if (errorResponse.errors) {
                    if (typeof errorResponse.errors === 'string') {
                        errorMessage = errorResponse.errors;
                    } else if (Array.isArray(errorResponse.errors)) {
                        errorMessage = errorResponse.errors.join(', ');
                    } else if (typeof errorResponse.errors === 'object') {
                        errorMessage = Object.values(errorResponse.errors).flat().join(', ');
                    }
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setError(errorMessage);
        }
    };

    const handleDeleteApplication = async (id) => {
        if (window.confirm('Are you sure you want to delete this application?')) {
            try {
                await studentApplicationService.deleteApplication(id);
                setSuccess('Application deleted successfully');
                fetchApplications();
            } catch (error) {
                setError('Failed to delete application');
            }
        }
    };

    const handleSendToAdmin = async (id) => {
        if (window.confirm('Send this application to admin for final approval?')) {
            try {
                await studentApplicationService.sendToAdmin(id);
                setSuccess('Application sent to admin successfully');
                fetchApplications();
            } catch (error) {
                setError('Failed to send application');
            }
        }
    };

    const handleApprove = async (id) => {
        try {
            await studentApplicationService.updateApplicationStatus(id, 'Approved');
            setSuccess('Application approved');
            fetchApplications();
        } catch (error) {
            setError('Failed to approve application');
        }
    };

    const handleReject = async (id) => {
        const reason = window.prompt('Enter rejection reason:');
        if (reason) {
            try {
                await studentApplicationService.updateApplicationStatus(id, 'Rejected', reason);
                setSuccess('Application rejected');
                fetchApplications();
            } catch (error) {
                setError('Failed to reject application');
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'warning';
            case 'UnderReview': return 'info';
            case 'Approved': return 'success';
            case 'Rejected': return 'error';
            default: return 'default';
        }
    };

    const renderApplicationsTab = () => (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Student Applications
                </Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
                    Add Application
                </Button>
            </Stack>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            <Card>
                <CardContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Field of Study</TableCell>
                                    <TableCell>Funding</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {applications
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((app) => (
                                        <TableRow key={app.id} hover>
                                            <TableCell>{app.fullName}</TableCell>
                                            <TableCell>{app.email}</TableCell>
                                            <TableCell>{app.fieldOfStudy}</TableCell>
                                            <TableCell>${app.requestedFundingAmount}</TableCell>
                                            <TableCell>
                                                <Chip label={app.status} color={getStatusColor(app.status)} size="small" />
                                            </TableCell>
                                            <TableCell>{new Date(app.submittedAt).toLocaleDateString()}</TableCell>
                                            <TableCell align="right">
                                                <IconButton size="small" onClick={() => handleOpenDialog(app)}>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteApplication(app.id)}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                                {app.status === 'Pending' && (
                                                    <>
                                                        <IconButton size="small" color="success" onClick={() => handleApprove(app.id)}>
                                                            <CheckCircle fontSize="small" />
                                                        </IconButton>
                                                        <IconButton size="small" color="error" onClick={() => handleReject(app.id)}>
                                                            <Cancel fontSize="small" />
                                                        </IconButton>
                                                    </>
                                                )}
                                                {app.status === 'Approved' && (
                                                    <IconButton size="small" color="primary" onClick={() => handleSendToAdmin(app.id)}>
                                                        <Send fontSize="small" />
                                                    </IconButton>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={applications.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                    />
                </CardContent>
            </Card>
        </Box>
    );

    const handleExportReport = async (status = null) => {
        try {
            setReportLoading(true);
            const params = {};
            if (reportStartDate) params.startDate = reportStartDate;
            if (reportEndDate) params.endDate = reportEndDate;
            if (status) params.status = status;

            const response = await api.get('/manager/reports/export-csv', { 
                params,
                responseType: 'blob' 
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const statusLabel = status ? `-${status}` : '';
            link.setAttribute('download', `applications-report${statusLabel}-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setSuccess('Report exported successfully');
        } catch (error) {
            setError('Failed to export report');
            console.error('Error exporting report:', error);
        } finally {
            setReportLoading(false);
        }
    };

    const renderReportsTab = () => (
        <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                Application Reports Archive
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            {/* Report Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Report Filters
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Start Date"
                                type="date"
                                value={reportStartDate}
                                onChange={(e) => setReportStartDate(e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="End Date"
                                type="date"
                                value={reportEndDate}
                                onChange={(e) => setReportEndDate(e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={reportStatus}
                                    label="Status"
                                    onChange={(e) => setReportStatus(e.target.value)}
                                >
                                    <MenuItem value="">All Statuses</MenuItem>
                                    <MenuItem value="Pending">Pending</MenuItem>
                                    <MenuItem value="UnderReview">Under Review</MenuItem>
                                    <MenuItem value="Approved">Approved</MenuItem>
                                    <MenuItem value="Rejected">Rejected</MenuItem>
                                    <MenuItem value="Incomplete">Incomplete</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Report Cards */}
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Stack spacing={2} alignItems="center">
                                <TableChart sx={{ fontSize: 40, color: 'primary.main' }} />
                                <Typography variant="h6">All Applications</Typography>
                                <Typography variant="body2" color="text.secondary" align="center">
                                    Export all applications with current filters
                                </Typography>
                                <Button 
                                    variant="contained" 
                                    fullWidth
                                    startIcon={<Download />}
                                    onClick={() => handleExportReport()}
                                    disabled={reportLoading}
                                >
                                    Export CSV
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Stack spacing={2} alignItems="center">
                                <TableChart sx={{ fontSize: 40, color: 'success.main' }} />
                                <Typography variant="h6">Approved Applications</Typography>
                                <Typography variant="body2" color="text.secondary" align="center">
                                    Export all approved applications
                                </Typography>
                                <Button 
                                    variant="contained" 
                                    color="success" 
                                    fullWidth
                                    startIcon={<Download />}
                                    onClick={() => handleExportReport('Approved')}
                                    disabled={reportLoading}
                                >
                                    Export CSV
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Stack spacing={2} alignItems="center">
                                <TableChart sx={{ fontSize: 40, color: 'warning.main' }} />
                                <Typography variant="h6">Pending Applications</Typography>
                                <Typography variant="body2" color="text.secondary" align="center">
                                    Export all pending applications
                                </Typography>
                                <Button 
                                    variant="contained" 
                                    color="warning" 
                                    fullWidth
                                    startIcon={<Download />}
                                    onClick={() => handleExportReport('Pending')}
                                    disabled={reportLoading}
                                >
                                    Export CSV
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Stack spacing={2} alignItems="center">
                                <TableChart sx={{ fontSize: 40, color: 'error.main' }} />
                                <Typography variant="h6">Rejected Applications</Typography>
                                <Typography variant="body2" color="text.secondary" align="center">
                                    Export all rejected applications
                                </Typography>
                                <Button 
                                    variant="contained" 
                                    color="error" 
                                    fullWidth
                                    startIcon={<Download />}
                                    onClick={() => handleExportReport('Rejected')}
                                    disabled={reportLoading}
                                >
                                    Export CSV
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );

    // Use student counts if available (includes posted students), otherwise use application counts
    const pendingCount = studentsByStatus ? studentsByStatus.Pending : applications.filter(a => a.status === 'Pending' || a.status === 0).length;
    const underReviewCount = studentsByStatus ? studentsByStatus.UnderReview : applications.filter(a => a.status === 'UnderReview' || a.status === 1).length;
    const approvedCount = studentsByStatus ? studentsByStatus.Approved : applications.filter(a => a.status === 'Approved' || a.status === 2 || a.isPostedAsStudent).length;
    const rejectedCount = studentsByStatus ? studentsByStatus.Rejected : applications.filter(a => a.status === 'Rejected' || a.status === 3).length;

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
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                Manager Dashboard
            </Typography>

            {/* Analytics Charts Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Application Status Donut Chart */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
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

                {/* Donation Status Donut Chart */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
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
                                        <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: alpha('#9c27b0', 0.1) }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                    Total Amount Raised
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                                                    ${donationStats.totalAmount.toLocaleString()}
                                                </Typography>
                                            </Stack>
                                        </Box>
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
            </Grid>

            <Card sx={{ mb: 3 }}>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                    <Tab label="Applications" />
                    <Tab label="Reports" />
                </Tabs>
            </Card>

            {activeTab === 0 && renderApplicationsTab()}
            {activeTab === 1 && renderReportsTab()}

            {/* Application Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>{selectedApp ? 'Edit Application' : 'Create Application'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Full Name"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Age"
                                    type="number"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Place of Birth"
                                    value={formData.placeOfBirth}
                                    onChange={(e) => setFormData({ ...formData, placeOfBirth: e.target.value })}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Current Residency"
                                    value={formData.currentResidency}
                                    onChange={(e) => setFormData({ ...formData, currentResidency: e.target.value })}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    fullWidth
                                    required
                                    error={!!error && (error.toLowerCase().includes('email') || error.toLowerCase().includes('already') || error.toLowerCase().includes('exists'))}
                                    helperText={
                                        error && (error.toLowerCase().includes('email') || error.toLowerCase().includes('already') || error.toLowerCase().includes('exists'))
                                            ? error
                                            : "Email address for the student"
                                    }
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Phone Number"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Father's Name"
                                    value={formData.fatherName}
                                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Mother's Name"
                                    value={formData.motherName}
                                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Parents Annual Salary"
                                    type="number"
                                    value={formData.parentsAnnualSalary}
                                    onChange={(e) => setFormData({ ...formData, parentsAnnualSalary: e.target.value })}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Field of Study"
                                    value={formData.fieldOfStudy}
                                    onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Dream Career"
                                    value={formData.dreamCareer}
                                    onChange={(e) => setFormData({ ...formData, dreamCareer: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Personal Story"
                                    value={formData.personalStory}
                                    onChange={(e) => setFormData({ ...formData, personalStory: e.target.value })}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Academic Background"
                                    value={formData.academicBackground}
                                    onChange={(e) => setFormData({ ...formData, academicBackground: e.target.value })}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Requested Funding Amount"
                                    type="number"
                                    value={formData.requestedFundingAmount}
                                    onChange={(e) => setFormData({ ...formData, requestedFundingAmount: e.target.value })}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Funding Purpose"
                                    value={formData.fundingPurpose}
                                    onChange={(e) => setFormData({ ...formData, fundingPurpose: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveApplication} variant="contained">
                        {selectedApp ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ManagerDashboard;
