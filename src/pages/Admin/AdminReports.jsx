import { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Stack,
    Alert,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
} from '@mui/material';
import {
    Download,
    PictureAsPdf,
    TableChart,
    Schedule,
    Email,
    CalendarToday,
    TrendingUp,
} from '@mui/icons-material';
import { adminService } from '../../services/adminService';

const AdminReports = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportType, setReportType] = useState('all');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleExportCSV = async (type) => {
        try {
            setLoading(true);
            let blob;
            const startDateParam = startDate || null;
            const endDateParam = endDate || null;

            switch (type) {
                case 'students':
                    blob = await adminService.exportStudentsCSV(startDateParam, endDateParam);
                    downloadFile(blob, `students-report-${new Date().toISOString().split('T')[0]}.csv`);
                    break;
                case 'donors':
                    blob = await adminService.exportDonorsCSV(startDateParam, endDateParam);
                    downloadFile(blob, `donors-report-${new Date().toISOString().split('T')[0]}.csv`);
                    break;
                case 'donations':
                    blob = await adminService.exportDonationsCSV(startDateParam, endDateParam);
                    downloadFile(blob, `donations-report-${new Date().toISOString().split('T')[0]}.csv`);
                    break;
                default:
                    break;
            }

            setSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded successfully`);
        } catch (error) {
            setError('Failed to generate report');
            console.error('Error generating report:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadFile = (blob, filename) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const reportCards = [
        {
            title: 'Students Report',
            description: 'Export all student profiles with funding details',
            icon: <TableChart sx={{ fontSize: 40, color: 'primary.main' }} />,
            action: () => handleExportCSV('students'),
            type: 'CSV',
        },
        {
            title: 'Donors Report',
            description: 'Export all donor information and contribution history',
            icon: <TableChart sx={{ fontSize: 40, color: 'success.main' }} />,
            action: () => handleExportCSV('donors'),
            type: 'CSV',
        },
        {
            title: 'Donations Report',
            description: 'Export all donation transactions and payment details',
            icon: <TableChart sx={{ fontSize: 40, color: 'warning.main' }} />,
            action: () => handleExportCSV('donations'),
            type: 'CSV',
        },
        {
            title: 'Student Progress Report',
            description: 'View detailed progress report for individual students',
            icon: <PictureAsPdf sx={{ fontSize: 40, color: 'error.main' }} />,
            action: async () => {
                setError('Please navigate to the Students page and select a student to generate their progress report.');
            },
            type: 'PDF',
        },
    ];

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                Reports & Exports
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            {/* Filters */}
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
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="End Date"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel>Report Type</InputLabel>
                                <Select
                                    value={reportType}
                                    label="Report Type"
                                    onChange={(e) => setReportType(e.target.value)}
                                >
                                    <MenuItem value="all">All Data</MenuItem>
                                    <MenuItem value="active">Active Only</MenuItem>
                                    <MenuItem value="completed">Completed Only</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Report Cards */}
            <Grid container spacing={3}>
                {reportCards.map((report, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Stack spacing={2} alignItems="center" textAlign="center">
                                    {report.icon}
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {report.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {report.description}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<Download />}
                                        onClick={report.action}
                                        disabled={loading}
                                        fullWidth
                                    >
                                        Export {report.type}
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Scheduled Reports Section */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'primary.main' }}>
                    Scheduled Reports
                </Typography>
                
                <Card 
                    sx={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '200px',
                            height: '200px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '50%',
                            transform: 'translate(30%, -30%)',
                        },
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '150px',
                            height: '150px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '50%',
                            transform: 'translate(-30%, 30%)',
                        },
                    }}
                >
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                        <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3 }}>
                            <Box
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backdropFilter: 'blur(10px)',
                                }}
                            >
                                <Schedule sx={{ fontSize: 50, color: 'white' }} />
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                                    Coming Soon
                                </Typography>
                                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                    Automated report scheduling and email delivery
                                </Typography>
                            </Box>
                        </Stack>

                        <Divider sx={{ my: 3, bgcolor: 'rgba(255, 255, 255, 0.3)' }} />

                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            What to Expect:
                        </Typography>

                        <Grid container spacing={3} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={4}>
                                <Stack direction="row" spacing={2} alignItems="flex-start">
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2,
                                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <CalendarToday sx={{ color: 'white' }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                            Flexible Scheduling
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                            Set up weekly or monthly automated reports
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Stack direction="row" spacing={2} alignItems="flex-start">
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2,
                                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Email sx={{ color: 'white' }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                            Email Delivery
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                            Reports automatically delivered to your inbox
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Stack direction="row" spacing={2} alignItems="flex-start">
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2,
                                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <TrendingUp sx={{ color: 'white' }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                            Custom Reports
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                            Choose which data to include in each report
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                        </Grid>

                        <Alert 
                            severity="info" 
                            sx={{ 
                                bgcolor: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                '& .MuiAlert-icon': {
                                    color: 'white',
                                },
                            }}
                        >
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                Scheduled report functionality coming soon. You'll be able to set up automated weekly or monthly reports delivered via email.
                            </Typography>
                        </Alert>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default AdminReports;
