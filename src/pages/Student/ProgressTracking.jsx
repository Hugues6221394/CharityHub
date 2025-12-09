import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Stack,
    Grid,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Avatar,
    Chip,
    LinearProgress,
} from '@mui/material';
import {
    Add,
    PhotoCamera,
    VideoLibrary,
    Delete,
    Edit,
} from '@mui/icons-material';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';

const ProgressTracking = () => {
    const [progressUpdates, setProgressUpdates] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingUpdate, setEditingUpdate] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        academicGrade: '',
        semester: '',
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [existingPhotoUrl, setExistingPhotoUrl] = useState(null);
    const [existingVideoUrl, setExistingVideoUrl] = useState(null);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProgressUpdates();
    }, []);

    const fetchProgressUpdates = async () => {
        try {
            const response = await api.get('/progress/my-progress-updates');
            setProgressUpdates(response.data || []);
        } catch (error) {
            console.error('Error fetching progress updates:', error);
        }
    };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles([...selectedFiles, ...files]);
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            // Upload files first
            const uploadedUrls = [];
            let photoUrl = null;
            let videoUrl = null;
            
            for (const file of selectedFiles) {
                try {
                    const formDataFile = new FormData();
                    formDataFile.append('file', file);

                    const uploadResponse = await api.post('/progress/upload-media', formDataFile, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    
                    const url = uploadResponse.data.url;
                    uploadedUrls.push(url);
                    
                    // Determine if it's a photo or video
                    const fileType = file.type;
                    if (fileType.startsWith('image/')) {
                        photoUrl = url;
                    } else if (fileType.startsWith('video/')) {
                        videoUrl = url;
                    }
                } catch (error) {
                    console.error('Error uploading file:', error);
                    setError(`Failed to upload ${file.name}. Please try again.`);
                    setLoading(false);
                    return;
                }
            }

            // Create progress update
            const updateData = {
                title: formData.title,
                description: formData.description,
                grade: formData.academicGrade || null,
                achievement: formData.semester || null,
                photoUrl: photoUrl || existingPhotoUrl,
                videoUrl: videoUrl || existingVideoUrl,
            };

            if (editingUpdate) {
                // Update existing progress
                await api.put(`/progress/${editingUpdate.id}`, updateData);
                setSuccess('Progress update updated successfully!');
            } else {
                // Create new progress
                await api.post('/progress/create', updateData);
                setSuccess('Progress update posted successfully! Your donors have been notified.');
            }
            
            setOpenDialog(false);
            setEditingUpdate(null);
            setFormData({
                title: '',
                description: '',
                academicGrade: '',
                semester: '',
            });
            setSelectedFiles([]);
            setExistingPhotoUrl(null);
            setExistingVideoUrl(null);
            fetchProgressUpdates();

        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create progress update';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleEditUpdate = (update) => {
        setEditingUpdate(update);
        setFormData({
            title: update.title || '',
            description: update.description || '',
            academicGrade: update.grade || '',
            semester: update.achievement || '',
        });
        setExistingPhotoUrl(update.photoUrl || null);
        setExistingVideoUrl(update.videoUrl || null);
        setSelectedFiles([]);
        setOpenDialog(true);
    };

    const handleDeleteUpdate = async (id) => {
        if (window.confirm('Are you sure you want to delete this progress update?')) {
            try {
                setError('');
                setSuccess('');
                await api.delete(`/progress/${id}`);
                setSuccess('Progress update deleted successfully');
                fetchProgressUpdates();
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || 'Failed to delete progress update';
                setError(errorMessage);
            }
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingUpdate(null);
        setFormData({
            title: '',
            description: '',
            academicGrade: '',
            semester: '',
        });
        setSelectedFiles([]);
        setExistingPhotoUrl(null);
        setExistingVideoUrl(null);
    };

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Progress Tracking
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenDialog(true)}
                >
                    Create Update
                </Button>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Alert severity="info" sx={{ mb: 3 }}>
                Share your academic progress, achievements, and milestones with your donors.
                They will be automatically notified when you post an update!
            </Alert>

            {/* Progress Updates List */}
            <Grid container spacing={3}>
                {progressUpdates.length === 0 ? (
                    <Grid item xs={12}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 6 }}>
                                <Typography variant="h6" color="text.secondary">
                                    No progress updates yet
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Start sharing your journey with your donors!
                                </Typography>
                                <Button variant="contained" onClick={() => setOpenDialog(true)}>
                                    Create Your First Update
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ) : (
                    progressUpdates.map((update) => (
                        <Grid item xs={12} key={update.id}>
                            <Card>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                                {update.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                {update.description}
                                            </Typography>

                                            {update.grade && (
                                                <Chip
                                                    label={`Grade: ${update.grade}`}
                                                    size="small"
                                                    color="success"
                                                    sx={{ mr: 1, mb: 1 }}
                                                />
                                            )}
                                            {update.achievement && (
                                                <Chip
                                                    label={`Achievement: ${update.achievement}`}
                                                    size="small"
                                                    color="primary"
                                                    sx={{ mr: 1, mb: 1 }}
                                                />
                                            )}

                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                                Posted on {new Date(update.reportDate || update.createdAt).toLocaleDateString()}
                                            </Typography>
                                        </Box>

                                        <Stack direction="row" spacing={1}>
                                            <IconButton size="small" color="primary" onClick={() => handleEditUpdate(update)}>
                                                <Edit />
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={() => handleDeleteUpdate(update.id)}>
                                                <Delete />
                                            </IconButton>
                                        </Stack>
                                    </Stack>

                                    {/* Media Preview */}
                                    {(update.photoUrl || update.videoUrl) && (
                                        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                            {update.photoUrl && (
                                                <Box
                                                    component="img"
                                                    src={getImageUrl(update.photoUrl)}
                                                    alt={update.title}
                                                    sx={{
                                                        width: 100,
                                                        height: 100,
                                                        objectFit: 'cover',
                                                        borderRadius: 1,
                                                    }}
                                                />
                                            )}
                                            {update.videoUrl && (
                                                <Box
                                                    component="video"
                                                    src={getImageUrl(update.videoUrl)}
                                                    controls
                                                    sx={{
                                                        width: 200,
                                                        height: 100,
                                                        borderRadius: 1,
                                                    }}
                                                />
                                            )}
                                        </Stack>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>

            {/* Create/Edit Progress Update Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>{editingUpdate ? 'Edit Progress Update' : 'Create Progress Update'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <TextField
                            label="Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            fullWidth
                            required
                            placeholder="e.g., Completed First Semester with Honors"
                        />

                        <TextField
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            fullWidth
                            multiline
                            rows={4}
                            required
                            placeholder="Share your achievements, challenges overcome, and what you learned..."
                        />

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Academic Grade/GPA"
                                    value={formData.academicGrade}
                                    onChange={(e) => setFormData({ ...formData, academicGrade: e.target.value })}
                                    fullWidth
                                    placeholder="e.g., 3.8 GPA or A-"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Semester/Year"
                                    value={formData.semester}
                                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                    fullWidth
                                    placeholder="e.g., Fall 2024"
                                />
                            </Grid>
                        </Grid>

                        {/* File Upload */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Add Photos or Videos
                            </Typography>
                            
                            {/* Existing Media Preview */}
                            {(existingPhotoUrl || existingVideoUrl) && (
                                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                    {existingPhotoUrl && (
                                        <Box sx={{ position: 'relative' }}>
                                            <Box
                                                component="img"
                                                src={getImageUrl(existingPhotoUrl)}
                                                alt="Current photo"
                                                sx={{
                                                    width: 100,
                                                    height: 100,
                                                    objectFit: 'cover',
                                                    borderRadius: 1,
                                                }}
                                            />
                                            <IconButton
                                                size="small"
                                                sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(0,0,0,0.5)' }}
                                                onClick={() => setExistingPhotoUrl(null)}
                                            >
                                                <Delete fontSize="small" sx={{ color: 'white' }} />
                                            </IconButton>
                                        </Box>
                                    )}
                                    {existingVideoUrl && (
                                        <Box sx={{ position: 'relative' }}>
                                            <Box
                                                component="video"
                                                src={getImageUrl(existingVideoUrl)}
                                                controls
                                                sx={{
                                                    width: 200,
                                                    height: 100,
                                                    borderRadius: 1,
                                                }}
                                            />
                                            <IconButton
                                                size="small"
                                                sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(0,0,0,0.5)' }}
                                                onClick={() => setExistingVideoUrl(null)}
                                            >
                                                <Delete fontSize="small" sx={{ color: 'white' }} />
                                            </IconButton>
                                        </Box>
                                    )}
                                </Stack>
                            )}
                            
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<PhotoCamera />}
                                >
                                    Upload Photos
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileSelect}
                                    />
                                </Button>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<VideoLibrary />}
                                >
                                    Upload Videos
                                    <input
                                        type="file"
                                        hidden
                                        accept="video/*"
                                        multiple
                                        onChange={handleFileSelect}
                                    />
                                </Button>
                            </Stack>

                            {/* Selected Files Preview */}
                            {selectedFiles.length > 0 && (
                                <Stack spacing={1} sx={{ mt: 2 }}>
                                    {selectedFiles.map((file, index) => (
                                        <Stack
                                            key={index}
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}
                                        >
                                            <Typography variant="body2">{file.name}</Typography>
                                            <IconButton size="small" onClick={() => handleRemoveFile(index)}>
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    ))}
                                </Stack>
                            )}
                        </Box>

                        <Alert severity="info">
                            Your donors will be automatically notified when you post this update!
                        </Alert>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={loading || !formData.title || !formData.description}
                    >
                        {loading ? (editingUpdate ? 'Updating...' : 'Posting...') : (editingUpdate ? 'Update' : 'Post Update')}
                    </Button>
                </DialogActions>
            </Dialog>

            {loading && <LinearProgress sx={{ mt: 2 }} />}
        </Box>
    );
};

export default ProgressTracking;
