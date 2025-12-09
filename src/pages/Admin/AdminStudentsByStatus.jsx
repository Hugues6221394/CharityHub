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

const AdminStudentsByStatus = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [loading, setLoading] = useState(false);

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

    const getStatusFromValue = (statusValue) => {
        if (typeof statusValue === 'number') {
            const statusMap = {
                0: 'Pending',
                1: 'UnderReview',
                2: 'Approved',
                3: 'Rejected',
                4: 'Incomplete',
            };
            return statusMap[statusValue] || 'Unknown';
        }
        return statusValue || 'Unknown';
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const statusParam = selectedStatus === 'All' ? null : getStatusEnumValue(selectedStatus);
            const response = await api.get('/students/by-status', {
                params: statusParam !== null ? { status: statusParam } : {}
            });
            const studentsData = response.data || [];
            // API already filters by status and includes posted students for Approved status
            // No need for additional filtering
            setFilteredStudents(studentsData);
            setStudents(studentsData);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
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

    const getStatusLabel = (status) => {
        const statusOption = statusOptions.find(opt => opt.value === status);
        return statusOption?.label || status;
    };

    if (loading) {
        return (
            <Box>
                <LinearProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin/students')}>
                    Back
                </Button>
                <Typography variant="h4" sx={{ fontWeight: 700, flexGrow: 1 }}>
                    Students by Application Status
                </Typography>
            </Stack>

            <Card sx={{ mb: 3 }}>
                <Tabs value={selectedStatus} onChange={handleStatusChange} variant="scrollable" scrollButtons="auto">
                    {statusOptions.map((option) => (
                        <Tab
                            key={option.value}
                            value={option.value}
                            label={option.label}
                            icon={option.icon}
                            iconPosition="start"
                        />
                    ))}
                </Tabs>
            </Card>

            <Grid container spacing={3}>
                {filteredStudents.length === 0 ? (
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" align="center">
                                    No students found with status: {getStatusLabel(selectedStatus)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ) : (
                    filteredStudents.map((student) => (
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
                                                {student.location}
                                            </Typography>
                                            <Chip
                                                label={getStatusLabel(getStatusFromValue(student.applicationStatus))}
                                                color={getStatusColor(getStatusFromValue(student.applicationStatus))}
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
                                            value={student.fundingGoal > 0 ? Math.min((student.amountRaised / student.fundingGoal) * 100, 100) : 0}
                                            sx={{ height: 8, borderRadius: 4 }}
                                        />
                                    </Box>

                                    <Stack direction="row" spacing={1}>
                                        <IconButton size="small" onClick={() => handleViewDetails(student)}>
                                            <Info fontSize="small" />
                                        </IconButton>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => navigate(`/admin/students/${student.id}`)}
                                        >
                                            View Full Profile
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>

            {/* Details Dialog */}
            <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5">Student Details</Typography>
                        <IconButton onClick={() => setOpenDetailsDialog(false)}>
                            <Cancel />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    {selectedStudent && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                                            <Avatar
                                                src={getImageUrl(selectedStudent.photoUrl)}
                                                sx={{ width: 80, height: 80 }}
                                            >
                                                <School />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h6">{selectedStudent.fullName}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {selectedStudent.location} • Age {selectedStudent.age}
                                                </Typography>
                                                <Chip
                                                    label={getStatusLabel(getStatusFromValue(selectedStudent.applicationStatus))}
                                                    color={getStatusColor(getStatusFromValue(selectedStudent.applicationStatus))}
                                                    size="small"
                                                    sx={{ mt: 1 }}
                                                />
                                            </Box>
                                        </Stack>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Academic Background</Typography>
                                        <Typography variant="body2" sx={{ mb: 2 }}>
                                            {selectedStudent.academicBackground || 'N/A'}
                                        </Typography>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Dream Career</Typography>
                                        <Typography variant="body2" sx={{ mb: 2 }}>
                                            {selectedStudent.dreamCareer || 'N/A'}
                                        </Typography>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Story</Typography>
                                        <Typography variant="body2">{selectedStudent.story || 'N/A'}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ mb: 2 }}>Funding Information</Typography>
                                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                            <Typography variant="body2">Amount Raised</Typography>
                                            <Typography variant="h6">${selectedStudent.amountRaised || 0}</Typography>
                                        </Stack>
                                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                            <Typography variant="body2">Funding Goal</Typography>
                                            <Typography variant="h6">${selectedStudent.fundingGoal || 0}</Typography>
                                        </Stack>
                                        <LinearProgress
                                            variant="determinate"
                                            value={selectedStudent.fundingGoal > 0 ? Math.min((selectedStudent.amountRaised / selectedStudent.fundingGoal) * 100, 100) : 0}
                                            sx={{ height: 10, borderRadius: 5, mt: 2 }}
                                        />
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
                    {selectedStudent && (
                        <Button
                            variant="contained"
                            onClick={() => {
                                setOpenDetailsDialog(false);
                                navigate(`/admin/students/${selectedStudent.id}`);
                            }}
                        >
                            View Full Profile
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminStudentsByStatus;

