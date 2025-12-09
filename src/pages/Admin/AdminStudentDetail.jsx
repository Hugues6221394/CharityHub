import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Button,
    Stack,
    Avatar,
    Chip,
    LinearProgress,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Switch,
    FormControlLabel,
    Alert,
    Tabs,
    Tab,
    Paper,
    CircularProgress,
} from '@mui/material';
import {
    ArrowBack,
    Edit,
    Delete,
    Save,
    Cancel,
    School,
    LocationOn,
    AttachMoney,
    People,
    Description,
    Image as ImageIcon,
    Visibility,
    VisibilityOff,
    CloudUpload,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUtils';
import api from '../../services/api';
import ImageGallery from '../../components/ImageGallery';

const AdminStudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        location: '',
        story: '',
        academicBackground: '',
        dreamCareer: '',
        fundingGoal: '',
        isVisible: true,
        email: '',
    });
    const [profileImageUrl, setProfileImageUrl] = useState('');
    const [documents, setDocuments] = useState([]);
    const [newDocuments, setNewDocuments] = useState([]);
    const [galleryImages, setGalleryImages] = useState([]);

    useEffect(() => {
        fetchStudent();
    }, [id]);

    const fetchStudent = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await studentService.getStudent(parseInt(id));
            setStudent(data);
            setFormData({
                fullName: data.fullName || '',
                age: data.age || '',
                location: data.location || '',
                story: data.story || '',
                academicBackground: data.academicBackground || '',
                dreamCareer: data.dreamCareer || '',
                fundingGoal: data.fundingGoal || '',
                isVisible: data.isVisible !== false,
                email: data.email || '',
            });
            setProfileImageUrl(data.photoUrl || '');
            setDocuments(data.documents || []);
            setGalleryImages(data.galleryImageUrls || []);
        } catch (err) {
            setError('Failed to load student details');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setEditing(true);
        setError('');
        setSuccess('');
    };

    const handleCancel = () => {
        setEditing(false);
        if (student) {
            setFormData({
                fullName: student.fullName || '',
                age: student.age || '',
                location: student.location || '',
                story: student.story || '',
                academicBackground: student.academicBackground || '',
                dreamCareer: student.dreamCareer || '',
                fundingGoal: student.fundingGoal || '',
                isVisible: student.isVisible !== false,
                email: student.email || '',
            });
            setProfileImageUrl(student.photoUrl || '');
            setDocuments(student.documents || []);
            setNewDocuments([]);
            setGalleryImages(student.galleryImageUrls || []);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccess('');

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

            if (user?.role === 'Admin' || user?.role === 'Manager') {
                if (formData.email && formData.email.trim() && user?.role === 'Admin') {
                    updateData.email = formData.email.trim();
                }
                const allDocuments = [...documents, ...newDocuments];
                if (allDocuments.length > 0 && user?.role === 'Admin') {
                    updateData.documents = allDocuments;
                }
                if (galleryImages.length > 0) {
                    updateData.galleryImageUrls = galleryImages;
                }
            }

            await studentService.updateStudent(parseInt(id), updateData);
            setSuccess('Student updated successfully');
            setEditing(false);
            await fetchStudent();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update student';
            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
            try {
                setSaving(true);
                await studentService.deleteStudent(parseInt(id));
                navigate('/admin/students');
            } catch (err) {
                const errorMessage = err.response?.data?.message || err.message || 'Failed to delete student';
                setError(errorMessage);
            } finally {
                setSaving(false);
            }
        }
    };

    const handleImageUpload = async (e) => {
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
                description: fileType,
                fileSize: file.size,
            };
            setNewDocuments([...newDocuments, newDoc]);
        } catch (error) {
            setError('Failed to upload document');
        }
    };

    const removeDocument = (index, isNew = false) => {
        if (isNew) {
            setNewDocuments(newDocuments.filter((_, i) => i !== index));
        } else {
            setDocuments(documents.filter((_, i) => i !== index));
        }
    };

    const handleGalleryImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const validFiles = files.filter(file => {
            if (!allowedTypes.includes(file.type)) {
                setError('Only JPG and PNG images are allowed for gallery');
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('File size exceeds 5MB limit');
                return false;
            }
            return true;
        });

        for (const file of validFiles) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                const response = await api.post('/fileupload/profile-picture', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setGalleryImages(prev => [...prev, response.data.url]);
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to upload gallery image');
            }
        }
    };

    const removeGalleryImage = (index) => {
        setGalleryImages(galleryImages.filter((_, i) => i !== index));
    };

    const handleSaveGallery = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccess('');

            const updateData = {
                fullName: student.fullName,
                age: student.age,
                location: student.location,
                story: student.story,
                academicBackground: student.academicBackground || '',
                dreamCareer: student.dreamCareer || '',
                fundingGoal: student.fundingGoal,
                isVisible: student.isVisible,
                photoUrl: student.photoUrl,
                galleryImageUrls: galleryImages,
            };

            if (user?.role === 'Admin' && student.email) {
                updateData.email = student.email;
            }

            await studentService.updateStudent(parseInt(id), updateData);
            setSuccess('Gallery updated successfully');
            await fetchStudent();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update gallery';
            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!student) {
        return (
            <Container>
                <Alert severity="error">Student not found</Alert>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin/students')} sx={{ mt: 2 }}>
                    Back to Students
                </Button>
            </Container>
        );
    }

    const fundingProgress = student.fundingGoal > 0 ? (student.amountRaised / student.fundingGoal) * 100 : 0;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin/students')}>
                    Back
                </Button>
                <Typography variant="h4" sx={{ fontWeight: 700, flexGrow: 1 }}>
                    Student Profile
                </Typography>
                {!editing && (
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="contained"
                            startIcon={<Edit />}
                            onClick={handleEdit}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Delete />}
                            onClick={handleDelete}
                        >
                            Delete
                        </Button>
                    </Stack>
                )}
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
                <Tab label="Overview" />
                <Tab label="Documents" />
                <Tab label="Gallery" />
                <Tab label="Progress Reports" />
            </Tabs>

            {activeTab === 0 && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Box sx={{ textAlign: 'center', mb: 3 }}>
                                    {editing ? (
                                        <Box>
                                            <Avatar
                                                src={getImageUrl(profileImageUrl)}
                                                sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
                                            />
                                            <Button
                                                variant="outlined"
                                                component="label"
                                                startIcon={<CloudUpload />}
                                                size="small"
                                            >
                                                Upload Photo
                                                <input
                                                    type="file"
                                                    hidden
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                />
                                            </Button>
                                        </Box>
                                    ) : (
                                        <Avatar
                                            src={getImageUrl(student.photoUrl)}
                                            sx={{ width: 150, height: 150, mx: 'auto' }}
                                        />
                                    )}
                                    <Typography variant="h5" sx={{ mt: 2, fontWeight: 600 }}>
                                        {editing ? (
                                            <TextField
                                                fullWidth
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                sx={{ mt: 1 }}
                                            />
                                        ) : (
                                            student.fullName
                                        )}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        {editing ? (
                                            <TextField
                                                fullWidth
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                size="small"
                                                sx={{ mt: 1 }}
                                            />
                                        ) : (
                                            <>
                                                <LocationOn fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                                {student.location}
                                            </>
                                        )}
                                    </Typography>
                                    <Chip
                                        label={student.isVisible ? 'Published' : 'Hidden'}
                                        color={student.isVisible ? 'success' : 'default'}
                                        size="small"
                                        sx={{ mt: 1 }}
                                    />
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                        Funding Progress
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min(fundingProgress, 100)}
                                        sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                    />
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2">
                                            ${student.amountRaised?.toLocaleString() || 0} raised
                                        </Typography>
                                        <Typography variant="body2">
                                            Goal: ${student.fundingGoal?.toLocaleString() || 0}
                                        </Typography>
                                    </Stack>
                                </Box>

                                {editing && (
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.isVisible}
                                                onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                                            />
                                        }
                                        label="Visible to Public"
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    Student Information
                                </Typography>

                                <Grid container spacing={2}>
                                    {user?.role === 'Admin' && (
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Email Address"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                fullWidth
                                                disabled={!editing}
                                            />
                                        </Grid>
                                    )}
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Age"
                                            type="number"
                                            value={formData.age}
                                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                            fullWidth
                                            disabled={!editing}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Funding Goal ($)"
                                            type="number"
                                            value={formData.fundingGoal}
                                            onChange={(e) => setFormData({ ...formData, fundingGoal: e.target.value })}
                                            fullWidth
                                            disabled={!editing}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Academic Background"
                                            value={formData.academicBackground}
                                            onChange={(e) => setFormData({ ...formData, academicBackground: e.target.value })}
                                            fullWidth
                                            disabled={!editing}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Dream Career"
                                            value={formData.dreamCareer}
                                            onChange={(e) => setFormData({ ...formData, dreamCareer: e.target.value })}
                                            fullWidth
                                            disabled={!editing}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Student Story"
                                            value={formData.story}
                                            onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                                            fullWidth
                                            multiline
                                            rows={6}
                                            disabled={!editing}
                                        />
                                    </Grid>
                                </Grid>

                                {editing && (
                                    <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                                        <Button
                                            variant="contained"
                                            startIcon={<Save />}
                                            onClick={handleSave}
                                            disabled={saving}
                                        >
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            startIcon={<Cancel />}
                                            onClick={handleCancel}
                                            disabled={saving}
                                        >
                                            Cancel
                                        </Button>
                                    </Stack>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {activeTab === 1 && (
                <Card>
                    <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Typography variant="h6">Documents</Typography>
                            {editing && user?.role === 'Admin' && (
                                <Stack direction="row" spacing={1}>
                                    {['Transcript', 'Diploma', 'Certificate', 'ID Card'].map((docType) => (
                                        <Button
                                            key={docType}
                                            variant="outlined"
                                            size="small"
                                            startIcon={<CloudUpload />}
                                            component="label"
                                        >
                                            {docType}
                                            <input
                                                type="file"
                                                hidden
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (file) await handleDocumentUpload(file, docType);
                                                }}
                                            />
                                        </Button>
                                    ))}
                                </Stack>
                            )}
                        </Stack>
                        <List>
                            {documents.map((doc, index) => (
                                <ListItem
                                    key={index}
                                    secondaryAction={
                                        editing && user?.role === 'Admin' && (
                                            <IconButton edge="end" onClick={() => removeDocument(index, false)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        )
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar><Description /></Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={doc.fileName} secondary={doc.fileType} />
                                </ListItem>
                            ))}
                            {newDocuments.map((doc, index) => (
                                <ListItem
                                    key={`new-${index}`}
                                    secondaryAction={
                                        <IconButton edge="end" onClick={() => removeDocument(index, true)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar><Description /></Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={doc.fileName} secondary={doc.fileType} />
                                </ListItem>
                            ))}
                            {documents.length === 0 && newDocuments.length === 0 && (
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                                    No documents uploaded
                                </Typography>
                            )}
                        </List>
                    </CardContent>
                </Card>
            )}

            {activeTab === 2 && (
                <Card>
                    <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Typography variant="h6">Gallery Images</Typography>
                            {(user?.role === 'Admin' || user?.role === 'Manager') && (
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<CloudUpload />}
                                    size="small"
                                >
                                    Add Images
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        multiple
                                        onChange={handleGalleryImageUpload}
                                    />
                                </Button>
                            )}
                        </Stack>
                        
                        {galleryImages.length > 0 ? (
                            <Grid container spacing={2}>
                                {galleryImages.map((imageUrl, index) => (
                                    <Grid item xs={12} sm={6} md={4} key={index}>
                                        <Box sx={{ position: 'relative' }}>
                                            <Box
                                                component="img"
                                                src={getImageUrl(imageUrl)}
                                                alt={`Gallery ${index + 1}`}
                                                sx={{
                                                    width: '100%',
                                                    height: 200,
                                                    objectFit: 'cover',
                                                    borderRadius: 2,
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => window.open(getImageUrl(imageUrl), '_blank')}
                                            />
                                            {(user?.role === 'Admin' || user?.role === 'Manager') && (
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 8,
                                                        right: 8,
                                                        bgcolor: 'rgba(0,0,0,0.5)',
                                                        color: 'white',
                                                        '&:hover': {
                                                            bgcolor: 'rgba(0,0,0,0.7)',
                                                        },
                                                    }}
                                                    onClick={() => removeGalleryImage(index)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                                No gallery images. Click "Add Images" to upload gallery photos.
                            </Typography>
                        )}

                        {(user?.role === 'Admin' || user?.role === 'Manager') && galleryImages.length > 0 && (
                            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                                <Button
                                    variant="contained"
                                    startIcon={<Save />}
                                    onClick={handleSaveGallery}
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save Gallery Changes'}
                                </Button>
                            </Stack>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeTab === 3 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>Progress Reports</Typography>
                        {student.progressReports && student.progressReports.length > 0 ? (
                            <List>
                                {student.progressReports.map((report) => (
                                    <ListItem key={report.id}>
                                        <ListItemText
                                            primary={report.title}
                                            secondary={
                                                <>
                                                    <Typography variant="body2">{report.description}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(report.reportDate).toLocaleDateString()}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                                No progress reports yet
                            </Typography>
                        )}
                    </CardContent>
                </Card>
            )}
        </Container>
    );
};

export default AdminStudentDetail;

