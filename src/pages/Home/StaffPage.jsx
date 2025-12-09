import React from 'react';
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
    alpha,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    ArrowBack,
    Groups,
} from '@mui/icons-material';
import { getImageUrl } from '../../utils/imageUtils';

const StaffPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Staff members
    const staffMembers = [
        {
            name: 'Hugues NGABONZIZA',
            role: 'Founder',
            image: '/images/about/staff1.jpg',
        },
        {
            name: 'Gatera Merveille',
            role: 'Managing Director',
            image: '/images/about/staff2.jpeg',
        },
        {
            name: 'Keza Leila',
            role: 'Funds Organiser',
            image: '/images/about/staff3.jpeg',
        },
        {
            name: 'TESI Divine',
            role: 'Co-Founder, CEO',
            image: '/images/about/default.jpeg',
        },
        {
            name: 'IRIZA Yvonne',
            role: 'Human Resource',
            image: '/images/about/default.jpeg',
        },
    ];

    return (
        <Box>
            {/* Hero Section */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${alpha('#1976d2', 0.9)} 0%, ${alpha('#42a5f5', 0.85)} 100%)`,
                    color: 'white',
                    py: { xs: 6, md: 12 },
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Container maxWidth="lg">
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/about')}
                        sx={{ mb: 4, color: 'white', borderColor: 'white' }}
                        variant="outlined"
                    >
                        Back to About
                    </Button>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Groups sx={{ fontSize: { xs: 40, md: 60 } }} />
                        <Typography variant="h2" sx={{ fontWeight: 700, fontSize: { xs: '2rem', md: '3rem' } }}>
                            Our Staff
                        </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ mb: 4, opacity: 0.95, maxWidth: 800, fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
                        Meet the dedicated team behind Student Charity Hub
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 }, px: { xs: 2, sm: 3 } }}>
                <Grid container spacing={{ xs: 3, sm: 4, md: 5 }} justifyContent="center">
                    {staffMembers.map((staff, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3.6} key={index}>
                            <Card
                                sx={{
                                    height: '100%',
                                    textAlign: 'center',
                                    borderRadius: 4,
                                    overflow: 'hidden',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
                                    border: '1px solid',
                                    borderColor: alpha('#1976d2', 0.1),
                                    '&:hover': {
                                        transform: 'translateY(-12px) scale(1.02)',
                                        boxShadow: '0px 12px 40px rgba(25, 118, 210, 0.25)',
                                        borderColor: 'primary.main',
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
                                        '&::after': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.05) 100%)',
                                            zIndex: 1,
                                        },
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={getImageUrl(staff.image)}
                                        alt={staff.name}
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            transition: 'transform 0.4s ease-in-out',
                                            '&:hover': {
                                                transform: 'scale(1.1)',
                                            },
                                        }}
                                        onError={(e) => {
                                            e.target.src = getImageUrl('/images/about/default.jpeg');
                                        }}
                                    />
                                </Box>
                                <CardContent 
                                    sx={{ 
                                        p: { xs: 2.5, sm: 3, md: 3.5 },
                                        bgcolor: 'white',
                                    }}
                                >
                                    <Typography 
                                        variant="h5" 
                                        sx={{ 
                                            fontWeight: 700, 
                                            mb: 1, 
                                            color: 'primary.main',
                                            fontSize: { xs: '1.25rem', sm: '1.5rem' },
                                            lineHeight: 1.3,
                                        }}
                                    >
                                        {staff.name}
                                    </Typography>
                                    <Typography 
                                        variant="body1" 
                                        color="text.secondary" 
                                        sx={{ 
                                            fontSize: { xs: '0.95rem', sm: '1rem' }, 
                                            fontWeight: 500,
                                            color: 'text.secondary',
                                        }}
                                    >
                                        {staff.role}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default StaffPage;

