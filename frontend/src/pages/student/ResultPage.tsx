import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  LinearProgress,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { LoadingState } from '@/components/common/LoadingState';
import type { ResultSummary } from '@/types';
import { formatPercent } from '@/utils/format';

export function ResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const id = Number(attemptId);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const theme = useTheme();
  const [result, setResult] = useState<ResultSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getResult(id)
      .then((d) => setResult(d as ResultSummary))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingState message="Loading results..." />;
  if (!result) return null;

  const backPath = user?.role === 'admin' ? '/admin/attempts' : '/student/history';

  return (
    <Box maxWidth={900} mx="auto" p={3}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate(backPath)} size="small">
          <ArrowBackIcon />
        </IconButton>
      </Box>
      <Card
        component={motion.div}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        sx={{ mb: 3, textAlign: 'center' }}
      >
        <CardContent sx={{ py: 4 }}>
          <Typography variant="overline" color="text.secondary">
            {result.test.title}
          </Typography>
          <Typography variant="h3" fontWeight={800} color="primary.main" my={1}>
            {formatPercent(result.percentage)}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Score: {result.score} / {result.totalMarks}
          </Typography>
          {result.attempt.status === 'auto_submitted' && (
            <Chip label="Auto-submitted (time expired)" color="warning" sx={{ mt: 2 }} />
          )}
          <LinearProgress
            variant="determinate"
            value={result.percentage}
            sx={{ mt: 3, height: 10, borderRadius: 5 }}
          />
        </CardContent>
      </Card>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight={700}>
                {result.correctCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Correct
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CancelIcon color="error" sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight={700}>
                {result.incorrectCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Incorrect
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <HelpOutlineIcon sx={{ fontSize: 32, color: 'text.secondary' }} />
              <Typography variant="h5" fontWeight={700}>
                {result.unansweredCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unanswered
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight={600} mb={2}>
        Answer Review
      </Typography>
      {result.answers.map((a, i) => (
        <Card key={a.question.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" gap={1} alignItems="flex-start" mb={1}>
              <Chip
                size="small"
                label={a.isCorrect ? 'Correct' : a.selectedAnswer ? 'Wrong' : 'Skipped'}
                color={a.isCorrect ? 'success' : a.selectedAnswer ? 'error' : 'default'}
              />
              <Typography fontWeight={600} flex={1}>
                Q{i + 1}. {a.question.question}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                bgcolor: alpha(
                  a.isCorrect ? theme.palette.success.main : theme.palette.error.main,
                  0.08
                ),
                p: 1.5,
                borderRadius: 1,
              }}
            >
              Your answer: {a.selectedAnswer ?? '—'} · Correct: {a.question.correct_answer}
            </Typography>
          </CardContent>
        </Card>
      ))}

      <Button variant="contained" onClick={() => navigate(backPath)}>
        Back
      </Button>
    </Box>
  );
}
