import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Typography,
  Chip,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useExamStore } from '@/store/examStore';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import QuizIcon from '@mui/icons-material/Quiz';
import { useToast } from '@/hooks/useToast';
import type { Attempt, Test } from '@/types';
import { formatDuration } from '@/utils/format';

export function AvailableTestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<number | null>(null);
  const user = useAuthStore((s) => s.user)!;
  const setSession = useExamStore((s) => s.setSession);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    api
      .listTests(true)
      .then((d) => setTests(d as Test[]))
      .finally(() => setLoading(false));
  }, []);

  const startTest = async (testId: number) => {
    setStarting(testId);
    try {
      const attempt = (await api.startAttempt(user.id, testId)) as Attempt;
      const data = (await api.getAttemptSession(attempt.id)) as {
        attempt: Attempt;
        test: Test;
        questions: import('@/types').Question[];
        answers: Array<{ questionId: number; selectedAnswer: string | null }>;
      };

      const answersMap: Record<number, string | null> = {};
      data.answers.forEach((a) => {
        answersMap[a.questionId] = a.selectedAnswer;
      });

      setSession({
        attempt: data.attempt,
        test: data.test,
        questions: data.questions,
        answers: answersMap,
        timeLeftSeconds: data.test.duration * 60,
      });
      navigate(`/student/exam/${attempt.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not start test');
    } finally {
      setStarting(null);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Available Tests
      </Typography>
      {tests.length === 0 ? (
        <Card>
          <EmptyState
            title="No tests available"
            description="Check back later when your instructor publishes tests."
            icon={<QuizIcon sx={{ fontSize: 48 }} />}
          />
        </Card>
      ) : (
        <Grid container spacing={3}>
          {tests.map((t, i) => (
            <Grid item xs={12} sm={6} md={4} key={t.id}>
              <Card
                component={motion.div}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Chip label="Published" color="success" size="small" />
                    <Typography variant="caption" color="text.secondary">
                      {t.total_marks} marks
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {t.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {t.description || 'No description'}
                  </Typography>
                  <Typography variant="body2">
                    Duration: {formatDuration(t.duration)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    disabled={starting === t.id}
                    onClick={() => startTest(t.id)}
                  >
                    {starting === t.id ? 'Starting...' : 'Start Test'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
}
