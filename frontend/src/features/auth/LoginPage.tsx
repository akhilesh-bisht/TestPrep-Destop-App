import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  Tab,
  Tabs,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useToast } from '@/hooks/useToast';
import type { User, UserRole } from '@/types';

interface LoginForm {
  email: string;
  password: string;
}

export function LoginPage() {
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const { mode, toggleMode } = useThemeStore();
  const toast = useToast();
  const theme = useTheme();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const user = (await api.login({ ...data, role })) as User;
      setUser(user);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${theme.palette.background.default} 50%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
      }}
    >
      <IconButton
        onClick={toggleMode}
        sx={{ position: 'fixed', top: 16, right: 16 }}
        color="inherit"
      >
        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
      <Container maxWidth="sm">
        <Card
          component={motion.div}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{ overflow: 'visible' }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box textAlign="center" mb={3}>
              <SchoolIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h4" fontWeight={700} gutterBottom>
                TestPrep Pro
              </Typography>
              <Typography color="text.secondary">
                Offline-first test preparation — sign in to continue
              </Typography>
            </Box>

            <Tabs
              value={role}
              onChange={(_, v) => setRole(v)}
              variant="fullWidth"
              sx={{ mb: 3 }}
            >
              <Tab
                value="student"
                label="Student"
                icon={<PersonIcon />}
                iconPosition="start"
              />
              <Tab
                value="admin"
                label="Admin"
                icon={<AdminPanelSettingsIcon />}
                iconPosition="start"
              />
            </Tabs>

            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              display="flex"
              flexDirection="column"
              gap={2}
            >
              <TextField
                label="Email"
                type="email"
                fullWidth
                {...register('email', { required: true })}
                placeholder={role === 'admin' ? 'admin@testprep.com' : 'student@testprep.com'}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                {...register('password', { required: true })}
              />
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Box>

            <Box mt={3} p={2} bgcolor="action.hover" borderRadius={2}>
              <Typography variant="caption" color="text.secondary" display="block">
                Demo credentials:
              </Typography>
              <Typography variant="body2">
                Admin: admin@testprep.com / admin123
              </Typography>
              <Typography variant="body2">
                Student: student@testprep.com / student123
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
