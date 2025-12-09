import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Avatar,
    Stack,
    Button,
    LinearProgress,
    Alert,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Tabs,
    Tab,
    ImageList,
    ImageListItem,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    CircularProgress,
    Paper,
} from '@mui/material';
import {
    Favorite,
    AttachMoney,
    School,
    ArrowBack,
    Close,
    PhotoLibrary,
    Description,
    Download,
    Image as ImageIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';
import ImageGallery from '../../components/ImageGallery';

const DonorMyStudents = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [sponsoredStudents, setSponsoredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentDetails, setStudentDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [detailsTab, setDetailsTab] = useState(0);

    useEffect(() => {
        fetchMyStudents();
    }, []);

    const fetchMyStudents = async () => {
        try {
            setLoading(true);
            const response = await api.get('/donors/my-students');
            setSponsoredStudents(response.data || []);
        } catch (error) {
            setError('Failed to fetch sponsored students');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFundingProgress = (student) => {
        if (!student.fundingGoal || student.fundingGoal === 0) return 0;
        return Math.min((student.amountRaised / student.fundingGoal) * 100, 100);
    };

    const handleMessageStudent = async (student) => {
        try {
            // Navigate to messages page with student conversation
            navigate(`/donor/messages?studentId=${student.id}`);
        } catch (error) {
            console.error('Error opening message:', error);
            alert('Failed to open messaging. Please try again.');
        }
    };

    const handleViewGalleryAndDocuments = async (student) => {
        try {
            setSelectedStudent(student);
            setOpenDetailsDialog(true);
            setDetailsLoading(true);
            setDetailsTab(0);

            // Fetch full student details including gallery and documents
            const response = await api.get(`/students/${student.id}`);
            setStudentDetails(response.data);
        } catch (error) {
            console.error('Error fetching student details:', error);
            alert('Failed to load student details. Please try again.');
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleDownloadImage = (imageUrl) => {
        const fullUrl = getImageUrl(imageUrl);
        const link = document.createElement('a');
        link.href = fullUrl;
        link.download = `student-gallery-${selectedStudent?.id}-${Date.now()}.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadDocument = async (doc) => {
        try {
            // The API returns filePath, not fileUrl
            const filePath = doc.filePath || doc.fileUrl;
            if (!filePath) {
                alert('Document file path not available');
                return;
            }
            const fullUrl = getImageUrl(filePath);
            const response = await fetch(fullUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch document');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = doc.fileName || `document-${doc.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading document:', error);
            alert('Failed to download document. Please try again.');
        }
    };

    return (
        <Box>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/donor/dashboard')}>
                    Back to Dashboard
                </Button>
                <Typography variant="h4" sx={{ fontWeight: 700, flexGrow: 1 }}>
                    My Sponsored Students
                </Typography>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Typography>Loading...</Typography>
            ) : sponsoredStudents.length === 0 ? (
                <Card>
                    <CardContent>
                        <Alert severity="info">
                            You haven't sponsored any students yet. Browse students to start supporting!
                        </Alert>
                        <Button
                            variant="contained"
                            sx={{ mt: 2 }}
                            onClick={() => navigate('/students')}
                        >
                            Browse Students
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 2,
                        width: '100%',
                        '@media (max-width: 600px)': {
                            gridTemplateColumns: '1fr',
                        },
                    }}
                >
                    {sponsoredStudents.map((student) => {
                        const progress = getFundingProgress(student);
                        return (
                            <Card
                                key={student.id}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        boxShadow: 6,
                                    },
                                }}
                                onClick={() => navigate(`/students/${student.id}`)}
                            >
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            width: '100%',
                                            paddingTop: '75%', // 4:3 aspect ratio
                                            bgcolor: 'grey.100',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={getImageUrl(student.photoUrl) || 'https://via.placeholder.com/400x300?text=Student+Photo'}
                                            alt={student.fullName}
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                                objectPosition: 'center center',
                                                transition: 'transform 0.3s ease-in-out',
                                            }}
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/400x300?text=Student+Photo';
                                            }}
                                        />
                                        <Chip
                                            icon={<Favorite />}
                                            label="Sponsored"
                                            color="error"
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                zIndex: 1,
                                            }}
                                        />
                                    </Box>
                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                                            {student.fullName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                                            {student.story?.substring(0, 100)}...
                                        </Typography>

                                        <Box sx={{ mb: 2 }}>
                                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Funding Progress
                                                </Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                    {progress.toFixed(0)}%
                                                </Typography>
                                            </Stack>
                                            <LinearProgress
                                                variant="determinate"
                                                value={progress}
                                                sx={{ height: 8, borderRadius: 4 }}
                                            />
                                            <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    ${student.amountRaised?.toLocaleString() || 0} raised
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Goal: ${student.fundingGoal?.toLocaleString() || 0}
                                                </Typography>
                                            </Stack>
                                        </Box>

                                        <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" gap={1}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<PhotoLibrary />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewGalleryAndDocuments(student);
                                                }}
                                                sx={{ flex: 1, minWidth: '120px' }}
                                            >
                                                Gallery
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<Description />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewGalleryAndDocuments(student);
                                                    setDetailsTab(1);
                                                }}
                                                sx={{ flex: 1, minWidth: '120px' }}
                                            >
                                                Documents
                                            </Button>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/students/${student.id}`);
                                                }}
                                                sx={{ flex: 1, minWidth: '120px' }}
                                            >
                                                View Profile
                                            </Button>
                                        </Stack>
                                    </CardContent>
                                </Card>
                        );
                    })}
                </Box>
            )}

            {/* Gallery and Documents Dialog */}
            <Dialog
                open={openDetailsDialog}
                onClose={() => {
                    setOpenDetailsDialog(false);
                    setSelectedStudent(null);
                    setStudentDetails(null);
                    setDetailsTab(0);
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">
                            {selectedStudent?.fullName} - Gallery & Documents
                        </Typography>
                        <IconButton
                            onClick={() => {
                                setOpenDetailsDialog(false);
                                setSelectedStudent(null);
                                setStudentDetails(null);
                                setDetailsTab(0);
                            }}
                        >
                            <Close />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    {detailsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box>
                            <Tabs value={detailsTab} onChange={(e, newValue) => setDetailsTab(newValue)} sx={{ mb: 2 }}>
                                <Tab icon={<PhotoLibrary />} iconPosition="start" label="Gallery" />
                                <Tab icon={<Description />} iconPosition="start" label="Documents" />
                            </Tabs>

                            {detailsTab === 0 && (
                                <Box>
                                    {studentDetails?.galleryImageUrls && studentDetails.galleryImageUrls.length > 0 ? (
                                        <ImageList cols={3} gap={8}>
                                            {studentDetails.galleryImageUrls.map((imageUrl, index) => (
                                                <ImageListItem key={index}>
                                                    <Box
                                                        sx={{
                                                            position: 'relative',
                                                            width: '100%',
                                                            paddingTop: '100%',
                                                            overflow: 'hidden',
                                                            borderRadius: 1,
                                                            bgcolor: 'grey.100',
                                                        }}
                                                    >
                                                        <Box
                                                            component="img"
                                                            src={getImageUrl(imageUrl)}
                                                            alt={`Gallery ${index + 1}`}
                                                            sx={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'contain',
                                                                objectPosition: 'center center',
                                                                cursor: 'pointer',
                                                                transition: 'transform 0.3s ease-in-out',
                                                                '&:hover': {
                                                                    transform: 'scale(1.05)',
                                                                },
                                                            }}
                                                            onClick={() => window.open(getImageUrl(imageUrl), '_blank')}
                                                        />
                                                        <IconButton
                                                            sx={{
                                                                position: 'absolute',
                                                                bottom: 8,
                                                                right: 8,
                                                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
                                                            }}
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDownloadImage(imageUrl);
                                                            }}
                                                        >
                                                            <Download fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </ImageListItem>
                                            ))}
                                        </ImageList>
                                    ) : (
                                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                                            <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                            <Typography variant="body1" color="text.secondary">
                                                No gallery images available for this student.
                                            </Typography>
                                        </Paper>
                                    )}
                                </Box>
                            )}

                            {detailsTab === 1 && (
                                <Box>
                                    {studentDetails?.documents && studentDetails.documents.length > 0 ? (
                                        <List>
                                            {studentDetails.documents.map((document) => (
                                                <ListItem
                                                    key={document.id}
                                                    sx={{
                                                        border: 1,
                                                        borderColor: 'divider',
                                                        borderRadius: 1,
                                                        mb: 1,
                                                        '&:hover': {
                                                            bgcolor: 'action.hover',
                                                        },
                                                    }}
                                                    secondaryAction={
                                                        <IconButton
                                                            edge="end"
                                                            onClick={() => handleDownloadDocument(document)}
                                                        >
                                                            <Download />
                                                        </IconButton>
                                                    }
                                                >
                                                    <ListItemIcon>
                                                        <Description color="primary" />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={document.fileName || `Document ${document.id}`}
                                                        secondary={document.fileType || document.filePath || 'Document'}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                                            <Description sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                            <Typography variant="body1" color="text.secondary">
                                                No documents available for this student.
                                            </Typography>
                                        </Paper>
                                    )}
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setOpenDetailsDialog(false);
                        setSelectedStudent(null);
                        setStudentDetails(null);
                        setDetailsTab(0);
                    }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DonorMyStudents;

