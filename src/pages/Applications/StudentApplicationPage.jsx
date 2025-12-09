import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Stack,
    Stepper,
    Step,
    StepLabel,
    Grid,
    Alert,
    alpha,
    InputAdornment,
    Card,
    CardContent,
    IconButton,
} from '@mui/material';
import {
    Person,
    School,
    AttachMoney,
    CloudUpload,
    Delete,
} from '@mui/icons-material';
import { studentApplicationService } from '../../services/studentApplicationService';
import api from '../../services/api';

const steps = ['Personal Info', 'Family Background', 'Academic Info', 'Documents & Funding'];

const StudentApplicationPage = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [profileImageUrl, setProfileImageUrl] = useState('');
    const [documents, setDocuments] = useState([]);
    const [documentUrls, setDocumentUrls] = useState([]);
    const [galleryImages, setGalleryImages] = useState([]);
    const [galleryImageUrls, setGalleryImageUrls] = useState([]);
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, trigger, setValue, reset } = useForm();

    // Load rejected application data if exists
    useEffect(() => {
        const loadRejectedApplication = async () => {
            try {
                const data = await studentApplicationService.getMyApplication();
                if (data && data.status === 'Rejected') {
                    // Pre-fill form with rejected application data
                    setValue('fullName', data.fullName || '');
                    setValue('age', data.age || '');
                    setValue('placeOfBirth', data.placeOfBirth || '');
                    setValue('currentResidency', data.currentResidency || '');
                    setValue('email', data.email || '');
                    setValue('phoneNumber', data.phoneNumber || '');
                    setValue('fatherName', data.fatherName || '');
                    setValue('motherName', data.motherName || '');
                    setValue('parentsAnnualSalary', data.parentsAnnualSalary || '');
                    setValue('familySituation', data.familySituation || '');
                    setValue('personalStory', data.personalStory || '');
                    setValue('academicBackground', data.academicBackground || '');
                    setValue('currentEducationLevel', data.currentEducationLevel || '');
                    setValue('fieldOfStudy', data.fieldOfStudy || '');
                    setValue('dreamCareer', data.dreamCareer || '');
                    setValue('requestedFundingAmount', data.requestedFundingAmount || '');
                    setValue('fundingPurpose', data.fundingPurpose || '');
                    
                    // Load images and documents
                    if (data.profileImageUrl) {
                        setProfileImageUrl(data.profileImageUrl);
                    }
                    if (data.proofDocumentUrls && Array.isArray(data.proofDocumentUrls)) {
                        setDocumentUrls(data.proofDocumentUrls);
                    }
                    if (data.galleryImageUrls && Array.isArray(data.galleryImageUrls)) {
                        setGalleryImageUrls(data.galleryImageUrls);
                    }
                }
            } catch (error) {
                // No existing application or not rejected - that's fine
                console.log('No rejected application found or error loading:', error);
            }
        };
        loadRejectedApplication();
    }, [setValue]);

    const handleNext = async () => {
        const fields = getFieldsForStep(activeStep);
        const isValid = await trigger(fields);
        if (isValid) {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const getFieldsForStep = (step) => {
        switch (step) {
            case 0:
                return ['fullName', 'age', 'placeOfBirth', 'currentResidency', 'email', 'phoneNumber'];
            case 1:
                return ['fatherName', 'motherName', 'parentsAnnualSalary', 'familySituation'];
            case 2:
                return ['personalStory', 'academicBackground', 'currentEducationLevel', 'fieldOfStudy', 'dreamCareer'];
            case 3:
                return ['requestedFundingAmount', 'fundingPurpose'];
            default:
                return [];
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
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

        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await api.post('/fileupload/profile-picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setProfileImageUrl(response.data.url);
            setProfileImage(file);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to upload image');
        }
    };

    const handleDocumentUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            setError('Invalid file type. Allowed: PDF, JPG, PNG, DOC, DOCX');
            return;
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            setError('File size exceeds 10MB limit');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await api.post('/fileupload/document', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setDocumentUrls([...documentUrls, response.data.url]);
            setDocuments([...documents, file]);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to upload document');
        }
    };

    const removeDocument = (index) => {
        setDocuments(documents.filter((_, i) => i !== index));
        setDocumentUrls(documentUrls.filter((_, i) => i !== index));
    };

    const handleGalleryImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const validFiles = files.filter(file => {
            if (!allowedTypes.includes(file.type)) {
                setError('Only JPG and PNG images are allowed for gallery');
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('File size exceeds 5MB limit');
                return false;
            }
            return true;
        });

        for (const file of validFiles) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                const response = await api.post('/fileupload/profile-picture', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setGalleryImageUrls(prev => [...prev, response.data.url]);
                setGalleryImages(prev => [...prev, file]);
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to upload gallery image');
            }
        }
    };

    const removeGalleryImage = (index) => {
        setGalleryImages(galleryImages.filter((_, i) => i !== index));
        setGalleryImageUrls(galleryImageUrls.filter((_, i) => i !== index));
    };

    const onSubmit = async (data) => {
        try {
            setError('');
            setLoading(true);

            // Validate email format
            const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
            if (!emailRegex.test(data.email)) {
                setError('Please enter a valid email address');
                setLoading(false);
                return;
            }

            await studentApplicationService.submitApplication({
                ...data,
                email: data.email.trim().toLowerCase(),
                age: parseInt(data.age),
                parentsAnnualSalary: parseFloat(data.parentsAnnualSalary),
                requestedFundingAmount: parseFloat(data.requestedFundingAmount),
                profileImageUrl,
                proofDocumentUrls: documentUrls,
                galleryImageUrls: galleryImageUrls,
            });

            navigate('/student/dashboard');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 
                                err.response?.data?.errors?.join(', ') || 
                                'Failed to submit application';
            
            // Provide specific error messages
            if (errorMessage.toLowerCase().includes('email') && (errorMessage.toLowerCase().includes('exist') || errorMessage.toLowerCase().includes('already'))) {
                setError('This email address is already associated with an approved or posted application. Please use a different email address or contact support.');
            } else if (errorMessage.toLowerCase().includes('email')) {
                setError(`Email error: ${errorMessage}`);
            } else {
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Tell us about yourself
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                {...register('fullName', { required: 'Full name is required' })}
                                error={!!errors.fullName}
                                helperText={errors.fullName?.message}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Age"
                                type="number"
                                {...register('age', {
                                    required: 'Age is required',
                                    min: { value: 16, message: 'Must be at least 16 years old' },
                                })}
                                error={!!errors.age}
                                helperText={errors.age?.message}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Place of Birth"
                                {...register('placeOfBirth', { required: 'Place of birth is required' })}
                                error={!!errors.placeOfBirth}
                                helperText={errors.placeOfBirth?.message}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Current Residency"
                                {...register('currentResidency', { required: 'Current residency is required' })}
                                error={!!errors.currentResidency}
                                helperText={errors.currentResidency?.message}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Email Address"
                                type="email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email',
                                    },
                                })}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Phone Number"
                                {...register('phoneNumber')}
                            />
                        </Grid>
                    </Grid>
                );

            case 1:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Family Background
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Father's Name"
                                {...register('fatherName', { required: "Father's name is required" })}
                                error={!!errors.fatherName}
                                helperText={errors.fatherName?.message}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Mother's Name"
                                {...register('motherName', { required: "Mother's name is required" })}
                                error={!!errors.motherName}
                                helperText={errors.motherName?.message}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Parents' Annual Salary"
                                type="number"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                                {...register('parentsAnnualSalary', {
                                    required: "Parents' annual salary is required",
                                    min: { value: 0, message: 'Must be a positive number' },
                                })}
                                error={!!errors.parentsAnnualSalary}
                                helperText={errors.parentsAnnualSalary?.message}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Family Situation (Optional)"
                                multiline
                                rows={4}
                                {...register('familySituation')}
                                helperText="Describe your family's current situation"
                            />
                        </Grid>
                    </Grid>
                );

            case 2:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Academic Information
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Personal Story"
                                multiline
                                rows={6}
                                {...register('personalStory', {
                                    required: 'Personal story is required',
                                    minLength: { value: 100, message: 'Please write at least 100 characters' },
                                })}
                                error={!!errors.personalStory}
                                helperText={errors.personalStory?.message || 'Share your journey and why you need support (min 100 characters)'}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Academic Background"
                                multiline
                                rows={4}
                                {...register('academicBackground', {
                                    required: 'Academic background is required',
                                    minLength: { value: 50, message: 'Please write at least 50 characters' },
                                })}
                                error={!!errors.academicBackground}
                                helperText={errors.academicBackground?.message || 'Describe your education history'}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Current Education Level"
                                {...register('currentEducationLevel')}
                                helperText="e.g., High School, University Year 1"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Field of Study"
                                {...register('fieldOfStudy')}
                                helperText="e.g., Computer Science, Medicine"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Dream Career"
                                {...register('dreamCareer')}
                                helperText="What do you aspire to become?"
                            />
                        </Grid>
                    </Grid>
                );

            case 3:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Documents & Funding
                            </Typography>
                        </Grid>

                        {/* Profile Image */}
                        <Grid item xs={12}>
                            <Card variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                    Profile Photo
                                </Typography>
                                {profileImageUrl ? (
                                    <Box sx={{ textAlign: 'center' }}>
                                        <img
                                            src={profileImageUrl}
                                            alt="Profile"
                                            style={{ maxWidth: '200px', borderRadius: '8px' }}
                                        />
                                        <Button
                                            startIcon={<Delete />}
                                            onClick={() => {
                                                setProfileImage(null);
                                                setProfileImageUrl('');
                                            }}
                                            sx={{ mt: 2 }}
                                        >
                                            Remove
                                        </Button>
                                    </Box>
                                ) : (
                                    <Button
                                        component="label"
                                        variant="outlined"
                                        startIcon={<CloudUpload />}
                                        fullWidth
                                    >
                                        Upload Profile Photo
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                    </Button>
                                )}
                            </Card>
                        </Grid>

                        {/* My Gallery */}
                        <Grid item xs={12}>
                            <Card variant="outlined" sx={{ p: 2, bgcolor: 'primary.50' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                    My Gallery (Optional)
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Upload multiple images to showcase your journey, achievements, or daily life. These images will be visible to donors and can help increase support for your application.
                                </Typography>
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="gallery-upload"
                                    multiple
                                    type="file"
                                    onChange={handleGalleryImageUpload}
                                />
                                <label htmlFor="gallery-upload">
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        startIcon={<CloudUpload />}
                                        sx={{ mb: 2 }}
                                    >
                                        Upload Gallery Images
                                    </Button>
                                </label>
                                {galleryImageUrls.length > 0 && (
                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                        {galleryImageUrls.map((url, index) => (
                                            <Grid item xs={6} sm={4} md={3} key={index}>
                                                <Box sx={{ position: 'relative' }}>
                                                    <img
                                                        src={url}
                                                        alt={`Gallery ${index + 1}`}
                                                        style={{
                                                            width: '100%',
                                                            height: '150px',
                                                            objectFit: 'cover',
                                                            borderRadius: '8px',
                                                        }}
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => removeGalleryImage(index)}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 4,
                                                            right: 4,
                                                            bgcolor: 'error.main',
                                                            color: 'white',
                                                            '&:hover': { bgcolor: 'error.dark' },
                                                        }}
                                                    >
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}
                            </Card>
                        </Grid>

                        {/* Proof Documents */}
                        <Grid item xs={12}>
                            <Card variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                    Proof Documents
                                </Typography>
                                <Stack spacing={2}>
                                    {documents.map((doc, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                p: 1,
                                                bgcolor: alpha('#1976d2', 0.05),
                                                borderRadius: 1,
                                            }}
                                        >
                                            <Typography variant="body2">{doc.name}</Typography>
                                            <IconButton size="small" onClick={() => removeDocument(index)}>
                                                <Delete />
                                            </IconButton>
                                        </Box>
                                    ))}
                                    <Button
                                        component="label"
                                        variant="outlined"
                                        startIcon={<CloudUpload />}
                                        fullWidth
                                    >
                                        Add Document
                                        <input
                                            type="file"
                                            hidden
                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                            onChange={handleDocumentUpload}
                                        />
                                    </Button>
                                </Stack>
                            </Card>
                        </Grid>

                        {/* Funding */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Requested Funding Amount"
                                type="number"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                                {...register('requestedFundingAmount', {
                                    required: 'Funding amount is required',
                                    min: { value: 100, message: 'Minimum amount is $100' },
                                })}
                                error={!!errors.requestedFundingAmount}
                                helperText={errors.requestedFundingAmount?.message}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Funding Purpose"
                                multiline
                                rows={3}
                                {...register('fundingPurpose')}
                                helperText="How will you use the funds?"
                            />
                        </Grid>
                    </Grid>
                );

            default:
                return null;
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${alpha('#1976d2', 0.05)} 0%, ${alpha('#42a5f5', 0.05)} 100%)`,
                py: 4,
            }}
        >
            <Container maxWidth="md">
                <Paper elevation={0} sx={{ p: 4, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                    <Typography variant="h4" align="center" sx={{ fontWeight: 700, mb: 1 }}>
                        Student Application
                    </Typography>
                    <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
                        Complete all steps to submit your application for review
                    </Typography>

                    <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        {renderStepContent()}

                        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                            <Button
                                disabled={activeStep === 0}
                                onClick={handleBack}
                                sx={{ borderRadius: 2 }}
                            >
                                Back
                            </Button>
                            <Box sx={{ flex: 1 }} />
                            {activeStep === steps.length - 1 ? (
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                    sx={{ borderRadius: 2, px: 4 }}
                                >
                                    {loading ? 'Submitting...' : 'Submit Application'}
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={handleNext}
                                    sx={{ borderRadius: 2, px: 4 }}
                                >
                                    Next
                                </Button>
                            )}
                        </Stack>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default StudentApplicationPage;
