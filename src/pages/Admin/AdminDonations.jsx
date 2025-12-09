import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    TextField,
    InputAdornment,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    Search,
    Visibility,
    CheckCircle,
    Cancel,
    Pending,
} from '@mui/icons-material';
import api from '../../services/api';

const AdminDonations = () => {
    const [donations, setDonations] = useState([]);
    const [filteredDonations, setFilteredDonations] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        fetchDonations();
    }, []);

    useEffect(() => {
        filterDonations();
    }, [donations, searchTerm, statusFilter]);

    const fetchDonations = async () => {
        try {
            const response = await api.get('/donations/statistics');
            const stats = response.data;
            // Use recentDonations from statistics
            const donationsData = (stats.recentDonations || []).map(donation => ({
                id: donation.id,
                donorName: donation.donorName || 'Anonymous',
                studentName: donation.studentName || 'Unknown',
                amount: donation.amount,
                status: 'Completed',
                paymentMethod: 'Unknown',
                date: donation.completedAt || donation.date,
            }));
            setDonations(donationsData);
        } catch (error) {
            console.error('Error fetching donations:', error);
        }
    };

    const filterDonations = () => {
        let filtered = donations;

        if (searchTerm) {
            filtered = filtered.filter(
                (donation) =>
                    donation.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    donation.studentName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'All') {
            filtered = filtered.filter((donation) => donation.status === statusFilter);
        }

        setFilteredDonations(filtered);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'success';
            case 'Pending': return 'warning';
            case 'Failed': return 'error';
            default: return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed': return <CheckCircle fontSize="small" />;
            case 'Pending': return <Pending fontSize="small" />;
            case 'Failed': return <Cancel fontSize="small" />;
            default: return null;
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                Donation Management
            </Typography>

            <Card>
                <CardContent>
                    {/* Filters */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                        <TextField
                            placeholder="Search by donor or student..."
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
                        />
                        <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Status"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="All">All Status</MenuItem>
                                <MenuItem value="Completed">Completed</MenuItem>
                                <MenuItem value="Pending">Pending</MenuItem>
                                <MenuItem value="Failed">Failed</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>

                    {/* Donations Table */}
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Donor</TableCell>
                                    <TableCell>Student</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Payment Method</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredDonations
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((donation) => (
                                        <TableRow key={donation.id} hover>
                                            <TableCell>
                                                <Typography variant="subtitle2">{donation.donorName}</Typography>
                                            </TableCell>
                                            <TableCell>{donation.studentName}</TableCell>
                                            <TableCell>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    ${donation.amount}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{donation.paymentMethod}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={donation.status}
                                                    color={getStatusColor(donation.status)}
                                                    size="small"
                                                    icon={getStatusIcon(donation.status)}
                                                />
                                            </TableCell>
                                            <TableCell>{new Date(donation.date).toLocaleDateString()}</TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="View Details">
                                                    <IconButton size="small">
                                                        <Visibility fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredDonations.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                    />
                </CardContent>
            </Card>
        </Box>
    );
};

export default AdminDonations;
