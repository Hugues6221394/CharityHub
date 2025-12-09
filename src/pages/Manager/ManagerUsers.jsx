import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Chip,
    TextField,
    InputAdornment,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Tooltip,
} from '@mui/material';
import {
    Search,
    Add,
    Edit,
    Delete,
    Lock,
    LockOpen,
    VpnKey,
} from '@mui/icons-material';
import { adminService } from '../../services/adminService';
import { usePermissions } from '../../hooks/usePermissions';

const ManagerUsers = () => {
    const { hasPermission } = usePermissions();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'Student',
    });
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const canManage = hasPermission('users.manage');

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');
            const roleParam = roleFilter !== 'All' ? roleFilter : null;
            const data = await adminService.getAllUsers(roleParam);
            setUsers(data || []);
        } catch (error) {
            setError('Failed to fetch users');
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;

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

    const handleOpenDialog = (user = null) => {
        if (user) {
            setSelectedUser(user);
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: '',
                role: user.role,
            });
        } else {
            setSelectedUser(null);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                role: 'Student',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedUser(null);
        setError('');
    };

    const handleSaveUser = async () => {
        try {
            if (selectedUser) {
                await adminService.updateUser(selectedUser.id, formData);
                setSuccess('User updated successfully');
            } else {
                await adminService.createUser(formData);
                setSuccess('User created successfully');
            }
            handleCloseDialog();
            fetchUsers();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to save user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await adminService.deleteUser(userId);
                setSuccess('User deleted successfully');
                fetchUsers();
            } catch (error) {
                setError('Failed to delete user');
            }
        }
    };

    const handleToggleActive = async (userId, currentStatus) => {
        try {
            await adminService.toggleUserActive(userId);
            setSuccess(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
            fetchUsers();
        } catch (error) {
            setError('Failed to update user status');
        }
    };

    const handleOpenPasswordDialog = (user) => {
        setSelectedUser(user);
        setNewPassword('');
        setOpenPasswordDialog(true);
    };

    const handleResetPassword = async () => {
        try {
            await adminService.resetPassword(selectedUser.id, newPassword);
            setSuccess('Password reset successfully');
            setOpenPasswordDialog(false);
            setNewPassword('');
        } catch (error) {
            setError('Failed to reset password');
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'Admin': return 'error';
            case 'Manager': return 'warning';
            case 'Student': return 'primary';
            case 'Donor': return 'success';
            default: return 'default';
        }
    };

    return (
        <Box>
            <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                justifyContent="space-between" 
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={2}
                sx={{ mb: { xs: 2, sm: 3 } }}
            >
                <Typography 
                    variant="h4" 
                    sx={{ 
                        fontWeight: 700,
                        fontSize: { xs: '1.5rem', sm: '2rem' }
                    }}
                >
                    User Management
                </Typography>
                {canManage ? (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog()}
                        fullWidth={isMobile}
                        sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                    >
                        Add User
                    </Button>
                ) : (
                    <Chip label="View Only" color="info" size="small" />
                )}
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Card>
                <CardContent>
                    {/* Filters */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                        <TextField
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ flexGrow: 1 }}
                            disabled={loading}
                        />
                        <FormControl sx={{ minWidth: 180 }}>
                            <InputLabel>Filter by Role</InputLabel>
                            <Select
                                value={roleFilter}
                                label="Filter by Role"
                                onChange={(e) => {
                                    setRoleFilter(e.target.value);
                                    setPage(0);
                                }}
                                disabled={loading}
                            >
                                <MenuItem value="All">All Roles</MenuItem>
                                <MenuItem value="Admin">Admin</MenuItem>
                                <MenuItem value="Manager">Manager</MenuItem>
                                <MenuItem value="Student">Student</MenuItem>
                                <MenuItem value="Donor">Donor</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>

                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress />
                        </Box>
                    )}

                    {/* Users Table */}
                    {!loading && (
                        <TableContainer 
                            sx={{ 
                                maxWidth: '100%',
                                overflowX: 'auto',
                                '& .MuiTable-root': {
                                    minWidth: isMobile ? 700 : 'auto',
                                }
                            }}
                        >
                            <Table size={isMobile ? 'small' : 'medium'}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                        <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Email</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 600, display: { xs: 'none', lg: 'table-cell' } }}>Created</TableCell>
                                        {canManage && <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={canManage ? 6 : 5} align="center" sx={{ py: 4 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {searchTerm || roleFilter !== 'All'
                                                        ? 'No users found matching your criteria'
                                                        : 'No users found'}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((user) => (
                                                <TableRow key={user.id} hover>
                                                    <TableCell>
                                                        <Box>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                                {user.firstName} {user.lastName}
                                                            </Typography>
                                                            <Typography 
                                                                variant="caption" 
                                                                color="text.secondary"
                                                                sx={{ display: { xs: 'block', md: 'none' } }}
                                                            >
                                                                {user.email}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                                        {user.email}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={user.role} 
                                                            color={getRoleColor(user.role)} 
                                                            size="small"
                                                            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={user.isActive ? 'Active' : 'Inactive'}
                                                            color={user.isActive ? 'success' : 'default'}
                                                            size="small"
                                                            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    {canManage && (
                                                        <TableCell align="right">
                                                            <Stack 
                                                                direction="row" 
                                                                spacing={0.5} 
                                                                justifyContent="flex-end"
                                                                sx={{ flexWrap: 'wrap', gap: { xs: 0.5, sm: 0 } }}
                                                            >
                                                                <Tooltip title="Edit">
                                                                    <IconButton 
                                                                        size="small" 
                                                                        onClick={() => handleOpenDialog(user)}
                                                                        sx={{ p: { xs: 0.5, sm: 1 } }}
                                                                    >
                                                                        <Edit fontSize={isMobile ? 'small' : 'medium'} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Reset Password">
                                                                    <IconButton 
                                                                        size="small" 
                                                                        onClick={() => handleOpenPasswordDialog(user)}
                                                                        sx={{ p: { xs: 0.5, sm: 1 } }}
                                                                    >
                                                                        <VpnKey fontSize={isMobile ? 'small' : 'medium'} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title={user.isActive ? 'Deactivate' : 'Activate'}>
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleToggleActive(user.id, user.isActive)}
                                                                        sx={{ p: { xs: 0.5, sm: 1 } }}
                                                                    >
                                                                        {user.isActive ? <LockOpen fontSize={isMobile ? 'small' : 'medium'} /> : <Lock fontSize={isMobile ? 'small' : 'medium'} />}
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Delete">
                                                                    <IconButton
                                                                        size="small"
                                                                        color="error"
                                                                        onClick={() => handleDeleteUser(user.id)}
                                                                        sx={{ p: { xs: 0.5, sm: 1 } }}
                                                                    >
                                                                        <Delete fontSize={isMobile ? 'small' : 'medium'} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Stack>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {!loading && (
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={filteredUsers.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(e, newPage) => setPage(newPage)}
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit User Dialog */}
            {canManage && (
                <>
                    <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                        <DialogTitle>{selectedUser ? 'Edit User' : 'Create New User'}</DialogTitle>
                        <DialogContent>
                            <Stack spacing={2} sx={{ mt: 2 }}>
                                <TextField
                                    label="First Name"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    fullWidth
                                    required
                                />
                                <TextField
                                    label="Last Name"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    fullWidth
                                    required
                                />
                                <TextField
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    fullWidth
                                    required
                                />
                                {!selectedUser && (
                                    <TextField
                                        label="Password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        fullWidth
                                        required
                                    />
                                )}
                                <FormControl fullWidth>
                                    <InputLabel>Role</InputLabel>
                                    <Select
                                        value={formData.role}
                                        label="Role"
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <MenuItem value="Admin">Admin</MenuItem>
                                        <MenuItem value="Manager">Manager</MenuItem>
                                        <MenuItem value="Student">Student</MenuItem>
                                        <MenuItem value="Donor">Donor</MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
                            <Button 
                                onClick={handleCloseDialog}
                                fullWidth={isMobile}
                                sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleSaveUser} 
                                variant="contained"
                                fullWidth={isMobile}
                                sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                            >
                                {selectedUser ? 'Update' : 'Create'}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Reset Password Dialog */}
                    <Dialog 
                        open={openPasswordDialog} 
                        onClose={() => setOpenPasswordDialog(false)} 
                        maxWidth="xs" 
                        fullWidth
                        fullScreen={isMobile}
                    >
                        <DialogTitle sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                            Reset Password
                        </DialogTitle>
                        <DialogContent>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Reset password for {selectedUser?.email}
                            </Typography>
                            <TextField
                                label="New Password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                fullWidth
                                required
                            />
                        </DialogContent>
                        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
                            <Button 
                                onClick={() => setOpenPasswordDialog(false)}
                                fullWidth={isMobile}
                                sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleResetPassword} 
                                variant="contained" 
                                color="primary"
                                fullWidth={isMobile}
                                sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                            >
                                Reset Password
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </Box>
    );
};

export default ManagerUsers;

