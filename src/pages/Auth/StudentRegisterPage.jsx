import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Stack,
    Alert,
    IconButton,
    InputAdornment,
    alpha,
    Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { initGoogleAuth, renderGoogleButton } from '../../services/googleAuthService';

const StudentRegisterPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, watch, formState: { errors } } = useForm();

    const password = watch('password');

    useEffect(() => {
        initGoogleAuth().then(() => {
            renderGoogleButton('googleSignInButtonStudent', handleGoogleCallback);
        });
    }, []);

    const handleGoogleCallback = async (response) => {
        try {
            setError('');
            setLoading(true);
            setError('Google Sign-In integration with backend is pending. Please use email/password registration.');
        } catch (err) {
            setError('Google Sign-In failed');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            setError('');
            setLoading(true);
            
            // Validate email format
            const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
            if (!emailRegex.test(data.email)) {
                setError('Please enter a valid email address');
                setLoading(false);
                return;
            }
            
            await registerUser({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email.trim().toLowerCase(),
                password: data.password,
                confirmPassword: data.confirmPassword,
                role: 'Student',
            });
            navigate('/student/application');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 
                                err.response?.data?.errors?.join(', ') || 
                                'Registration failed. Please try again.';
            
            // Provide specific error messages
            if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('exist')) {
                setError('This email address is already registered. Please use a different email or try logging in.');
            } else if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('approved') || errorMessage.toLowerCase().includes('posted')) {
                setError('This email is already associated with an approved or posted application. Please use a different email address.');
            } else {
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${alpha('#1976d2', 0.05)} 0%, ${alpha('#42a5f5', 0.05)} 100%)`,
                display: 'flex',
                alignItems: 'center',
                py: 4,
            }}
        >
            <Container maxWidth="sm">
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                    <Button
                        component={Link}
                        to="/"
                        startIcon={<ArrowBack />}
                    >
                        Back to Homepage
                    </Button>
                    <Button
                        component={Link}
                        to="/register"
                        variant="outlined"
                    >
                        Back to Register
                    </Button>
                </Stack>

                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    }}
                >
                    <Typography
                        variant="h4"
                        align="center"
                        sx={{ fontWeight: 700, mb: 1 }}
                    >
                        Student Registration
                    </Typography>
                    <Typography
                        variant="body1"
                        align="center"
                        color="text.secondary"
                        sx={{ mb: 4 }}
                    >
                        Create your account to submit your application
                    </Typography>

                    <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                        After registration, you'll be able to submit a detailed application for review.
                    </Alert>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={3}>
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    {...register('firstName', {
                                        required: 'First name is required',
                                    })}
                                    error={!!errors.firstName}
                                    helperText={errors.firstName?.message}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    {...register('lastName', {
                                        required: 'Last name is required',
                                    })}
                                    error={!!errors.lastName}
                                    helperText={errors.lastName?.message}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                            </Stack>

                            <TextField
                                fullWidth
                                label="Email Address"
                                type="email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address',
                                    },
                                })}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 8,
                                        message: 'Password must be at least 8 characters',
                                    },
                                })}
                                error={!!errors.password}
                                helperText={errors.password?.message}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />

                            <TextField
                                fullWidth
                                label="Confirm Password"
                                type="password"
                                {...register('confirmPassword', {
                                    required: 'Please confirm your password',
                                    validate: value =>
                                        value === password || 'Passwords do not match',
                                })}
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword?.message}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{
                                    py: 1.5,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                }}
                            >
                                {loading ? 'Creating Account...' : 'Create Account & Continue'}
                            </Button>
                        </Stack>
                    </form>

                    {/* Google Sign-In Button - Below Register */}
                    <Box sx={{ mt: 2 }}>
                        <Divider sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                OR
                            </Typography>
                        </Divider>
                        <Box id="googleSignInButtonStudent" sx={{ display: 'flex', justifyContent: 'center' }}></Box>
                    </Box>

                    <Typography variant="body2" align="center" sx={{ mt: 3 }}>
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            style={{
                                color: '#1976d2',
                                textDecoration: 'none',
                                fontWeight: 600,
                            }}
                        >
                            Sign in
                        </Link>
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
};

export default StudentRegisterPage;
