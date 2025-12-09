import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Dialog,
    DialogContent,
    IconButton,
    Stack,
    Typography,
    Grid,
    Card,
    CardMedia,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    Close,
    NavigateBefore,
    NavigateNext,
    ZoomIn,
    ZoomOut,
    Download,
    Fullscreen,
} from '@mui/icons-material';
import { getImageUrl } from '../../utils/imageUtils';
import api from '../../services/api';

const ImageViewer = () => {
    const { imagePath } = useParams();
    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        if (imagePath) {
            // Decode the image path
            const decodedPath = decodeURIComponent(imagePath);
            setImages([decodedPath]);
            setCurrentIndex(0);
            setLoading(false);
        } else {
            // If no specific image, try to load all images from a gallery
            fetchAllImages();
        }
    }, [imagePath]);

    const fetchAllImages = async () => {
        try {
            setLoading(true);
            // This would need an API endpoint to fetch all images
            // For now, we'll just show the single image
            setLoading(false);
        } catch (err) {
            setError('Failed to load images');
            setLoading(false);
        }
    };

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
        setZoom(1);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
        setZoom(1);
    };

    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setZoom((prev) => Math.max(prev - 0.25, 0.5));
    };

    const handleDownload = () => {
        const imageUrl = getImageUrl(images[currentIndex]);
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = images[currentIndex].split('/').pop() || 'image.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleClose = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (images.length === 0) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="info">No images to display</Alert>
            </Box>
        );
    }

    const currentImage = images[currentIndex];
    const imageUrl = getImageUrl(currentImage);

    return (
        <Dialog
            open={true}
            onClose={handleClose}
            maxWidth={false}
            fullWidth
            PaperProps={{
                sx: {
                    m: 0,
                    height: '100vh',
                    maxHeight: '100vh',
                    bgcolor: 'rgba(0, 0, 0, 0.95)',
                },
            }}
        >
            <DialogContent sx={{ p: 0, position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 10,
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                        p: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant="h6" sx={{ color: 'white', ml: 2 }}>
                        {currentIndex + 1} / {images.length}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <IconButton onClick={handleZoomOut} sx={{ color: 'white' }}>
                            <ZoomOut />
                        </IconButton>
                        <IconButton onClick={handleZoomIn} sx={{ color: 'white' }}>
                            <ZoomIn />
                        </IconButton>
                        <IconButton onClick={handleDownload} sx={{ color: 'white' }}>
                            <Download />
                        </IconButton>
                        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                            <Close />
                        </IconButton>
                    </Stack>
                </Box>

                {/* Image Container */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        component="img"
                        src={imageUrl}
                        alt={`Image ${currentIndex + 1}`}
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                        }}
                        sx={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            transform: `scale(${zoom})`,
                            transition: 'transform 0.3s',
                            cursor: zoom > 1 ? 'grab' : 'default',
                        }}
                    />

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <IconButton
                                onClick={handlePrevious}
                                sx={{
                                    position: 'absolute',
                                    left: 16,
                                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
                                }}
                            >
                                <NavigateBefore />
                            </IconButton>
                            <IconButton
                                onClick={handleNext}
                                sx={{
                                    position: 'absolute',
                                    right: 16,
                                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
                                }}
                            >
                                <NavigateNext />
                            </IconButton>
                        </>
                    )}
                </Box>

                {/* Thumbnail Strip (if multiple images) */}
                {images.length > 1 && (
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            bgcolor: 'rgba(0, 0, 0, 0.7)',
                            p: 1,
                            overflowX: 'auto',
                            display: 'flex',
                            gap: 1,
                        }}
                    >
                        {images.map((img, idx) => (
                            <Card
                                key={idx}
                                sx={{
                                    minWidth: 80,
                                    height: 60,
                                    cursor: 'pointer',
                                    border: idx === currentIndex ? '2px solid white' : 'none',
                                    opacity: idx === currentIndex ? 1 : 0.7,
                                    '&:hover': { opacity: 1 },
                                }}
                                onClick={() => {
                                    setCurrentIndex(idx);
                                    setZoom(1);
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    image={getImageUrl(img)}
                                    alt={`Thumbnail ${idx + 1}`}
                                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </Card>
                        ))}
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ImageViewer;

