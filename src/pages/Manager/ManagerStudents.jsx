import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    TextField,
    InputAdornment,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Chip,
    Avatar,
    IconButton,
    LinearProgress,
    Switch,
    FormControlLabel,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Link as MuiLink,
} from '@mui/material';
import {
    Search,
    Add,
    Edit,
    Delete,
    Visibility,
    VisibilityOff,
    School,
    CloudUpload,
    Delete as DeleteIcon,
    Image,
    Description,
    Info,
} from '@mui/icons-material';
import { studentService } from '../../services/studentService';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';
import ImageGallery from '../../components/ImageGallery';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ManagerStudents = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentDetails, setStudentDetails] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        age: '',
        location: '',
        story: '',
        academicBackground: '',
        dreamCareer: '',
        fundingGoal: '',
        isVisible: true,
    });
    const [profileImageUrl, setProfileImageUrl] = useState('');
    const [documents, setDocuments] = useState([]); // Array of { filePath, fileName, fileType, description, fileSize }
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        filterStudents();
    }, [students, searchTerm]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await studentService.getStudents();
            const studentsArray = response?.students || response || [];
            setStudents(Array.isArray(studentsArray) ? studentsArray : []);
        } catch (error) {
            setError('Failed to fetch students');
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterStudents = () => {
        if (searchTerm) {
            const filtered = students.filter(
                (student) =>
                    student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    student.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    student.academicBackground?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredStudents(filtered);
        } else {
            setFilteredStudents(students);
        }
    };

    const fetchStudentDetails = async (studentId) => {
        try {
            setDetailsLoading(true);
            const response = await studentService.getStudent(studentId);
            setStudentDetails(response);
        } catch (error) {
            setError('Failed to fetch student details');
            console.error('Error fetching student details:', error);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleViewDetails = async (student) => {
        navigate(`/manager/students/${student.id}`);
    };

    const handleOpenDialog = async (student = null) => {
        if (student) {
            setSelectedStudent(student);
            // Fetch full student details to get email and documents
            try {
                const fullDetails = await studentService.getStudent(student.id);
                setFormData({
                    email: fullDetails.email || student.email || '',
                    fullName: fullDetails.fullName || student.fullName || '',
                    age: fullDetails.age || student.age || '',
                    location: fullDetails.location || student.location || '',
                    story: fullDetails.story || student.story || '',
                    academicBackground: fullDetails.academicBackground || student.academicBackground || '',
                    dreamCareer: fullDetails.dreamCareer || student.dreamCareer || '',
                    fundingGoal: fullDetails.fundingGoal || student.fundingGoal || '',
                    isVisible: fullDetails.isVisible !== false,
                });
                setProfileImageUrl(fullDetails.photoUrl || student.photoUrl || '');
                // Set documents if available
                if (fullDetails.documents && fullDetails.documents.length > 0) {
                    setDocuments(fullDetails.documents.map(doc => ({
                        fileName: doc.fileName,
                        filePath: doc.filePath,
                        fileType: doc.fileType,
                        description: doc.fileType,
                        fileSize: 0,
                    })));
                } else {
                    setDocuments([]);
                }
            } catch (error) {
                console.error('Error fetching student details:', error);
                // Fallback to basic student data
                setFormData({
                    email: student.email || '',
                    fullName: student.fullName || '',
                    age: student.age || '',
                    location: student.location || '',
                    story: student.story || '',
                    academicBackground: student.academicBackground || '',
                    dreamCareer: student.dreamCareer || '',
                    fundingGoal: student.fundingGoal || '',
                    isVisible: student.isVisible !== false,
                });
                setProfileImageUrl(student.photoUrl || '');
                setDocuments([]);
            }
        } else {
            setSelectedStudent(null);
            setFormData({
                email: '',
                fullName: '',
                age: '',
                location: '',
                story: '',
                academicBackground: '',
                dreamCareer: '',
                fundingGoal: '',
                isVisible: true,
            });
            setProfileImageUrl('');
            setDocuments([]);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedStudent(null);
        setProfileImageUrl('');
        setDocuments([]);
        setError('');
        setSuccess('');
    };

    const handleCloseDetailsDialog = () => {
        setOpenDetailsDialog(false);
        setSelectedStudent(null);
        setStudentDetails(null);
    };

    const handleSaveStudent = async () => {
        try {
            setError('');
            setSuccess('');
            
            // Validate required fields
            if (!selectedStudent) {
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
                if (!formData.location || formData.location.trim() === '') {
                    setError('Location is required');
                    return;
                }
                if (!formData.story || formData.story.trim() === '') {
                    setError('Student story is required');
                    return;
                }
                if (!formData.fundingGoal || parseFloat(formData.fundingGoal) <= 0) {
                    setError('Please provide a valid funding goal');
                    return;
                }
            }
            
            if (selectedStudent) {
                // Update student
                try {
                    const updateData = {
                        fullName: formData.fullName.trim(),
                        age: parseInt(formData.age) || 0,
                        location: formData.location.trim(),
                        story: formData.story.trim(),
                        academicBackground: formData.academicBackground?.trim() || '',
                        dreamCareer: formData.dreamCareer?.trim() || '',
                        fundingGoal: parseFloat(formData.fundingGoal) || 0,
                        isVisible: formData.isVisible,
                        photoUrl: profileImageUrl,
                    };
                    
                    // Only include email and documents if user is manager/admin
                    if (user?.role === 'Manager' || user?.role === 'Admin') {
                        if (formData.email && formData.email.trim()) {
                            updateData.email = formData.email.trim();
                        }
                        if (documents.length > 0) {
                            updateData.documents = documents;
                        }
                    }
                    
                    await studentService.updateStudent(selectedStudent.id, updateData);
                    setSuccess('Student updated successfully');
                    handleCloseDialog();
                    fetchStudents();
                } catch (error) {
                    const errorResponse = error.response?.data;
                    let errorMessage = 'Failed to update student';
                    
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
            } else {
                // Create student
                try {
                    const response = await api.post('/students', {
                        email: formData.email.trim(),
                        fullName: formData.fullName.trim(),
                        age: parseInt(formData.age) || 0,
                        location: formData.location.trim(),
                        story: formData.story.trim(),
                        academicBackground: formData.academicBackground?.trim() || '',
                        dreamCareer: formData.dreamCareer?.trim() || '',
                        fundingGoal: parseFloat(formData.fundingGoal) || 0,
                        isVisible: formData.isVisible,
                        photoUrl: profileImageUrl,
                        documents: documents.length > 0 ? documents : null,
                    });
                    setSuccess(response.data?.message || 'Student created successfully. Password reset email has been sent to the student.');
                    handleCloseDialog();
                    fetchStudents();
                } catch (error) {
                    const errorResponse = error.response?.data;
                    let errorMessage = 'Failed to create student';
                    
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
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
            setError(errorMessage);
        }
    };

    const handleToggleVisibility = async (studentId, currentVisibility) => {
        try {
            const student = students.find(s => s.id === studentId);
            if (!student) return;
            
            await studentService.updateStudent(studentId, {
                fullName: student.fullName,
                age: student.age,
                location: student.location,
                story: student.story,
                academicBackground: student.academicBackground,
                dreamCareer: student.dreamCareer,
                fundingGoal: student.fundingGoal,
                isVisible: !currentVisibility,
                photoUrl: student.photoUrl,
            });
            setSuccess(`Student ${currentVisibility ? 'hidden' : 'published'} successfully`);
            fetchStudents();
        } catch (error) {
            setError('Failed to update student visibility');
        }
    };

    const handleDeleteStudent = async (studentId) => {
        if (window.confirm('Are you sure you want to delete this student profile?')) {
            try {
                await studentService.deleteStudent(studentId);
                setSuccess('Student deleted successfully');
                fetchStudents();
            } catch (error) {
                setError('Failed to delete student');
            }
        }
    };

    const calculateFundingProgress = (raised, goal) => {
        if (!goal || goal === 0) return 0;
        return Math.min((raised / goal) * 100, 100);
    };

    const handleDocumentUpload = async (file, fileType) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await api.post('/fileupload/document', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            const newDoc = {
                fileName: response.data.fileName || file.name,
                filePath: response.data.url,
                fileType: fileType,
                description: `${fileType} document`,
                fileSize: file.size
            };
            
            setDocuments([...documents, newDoc]);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to upload document');
        }
    };

    if (loading) {
        return (
            <Box>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                    Student Management
                </Typography>
                <LinearProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Student Management
                </Typography>
                <Stack direction="row" spacing={2}>
                    <Button 
                        variant="outlined" 
                        onClick={() => navigate('/manager/students/by-status')}
                    >
                        View by Status
                    </Button>
                    <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
                        Add Student
                    </Button>
                </Stack>
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

            {/* Search */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <TextField
                        placeholder="Search students by name, location, or field of study..."
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

            {/* Students Grid */}
            <Grid container spacing={3}>
                {filteredStudents.length === 0 ? (
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" align="center">
                                    No students found.
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
                                                label={student.isVisible ? 'Published' : 'Hidden'}
                                                color={student.isVisible ? 'success' : 'default'}
                                                size="small"
                                                sx={{ mt: 0.5 }}
                                            />
                                        </Box>
                                    </Stack>

                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {student.academicBackground} • {student.dreamCareer}
                                    </Typography>

                                    {/* Funding Progress */}
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

                                    {/* Actions */}
                                    <Stack direction="row" spacing={1}>
                                        <IconButton size="small" onClick={() => handleViewDetails(student)} title="View Full Profile">
                                            <Info fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => navigate(`/manager/students/${student.id}`)} title="Edit Student">
                                            <Edit fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleToggleVisibility(student.id, student.isVisible)}
                                        >
                                            {student.isVisible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDeleteStudent(student.id)}>
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>

            {/* View Details Dialog */}
            <Dialog open={openDetailsDialog} onClose={handleCloseDetailsDialog} maxWidth="lg" fullWidth>
                <DialogTitle>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5">Student Details</Typography>
                        <IconButton onClick={handleCloseDetailsDialog}>
                            <DeleteIcon />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    {detailsLoading ? (
                        <LinearProgress />
                    ) : studentDetails ? (
                        <Grid container spacing={3}>
                            {/* Basic Info */}
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                                            <Avatar 
                                                src={getImageUrl(studentDetails.photoUrl)} 
                                                sx={{ width: 80, height: 80 }}
                                            >
                                                <School />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h6">{studentDetails.fullName}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {studentDetails.location} • Age {studentDetails.age}
                                                </Typography>
                                                <Chip
                                                    label={studentDetails.isVisible ? 'Published' : 'Hidden'}
                                                    color={studentDetails.isVisible ? 'success' : 'default'}
                                                    size="small"
                                                    sx={{ mt: 1 }}
                                                />
                                            </Box>
                                        </Stack>
                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Academic Background</Typography>
                                        <Typography variant="body2" sx={{ mb: 2 }}>{studentDetails.academicBackground || 'N/A'}</Typography>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Dream Career</Typography>
                                        <Typography variant="body2" sx={{ mb: 2 }}>{studentDetails.dreamCareer || 'N/A'}</Typography>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Story</Typography>
                                        <Typography variant="body2">{studentDetails.story || 'N/A'}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Funding & Stats */}
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ mb: 2 }}>Funding Information</Typography>
                                        <Box sx={{ mb: 2 }}>
                                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                                <Typography variant="body2">Amount Raised</Typography>
                                                <Typography variant="h6">${studentDetails.amountRaised || 0}</Typography>
                                            </Stack>
                                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                                <Typography variant="body2">Funding Goal</Typography>
                                                <Typography variant="h6">${studentDetails.fundingGoal || 0}</Typography>
                                            </Stack>
                                            <LinearProgress
                                                variant="determinate"
                                                value={calculateFundingProgress(studentDetails.amountRaised || 0, studentDetails.fundingGoal || 0)}
                                                sx={{ height: 10, borderRadius: 5, mt: 2 }}
                                            />
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                {calculateFundingProgress(studentDetails.amountRaised || 0, studentDetails.fundingGoal || 0).toFixed(1)}% Complete
                                            </Typography>
                                        </Box>
                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="body2">Donors: {studentDetails.donorCount || 0}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Gallery Images */}
                            {studentDetails.galleryImageUrls && studentDetails.galleryImageUrls.length > 0 && (
                                <Grid item xs={12}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ mb: 2 }}>
                                                <Image sx={{ verticalAlign: 'middle', mr: 1 }} />
                                                Gallery Images ({studentDetails.galleryImageUrls.length})
                                            </Typography>
                                            <ImageGallery images={studentDetails.galleryImageUrls} title="Student Gallery" />
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}

                            {/* Documents */}
                            {studentDetails.documents && studentDetails.documents.length > 0 && (
                                <Grid item xs={12}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ mb: 2 }}>
                                                <Description sx={{ verticalAlign: 'middle', mr: 1 }} />
                                                Documents ({studentDetails.documents.length})
                                            </Typography>
                                            <List>
                                                {studentDetails.documents.map((doc, index) => (
                                                    <ListItem key={index}>
                                                        <ListItemAvatar>
                                                            <Avatar>
                                                                <Description />
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={doc.fileName || `Document ${index + 1}`}
                                                            secondary={new Date(doc.uploadedAt).toLocaleDateString()}
                                                        />
                                                        <Button
                                                            size="small"
                                                            component={MuiLink}
                                                            href={getImageUrl(doc.filePath)}
                                                            target="_blank"
                                                        >
                                                            View
                                                        </Button>
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}

                            {/* Proof Documents from Application */}
                            {studentDetails.proofDocuments && studentDetails.proofDocuments.length > 0 && (
                                <Grid item xs={12}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ mb: 2 }}>
                                                <Description sx={{ verticalAlign: 'middle', mr: 1 }} />
                                                Proof Documents ({studentDetails.proofDocuments.length})
                                            </Typography>
                                            <List>
                                                {studentDetails.proofDocuments.map((docUrl, index) => (
                                                    <ListItem key={index}>
                                                        <ListItemAvatar>
                                                            <Avatar>
                                                                <Description />
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={`Proof Document ${index + 1}`}
                                                            secondary={docUrl.split('/').pop()}
                                                        />
                                                        <Button
                                                            size="small"
                                                            component={MuiLink}
                                                            href={getImageUrl(docUrl)}
                                                            target="_blank"
                                                        >
                                                            View
                                                        </Button>
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}
                        </Grid>
                    ) : (
                        <Typography>No details available</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetailsDialog}>Close</Button>
                    {selectedStudent && (
                        <Button variant="contained" onClick={() => {
                            handleCloseDetailsDialog();
                            handleOpenDialog(selectedStudent);
                        }}>
                            Edit
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Create/Edit Student Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>{selectedStudent ? 'Edit Student Profile' : 'Create Student Profile'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            {!selectedStudent && (
                                <Grid item xs={12}>
                                    <TextField
                                        label="Email Address"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        fullWidth
                                        required
                                        error={!!error && (error.toLowerCase().includes('email') || error.toLowerCase().includes('already') || error.toLowerCase().includes('exists'))}
                                        helperText={
                                            error && (error.toLowerCase().includes('email') || error.toLowerCase().includes('already') || error.toLowerCase().includes('exists'))
                                                ? error
                                                : "A user account will be created automatically if it doesn't exist. Password reset email will be sent to set the password."
                                        }
                                    />
                                </Grid>
                            )}
                            {selectedStudent && (user?.role === 'Manager' || user?.role === 'Admin') && (
                                <Grid item xs={12}>
                                    <TextField
                                        label="Email Address"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        fullWidth
                                        error={!!error && (error.toLowerCase().includes('email') || error.toLowerCase().includes('already') || error.toLowerCase().includes('exists'))}
                                        helperText={
                                            error && (error.toLowerCase().includes('email') || error.toLowerCase().includes('already') || error.toLowerCase().includes('exists'))
                                                ? error
                                                : "Update student's email address"
                                        }
                                    />
                                </Grid>
                            )}
                            <Grid item xs={12}>
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
                                    label="Location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Academic Background"
                                    value={formData.academicBackground}
                                    onChange={(e) => setFormData({ ...formData, academicBackground: e.target.value })}
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
                                    label="Student Story"
                                    value={formData.story}
                                    onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                                    fullWidth
                                    multiline
                                    rows={4}
                                    placeholder="Tell the student's story..."
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Funding Goal ($)"
                                    type="number"
                                    value={formData.fundingGoal}
                                    onChange={(e) => setFormData({ ...formData, fundingGoal: e.target.value })}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.isVisible}
                                            onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                                        />
                                    }
                                    label="Publish Profile (Make Visible to Donors)"
                                />
                            </Grid>
                        </Grid>

                        {/* Profile Image Upload */}
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                Profile Photo
                            </Typography>
                            {profileImageUrl && (
                                <Box sx={{ mb: 2 }}>
                                    <img
                                        src={getImageUrl(profileImageUrl)}
                                        alt="Profile"
                                        style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                    <IconButton
                                        size="small"
                                        onClick={() => setProfileImageUrl('')}
                                        sx={{ ml: 1 }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            )}
                            <Button variant="outlined" startIcon={<CloudUpload />} component="label">
                                {profileImageUrl ? 'Change Photo' : 'Upload Profile Photo'}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        try {
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            const response = await api.post('/fileupload/profile-picture', formData, {
                                                headers: { 'Content-Type': 'multipart/form-data' },
                                            });
                                            setProfileImageUrl(response.data.url);
                                        } catch (error) {
                                            setError('Failed to upload image');
                                        }
                                    }}
                                />
                            </Button>
                        </Box>

                        {/* Academic Documents Upload */}
                        {(!selectedStudent || user?.role === 'Manager' || user?.role === 'Admin') && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                    Academic Documents
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Suggested documents: Transcript, Diploma, Certificate, Recommendation Letter, ID Card, etc.
                                </Typography>
                                
                                {/* Document Type Suggestions */}
                                <Grid container spacing={1} sx={{ mb: 2 }}>
                                    {['Transcript', 'Diploma', 'Certificate', 'Recommendation Letter', 'ID Card', 'Birth Certificate'].map((docType) => (
                                        <Grid item key={docType}>
                                            <Chip
                                                label={docType}
                                                size="small"
                                                onClick={() => {
                                                    const input = document.createElement('input');
                                                    input.type = 'file';
                                                    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
                                                    input.onchange = async (e) => {
                                                        const file = e.target.files[0];
                                                        if (!file) return;
                                                        await handleDocumentUpload(file, docType);
                                                    };
                                                    input.click();
                                                }}
                                                sx={{ cursor: 'pointer' }}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>

                                {/* Uploaded Documents List */}
                                {documents.length > 0 && (
                                    <List dense>
                                        {documents.map((doc, index) => (
                                            <ListItem
                                                key={index}
                                                secondaryAction={
                                                    <IconButton
                                                        edge="end"
                                                        size="small"
                                                        onClick={() => {
                                                            const newDocs = documents.filter((_, i) => i !== index);
                                                            setDocuments(newDocs);
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                }
                                            >
                                                <ListItemAvatar>
                                                    <Avatar>
                                                        <Description />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={doc.fileName}
                                                    secondary={`${doc.fileType} • ${(doc.fileSize / 1024).toFixed(1)} KB`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                )}

                                <Button variant="outlined" startIcon={<CloudUpload />} component="label" size="small">
                                    Upload Document
                                    <input
                                        type="file"
                                        hidden
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;
                                            await handleDocumentUpload(file, 'Other');
                                        }}
                                    />
                                </Button>
                            </Box>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSaveStudent} variant="contained">
                        {selectedStudent ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ManagerStudents;
