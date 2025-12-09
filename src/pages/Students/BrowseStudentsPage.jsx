import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    LinearProgress,
    Chip,
    TextField,
    InputAdornment,
    Stack,
    Button,
    AppBar,
    Toolbar,
    alpha,
    Skeleton,
    Pagination,
} from '@mui/material';
import { Search, LocationOn, TrendingUp, ArrowForward } from '@mui/icons-material';
import { studentService } from '../../services/studentService';
import { getImageUrl } from '../../utils/imageUtils';

const BrowseStudentsPage = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchStudents();
    }, [page, search]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const data = await studentService.getStudents({
                search,
                page,
                pageSize: 12,
            });
            setStudents(data.students);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    return (
        <Box>
            {/* Navigation */}
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    bgcolor: 'white',
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                <Toolbar>
                    <Typography
                        variant="h6"
                        component={Link}
                        to="/"
                        sx={{
                            flexGrow: 1,
                            textDecoration: 'none',
                            color: 'primary.main',
                            fontWeight: 700,
                            fontSize: '1.5rem',
                        }}
                    >
                        Student Charity Hub
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <Button color="inherit" component={Link} to="/" sx={{ color: 'text.primary' }}>
                            Home
                        </Button>
                        <Button color="inherit" component={Link} to="/login" sx={{ color: 'text.primary' }}>
                            Login
                        </Button>
                        <Button variant="contained" component={Link} to="/register" sx={{ borderRadius: 2 }}>
                            Get Started
                        </Button>
                    </Stack>
                </Toolbar>
            </AppBar>

            {/* Hero Section */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${alpha('#1976d2', 0.95)} 0%, ${alpha('#42a5f5', 0.9)} 100%)`,
                    color: 'white',
                    py: 8,
                }}
            >
                <Container maxWidth="lg">
                    <Typography
                        variant="h3"
                        align="center"
                        sx={{ fontWeight: 700, mb: 2 }}
                    >
                        Find Students to Support
                    </Typography>
                    <Typography
                        variant="h6"
                        align="center"
                        sx={{ mb: 4, opacity: 0.95, maxWidth: 600, mx: 'auto' }}
                    >
                        Browse verified students and make a direct impact on their educational journey
                    </Typography>

                    {/* Search Bar */}
                    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                        <TextField
                            fullWidth
                            placeholder="Search by name, location, or dream career..."
                            value={search}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{ color: 'grey.500' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                bgcolor: 'white',
                                borderRadius: 3,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    '& fieldset': {
                                        border: 'none',
                                    },
                                },
                            }}
                        />
                    </Box>
                </Container>
            </Box>

            {/* Students Grid */}
            <Container maxWidth="lg" sx={{ py: 6 }}>
                {loading ? (
                    <Grid container spacing={3}>
                        {[...Array(6)].map((_, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card sx={{ borderRadius: 3 }}>
                                    <Skeleton variant="rectangular" height={200} />
                                    <CardContent>
                                        <Skeleton variant="text" height={32} />
                                        <Skeleton variant="text" />
                                        <Skeleton variant="text" />
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : students.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
                            No students found
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Try adjusting your search criteria
                        </Typography>
                    </Box>
                ) : (
                    <>
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
                            {students.map((student) => (
                                <Card
                                    key={student.id}
                                    component={Link}
                                    to={`/students/${student.id}`}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        textDecoration: 'none',
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease-in-out',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: 6,
                                        },
                                    }}
                                >
                                        {/* Image Container with Fixed Aspect Ratio */}
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
                                                    '&:hover': {
                                                        transform: 'scale(1.05)',
                                                    },
                                                }}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/400x300?text=Student+Photo';
                                                }}
                                            />
                                        </Box>
                                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                            <Typography
                                                variant="h6"
                                                sx={{ fontWeight: 700, mb: 1 }}
                                            >
                                                {student.fullName}
                                            </Typography>

                                            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                                <Chip
                                                    icon={<LocationOn sx={{ fontSize: 16 }} />}
                                                    label={student.location}
                                                    size="small"
                                                    sx={{ bgcolor: alpha('#1976d2', 0.1), color: 'primary.main' }}
                                                />
                                                <Chip
                                                    label={`${student.age} years`}
                                                    size="small"
                                                    sx={{ bgcolor: alpha('#1976d2', 0.1), color: 'primary.main' }}
                                                />
                                            </Stack>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mb: 2,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {student.story}
                                            </Typography>

                                            {student.dreamCareer && (
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        mb: 2,
                                                        fontWeight: 600,
                                                        color: 'primary.main',
                                                    }}
                                                >
                                                    🎯 Dream: {student.dreamCareer}
                                                </Typography>
                                            )}

                                            {/* My Gallery Preview */}
                                            {student.galleryImageUrls && student.galleryImageUrls.length > 0 && (
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                                        My Gallery ({student.galleryImageUrls.length} photos)
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto' }}>
                                                        {student.galleryImageUrls.slice(0, 3).map((imgUrl, idx) => (
                                                            <img
                                                                key={idx}
                                                                src={getImageUrl(imgUrl)}
                                                                alt={`Gallery ${idx + 1}`}
                                                                style={{
                                                                    width: '60px',
                                                                    height: '60px',
                                                                    objectFit: 'cover',
                                                                    borderRadius: '4px',
                                                                    flexShrink: 0,
                                                                }}
                                                            />
                                                        ))}
                                                        {student.galleryImageUrls.length > 3 && (
                                                            <Box
                                                                sx={{
                                                                    width: '60px',
                                                                    height: '60px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    bgcolor: 'grey.200',
                                                                    borderRadius: '4px',
                                                                    flexShrink: 0,
                                                                }}
                                                            >
                                                                <Typography variant="caption">+{student.galleryImageUrls.length - 3}</Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>
                                            )}

                                            <Box>
                                                <Stack
                                                    direction="row"
                                                    justifyContent="space-between"
                                                    sx={{ mb: 1 }}
                                                >
                                                    <Typography variant="body2" color="text.secondary">
                                                        Funding Progress
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {student.fundingProgress.toFixed(0)}%
                                                    </Typography>
                                                </Stack>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={Math.min(student.fundingProgress, 100)}
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 4,
                                                        bgcolor: alpha('#1976d2', 0.1),
                                                        '& .MuiLinearProgress-bar': {
                                                            borderRadius: 4,
                                                        },
                                                    }}
                                                />
                                                <Stack
                                                    direction="row"
                                                    justifyContent="space-between"
                                                    sx={{ mt: 1 }}
                                                >
                                                    <Typography variant="caption" color="text.secondary">
                                                        ${student.amountRaised.toLocaleString()} raised
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        of ${student.fundingGoal.toLocaleString()}
                                                    </Typography>
                                                </Stack>
                                            </Box>

                                            <Button
                                                fullWidth
                                                variant="contained"
                                                endIcon={<ArrowForward />}
                                                sx={{
                                                    mt: 2,
                                                    borderRadius: 2,
                                                    textTransform: 'none',
                                                }}
                                            >
                                                View Profile
                                            </Button>
                                        </CardContent>
                                    </Card>
                            ))}
                        </Box>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={(e, value) => setPage(value)}
                                    color="primary"
                                    size="large"
                                    sx={{
                                        '& .MuiPaginationItem-root': {
                                            borderRadius: 2,
                                        },
                                    }}
                                />
                            </Box>
                        )}
                    </>
                )}
            </Container>
        </Box>
    );
};

export default BrowseStudentsPage;
