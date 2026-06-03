import { Grid, Typography, Card, CardContent, Button, List, ListItem, ListItemText } from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HistoryIcon from '@mui/icons-material/History';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { StatCard } from '@/components/common/StatCard';
import { LoadingState } from '@/components/common/LoadingState';
import type { PerformanceAnalytics, Test } from '@/types';
import { formatPercent } from '@/utils/format';

export function StudentDashboardPage() {
  const user = useAuthStore((s) => s.user)!;
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<PerformanceAnalytics | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAnalytics(user.id),
      api.listTests(true),
    ])
      .then(([a, t]) => {
        setAnalytics(a as PerformanceAnalytics);
        setTests((t as Test[]).slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, [user.id]);

  if (loading) return <LoadingState />;

  return (
    <>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Welcome, {user.name}
      </Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Tests Completed"
            value={analytics?.testsCompleted ?? 0}
            icon={<QuizIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Average Score"
            value={formatPercent(analytics?.averagePercentage ?? 0)}
            icon={<TrendingUpIcon />}
            color="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Best Score"
            value={formatPercent(analytics?.bestScore ?? 0)}
            icon={<HistoryIcon />}
            color="#22d3ee"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Available Tests
              </Typography>
              {tests.length === 0 ? (
                <Typography color="text.secondary">No tests available right now.</Typography>
              ) : (
                <List>
                  {tests.map((t) => (
                    <ListItem key={t.id} divider>
                      <ListItemText primary={t.title} secondary={`${t.duration} min · ${t.total_marks} marks`} />
                    </ListItem>
                  ))}
                </List>
              )}
              <Button sx={{ mt: 2 }} onClick={() => navigate('/student/tests')}>
                View All Tests
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Results
              </Typography>
              {(analytics?.recentResults ?? []).length === 0 ? (
                <Typography color="text.secondary">Take a test to see results here.</Typography>
              ) : (
                <List>
                  {analytics!.recentResults.slice(0, 5).map((r, i) => (
                    <ListItem key={i} divider>
                      <ListItemText
                        primary={r.testTitle}
                        secondary={formatPercent(r.percentage)}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
