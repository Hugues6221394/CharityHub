import { Link, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    Stack,
    Card,
    CardContent,
    CardActions,
    alpha,
} from '@mui/material';
import { School, Favorite, ArrowBack } from '@mui/icons-material';

const RegisterPage = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
            }}
        >
            <Container maxWidth="sm">
                <Button
                    component={Link}
                    to="/"
                    startIcon={<ArrowBack />}
                    sx={{ mb: 2, color: 'white' }}
                >
                    Back to Homepage
                </Button>
                <Paper
                    elevation={24}
                    sx={{
                        p: 4,
                        borderRadius: 4,
                        background: 'white',
                    }}
                >
                    <Stack spacing={3}>
                        {/* Header */}
                        <Box textAlign="center">
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                Join Student Charity Hub
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Choose your registration type to get started
                            </Typography>
                        </Box>

                        {/* Student Registration Card */}
                        <Card
                            sx={{
                                border: '2px solid',
                                borderColor: 'primary.main',
                                transition: 'all 0.3s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 6,
                                    borderColor: 'primary.dark',
                                },
                            }}
                        >
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            bgcolor: alpha('#1976d2', 0.1),
                                        }}
                                    >
                                        <School sx={{ fontSize: 40, color: 'primary.main' }} />
                                    </Box>
                                    <Box flex={1}>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            Register as Student
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Apply for educational funding and connect with donors who want to support your dreams
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                            <CardActions sx={{ p: 2, pt: 0 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    onClick={() => navigate('/register/student')}
                                    sx={{
                                        py: 1.5,
                                        fontWeight: 600,
                                    }}
                                >
                                    Register as Student
                                </Button>
                            </CardActions>
                        </Card>

                        {/* Donor Registration Card */}
                        <Card
                            sx={{
                                border: '2px solid',
                                borderColor: 'secondary.main',
                                transition: 'all 0.3s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 6,
                                    borderColor: 'secondary.dark',
                                },
                            }}
                        >
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            bgcolor: alpha('#dc004e', 0.1),
                                        }}
                                    >
                                        <Favorite sx={{ fontSize: 40, color: 'secondary.main' }} />
                                    </Box>
                                    <Box flex={1}>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            Register as Donor
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Support students in need and make a meaningful impact on their educational journey
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                            <CardActions sx={{ p: 2, pt: 0 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="secondary"
                                    size="large"
                                    onClick={() => navigate('/register/donor')}
                                    sx={{
                                        py: 1.5,
                                        fontWeight: 600,
                                    }}
                                >
                                    Register as Donor
                                </Button>
                            </CardActions>
                        </Card>

                        {/* Back to Login */}
                        <Box textAlign="center">
                            <Button
                                component={Link}
                                to="/login"
                                startIcon={<ArrowBack />}
                                sx={{
                                    textTransform: 'none',
                                }}
                            >
                                Already have an account? Sign in
                            </Button>
                        </Box>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
};

export default RegisterPage;

