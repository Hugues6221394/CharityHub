import { useState } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Button,
    Stack,
    Typography,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    IconButton,
} from '@mui/material';
import {
    Description,
    PictureAsPdf,
    Image,
    InsertDriveFile,
    Close,
    Download,
    Visibility,
} from '@mui/icons-material';

const DocumentViewer = ({ documents = [], title = "Documents" }) => {
    const [previewDoc, setPreviewDoc] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    const getFileIcon = (url) => {
        const extension = url.split('.').pop()?.toLowerCase();
        if (extension === 'pdf') return <PictureAsPdf color="error" />;
        if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) return <Image color="primary" />;
        return <InsertDriveFile color="action" />;
    };

    const getFileType = (url) => {
        const extension = url.split('.').pop()?.toLowerCase();
        return extension?.toUpperCase() || 'FILE';
    };

    const handlePreview = (docUrl) => {
        setPreviewDoc(docUrl);
        setPreviewOpen(true);
    };

    const handleClosePreview = () => {
        setPreviewOpen(false);
        setPreviewDoc(null);
    };

    if (!documents || documents.length === 0) {
        return (
            <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    No documents uploaded
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <Box sx={{ mb: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {title} ({documents.length} {documents.length === 1 ? 'document' : 'documents'})
                    </Typography>
                    <Chip label={`${documents.length} files`} size="small" color="secondary" />
                </Stack>
                <Grid container spacing={2}>
                    {documents.map((docUrl, idx) => (
                        <Grid item xs={12} sm={6} md={4} key={idx}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    '&:hover': {
                                        boxShadow: 6,
                                        transform: 'translateY(-2px)',
                                    },
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                        <Box sx={{ fontSize: 40 }}>
                                            {getFileIcon(docUrl)}
                                        </Box>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                Document {idx + 1}
                                            </Typography>
                                            <Chip label={getFileType(docUrl)} size="small" sx={{ mt: 0.5 }} />
                                        </Box>
                                    </Stack>
                                    <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<Visibility />}
                                            onClick={() => handlePreview(docUrl)}
                                            fullWidth
                                        >
                                            Preview
                                        </Button>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={<Download />}
                                            component="a"
                                            href={docUrl}
                                            download
                                            target="_blank"
                                            fullWidth
                                        >
                                            Download
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Document Preview Dialog */}
            <Dialog
                open={previewOpen}
                onClose={handleClosePreview}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Document Preview</Typography>
                        <IconButton onClick={handleClosePreview}>
                            <Close />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    {previewDoc && (
                        <Box sx={{ mt: 2 }}>
                            {previewDoc.toLowerCase().endsWith('.pdf') ? (
                                <iframe
                                    src={previewDoc}
                                    style={{
                                        width: '100%',
                                        height: '70vh',
                                        border: 'none',
                                    }}
                                    title="Document Preview"
                                />
                            ) : ['jpg', 'jpeg', 'png', 'gif'].includes(previewDoc.split('.').pop()?.toLowerCase() || '') ? (
                                <Box
                                    component="img"
                                    src={previewDoc}
                                    alt="Document Preview"
                                    sx={{
                                        width: '100%',
                                        maxHeight: '70vh',
                                        objectFit: 'contain',
                                    }}
                                />
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                        Preview not available for this file type
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<Download />}
                                        component="a"
                                        href={previewDoc}
                                        download
                                        target="_blank"
                                    >
                                        Download to View
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePreview}>Close</Button>
                    <Button
                        variant="contained"
                        startIcon={<Download />}
                        component="a"
                        href={previewDoc || ''}
                        download
                        target="_blank"
                    >
                        Download
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DocumentViewer;

