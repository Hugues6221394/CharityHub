import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Chip,
    Avatar,
    Stack,
    Tabs,
    Tab,
    LinearProgress,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    ArrowBack,
    School,
    Description,
    Info,
    CheckCircle,
    Cancel,
    Pending,
    HourglassEmpty,
    ErrorOutline,
} from '@mui/icons-material';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';
import ImageGallery from '../../components/ImageGallery';

const ManagerStudentsByStatus = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const statusOptions = [
        { value: 'All', label: 'All Students', icon: <School />, color: 'default' },
        { value: 'Approved', label: 'Approved', icon: <CheckCircle />, color: 'success' },
        { value: 'Pending', label: 'Pending', icon: <Pending />, color: 'warning' },
        { value: 'UnderReview', label: 'Under Review', icon: <HourglassEmpty />, color: 'info' },
        { value: 'Rejected', label: 'Rejected', icon: <Cancel />, color: 'error' },
        { value: 'Incomplete', label: 'Incomplete', icon: <ErrorOutline />, color: 'default' },
    ];

    useEffect(() => {
        fetchStudents();
    }, [selectedStatus]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            setError('');
            const statusParam = selectedStatus === 'All' ? null : getStatusEnumValue(selectedStatus);
            const response = await api.get('/students/by-status', {
                params: statusParam !== null ? { status: statusParam } : {}
            });
            const studentsData = response.data || [];
            setStudents(studentsData);
            // No need to filter again - API already filters by status
        } catch (error) {
            console.error('Error fetching students:', error);
            setError('Failed to load students. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusEnumValue = (status) => {
        const statusMap = {
            'All': null,
            'Pending': 0,
            'UnderReview': 1,
            'Approved': 2,
            'Rejected': 3,
            'Incomplete': 4,
        };
        return statusMap[status] ?? null;
    };

    const getStatusLabel = (status) => {
        const statusMap = {
            0: 'Pending',
            1: 'UnderReview',
            2: 'Approved',
            3: 'Rejected',
            4: 'Incomplete',
        };
        return statusMap[status] || status || 'Unknown';
    };

    const handleStatusChange = (event, newValue) => {
        setSelectedStatus(newValue);
    };

    const handleViewDetails = (student) => {
        setSelectedStudent(student);
        setOpenDetailsDialog(true);
    };

    const getStatusColor = (status) => {
        const statusOption = statusOptions.find(opt => opt.value === status);
        return statusOption?.color || 'default';
    };

    const getStatusIcon = (status) => {
        const statusOption = statusOptions.find(opt => opt.value === status);
        return statusOption?.icon || <Info />;
    };

    const calculateFundingProgress = (raised, goal) => {
        if (!goal || goal === 0) return 0;
        return Math.min((raised / goal) * 100, 100);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/manager/students')}>
                    Back to Student Management
                </Button>
                <Typography variant="h4" sx={{ fontWeight: 700, flexGrow: 1 }}>
                    Students by Application Status
                </Typography>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Tabs
                value={selectedStatus}
                onChange={handleStatusChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
                {statusOptions.map((option) => (
                    <Tab
                        key={option.value}
                        label={option.label}
                        value={option.value}
                        icon={option.icon}
                        iconPosition="start"
                    />
                ))}
            </Tabs>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : students.length === 0 ? (
                <Alert severity="info">
                    No students found with status: {statusOptions.find(opt => opt.value === selectedStatus)?.label || selectedStatus}
                </Alert>
            ) : (
                <Grid container spacing={3}>
                    {students.map((student) => (
                        <Grid item xs={12} sm={6} md={4} key={student.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                                        <Avatar
                                            src={getImageUrl(student.photoUrl)}
                                            sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}
                                        >
                                            <School />
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                {student.fullName}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {student.location} • Age {student.age}
                                            </Typography>
                                            <Chip
                                                icon={getStatusIcon(getStatusLabel(student.applicationStatus))}
                                                label={`Status: ${getStatusLabel(student.applicationStatus)}`}
                                                color={getStatusColor(getStatusLabel(student.applicationStatus))}
                                                size="small"
                                                sx={{ mt: 0.5 }}
                                            />
                                        </Box>
                                    </Stack>

                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {student.academicBackground} • {student.dreamCareer}
                                    </Typography>

                                    <Box sx={{ mb: 2 }}>
                                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                Funding Progress
                                            </Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                ${student.amountRaised || 0} / ${student.fundingGoal || 0}
                                            </Typography>
                                        </Stack>
                                        <LinearProgress
                                            variant="determinate"
                                            value={calculateFundingProgress(student.amountRaised || 0, student.fundingGoal || 0)}
                                            sx={{ height: 8, borderRadius: 4 }}
                                        />
                                    </Box>

                                    <Stack direction="row" spacing={1}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<Info />}
                                            onClick={() => navigate(`/manager/students/${student.id}`)}
                                        >
                                            View Profile
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Student Details Dialog */}
            <Dialog
                open={openDetailsDialog}
                onClose={() => setOpenDetailsDialog(false)}
                maxWidth="md"
                fullWidth
            >
                {selectedStudent && (
                    <>
                        <DialogTitle>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar src={getImageUrl(selectedStudent.photoUrl)} sx={{ width: 50, height: 50 }} />
                                <Box>
                                    <Typography variant="h6">{selectedStudent.fullName}</Typography>
                                    <Chip
                                        label={getStatusLabel(selectedStudent.applicationStatus)}
                                        color={getStatusColor(getStatusLabel(selectedStudent.applicationStatus))}
                                        size="small"
                                    />
                                </Box>
                            </Stack>
                        </DialogTitle>
                        <DialogContent>
                            <Stack spacing={2}>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Location:</strong> {selectedStudent.location}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Age:</strong> {selectedStudent.age}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Academic Background:</strong> {selectedStudent.academicBackground || 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Dream Career:</strong> {selectedStudent.dreamCareer || 'N/A'}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Story:</strong> {selectedStudent.story}
                                </Typography>
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setOpenDetailsDialog(false);
                                    navigate(`/manager/students/${selectedStudent.id}`);
                                }}
                            >
                                View Full Profile
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default ManagerStudentsByStatus;

