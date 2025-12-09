import { useState } from 'react';
import {
    Box,
    Grid,
    Card,
    CardMedia,
    IconButton,
    Dialog,
    DialogContent,
    Stack,
    Typography,
    Chip,
    Button,
} from '@mui/material';
import {
    Close,
    NavigateBefore,
    NavigateNext,
    ZoomIn,
    Download,
} from '@mui/icons-material';
import { getImageUrl } from '../utils/imageUtils';

const ImageGallery = ({ images = [], title = "Gallery", maxHeight = 400 }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleImageClick = (image, index) => {
        setSelectedImage(image);
        setCurrentIndex(index);
        setLightboxOpen(true);
    };

    const handleNext = () => {
        const nextIndex = (currentIndex + 1) % images.length;
        setCurrentIndex(nextIndex);
        setSelectedImage(images[nextIndex]);
    };

    const handlePrevious = () => {
        const prevIndex = (currentIndex - 1 + images.length) % images.length;
        setCurrentIndex(prevIndex);
        setSelectedImage(images[prevIndex]);
    };

    const handleClose = () => {
        setLightboxOpen(false);
        setSelectedImage(null);
    };

    if (!images || images.length === 0) {
        return null;
    }

    return (
        <>
            <Box sx={{ mb: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {title} ({images.length} {images.length === 1 ? 'image' : 'images'})
                    </Typography>
                    <Chip label={`${images.length} photos`} size="small" color="primary" />
                </Stack>
                <Grid container spacing={2}>
                    {images.slice(0, 6).map((imgUrl, idx) => (
                        <Grid item xs={6} sm={4} md={3} key={idx}>
                            <Card
                                sx={{
                                    position: 'relative',
                                    cursor: 'pointer',
                                    overflow: 'hidden',
                                    borderRadius: 2,
                                    '&:hover': {
                                        transform: 'scale(1.02)',
                                        boxShadow: 6,
                                    },
                                    transition: 'all 0.3s ease',
                                }}
                                onClick={() => handleImageClick(imgUrl, idx)}
                            >
                                <CardMedia
                                    component="img"
                                    image={getImageUrl(imgUrl)}
                                    alt={`${title} ${idx + 1}`}
                                    sx={{
                                        height: 200,
                                        objectFit: 'cover',
                                        '&:hover': {
                                            filter: 'brightness(0.9)',
                                        },
                                    }}
                                />
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        bgcolor: 'rgba(0,0,0,0.5)',
                                        borderRadius: 1,
                                        p: 0.5,
                                    }}
                                >
                                    <ZoomIn sx={{ color: 'white', fontSize: 20 }} />
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                    {images.length > 6 && (
                        <Grid item xs={6} sm={4} md={3}>
                            <Card
                                sx={{
                                    height: 200,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: 'grey.100',
                                    cursor: 'pointer',
                                    borderRadius: 2,
                                    '&:hover': {
                                        bgcolor: 'grey.200',
                                    },
                                }}
                                onClick={() => handleImageClick(images[6], 6)}
                            >
                                <Stack alignItems="center" spacing={1}>
                                    <Typography variant="h4" color="text.secondary">
                                        +{images.length - 6}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        More images
                                    </Typography>
                                </Stack>
                            </Card>
                        </Grid>
                    )}
                </Grid>
            </Box>

            {/* Lightbox Dialog */}
            <Dialog
                open={lightboxOpen}
                onClose={handleClose}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: 'rgba(0,0,0,0.95)',
                        color: 'white',
                    },
                }}
            >
                <DialogContent sx={{ p: 0, position: 'relative', minHeight: '70vh' }}>
                    <IconButton
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            zIndex: 1,
                            bgcolor: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.2)',
                            },
                        }}
                    >
                        <Close />
                    </IconButton>

                    {images.length > 1 && (
                        <>
                            <IconButton
                                onClick={handlePrevious}
                                sx={{
                                    position: 'absolute',
                                    left: 8,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 1,
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                    },
                                }}
                            >
                                <NavigateBefore />
                            </IconButton>
                            <IconButton
                                onClick={handleNext}
                                sx={{
                                    position: 'absolute',
                                    right: 8,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 1,
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                    },
                                }}
                            >
                                <NavigateNext />
                            </IconButton>
                        </>
                    )}

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '70vh',
                            p: 2,
                        }}
                    >
                        <Box
                            component="img"
                            src={getImageUrl(selectedImage)}
                            alt="Gallery image"
                            sx={{
                                maxWidth: '100%',
                                maxHeight: '70vh',
                                objectFit: 'contain',
                                borderRadius: 2,
                            }}
                        />
                    </Box>

                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 16,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: 1,
                            bgcolor: 'rgba(0,0,0,0.5)',
                            borderRadius: 2,
                            p: 1,
                        }}
                    >
                        <Typography variant="body2" sx={{ color: 'white', alignSelf: 'center', px: 1 }}>
                            {currentIndex + 1} / {images.length}
                        </Typography>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<Download />}
                            href={getImageUrl(selectedImage)}
                            download
                            target="_blank"
                            sx={{ bgcolor: 'primary.main' }}
                        >
                            Download
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ImageGallery;

