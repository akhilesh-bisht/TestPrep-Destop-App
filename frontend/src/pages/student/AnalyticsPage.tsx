import { Card, CardContent, Grid, Typography, Box, LinearProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { StatCard } from '@/components/common/StatCard';
import { LoadingState } from '@/components/common/LoadingState';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AssignmentIcon from '@mui/icons-material/Assignment';
import type { PerformanceAnalytics } from '@/types';
import { formatPercent } from '@/utils/format';

export function AnalyticsPage() {
  const user = useAuthStore((s) => s.user)!;
  const [data, setData] = useState<PerformanceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAnalytics(user.id)
      .then((d) => setData(d as PerformanceAnalytics))
      .finally(() => setLoading(false));
  }, [user.id]);

  if (loading) return <LoadingState />;
  if (!data) return null;

  return (
    <>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Performance Analytics
      </Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Attempts" value={data.totalAttempts} icon={<AssignmentIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average"
            value={formatPercent(data.averagePercentage)}
            icon={<TrendingUpIcon />}
            color="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Best Score"
            value={formatPercent(data.bestScore)}
            icon={<EmojiEventsIcon />}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Tests Done" value={data.testsCompleted} icon={<AssignmentIcon />} color="#22d3ee" />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Performance by Test
          </Typography>
          {data.recentResults.length === 0 ? (
            <Typography color="text.secondary">No data yet.</Typography>
          ) : (
            data.recentResults.map((r, i) => (
              <Box key={i} mb={2}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2" fontWeight={600}>
                    {r.testTitle}
                  </Typography>
                  <Typography variant="body2">{formatPercent(r.percentage)}</Typography>
                </Box>
                <LinearProgress variant="determinate" value={r.percentage} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
}
