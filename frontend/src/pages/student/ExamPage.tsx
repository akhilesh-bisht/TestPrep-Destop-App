import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TimerIcon from '@mui/icons-material/Timer';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/services/api';
import { useExamStore } from '@/store/examStore';
import { useToast } from '@/hooks/useToast';
import { formatTimer } from '@/utils/format';
import { LoadingState } from '@/components/common/LoadingState';

export function ExamPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const id = Number(attemptId);
  const navigate = useNavigate();
  const toast = useToast();
  const theme = useTheme();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    attempt,
    test,
    questions,
    answers,
    currentIndex,
    timeLeftSeconds,
    setSession,
    setAnswer,
    setCurrentIndex,
    setTimeLeft,
    reset,
  } = useExamStore();

  const loadSession = useCallback(async () => {
    try {
      const data = await api.getAttemptSession(id);
      const session = data as {
        attempt: import('@/types').Attempt;
        test: import('@/types').Test;
        questions: import('@/types').Question[];
        answers: Array<{ questionId: number; selectedAnswer: string | null }>;
      };
      if (session.attempt.status !== 'in_progress') {
        navigate(`/student/result/${id}`);
        return;
      }
      const answersMap: Record<number, string | null> = {};
      session.answers.forEach((a) => {
        answersMap[a.questionId] = a.selectedAnswer;
      });
      const started = new Date(session.attempt.started_at).getTime();
      const elapsed = Math.floor((Date.now() - started) / 1000);
      const total = session.test.duration * 60;
      const remaining = Math.max(0, total - elapsed);

      setSession({
        attempt: session.attempt,
        test: session.test,
        questions: session.questions,
        answers: answersMap,
        timeLeftSeconds: remaining,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load exam');
      navigate('/student/tests');
    }
  }, [id, navigate, setSession, toast]);

  useEffect(() => {
    if (!attempt || attempt.id !== id) loadSession();
  }, [attempt, id, loadSession]);

  const submit = useCallback(
    async (autoSubmit = false) => {
      if (submitting) return;
      setSubmitting(true);
      try {
        await api.submitAttempt(id, autoSubmit);
        reset();
        toast.success(
          autoSubmit ? 'Time expired — test auto-submitted' : 'Test submitted successfully'
        );
        navigate(`/student/result/${id}`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Submit failed');
        setSubmitting(false);
      }
    },
    [id, navigate, reset, submitting, toast]
  );

  useEffect(() => {
    if (!attempt) return;

    timerRef.current = setInterval(() => {
      const left = useExamStore.getState().timeLeftSeconds;
      if (left <= 1) {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeLeft(0);
        submit(true);
      } else {
        setTimeLeft(left - 1);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [attempt?.id, setTimeLeft, submit]);

  const saveCurrentAnswer = async (questionId: number, value: string) => {
    setAnswer(questionId, value);
    try {
      await api.saveAnswer({
        attemptId: id,
        questionId,
        selectedAnswer: value as 'A' | 'B' | 'C' | 'D',
      });
    } catch {
      /* silent — local state kept */
    }
  };

  if (!attempt || !test || questions.length === 0) {
    return <LoadingState message="Preparing exam..." />;
  }

  const q = questions[currentIndex];
  const options = [
    { key: 'A', text: q.option_a },
    { key: 'B', text: q.option_b },
    { key: 'C', text: q.option_c },
    { key: 'D', text: q.option_d },
  ];
  const answeredCount = Object.values(answers).filter(Boolean).length;
  const isLowTime = timeLeftSeconds < 300;

  return (
    <Box minHeight="100vh" bgcolor="background.default" p={2}>
      <Box maxWidth={1200} mx="auto">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/student/tests')}
              variant="text"
              size="small"
            >
              Back
            </Button>
            <Typography variant="h6" fontWeight={700}>
              {test.title}
            </Typography>
          </Box>
          <Chip
            icon={<TimerIcon />}
            label={formatTimer(timeLeftSeconds)}
            color={isLowTime ? 'error' : 'primary'}
            sx={{ fontWeight: 700, fontSize: '1rem', px: 1 }}
          />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Card sx={{ position: { md: 'sticky' }, top: 16 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Navigation
                </Typography>
                <Typography variant="body2" mb={2}>
                  {answeredCount}/{questions.length} answered
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {questions.map((ques, idx) => {
                    const answered = !!answers[ques.id];
                    const active = idx === currentIndex;
                    return (
                      <Button
                        key={ques.id}
                        size="small"
                        variant={active ? 'contained' : answered ? 'outlined' : 'text'}
                        color={answered ? 'success' : 'inherit'}
                        onClick={() => setCurrentIndex(idx)}
                        sx={{ minWidth: 36, p: 0.5 }}
                      >
                        {idx + 1}
                      </Button>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={9}>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Question {currentIndex + 1} of {questions.length} · {q.marks} marks
                </Typography>
                <Typography variant="h6" fontWeight={600} my={2}>
                  {q.question}
                </Typography>
                <RadioGroup
                  value={answers[q.id] ?? ''}
                  onChange={(e) => saveCurrentAnswer(q.id, e.target.value)}
                >
                  {options.map((opt) => (
                    <FormControlLabel
                      key={opt.key}
                      value={opt.key}
                      control={<Radio />}
                      label={`${opt.key}. ${opt.text}`}
                      sx={{
                        mb: 1,
                        mx: 0,
                        px: 2,
                        py: 1.5,
                        borderRadius: 2,
                        border: 1,
                        borderColor: 'divider',
                        width: '100%',
                        bgcolor:
                          answers[q.id] === opt.key
                            ? alpha(theme.palette.primary.main, 0.12)
                            : 'transparent',
                      }}
                    />
                  ))}
                </RadioGroup>

                <Box display="flex" justifyContent="space-between" mt={3}>
                  <Button
                    startIcon={<ArrowBackIcon />}
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(currentIndex - 1)}
                  >
                    Previous
                  </Button>
                  {currentIndex < questions.length - 1 ? (
                    <Button
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => setCurrentIndex(currentIndex + 1)}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => setConfirmOpen(true)}
                    >
                      Submit Test
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Submit Test?</DialogTitle>
        <DialogContent>
          <Typography>
            You have answered {answeredCount} of {questions.length} questions. This cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => submit(false)} disabled={submitting}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
