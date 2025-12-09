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
} from '@mui/material';
import {
    Person,
    Lock,
    Notifications,
    Security,
    Delete,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AdminSettings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(0);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [open2FADialog, setOpen2FADialog] = useState(false);
    const [openDeactivateDialog, setOpenDeactivateDialog] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phoneNumber: '',
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

    useEffect(() => {
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

    const handleUpdateProfile = async () => {
        try {
            // TODO: API call to update profile
            setSuccess('Profile updated successfully');
        } catch (error) {
            setError('Failed to update profile');
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            // TODO: API call to change password
            setSuccess('Password changed successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setError('Failed to change password');
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

    const handleEnable2FA = () => {
        setOpen2FADialog(true);
    };

    const handleConfirm2FA = async () => {
        try {
            // TODO: API call to enable 2FA
            setTwoFactorEnabled(true);
            setOpen2FADialog(false);
            setSuccess('Two-Factor Authentication enabled successfully');
        } catch (error) {
            setError('Failed to enable 2FA');
        }
    };

    const handleDeactivateAccount = async () => {
        try {
            // TODO: API call to deactivate account
            setSuccess('Account deactivated successfully');
            setOpenDeactivateDialog(false);
        } catch (error) {
            setError('Failed to deactivate account');
        }
    };

    const renderProfileTab = () => (
        <Stack spacing={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Avatar>
                <Button variant="outlined" component="label">
                    Change Photo
                    <input type="file" hidden accept="image/*" />
                </Button>
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
                        <Typography variant="body1">
                            {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Add an extra layer of security to your account
                        </Typography>
                    </Box>
                    <Button
                        variant={twoFactorEnabled ? 'outlined' : 'contained'}
                        color={twoFactorEnabled ? 'error' : 'primary'}
                        onClick={() => twoFactorEnabled ? setTwoFactorEnabled(false) : handleEnable2FA()}
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
                                Temporarily disable your account. You can reactivate it later.
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
                Settings
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
                            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                        </Alert>
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
                            <Box sx={{ width: 200, height: 200, bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography color="text.secondary">QR Code Placeholder</Typography>
                            </Box>
                        </Box>
                        <TextField
                            label="Verification Code"
                            placeholder="Enter 6-digit code"
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

export default AdminSettings;
