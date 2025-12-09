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
    Divider,
    Alert,
    IconButton,
    InputAdornment,
    alpha,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { initGoogleAuth, renderGoogleButton } from '../../services/googleAuthService';

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [show2FADialog, setShow2FADialog] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [userId, setUserId] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();

    useEffect(() => {
        initGoogleAuth().then(() => {
            renderGoogleButton('googleSignInButton', handleGoogleCallback);
        });
    }, []);

    const handleGoogleCallback = async (response) => {
        try {
            setError('');
            setLoading(true);
            setError('Google Sign-In integration with backend is pending. Please use email/password login.');
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
            const result = await login(data.email, data.password);

            // Check if 2FA is required
            if (result.requiresTwoFactor) {
                setUserId(result.userId);
                setShow2FADialog(true);
                setLoading(false);
                return;
            }

            // Redirect based on role
            const role = result.user.role;
            if (role === 'Student') navigate('/student/dashboard');
            else if (role === 'Donor') navigate('/donor/dashboard');
            else if (role === 'Manager') navigate('/manager/dashboard');
            else if (role === 'Admin') navigate('/admin/dashboard');
            else navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify2FA = async () => {
        try {
            setError('');
            setLoading(true);
            const result = await authService.verify2FA(userId, twoFactorCode);

            // Store token and user
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));

            // Use window.location.href to force page reload and update auth context
            const role = result.user.role;
            if (role === 'Student') window.location.href = '/student/dashboard';
            else if (role === 'Donor') window.location.href = '/donor/dashboard';
            else if (role === 'Manager') window.location.href = '/manager/dashboard';
            else if (role === 'Admin') window.location.href = '/admin/dashboard';
            else window.location.href = '/';
        } catch (err) {
            setError('Invalid verification code. Please try again.');
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
                <Button
                    component={Link}
                    to="/"
                    startIcon={<ArrowBack />}
                    sx={{ mb: 3 }}
                >
                    Back to Home
                </Button>

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
                        Welcome Back
                    </Typography>
                    <Typography
                        variant="body1"
                        align="center"
                        color="text.secondary"
                        sx={{ mb: 4 }}
                    >
                        Sign in to continue to Student Charity Hub
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={3}>
                            <TextField
                                label="Email Address"
                                type="email"
                                fullWidth
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address',
                                    },
                                })}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                            />

                            <TextField
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                fullWidth
                                {...register('password', {
                                    required: 'Password is required',
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
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={loading}
                                sx={{
                                    py: 1.5,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                }}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>

                            <Box sx={{ textAlign: 'center' }}>
                                <Link
                                    to="/forgot-password"
                                    style={{
                                        color: '#1976d2',
                                        textDecoration: 'none',
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    Forgot password?
                                </Link>
                            </Box>
                        </Stack>
                    </form>

                    <Divider sx={{ my: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            OR
                        </Typography>
                    </Divider>

                    <Box id="googleSignInButton" sx={{ display: 'flex', justifyContent: 'center' }} />

                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                style={{
                                    color: '#1976d2',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                }}
                            >
                                Sign up
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Container>

            {/* 2FA Verification Dialog */}
            <Dialog open={show2FADialog} onClose={() => setShow2FADialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Two-Factor Authentication</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 3 }}>
                        Enter the 6-digit code from your authenticator app
                    </Typography>
                    <TextField
                        label="Verification Code"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        fullWidth
                        autoFocus
                        placeholder="000000"
                        inputProps={{ maxLength: 6 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShow2FADialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleVerify2FA}
                        variant="contained"
                        disabled={loading || twoFactorCode.length !== 6}
                    >
                        Verify
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LoginPage;
