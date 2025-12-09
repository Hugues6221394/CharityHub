import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemText,
    Chip,
    Stack,
    Alert,
    IconButton,
    Button,
} from '@mui/material';
import {
    Delete,
    CheckCircle,
    ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';

const NotificationsPage = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getNotifications();
            setNotifications(data.notifications || []);
        } catch (error) {
            setError('Failed to fetch notifications');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            fetchNotifications();
        } catch (error) {
            setError('Failed to mark notification as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            fetchNotifications();
        } catch (error) {
            setError('Failed to mark all as read');
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'Success': return 'success';
            case 'Error': return 'error';
            case 'Warning': return 'warning';
            default: return 'info';
        }
    };

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Notifications
                </Typography>
                {notifications.some(n => !n.isRead) && (
                    <Button
                        variant="outlined"
                        startIcon={<CheckCircle />}
                        onClick={handleMarkAllAsRead}
                    >
                        Mark All as Read
                    </Button>
                )}
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Card>
                <CardContent>
                    {loading ? (
                        <Typography>Loading notifications...</Typography>
                    ) : notifications.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <Typography variant="h6" color="text.secondary">
                                No notifications yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                You'll see notifications here when there are updates
                            </Typography>
                        </Box>
                    ) : (
                        <List>
                            {notifications.map((notification) => (
                                <ListItem
                                    key={notification.id}
                                    sx={{
                                        bgcolor: notification.isRead ? 'transparent' : 'primary.50',
                                        borderRadius: 1,
                                        mb: 1,
                                    }}
                                    secondaryAction={
                                        !notification.isRead && (
                                            <IconButton edge="end" onClick={() => handleMarkAsRead(notification.id)}>
                                                <CheckCircle color="primary" />
                                            </IconButton>
                                        )
                                    }
                                >
                                    <ListItemText
                                        primary={
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="subtitle1" sx={{ fontWeight: notification.isRead ? 400 : 600 }}>
                                                    {notification.title}
                                                </Typography>
                                                <Chip label={notification.type} size="small" color={getNotificationColor(notification.type)} />
                                            </Stack>
                                        }
                                        secondary={
                                            <>
                                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                    {notification.message.length > 100 
                                                        ? `${notification.message.substring(0, 100)}...` 
                                                        : notification.message}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </Typography>
                                            </>
                                        }
                                    />
                                    {notification.linkUrl && (
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => {
                                                navigate(notification.linkUrl);
                                            }}
                                            sx={{ ml: 1 }}
                                        >
                                            View
                                        </Button>
                                    )}
                                </ListItem>
                            ))}
                        </List>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default NotificationsPage;
