import { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
    Button,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Checkbox,
    Alert,
    CircularProgress,
    Paper,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { adminService } from '../../services/adminService';
import { permissionService } from '../../services/permissionService';

const AdminPermissions = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [availablePermissions, setAvailablePermissions] = useState([]);
    const [userPermissions, setUserPermissions] = useState(new Set());
    const [initialPermissions, setInitialPermissions] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [auditLog, setAuditLog] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    useEffect(() => {
        loadAudit();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            // Use backend role filtering
            const roleParam = roleFilter !== 'All' ? roleFilter : null;
            const data = await adminService.getAllUsers(roleParam);
            setUsers(data || []);
        } catch (err) {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        // Apply search filter (client-side for instant feedback)
        if (searchTerm) {
            filtered = filtered.filter(
                (user) =>
                    (user.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (user.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredUsers(filtered);
    };

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm]);

    useEffect(() => {
        loadUsers();
    }, [roleFilter]);

    const loadAudit = async () => {
        try {
            const data = await permissionService.getAuditLog();
            setAuditLog(data || []);
        } catch (err) {
            // ignore
        }
    };

    const loadUserPermissions = async (user) => {
        try {
            setLoading(true);
            setSelectedUser(user);
            const data = await permissionService.getUserPermissions(user.id);
            const permissions = data.permissions || [];
            const userPerms = new Set(data.userPermissions || []);
            setAvailablePermissions(permissions);
            setUserPermissions(userPerms);
            setInitialPermissions(new Set(userPerms)); // Store initial state
            setError('');
            setMessage('');
        } catch (err) {
            setError('Failed to load permissions for user');
        } finally {
            setLoading(false);
        }
    };

    const togglePermission = (perm) => {
        const updated = new Set(userPermissions);
        if (updated.has(perm)) updated.delete(perm);
        else updated.add(perm);
        setUserPermissions(updated);
    };

    const handleSave = async () => {
        if (!selectedUser) return;
        try {
            setSaving(true);
            setMessage('');
            setError('');
            
            // Calculate only the changes
            const permissionsToAdd = Array.from(userPermissions).filter(p => !initialPermissions.has(p));
            const permissionsToRemove = Array.from(initialPermissions).filter(p => !userPermissions.has(p));
            
            const payload = {
                permissionsToAdd: permissionsToAdd,
                permissionsToRemove: permissionsToRemove,
            };
            await permissionService.updateUserPermissions(selectedUser.id, payload);
            setMessage('Permissions updated successfully');
            setInitialPermissions(new Set(userPermissions)); // Update initial state
            loadAudit();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update permissions');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Typography 
                variant="h4" 
                sx={{ 
                    fontWeight: 700, 
                    mb: { xs: 2, sm: 3 },
                    fontSize: { xs: '1.5rem', sm: '2rem' }
                }}
            >
                Permission Management
            </Typography>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 3 }}>
                <Card sx={{ flex: 1, minWidth: { xs: '100%', md: 260 } }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            Users
                        </Typography>
                        
                        {/* Search and Filter */}
                        <Stack spacing={2} sx={{ mb: 2 }}>
                            <TextField
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                size="small"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                                fullWidth
                            />
                            <FormControl fullWidth size="small">
                                <InputLabel>Filter by Role</InputLabel>
                                <Select
                                    value={roleFilter}
                                    label="Filter by Role"
                                    onChange={(e) => {
                                        setRoleFilter(e.target.value);
                                        setSearchTerm(''); // Clear search when role changes
                                    }}
                                >
                                    <MenuItem value="All">All Roles</MenuItem>
                                    <MenuItem value="Admin">Admin</MenuItem>
                                    <MenuItem value="Manager">Manager</MenuItem>
                                    <MenuItem value="Student">Student</MenuItem>
                                    <MenuItem value="Donor">Donor</MenuItem>
                                </Select>
                            </FormControl>
                            {(searchTerm || roleFilter !== 'All') && (
                                <Chip
                                    label={`${filteredUsers.length} user${filteredUsers.length !== 1 ? 's' : ''} found`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                            )}
                        </Stack>

                        {loading && users.length === 0 ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : filteredUsers.length === 0 ? (
                            <Box sx={{ py: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    {searchTerm || roleFilter !== 'All'
                                        ? 'No users found matching your criteria'
                                        : 'No users found'}
                                </Typography>
                            </Box>
                        ) : (
                            <List dense sx={{ maxHeight: 500, overflow: 'auto' }}>
                                {filteredUsers.map((u) => (
                                    <ListItem key={u.id} disablePadding>
                                        <ListItemButton
                                            selected={selectedUser?.id === u.id}
                                            onClick={() => loadUserPermissions(u)}
                                        >
                                            <ListItemText
                                                primary={`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email}
                                                secondary={
                                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {u.email}
                                                        </Typography>
                                                        <Chip
                                                            label={u.role}
                                                            size="small"
                                                            color={
                                                                u.role === 'Admin' ? 'error' :
                                                                u.role === 'Manager' ? 'warning' :
                                                                u.role === 'Student' ? 'primary' :
                                                                u.role === 'Donor' ? 'success' : 'default'
                                                            }
                                                            sx={{ height: 18, fontSize: '0.65rem' }}
                                                        />
                                                    </Stack>
                                                }
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </CardContent>
                </Card>

                <Card sx={{ flex: 2, minWidth: { xs: '100%', md: 0 } }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            Permissions
                        </Typography>
                        <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                                mb: 2,
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                        >
                            Toggle permissions for the selected user. Changes are logged for audit.
                        </Typography>

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

                        {!selectedUser ? (
                            <Typography variant="body2" color="text.secondary">
                                Select a user to manage permissions.
                            </Typography>
                        ) : loading ? (
                            <CircularProgress />
                        ) : (
                                <Stack spacing={1}>
                                <Box sx={{ maxHeight: { xs: 300, sm: 400 }, overflow: 'auto' }}>
                                    {availablePermissions.map((perm) => (
                                        <Stack
                                            key={perm}
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                            sx={{ 
                                                border: 1, 
                                                borderColor: 'divider', 
                                                borderRadius: 1, 
                                                p: { xs: 1, sm: 1.5 },
                                                mb: 1
                                            }}
                                        >
                                            <Checkbox
                                                checked={userPermissions.has(perm)}
                                                onChange={() => togglePermission(perm)}
                                                size={isMobile ? 'small' : 'medium'}
                                            />
                                            <Typography 
                                                sx={{ 
                                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                                    wordBreak: 'break-word'
                                                }}
                                            >
                                                {perm}
                                            </Typography>
                                        </Stack>
                                    ))}
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Stack 
                                    direction={{ xs: 'column', sm: 'row' }} 
                                    spacing={2}
                                >
                                    <Button 
                                        variant="contained" 
                                        onClick={handleSave} 
                                        disabled={saving}
                                        fullWidth={isMobile}
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                    <Button 
                                        variant="outlined" 
                                        onClick={() => selectedUser && loadUserPermissions(selectedUser)} 
                                        disabled={saving}
                                        fullWidth={isMobile}
                                    >
                                        Reset
                                    </Button>
                                </Stack>
                            </Stack>
                        )}
                    </CardContent>
                </Card>
            </Stack>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Permission Audit Log
                </Typography>
                <Paper variant="outlined" sx={{ maxHeight: 260, overflow: 'auto' }}>
                    <List dense>
                        {auditLog.length === 0 && (
                            <ListItem>
                                <ListItemText primary="No audit records yet." />
                            </ListItem>
                        )}
                        {auditLog.map((log) => (
                            <ListItem key={log.id} divider>
                                <ListItemText
                                    primary={log.changes}
                                    secondary={`${log.createdAt} • Admin: ${log.adminUserId} • Target: ${log.targetUserId}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Box>
        </Box>
    );
};

export default AdminPermissions;

