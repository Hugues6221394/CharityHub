import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Stack,
    Alert,
    alpha,
} from '@mui/material';
import { ArrowBack, Email } from '@mui/icons-material';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        try {
            setError('');
            setLoading(true);

            // TODO: Call backend API to send reset email
            // await authService.forgotPassword(email);

            // For now, show success message
            setSuccess(true);
        } catch (err) {
            setError('Failed to send reset email. Please try again.');
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
                <Button
                    component={Link}
                    to="/login"
                    startIcon={<ArrowBack />}
                    sx={{ mb: 3 }}
                >
                    Back to Login
                </Button>

                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                bgcolor: alpha('#1976d2', 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2,
                            }}
                        >
                            <Email sx={{ fontSize: 32, color: 'primary.main' }} />
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            Forgot Password?
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            No worries! Enter your email and we'll send you a reset link
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success ? (
                        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                Reset Link Sent!
                            </Typography>
                            <Typography variant="body2">
                                We've sent a password reset link to <strong>{email}</strong>.
                                Please check your inbox and follow the instructions.
                            </Typography>
                        </Alert>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <Stack spacing={3}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        },
                                    }}
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
                                    {loading ? 'Sending...' : 'Send Reset Link'}
                                </Button>
                            </Stack>
                        </form>
                    )}

                    <Typography variant="body2" align="center" sx={{ mt: 3 }}>
                        Remember your password?{' '}
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

export default ForgotPasswordPage;
