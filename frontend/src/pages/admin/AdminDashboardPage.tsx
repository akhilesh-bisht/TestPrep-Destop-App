import { Grid, Typography, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { StatCard } from '@/components/common/StatCard';
import { LoadingState } from '@/components/common/LoadingState';
import type { DashboardStats } from '@/types';
import { formatDate, formatPercent } from '@/utils/format';

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAdminStats()
      .then((d) => setStats(d as DashboardStats))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading dashboard..." />;
  if (!stats) return null;

  return (
    <>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Tests" value={stats.totalTests} icon={<QuizIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Students" value={stats.totalStudents} icon={<PeopleIcon />} color="#22d3ee" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Attempts" value={stats.totalAttempts} icon={<AssignmentIcon />} color="#f59e0b" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Score"
            value={formatPercent(stats.averageScore)}
            icon={<TrendingUpIcon />}
            color="#10b981"
          />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Attempts
          </Typography>
          {stats.recentAttempts.length === 0 ? (
            <Typography color="text.secondary">No attempts yet.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Test</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Completed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.recentAttempts.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.studentName}</TableCell>
                    <TableCell>{a.testTitle}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${a.score}/${formatPercent(a.percentage)}`}
                        size="small"
                        color={a.percentage >= 70 ? 'success' : a.percentage >= 50 ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{formatDate(a.completed_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
