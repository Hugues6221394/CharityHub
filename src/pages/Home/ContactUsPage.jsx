import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    TextField,
    Stack,
    Alert,
    alpha,
} from '@mui/material';
import {
    ArrowBack,
    Email,
    Phone,
    LocationOn,
    Send,
    Message,
} from '@mui/icons-material';
import api from '../../services/api';

const ContactUsPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            // Here you would typically send the form data to your backend
            // For now, we'll just show a success message
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            
            setSuccess('Thank you for contacting us! We will get back to you soon.');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            setError('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const contactInfo = [
        {
            icon: <Email sx={{ fontSize: 40 }} />,
            title: 'Email Us',
            content: 'info@studentcharityhub.com',
            action: 'mailto:info@studentcharityhub.com',
        },
        {
            icon: <Phone sx={{ fontSize: 40 }} />,
            title: 'Call Us',
            content: '+250785123457',
            action: 'tel:+250785123457',
        },
        {
            icon: <LocationOn sx={{ fontSize: 40 }} />,
            title: 'Visit Us',
            content: 'KG 580 ST, Kigali, Rwanda',
            action: null,
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
                        Contact Us
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 4, opacity: 0.95, maxWidth: 800 }}>
                        We're here to help! Reach out to us with any questions or concerns
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Grid container spacing={6}>
                    {/* Contact Information */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, color: 'primary.main' }}>
                            Get in Touch
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
                            Have questions about how our platform works? Want to learn more about supporting students? 
                            Or need help with your account? We're here to assist you every step of the way.
                        </Typography>

                        <Stack spacing={3}>
                            {contactInfo.map((info, index) => (
                                <Card key={index} sx={{ bgcolor: alpha('#1976d2', 0.05) }}>
                                    <CardContent>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Box sx={{ color: 'primary.main' }}>
                                                {info.icon}
                                            </Box>
                                            <Box>
                                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                    {info.title}
                                                </Typography>
                                                {info.action ? (
                                                    <Button
                                                        component="a"
                                                        href={info.action}
                                                        sx={{ p: 0, textTransform: 'none', justifyContent: 'flex-start' }}
                                                    >
                                                        <Typography variant="body2" color="primary">
                                                            {info.content}
                                                        </Typography>
                                                    </Button>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">
                                                        {info.content}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    </Grid>

                    {/* Contact Form */}
                    <Grid item xs={12} md={8}>
                        <Card>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
                                    Send Us a Message
                                </Typography>

                                {error && (
                                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                                        {error}
                                    </Alert>
                                )}
                                {success && (
                                    <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
                                        {success}
                                    </Alert>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <Stack spacing={3}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Your Name"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Your Email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    required
                                                />
                                            </Grid>
                                        </Grid>
                                        <TextField
                                            fullWidth
                                            label="Subject"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            required
                                        />
                                        <TextField
                                            fullWidth
                                            label="Message"
                                            multiline
                                            rows={6}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            required
                                            placeholder="Tell us how we can help you..."
                                        />
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            startIcon={<Send />}
                                            disabled={loading}
                                            sx={{ alignSelf: 'flex-start', px: 4 }}
                                        >
                                            {loading ? 'Sending...' : 'Send Message'}
                                        </Button>
                                    </Stack>
                                </form>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* FAQ Section */}
                <Box sx={{ mt: 8 }}>
                    <Typography variant="h4" align="center" sx={{ fontWeight: 700, mb: 6, color: 'primary.main' }}>
                        Frequently Asked Questions
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                        How do I become a donor?
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Simply register as a donor on our platform, browse student profiles, and choose 
                                        who you'd like to support. You can make one-time or recurring donations.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                        How are students verified?
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        All students go through a comprehensive verification process including document 
                                        review, background checks, and interviews with our team to ensure authenticity.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                        Can I track my donation?
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Yes! As a donor, you can see exactly how your contributions are being used and 
                                        receive regular progress updates from the students you support.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                        Is my donation tax-deductible?
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Yes, all donations made through our platform are tax-deductible. You will receive 
                                        a receipt for your records after each donation.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
};

export default ContactUsPage;

