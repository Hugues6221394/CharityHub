import { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Stack,
    Alert,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    Divider,
    CircularProgress,
} from '@mui/material';
import {
    Payment,
    Phone,
    CreditCard,
} from '@mui/icons-material';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DonationPayment = ({ student, onSuccess, onCancel }) => {
    const { isAuthenticated } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState('paypal');
    const [amount, setAmount] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // PayPal configuration
    const paypalOptions = {
        'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test',
        currency: 'USD',
    };

    const handleMTNPayment = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (!phoneNumber || phoneNumber.length < 10) {
            setError('Please enter a valid phone number');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Use guest donation endpoint if not authenticated
            if (!isAuthenticated) {
                const response = await api.post('/donations/guest', {
                    studentId: student.id,
                    amount: parseFloat(amount),
                    paymentMethod: 'MTN',
                    phoneNumber: phoneNumber,
                });

                if (response.data.status === 'Completed') {
                    setSuccess('Payment completed successfully!');
                    setTimeout(() => onSuccess && onSuccess(), 2000);
                } else {
                    setSuccess('Payment initiated! Please check your phone to complete the transaction.');
                    // Poll for payment status if needed
                    if (response.data.id) {
                        pollGuestPaymentStatus(response.data.id);
                    }
                }
            } else {
                const response = await api.post('/payments/mtn/initiate', {
                    studentId: student.id,
                    amount: parseFloat(amount),
                    phoneNumber: phoneNumber,
                });

                setSuccess('Payment initiated! Please check your phone to complete the transaction.');

                // Poll for payment status
                const transactionId = response.data.transactionId;
                pollPaymentStatus(transactionId);
            }

        } catch (error) {
            setError(error.response?.data?.message || 'Failed to initiate payment');
        } finally {
            setLoading(false);
        }
    };

    const pollGuestPaymentStatus = async (donationId) => {
        let attempts = 0;
        const maxAttempts = 30; // 30 attempts = 5 minutes

        const checkStatus = setInterval(async () => {
            try {
                const response = await api.get(`/donations/${donationId}`);
                
                if (response.data.status === 'Completed') {
                    clearInterval(checkStatus);
                    setSuccess('Payment completed successfully!');
                    setTimeout(() => onSuccess && onSuccess(), 2000);
                } else if (response.data.status === 'Failed') {
                    clearInterval(checkStatus);
                    setError('Payment failed. Please try again.');
                }

                attempts++;
                if (attempts >= maxAttempts) {
                    clearInterval(checkStatus);
                    setError('Payment timeout. Please check your transaction status.');
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
            }
        }, 10000); // Check every 10 seconds
    };

    const pollPaymentStatus = async (transactionId) => {
        let attempts = 0;
        const maxAttempts = 30; // 30 attempts = 5 minutes

        const checkStatus = setInterval(async () => {
            try {
                const response = await api.get(`/payments/mtn/status/${transactionId}`);

                if (response.data.status === 'SUCCESSFUL') {
                    clearInterval(checkStatus);
                    setSuccess('Payment completed successfully!');
                    setTimeout(() => onSuccess && onSuccess(), 2000);
                } else if (response.data.status === 'FAILED') {
                    clearInterval(checkStatus);
                    setError('Payment failed. Please try again.');
                }

                attempts++;
                if (attempts >= maxAttempts) {
                    clearInterval(checkStatus);
                    setError('Payment timeout. Please check your transaction status.');
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
            }
        }, 10000); // Check every 10 seconds
    };

    const createPayPalOrder = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount');
            return null;
        }

        try {
            if (!isAuthenticated) {
                // For guest donations, create the donation first
                const response = await api.post('/donations/guest', {
                    studentId: student.id,
                    amount: parseFloat(amount),
                    paymentMethod: 'PayPal',
                });

                // Store donation ID for later completion
                // Return a mock order ID that includes the donation ID
                return `PAYPAL_GUEST_${response.data.id}`;
            } else {
                const response = await api.post('/payments/paypal/create-order', {
                    studentId: student.id,
                    amount: parseFloat(amount),
                });

                return response.data.orderId;
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create PayPal order');
            return null;
        }
    };

    const onPayPalApprove = async (data) => {
        try {
            setLoading(true);

            if (!isAuthenticated) {
                // For guest donations, extract donation ID and complete it
                const donationId = data.orderID.replace('PAYPAL_GUEST_', '');
                
                try {
                    // Complete the guest donation
                    await api.put(`/donations/${donationId}/complete`);
                    setSuccess('Payment completed successfully! Thank you for your donation!');
                    setTimeout(() => onSuccess && onSuccess(), 2000);
                } catch (err) {
                    // If completion fails, check if it's already completed
                    try {
                        const checkResponse = await api.get(`/donations/${donationId}`);
                        if (checkResponse.data.status === 'Completed') {
                            setSuccess('Payment completed successfully! Thank you for your donation!');
                            setTimeout(() => onSuccess && onSuccess(), 2000);
                        } else {
                            setError('Failed to complete donation. Please contact support.');
                        }
                    } catch (checkErr) {
                        setError('Payment approved but failed to complete. Please contact support.');
                    }
                }
            } else {
                const response = await api.post('/payments/paypal/capture-order', {
                    orderId: data.orderID,
                    studentId: student.id,
                });

                setSuccess('Payment completed successfully!');
                setTimeout(() => onSuccess && onSuccess(), 2000);
            }

        } catch (error) {
            setError(error.response?.data?.message || 'Failed to complete payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                Make a Donation
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Box
                            component="img"
                            src={student.photoUrl || '/default-avatar.png'}
                            sx={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <Box>
                            <Typography variant="h6">{student.fullName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {student.fieldOfStudy || 'Student'}
                            </Typography>
                        </Box>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        Goal: ${student.fundingGoal?.toLocaleString()} •
                        Raised: ${student.amountRaised?.toLocaleString()}
                    </Typography>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <TextField
                        label="Donation Amount (USD)"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        fullWidth
                        required
                        sx={{ mb: 3 }}
                        InputProps={{
                            startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                        }}
                    />

                    <FormControl component="fieldset" sx={{ mb: 3 }}>
                        <FormLabel component="legend">Payment Method</FormLabel>
                        <RadioGroup
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            <FormControlLabel
                                value="paypal"
                                control={<Radio />}
                                label={
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <CreditCard />
                                        <Typography>PayPal</Typography>
                                    </Stack>
                                }
                            />
                            <FormControlLabel
                                value="mtn"
                                control={<Radio />}
                                label={
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Phone />
                                        <Typography>MTN Mobile Money</Typography>
                                    </Stack>
                                }
                            />
                        </RadioGroup>
                    </FormControl>

                    <Divider sx={{ my: 3 }} />

                    {paymentMethod === 'paypal' && (
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Click the PayPal button below to complete your donation
                            </Typography>
                            <PayPalScriptProvider options={paypalOptions}>
                                <PayPalButtons
                                    createOrder={createPayPalOrder}
                                    onApprove={onPayPalApprove}
                                    onError={(err) => setError('PayPal payment failed')}
                                    disabled={!amount || parseFloat(amount) <= 0}
                                    style={{ layout: 'vertical' }}
                                />
                            </PayPalScriptProvider>
                        </Box>
                    )}

                    {paymentMethod === 'mtn' && (
                        <Box>
                            <TextField
                                label="MTN Mobile Money Number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                fullWidth
                                required
                                placeholder="e.g., 250788123456"
                                sx={{ mb: 2 }}
                                InputProps={{
                                    startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                                }}
                            />
                            <Alert severity="info" sx={{ mb: 2 }}>
                                You will receive a prompt on your phone to approve the payment
                            </Alert>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleMTNPayment}
                                disabled={loading || !amount || !phoneNumber}
                                startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
                            >
                                {loading ? 'Processing...' : `Pay $${amount || '0'} with MTN`}
                            </Button>
                        </Box>
                    )}

                    <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                        <Button variant="outlined" fullWidth onClick={onCancel}>
                            Cancel
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};

export default DonationPayment;
