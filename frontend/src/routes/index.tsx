import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import QuizIcon from '@mui/icons-material/Quiz';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HistoryIcon from '@mui/icons-material/History';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { TestsManagePage } from '@/pages/admin/TestsManagePage';
import { TestEditorPage } from '@/pages/admin/TestEditorPage';
import { AttemptsPage } from '@/pages/admin/AttemptsPage';
import { StudentDashboardPage } from '@/pages/student/StudentDashboardPage';
import { AvailableTestsPage } from '@/pages/student/AvailableTestsPage';
import { ExamPage } from '@/pages/student/ExamPage';
import { ResultPage } from '@/pages/student/ResultPage';
import { HistoryPage } from '@/pages/student/HistoryPage';
import { AnalyticsPage } from '@/pages/student/AnalyticsPage';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuthStore } from '@/store/authStore';

const adminNav = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
  { label: 'Tests', path: '/admin/tests', icon: <QuizIcon /> },
  { label: 'Attempts', path: '/admin/attempts', icon: <AssignmentIcon /> },
];

const studentNav = [
  { label: 'Dashboard', path: '/student/dashboard', icon: <DashboardIcon /> },
  { label: 'Tests', path: '/student/tests', icon: <QuizIcon /> },
  { label: 'History', path: '/student/history', icon: <HistoryIcon /> },
  { label: 'Analytics', path: '/student/analytics', icon: <AnalyticsIcon /> },
];

function RootRedirect() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Navigate
      to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
      replace
    />
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RootRedirect />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AppLayout navItems={adminNav} />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="tests" element={<TestsManagePage />} />
        <Route path="tests/:testId" element={<TestEditorPage />} />
        <Route path="attempts" element={<AttemptsPage />} />
      </Route>

      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <AppLayout navItems={studentNav} />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboardPage />} />
        <Route path="tests" element={<AvailableTestsPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>

      <Route
        path="/student/exam/:attemptId"
        element={
          <ProtectedRoute role="student">
            <ExamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/result/:attemptId"
        element={
          <ProtectedRoute>
            <ResultPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
