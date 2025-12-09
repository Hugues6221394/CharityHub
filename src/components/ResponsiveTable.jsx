import { useMediaQuery, useTheme } from '@mui/material';
import { Box, Card, CardContent, Typography, Chip, Stack, Divider } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

/**
 * Responsive Table Component
 * Displays as a table on desktop/tablet, and as cards on mobile
 */
export const ResponsiveTable = ({ 
    columns = [], 
    data = [], 
    renderRowActions,
    emptyMessage = 'No data available',
    getRowKey = (row, index) => row.id || index,
    sx = {}
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    if (isMobile) {
        // Mobile: Card-based layout
        if (data.length === 0) {
            return (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        {emptyMessage}
                    </Typography>
                </Box>
            );
        }

        return (
            <Stack spacing={2} sx={sx}>
                {data.map((row, index) => (
                    <Card key={getRowKey(row, index)} elevation={2}>
                        <CardContent>
                            <Stack spacing={1.5}>
                                {columns.map((col) => {
                                    const value = col.render ? col.render(row) : row[col.field];
                                    if (col.hideOnMobile) return null;
                                    
                                    return (
                                        <Box key={col.field}>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                {col.label}:
                                            </Typography>
                                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                {value}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                                {renderRowActions && (
                                    <>
                                        <Divider sx={{ my: 1 }} />
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                            {renderRowActions(row)}
                                        </Box>
                                    </>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        );
    }

    // Desktop: Table layout
    return (
        <TableContainer sx={sx}>
            <Table>
                <TableHead>
                    <TableRow>
                        {columns.map((col) => (
                            <TableCell key={col.field} align={col.align || 'left'}>
                                {col.label}
                            </TableCell>
                        ))}
                        {renderRowActions && <TableCell align="right">Actions</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={columns.length + (renderRowActions ? 1 : 0)} align="center" sx={{ py: 4 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {emptyMessage}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((row, index) => (
                            <TableRow key={getRowKey(row, index)} hover>
                                {columns.map((col) => {
                                    const value = col.render ? col.render(row) : row[col.field];
                                    return (
                                        <TableCell key={col.field} align={col.align || 'left'}>
                                            {value}
                                        </TableCell>
                                    );
                                })}
                                {renderRowActions && (
                                    <TableCell align="right">
                                        {renderRowActions(row)}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

