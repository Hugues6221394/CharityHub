import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import HomePage from './pages/Home/HomePage';
import AboutUsPage from './pages/Home/AboutUsPage';
import ContactUsPage from './pages/Home/ContactUsPage';
import StaffPage from './pages/Home/StaffPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import StudentRegisterPage from './pages/Auth/StudentRegisterPage';
import DonorRegisterPage from './pages/Auth/DonorRegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import BrowseStudentsPage from './pages/Students/BrowseStudentsPage';
import StudentDetailsPage from './pages/Students/StudentDetailsPage';
import StudentApplicationPage from './pages/Applications/StudentApplicationPage';
import StudentDashboard from './pages/Dashboard/StudentDashboard';
import DonorDashboard from './pages/Dashboard/DonorDashboard';


// Admin Components
import AdminLayout from './components/Admin/AdminLayout';
import AdminDashboardOverview from './pages/Admin/AdminDashboardOverview';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminStudents from './pages/Admin/AdminStudents';
import AdminStudentsByStatus from './pages/Admin/AdminStudentsByStatus';
import ManagerStudentsByStatus from './pages/Manager/ManagerStudentsByStatus';
import AdminStudentDetail from './pages/Admin/AdminStudentDetail';
import AdminApplications from './pages/Admin/AdminApplications';
import AdminDonations from './pages/Admin/AdminDonations';
import AdminMessages from './pages/Admin/AdminMessages';
import AdminAnalytics from './pages/Admin/AdminAnalytics';
import AdminReports from './pages/Admin/AdminReports';
import AdminSettings from './pages/Admin/AdminSettings';
import AdminProgress from './pages/Admin/AdminProgress';
import AdminPermissions from './pages/Admin/AdminPermissions';
import ProfileSettings from './components/ProfileSettings';

// Manager Components
import ManagerLayout from './components/Manager/ManagerLayout';
import ManagerUsers from './pages/Manager/ManagerUsers';
import ManagerDashboard from './pages/Manager/ManagerDashboard';
import ManagerApplications from './pages/Manager/ManagerApplications';
import ManagerMessages from './pages/Manager/ManagerMessages';
import ManagerStudents from './pages/Manager/ManagerStudents';
import ManagerStudentDetail from './pages/Manager/ManagerStudentDetail';
import ManagerProgress from './pages/Manager/ManagerProgress';

// Student Components
import StudentLayout from './components/Student/StudentLayout';
import StudentDonors from './pages/Student/StudentDonors';
import ProgressTracking from './pages/Student/ProgressTracking';
import ApplicationTracking from './pages/Student/ApplicationTracking';

// Donor Components
import DonorLayout from './components/Donor/DonorLayout';
import DonorMyStudents from './pages/Donor/DonorMyStudents';
import DonorMyDonations from './pages/Donor/DonorMyDonations';
import DonorProgress from './pages/Donor/DonorProgress';

// Universal Components
import MessagesPage from './components/MessagesPage';
import NotificationsPage from './components/NotificationsPage';
import ImageViewer from './pages/Common/ImageViewer';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Professional blue
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2e7d32', // Professional green (changed from pink for better harmony)
      light: '#4caf50',
      dark: '#1b5e20',
      contrastText: '#ffffff',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
    },
    background: {
      default: '#f8f9fa', // Softer, more modern background
      paper: '#ffffff',
    },
    text: {
      primary: '#212529', // Better contrast
      secondary: '#6c757d',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: '#212529',
    },
    h2: {
      fontWeight: 600,
      color: '#212529',
    },
    h3: {
      fontWeight: 600,
      color: '#212529',
    },
    h4: {
      fontWeight: 600,
      color: '#212529',
    },
    h5: {
      fontWeight: 600,
      color: '#212529',
    },
    h6: {
      fontWeight: 600,
      color: '#212529',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 4px 8px rgba(0,0,0,0.08)',
    '0px 6px 12px rgba(0,0,0,0.1)',
    '0px 8px 16px rgba(0,0,0,0.12)',
    '0px 10px 20px rgba(0,0,0,0.15)',
    '0px 12px 24px rgba(0,0,0,0.18)',
    '0px 14px 28px rgba(0,0,0,0.2)',
    '0px 16px 32px rgba(0,0,0,0.22)',
    '0px 18px 36px rgba(0,0,0,0.24)',
    '0px 20px 40px rgba(0,0,0,0.26)',
    '0px 22px 44px rgba(0,0,0,0.28)',
    '0px 24px 48px rgba(0,0,0,0.3)',
    '0px 26px 52px rgba(0,0,0,0.32)',
    '0px 28px 56px rgba(0,0,0,0.34)',
    '0px 30px 60px rgba(0,0,0,0.36)',
    '0px 32px 64px rgba(0,0,0,0.38)',
    '0px 34px 68px rgba(0,0,0,0.4)',
    '0px 36px 72px rgba(0,0,0,0.42)',
    '0px 38px 76px rgba(0,0,0,0.44)',
    '0px 40px 80px rgba(0,0,0,0.46)',
    '0px 42px 84px rgba(0,0,0,0.48)',
    '0px 44px 88px rgba(0,0,0,0.5)',
    '0px 46px 92px rgba(0,0,0,0.52)',
    '0px 48px 96px rgba(0,0,0,0.54)',
  ],
  components: {
    MuiContainer: {
      defaultProps: {
        maxWidth: 'lg',
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 20px',
        },
        contained: {
          boxShadow: '0px 2px 8px rgba(25, 118, 210, 0.3)',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(25, 118, 210, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 4px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#212529',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.08)',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/contact" element={<ContactUsPage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register/student" element={<StudentRegisterPage />} />
            <Route path="/register/donor" element={<DonorRegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/students" element={<BrowseStudentsPage />} />
            <Route path="/students/:id" element={<StudentDetailsPage />} />
            <Route path="/image/:imagePath" element={<ImageViewer />} />

            // This file contains the updated routes section for App.jsx
            // Replace lines 120-204 in App.jsx with this content

            {/* Student Application Route (outside layout) */}
            <Route
              path="/student/application"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <StudentApplicationPage />
                </ProtectedRoute>
              }
            />

            {/* Manager Routes with Layout */}
            <Route
              path="/manager"
              element={
                <ProtectedRoute allowedRoles={['Manager']}>
                  <ManagerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<ManagerDashboard />} />
              <Route path="users" element={<ManagerUsers />} />
              <Route path="applications" element={<ManagerApplications />} />
              <Route path="students" element={<ManagerStudents />} />
              <Route path="students/:id" element={<ManagerStudentDetail />} />
              <Route path="students/by-status" element={<ManagerStudentsByStatus />} />
              <Route path="progress" element={<ManagerProgress />} />
              <Route path="reports" element={<ManagerDashboard />} />
              <Route path="messages" element={<ManagerMessages />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<ProfileSettings />} />
            </Route>

            {/* Student Routes with Layout */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="application-tracking" element={<ApplicationTracking />} />
              <Route path="progress" element={<ProgressTracking />} />
              <Route path="donors" element={<StudentDonors />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<ProfileSettings />} />
            </Route>

            {/* Donor Routes with Layout */}
            <Route
              path="/donor"
              element={
                <ProtectedRoute allowedRoles={['Donor']}>
                  <DonorLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DonorDashboard />} />
              <Route path="students" element={<DonorMyStudents />} />
              <Route path="donations" element={<DonorMyDonations />} />
              <Route path="progress" element={<DonorProgress />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<ProfileSettings />} />
            </Route>

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboardOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="applications" element={<AdminApplications />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="students/:id" element={<AdminStudentDetail />} />
              <Route path="students/by-status" element={<AdminStudentsByStatus />} />
              <Route path="donations" element={<AdminDonations />} />
              <Route path="progress" element={<AdminProgress />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="permissions" element={<AdminPermissions />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<ProfileSettings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />


            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
