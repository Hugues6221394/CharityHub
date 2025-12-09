import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    Stack,
    Avatar,
    alpha,
    CircularProgress,
    CardMedia,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    ArrowBack,
    School,
    Favorite,
    People,
    TrendingUp,
    Verified,
    Handshake,
    EmojiEvents,
    PhotoLibrary,
    Visibility,
    Groups,
} from '@mui/icons-material';
import { studentService } from '../../services/studentService';
import { getImageUrl } from '../../utils/imageUtils';

const AboutUsPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [studentGalleries, setStudentGalleries] = useState([]);
    const [loadingGalleries, setLoadingGalleries] = useState(false);

    useEffect(() => {
        fetchStudentGalleries();
    }, []);

    const fetchStudentGalleries = async () => {
        try {
            setLoadingGalleries(true);
            // Fetch students with photos for gallery
            const response = await studentService.getStudents({ pageSize: 12, page: 1 });
            const students = response?.students || response || [];
            // Filter students with photos
            const studentsWithPhotos = students.filter(s => s.photoUrl);
            setStudentGalleries(studentsWithPhotos.slice(0, 12)); // Limit to 12 for gallery
        } catch (error) {
            console.error('Error fetching student galleries:', error);
            setStudentGalleries([]);
        } finally {
            setLoadingGalleries(false);
        }
    };

    const values = [
        {
            icon: <School sx={{ fontSize: 40 }} />,
            title: 'Education First',
            description: 'We believe education is the key to breaking cycles of poverty and creating lasting change.',
        },
        {
            icon: <Handshake sx={{ fontSize: 40 }} />,
            title: 'Transparency',
            description: 'Every donation is tracked and donors can see exactly how their contributions make a difference.',
        },
        {
            icon: <Verified sx={{ fontSize: 40 }} />,
            title: 'Verified Students',
            description: 'All students go through a rigorous verification process to ensure authenticity and need.',
        },
        {
            icon: <EmojiEvents sx={{ fontSize: 40 }} />,
            title: 'Impact Driven',
            description: 'We measure success by the real-world achievements and progress of the students we support.',
        },
    ];

    const team = [
        {
            name: 'Our Mission',
            role: 'Empowering students through education',
            description: 'We connect generous donors with deserving students, creating opportunities for education and a brighter future.',
        },
        {
            name: 'Our Vision',
            role: 'A world where education is accessible',
            description: 'We envision a future where every student has the opportunity to pursue their dreams regardless of financial barriers.',
        },
        {
            name: 'Our Impact',
            role: 'Making a real difference',
            description: 'Through our platform, we have helped hundreds of students achieve their educational goals and transform their lives.',
        },
    ];

    return (
        <Box>
            {/* Hero Section */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${alpha('#1976d2', 0.9)} 0%, ${alpha('#42a5f5', 0.85)} 100%)`,
                    color: 'white',
                    py: 12,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Container maxWidth="lg">
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/')}
                        sx={{ mb: 4, color: 'white', borderColor: 'white' }}
                        variant="outlined"
                    >
                        Back to Home
                    </Button>
                    <Typography variant="h2" sx={{ fontWeight: 700, mb: 3 }}>
                        About Student Charity Hub
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 4, opacity: 0.95, maxWidth: 800 }}>
                        Connecting generous hearts with ambitious minds to create lasting educational impact
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 8 }}>
                {/* Mission Section */}
                <Box sx={{ mb: 8 }}>
                    <Typography variant="h3" align="center" sx={{ fontWeight: 700, mb: 4, color: 'primary.main' }}>
                        Our Story
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, maxWidth: 900, mx: 'auto', textAlign: 'center', mb: 4 }}>
                        Student Charity Hub was founded with a simple yet powerful mission: to bridge the gap between 
                        students in need and compassionate donors who want to make a real difference. We believe that 
                        education is the most powerful tool for change, and every student deserves the opportunity to 
                        pursue their dreams regardless of their financial circumstances.
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, maxWidth: 900, mx: 'auto', textAlign: 'center' }}>
                        Our platform provides a transparent, secure, and meaningful way for donors to support students 
                        directly. Through detailed profiles, progress tracking, and direct communication, we ensure that 
                        every contribution has a visible and lasting impact on a student's educational journey.
                    </Typography>
                </Box>

                {/* Values Section */}
                <Box sx={{ mb: 8 }}>
                    <Typography variant="h3" align="center" sx={{ fontWeight: 700, mb: 6, color: 'primary.main' }}>
                        Our Core Values
                    </Typography>
                    <Grid container spacing={4} justifyContent="center">
                        {values.map((value, index) => (
                            <Grid item xs={12} sm={6} md={6} lg={6} xl={6} key={index}>
                                <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                                    <CardContent>
                                        <Box sx={{ color: 'primary.main', mb: 2, display: 'flex', justifyContent: 'center' }}>
                                            {value.icon}
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                            {value.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {value.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Mission, Vision, Impact */}
                <Box sx={{ mb: 8 }}>
                    <Grid container spacing={4}>
                        {team.map((item, index) => (
                            <Grid item xs={12} md={4} key={index}>
                                <Card sx={{ height: '100%', bgcolor: alpha('#1976d2', 0.05) }}>
                                    <CardContent sx={{ p: 4 }}>
                                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                                            {item.name}
                                        </Typography>
                                        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                                            {item.role}
                                        </Typography>
                                        <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                                            {item.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Student Galleries Section */}
                <Box sx={{ mb: 8 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            Student Galleries
                        </Typography>
                        <Button
                            component={Link}
                            to="/students"
                            variant="outlined"
                            endIcon={<Visibility />}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                            View All Students
                        </Button>
                    </Box>
                    {loadingGalleries ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : studentGalleries.length > 0 ? (
                        <Grid container spacing={2}>
                            {studentGalleries.map((student) => (
                                <Grid item xs={6} sm={4} md={3} key={student.id}>
                                    <Card
                                        component={Link}
                                        to={`/students/${student.id}`}
                                        sx={{
                                            height: '100%',
                                            textDecoration: 'none',
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease-in-out',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: 6,
                                            },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                position: 'relative',
                                                width: '100%',
                                                paddingTop: '100%', // Square aspect ratio
                                                bgcolor: 'grey.100',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src={getImageUrl(student.photoUrl) || 'https://via.placeholder.com/300?text=Student'}
                                                alt={student.fullName}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    transition: 'transform 0.3s ease-in-out',
                                                    '&:hover': {
                                                        transform: 'scale(1.1)',
                                                    },
                                                }}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/300?text=Student';
                                                }}
                                            />
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                                                    p: 1.5,
                                                    color: 'white',
                                                }}
                                            >
                                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                                    {student.fullName}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <PhotoLibrary sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                            <Typography variant="body1" color="text.secondary">
                                No student galleries available at the moment.
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Our Staff Section */}
                <Box sx={{ mb: 8, textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
                        Our Staff
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
                        Meet the dedicated team behind Student Charity Hub who work tirelessly to connect students with donors and make education accessible to all.
                    </Typography>
                    <Button
                        component={Link}
                        to="/staff"
                        variant="contained"
                        size="large"
                        startIcon={<Groups />}
                        sx={{ 
                            textTransform: 'none', 
                            fontWeight: 600,
                            px: 4,
                            py: 1.5,
                            borderRadius: 3,
                            fontSize: '1.1rem',
                            boxShadow: 4,
                            '&:hover': {
                                boxShadow: 6,
                                transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s ease-in-out',
                        }}
                    >
                        View Our Team
                    </Button>
                </Box>

                {/* Statistics */}
                <Box sx={{ bgcolor: alpha('#1976d2', 0.05), borderRadius: 4, p: 6, mb: 8 }}>
                    <Typography variant="h3" align="center" sx={{ fontWeight: 700, mb: 6, color: 'primary.main' }}>
                        Our Impact in Numbers
                    </Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                                <People sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
                                <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                                    500+
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Students Supported
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Favorite sx={{ fontSize: 50, color: 'error.main', mb: 2 }} />
                                <Typography variant="h3" sx={{ fontWeight: 700, color: 'error.main', mb: 1 }}>
                                    1000+
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Generous Donors
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                                <TrendingUp sx={{ fontSize: 50, color: 'success.main', mb: 2 }} />
                                <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
                                    $2M+
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Funds Raised
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                                <EmojiEvents sx={{ fontSize: 50, color: 'warning.main', mb: 2 }} />
                                <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main', mb: 1 }}>
                                    95%
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Success Rate
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* Call to Action */}
                <Box sx={{ textAlign: 'center', bgcolor: 'primary.main', color: 'white', borderRadius: 4, p: 6 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                        Join Us in Making a Difference
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                        Together, we can transform lives through education
                    </Typography>
                    <Stack direction="row" spacing={2} justifyContent="center">
                        <Button
                            variant="contained"
                            size="large"
                            sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
                            onClick={() => navigate('/register/donor')}
                        >
                            Become a Donor
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'white', bgcolor: alpha('#fff', 0.1) } }}
                            onClick={() => navigate('/students')}
                        >
                            Browse Students
                        </Button>
                    </Stack>
                </Box>
            </Container>
        </Box>
    );
};

export default AboutUsPage;

