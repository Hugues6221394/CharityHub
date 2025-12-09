import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    TextField,
    Stack,
    Chip,
    IconButton,
    Divider,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    InputAdornment,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    CircularProgress,
    Paper,
} from '@mui/material';
import {
    Send,
    Person,
    Add,
    Search,
    Delete,
} from '@mui/icons-material';
import api from '../../services/api';
import { signalRService } from '../../services/signalRService';
import { useAuth } from '../../context/AuthContext';

const ManagerMessages = () => {
    const location = useLocation();
    const { user } = useAuth();
    const messagesEndRef = useRef(null);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [loadingUsers, setLoadingUsers] = useState(false);

    useEffect(() => {
        fetchConversations();
        initializeMessageConnection();
        
        // Handle navigation from application page
        if (location.state?.recipientId) {
            const student = {
                id: location.state.recipientId,
                firstName: location.state.recipientName?.split(' ')[0] || '',
                lastName: location.state.recipientName?.split(' ').slice(1).join(' ') || '',
                email: location.state.recipientEmail,
            };
            handleSelectUser(student);
        }
    }, [location.state]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (openCreateDialog) {
            const timeoutId = setTimeout(() => {
                fetchUsersForMessaging(roleFilter !== 'All' ? roleFilter : null, searchQuery || null);
            }, 300);
            
            return () => clearTimeout(timeoutId);
        }
    }, [openCreateDialog, roleFilter, searchQuery]);

    const initializeMessageConnection = async () => {
        await signalRService.startMessageConnection((message) => {
            if (selectedConversation && 
                (message.senderId === selectedConversation.id || message.receiverId === selectedConversation.id)) {
                setMessages(prev => {
                    if (prev.find(m => m.id === message.id)) return prev;
                    return [...prev, {
                        ...message,
                        isSentByMe: message.senderId === user?.id
                    }];
                });
            }
            
            setConversations(prev => prev.map(conv => {
                if (conv.id === message.senderId || conv.id === message.receiverId) {
                    return {
                        ...conv,
                        lastMessage: message.content,
                        lastMessageTime: message.createdAt
                    };
                }
                return conv;
            }));
        });
    };

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/messages/conversations');
            setConversations(response.data || []);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsersForMessaging = async (role = null, search = null) => {
        try {
            setLoadingUsers(true);
            const params = {};
            if (role && role !== 'All') {
                params.role = role;
            }
            if (search && search.trim()) {
                params.search = search.trim();
            }
            const response = await api.get('/manager/messaging/users-for-messaging', { params });
            const usersData = response.data || [];
            setUsers(usersData);
            setFilteredUsers(usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to fetch users. Please try again.');
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setSelectedConversation({
            id: user.id,
            participantName: `${user.firstName} ${user.lastName}`,
            participantEmail: user.email,
            isNew: true
        });
        setMessages([]);
    };

    const handleSelectConversation = async (conversation) => {
        setSelectedConversation(conversation);
        setSelectedUser({
            id: conversation.id,
            firstName: conversation.participantName?.split(' ')[0] || '',
            lastName: conversation.participantName?.split(' ').slice(1).join(' ') || '',
            email: conversation.participantEmail,
        });
        try {
            const response = await api.get(`/messages/conversation/${conversation.id}`);
            const messagesData = (response.data || []).map(msg => ({
                ...msg,
                isSentByMe: msg.senderId === user?.id
            }));
            setMessages(messagesData);
            await signalRService.joinConversation(conversation.id);
        } catch (error) {
            setError('Failed to fetch messages');
        }
    };

    const handleSendMessage = async () => {
        const messageContent = newMessage.trim();
        if (!messageContent) return;

        const receiverId = selectedUser?.id || selectedConversation?.id;
        if (!receiverId) {
            setError('Please select a user to message');
            return;
        }

        setNewMessage('');

        try {
            const response = await api.post('/messages/send', {
                receiverId: receiverId,
                content: messageContent,
            });
            
            const newMsg = {
                id: response.data.id || Date.now(),
                senderId: user?.id,
                receiverId: receiverId,
                content: messageContent,
                createdAt: new Date().toISOString(),
                isSentByMe: true,
                isRead: false,
                senderName: `${user?.firstName} ${user?.lastName}`
            };
            
            setMessages(prev => [...prev, newMsg]);

            if (selectedUser) {
                const newConv = {
                    id: receiverId,
                    participantName: `${selectedUser.firstName} ${selectedUser.lastName}`,
                    participantEmail: selectedUser.email,
                    firstName: selectedUser.firstName,
                    lastName: selectedUser.lastName,
                    profilePictureUrl: selectedUser.profilePictureUrl,
                    lastMessage: messageContent,
                    lastMessageTime: new Date().toISOString(),
                    isNew: false,
                    role: selectedUser.role
                };
                setConversations(prev => [newConv, ...prev.filter(c => c.id !== receiverId)]);
                setSelectedConversation(newConv);
                setSelectedUser(null);
            } else if (selectedConversation) {
                const updatedConv = { ...selectedConversation, lastMessage: messageContent, lastMessageTime: new Date().toISOString() };
                setConversations(prev => prev.map(c => c.id === receiverId ? updatedConv : c));
                setSelectedConversation(updatedConv);
            }
            
            setTimeout(() => {
                fetchConversations();
            }, 500);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to send message');
            setNewMessage(messageContent);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            try {
                await api.delete(`/messages/${messageId}`);
                setMessages(messages.filter(m => m.id !== messageId));
            } catch (error) {
                setError('Failed to delete message');
            }
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                Messages
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            <Grid container spacing={2} sx={{ height: 'calc(100vh - 200px)' }}>
                {/* Users/Conversations List */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', overflow: 'auto' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Users & Conversations
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<Add />}
                                    onClick={() => setOpenCreateDialog(true)}
                                >
                                    Create Conversation
                                </Button>
                            </Stack>
                            {loading ? (
                                <Typography>Loading...</Typography>
                            ) : (
                                <List>
                                    {users.map((user) => (
                                        <ListItem
                                            key={user.id}
                                            button
                                            selected={selectedUser?.id === user.id}
                                            onClick={() => handleSelectUser(user)}
                                            sx={{
                                                borderRadius: 2,
                                                mb: 1,
                                                '&.Mui-selected': {
                                                    bgcolor: 'primary.50',
                                                },
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar src={user.profilePictureUrl} sx={{ bgcolor: 'primary.main' }}>
                                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={`${user.firstName} ${user.lastName}`}
                                                secondary={
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Typography variant="caption">{user.email}</Typography>
                                                        <Chip label={user.role} size="small" color="primary" variant="outlined" />
                                                    </Stack>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                    {conversations.map((conversation) => (
                                        <ListItem
                                            key={conversation.id}
                                            button
                                            selected={selectedConversation?.id === conversation.id && !selectedConversation?.isNew}
                                            onClick={() => handleSelectConversation(conversation)}
                                            sx={{
                                                borderRadius: 2,
                                                mb: 1,
                                                '&.Mui-selected': {
                                                    bgcolor: 'primary.50',
                                                },
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'success.main' }}>
                                                    <Person />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={conversation.participantName || 'Conversation'}
                                                secondary={conversation.lastMessage || 'No messages yet'}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Messages View */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1, overflow: 'auto' }}>
                            {selectedConversation ? (
                                <>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                        {selectedConversation.participantName || 'New Message'}
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
                                        <Stack spacing={2}>
                                            {messages.map((message) => {
                                                const isSentByMe = message.senderId === user?.id;
                                                return (
                                                    <Box
                                                        key={message.id}
                                                        sx={{
                                                            display: 'flex',
                                                            flexDirection: isSentByMe ? 'row-reverse' : 'row',
                                                            gap: 1,
                                                            alignItems: 'flex-start',
                                                        }}
                                                    >
                                                        <Avatar sx={{ bgcolor: isSentByMe ? 'primary.main' : 'success.main' }}>
                                                            {isSentByMe ? user?.firstName?.[0] : message.senderName?.[0] || 'U'}
                                                        </Avatar>
                                                        <Box sx={{ maxWidth: '70%' }}>
                                                            <Paper
                                                                sx={{
                                                                    bgcolor: isSentByMe ? 'primary.main' : 'grey.100',
                                                                    color: isSentByMe ? 'white' : 'text.primary',
                                                                    p: 2,
                                                                    borderRadius: 2,
                                                                }}
                                                            >
                                                                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, opacity: 0.8 }}>
                                                                    {message.senderName || 'User'}
                                                                </Typography>
                                                                <Typography variant="body1">{message.content}</Typography>
                                                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.8 }}>
                                                                    {new Date(message.createdAt).toLocaleString()}
                                                                </Typography>
                                                            </Paper>
                                                            {!isSentByMe && (
                                                                <IconButton size="small" onClick={() => handleDeleteMessage(message.id)}>
                                                                    <Delete fontSize="small" />
                                                                </IconButton>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                );
                                            })}
                                        </Stack>
                                    </Box>
                                    <Divider sx={{ my: 2 }} />
                                    <Stack direction="row" spacing={1}>
                                        <TextField
                                            fullWidth
                                            placeholder="Type a message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                            multiline
                                            maxRows={3}
                                        />
                                        <Button
                                            variant="contained"
                                            endIcon={<Send />}
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim()}
                                        >
                                            Send
                                        </Button>
                                    </Stack>
                                </>
                            ) : selectedUser ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
                                    <Typography variant="h6" color="text.secondary">
                                        New Conversation with {selectedUser.firstName} {selectedUser.lastName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        Start a conversation by typing a message below
                                    </Typography>
                                    <Divider sx={{ width: '100%', my: 2 }} />
                                    <Box sx={{ width: '100%' }}>
                                        <Stack direction="row" spacing={1}>
                                            <TextField
                                                fullWidth
                                                placeholder="Type a message to start conversation..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage();
                                                    }
                                                }}
                                                multiline
                                                maxRows={3}
                                            />
                                            <Button
                                                variant="contained"
                                                endIcon={<Send />}
                                                onClick={handleSendMessage}
                                                disabled={!newMessage.trim()}
                                            >
                                                Send
                                            </Button>
                                        </Stack>
                                    </Box>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    <Typography color="text.secondary">
                                        Select a user or conversation to view messages
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Create Conversation Dialog */}
            <Dialog
                open={openCreateDialog}
                onClose={() => {
                    setOpenCreateDialog(false);
                    setSearchQuery('');
                    setRoleFilter('All');
                    setSelectedUser(null);
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Add />
                        <Typography variant="h6">Create New Conversation</Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Search by email or name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                            placeholder="Enter email or name to search..."
                        />
                        <FormControl fullWidth>
                            <InputLabel>Filter by Role</InputLabel>
                            <Select
                                value={roleFilter}
                                label="Filter by Role"
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <MenuItem value="All">All Roles</MenuItem>
                                <MenuItem value="Student">Student</MenuItem>
                                <MenuItem value="Admin">Admin</MenuItem>
                            </Select>
                        </FormControl>
                        <Divider />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Select a user to start conversation:
                        </Typography>
                        {loadingUsers ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : filteredUsers.length === 0 ? (
                            <Alert severity="info">No users found. Try adjusting your search or filter.</Alert>
                        ) : (
                            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                                <List>
                                    {filteredUsers.map((user) => (
                                        <ListItem
                                            key={user.id}
                                            button
                                            selected={selectedUser?.id === user.id}
                                            onClick={() => setSelectedUser(user)}
                                            sx={{
                                                borderRadius: 2,
                                                mb: 1,
                                                '&.Mui-selected': {
                                                    bgcolor: 'primary.50',
                                                },
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar src={user.profilePictureUrl} sx={{ bgcolor: 'primary.main' }}>
                                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={`${user.firstName} ${user.lastName}`}
                                                secondary={
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Typography variant="caption">{user.email}</Typography>
                                                        <Chip label={user.role} size="small" color="primary" variant="outlined" />
                                                    </Stack>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setOpenCreateDialog(false);
                        setSearchQuery('');
                        setRoleFilter('All');
                        setSelectedUser(null);
                    }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            if (selectedUser) {
                                handleSelectUser(selectedUser);
                                setOpenCreateDialog(false);
                                setSearchQuery('');
                                setRoleFilter('All');
                            }
                        }}
                        disabled={!selectedUser}
                    >
                        Start Conversation
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ManagerMessages;
