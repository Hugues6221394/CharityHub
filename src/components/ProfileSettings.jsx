import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Stack,
    Alert,
    Tabs,
    Tab,
    Switch,
    FormControlLabel,
    Divider,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    IconButton,
} from '@mui/material';
import {
    Person,
    Lock,
    Notifications,
    Security,
    Delete,
    PhotoCamera,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ProfileSettings = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState(0);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [open2FADialog, setOpen2FADialog] = useState(false);
    const [openDeactivateDialog, setOpenDeactivateDialog] = useState(false);
    const [qrCodeImage, setQrCodeImage] = useState('');
    const [authKey, setAuthKey] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Notification Settings
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        newApplications: true,
        newDonations: true,
        newMessages: true,
        weeklyReports: false,
    });

    // 2FA State
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [profileImage, setProfileImage] = useState(null);

    useEffect(() => {
        checkTwoFactorStatus();
        fetchNotificationPreferences();
    }, []);

    const fetchNotificationPreferences = async () => {
        try {
            const response = await api.get('/auth/notification-preferences');
            if (response.data) {
                setNotifications({
                    emailNotifications: response.data.emailNotifications ?? true,
                    newApplications: response.data.newApplications ?? true,
                    newDonations: response.data.newDonations ?? true,
                    newMessages: response.data.newMessages ?? true,
                    weeklyReports: response.data.weeklyReports ?? false,
                });
            }
        } catch (error) {
            console.error('Error fetching notification preferences:', error);
            // Use defaults if fetch fails
        }
    };

    const checkTwoFactorStatus = async () => {
        try {
            const response = await api.get('/auth/me');
            setTwoFactorEnabled(response.data.twoFactorEnabled || false);
        } catch (error) {
            console.error('Error checking 2FA status:', error);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            await api.put('/auth/update-profile', profileData);
            setSuccess('Profile updated successfully');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update profile');
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            await api.post('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            setSuccess('Password changed successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to change password');
        }
    };

    const handleUpdateNotifications = async () => {
        try {
            setError('');
            await api.put('/auth/notification-preferences', notifications);
            setSuccess('Notification preferences updated successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update preferences';
            setError(errorMessage);
            console.error('Error updating notification preferences:', error);
        }
    };

    const handleEnable2FA = async () => {
        try {
            const response = await api.post('/twofactor/setup');
            setQrCodeImage(response.data.qrCodeImage);
            setAuthKey(response.data.key);
            setOpen2FADialog(true);
        } catch (error) {
            setError('Failed to setup 2FA');
        }
    };

    const handleConfirm2FA = async () => {
        try {
            const response = await api.post('/twofactor/enable', { code: verificationCode });
            setRecoveryCodes(response.data.recoveryCodes);
            setTwoFactorEnabled(true);
            setOpen2FADialog(false);
            setShowRecoveryCodes(true);
            setSuccess('Two-Factor Authentication enabled successfully');
        } catch (error) {
            setError(error.response?.data?.message || 'Invalid verification code');
        }
    };

    const handleDisable2FA = async () => {
        if (window.confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
            try {
                await api.post('/twofactor/disable');
                setTwoFactorEnabled(false);
                setSuccess('Two-Factor Authentication disabled');
            } catch (error) {
                setError('Failed to disable 2FA');
            }
        }
    };

    const handleDeactivateAccount = async () => {
        try {
            await api.post('/auth/deactivate-account');
            setSuccess('Account deactivated successfully');
            setOpenDeactivateDialog(false);
            setTimeout(() => logout(), 2000);
        } catch (error) {
            setError('Failed to deactivate account');
        }
    };

    const handleProfileImageChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            setError('Only JPG and PNG images are allowed');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size exceeds 5MB limit');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/fileupload/profile-picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setProfileImage(response.data.url);
            setSuccess('Profile image updated successfully');
            // Update user context if needed
            if (user) {
                user.profilePictureUrl = response.data.url;
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to upload image');
        }
    };

    const renderProfileTab = () => (
        <Stack spacing={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ position: 'relative' }}>
                    <Avatar
                        src={profileImage || user?.profilePictureUrl}
                        sx={{ width: 100, height: 100, bgcolor: 'primary.main', fontSize: '2.5rem' }}
                    >
                        {!(profileImage || user?.profilePictureUrl) && `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`}
                    </Avatar>
                    <IconButton
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' },
                        }}
                        component="label"
                    >
                        <PhotoCamera fontSize="small" />
                        <input type="file" hidden accept="image/*" onChange={handleProfileImageChange} />
                    </IconButton>
                </Box>
                <Box>
                    <Typography variant="h6">{user?.firstName} {user?.lastName}</Typography>
                    <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                    <Typography variant="caption" color="text.secondary">
                        Role: {user?.role || 'User'}
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="First Name"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Last Name"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Phone Number"
                        value={profileData.phoneNumber}
                        onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                        fullWidth
                    />
                </Grid>
            </Grid>

            <Button variant="contained" onClick={handleUpdateProfile}>
                Save Changes
            </Button>
        </Stack>
    );

    const renderSecurityTab = () => (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Change Password
                </Typography>
                <Stack spacing={2}>
                    <TextField
                        label="Current Password"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        fullWidth
                    />
                    <TextField
                        label="New Password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        fullWidth
                    />
                    <TextField
                        label="Confirm New Password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        fullWidth
                    />
                    <Button variant="contained" onClick={handleChangePassword}>
                        Change Password
                    </Button>
                </Stack>
            </Box>

            <Divider />

            <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Two-Factor Authentication
                </Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {twoFactorEnabled ? '✅ Enabled' : '❌ Disabled'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Add an extra layer of security to your account
                        </Typography>
                    </Box>
                    <Button
                        variant={twoFactorEnabled ? 'outlined' : 'contained'}
                        color={twoFactorEnabled ? 'error' : 'primary'}
                        onClick={twoFactorEnabled ? handleDisable2FA : handleEnable2FA}
                    >
                        {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </Button>
                </Stack>
            </Box>
        </Stack>
    );

    const renderNotificationsTab = () => (
        <Stack spacing={2}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                Email Notifications
            </Typography>
            <FormControlLabel
                control={
                    <Switch
                        checked={notifications.emailNotifications}
                        onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                    />
                }
                label="Enable email notifications"
            />
            <Divider />
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
                Notification Types
            </Typography>
            <FormControlLabel
                control={
                    <Switch
                        checked={notifications.newApplications}
                        onChange={(e) => setNotifications({ ...notifications, newApplications: e.target.checked })}
                    />
                }
                label="New student applications"
            />
            <FormControlLabel
                control={
                    <Switch
                        checked={notifications.newDonations}
                        onChange={(e) => setNotifications({ ...notifications, newDonations: e.target.checked })}
                    />
                }
                label="New donations"
            />
            <FormControlLabel
                control={
                    <Switch
                        checked={notifications.newMessages}
                        onChange={(e) => setNotifications({ ...notifications, newMessages: e.target.checked })}
                    />
                }
                label="New messages"
            />
            <FormControlLabel
                control={
                    <Switch
                        checked={notifications.weeklyReports}
                        onChange={(e) => setNotifications({ ...notifications, weeklyReports: e.target.checked })}
                    />
                }
                label="Weekly summary reports"
            />
            <Button variant="contained" onClick={handleUpdateNotifications} sx={{ mt: 2 }}>
                Save Preferences
            </Button>
        </Stack>
    );

    const renderAccountTab = () => (
        <Stack spacing={3}>
            <Alert severity="warning">
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Danger Zone
                </Typography>
                <Typography variant="body2">
                    These actions are irreversible. Please proceed with caution.
                </Typography>
            </Alert>

            <Card sx={{ bgcolor: 'error.50', border: '1px solid', borderColor: 'error.light' }}>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                Deactivate Account
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Temporarily disable your account. You can reactivate it by logging in again.
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => setOpenDeactivateDialog(true)}
                        >
                            Deactivate
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Stack>
    );

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                Profile Settings
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Card>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                    <Tab icon={<Person />} label="Profile" />
                    <Tab icon={<Lock />} label="Security" />
                    <Tab icon={<Notifications />} label="Notifications" />
                    <Tab icon={<Delete />} label="Account" />
                </Tabs>
                <CardContent sx={{ p: 3 }}>
                    {activeTab === 0 && renderProfileTab()}
                    {activeTab === 1 && renderSecurityTab()}
                    {activeTab === 2 && renderNotificationsTab()}
                    {activeTab === 3 && renderAccountTab()}
                </CardContent>
            </Card>

            {/* 2FA Setup Dialog */}
            <Dialog open={open2FADialog} onClose={() => setOpen2FADialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <Alert severity="info">
                            Scan this QR code with your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)
                        </Alert>
                        {qrCodeImage && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
                                <img
                                    src={`data:image/png;base64,${qrCodeImage}`}
                                    alt="2FA QR Code"
                                    style={{ width: 200, height: 200 }}
                                />
                            </Box>
                        )}
                        <Typography variant="body2" color="text.secondary" align="center">
                            Or enter this key manually: <strong>{authKey}</strong>
                        </Typography>
                        <TextField
                            label="Verification Code"
                            placeholder="Enter 6-digit code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen2FADialog(false)}>Cancel</Button>
                    <Button onClick={handleConfirm2FA} variant="contained">
                        Verify & Enable
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Recovery Codes Dialog */}
            <Dialog open={showRecoveryCodes} onClose={() => setShowRecoveryCodes(false)}>
                <DialogTitle>Save Your Recovery Codes</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Save these recovery codes in a safe place. You can use them to access your account if you lose your phone.
                    </Alert>
                    <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                        {recoveryCodes.map((code, index) => (
                            <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace' }}>
                                {code}
                            </Typography>
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowRecoveryCodes(false)} variant="contained">
                        I've Saved Them
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Deactivate Account Dialog */}
            <Dialog open={openDeactivateDialog} onClose={() => setOpenDeactivateDialog(false)}>
                <DialogTitle>Deactivate Account?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to deactivate your account? You can reactivate it by logging in again.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeactivateDialog(false)}>Cancel</Button>
                    <Button onClick={handleDeactivateAccount} color="error" variant="contained">
                        Deactivate
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProfileSettings;
