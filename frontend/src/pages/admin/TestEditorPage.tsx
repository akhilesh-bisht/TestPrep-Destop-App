import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { api } from '@/services/api';
import { LoadingState } from '@/components/common/LoadingState';
import { useToast } from '@/hooks/useToast';
import type { Question, Test } from '@/types';

interface QuestionForm {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  marks: number;
}

export function TestEditorPage() {
  const { testId } = useParams<{ testId: string }>();
  const id = Number(testId);
  const navigate = useNavigate();
  const toast = useToast();
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<QuestionForm>({
    defaultValues: {
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      marks: 1,
    },
  });

  const load = async () => {
    setLoading(true);
    try {
      const [t, q] = await Promise.all([api.getTest(id), api.getQuestions(id)]);
      setTest(t as Test);
      setQuestions(q as Question[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const onSubmit = async (data: QuestionForm) => {
    try {
      await api.addQuestion({
        testId: id,
        question: data.question,
        optionA: data.optionA,
        optionB: data.optionB,
        optionC: data.optionC,
        optionD: data.optionD,
        correctAnswer: data.correctAnswer,
        marks: Number(data.marks),
      });
      toast.success('Question added');
      setDialogOpen(false);
      reset();
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    }
  };

  const handleDelete = async (qId: number) => {
    if (!confirm('Delete this question?')) return;
    try {
      await api.deleteQuestion(qId);
      toast.success('Question deleted');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    }
  };

  const handleImport = async () => {
    try {
      const buffer = await api.openExcelFile();
      if (!buffer) return;
      const result = (await api.importQuestions(id, buffer)) as { imported: number };
      toast.success(`Imported ${result.imported} questions`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Import failed');
    }
  };

  if (loading) return <LoadingState />;
  if (!test) return null;

  return (
    <>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/admin/tests')}>
          <ArrowBackIcon />
        </IconButton>
        <Box flex={1}>
          <Typography variant="h5" fontWeight={700}>
            {test.title}
          </Typography>
          <Typography color="text.secondary">
            Question Bank · {questions.length} questions · {test.total_marks} marks
          </Typography>
        </Box>
        <Button startIcon={<UploadFileIcon />} onClick={handleImport}>
          Import Excel
        </Button>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Add MCQ
        </Button>
      </Box>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Question</TableCell>
              <TableCell>Answer</TableCell>
              <TableCell>Marks</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {questions.map((q, i) => (
              <TableRow key={q.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell sx={{ maxWidth: 400 }}>{q.question}</TableCell>
                <TableCell>{q.correct_answer}</TableCell>
                <TableCell>{q.marks}</TableCell>
                <TableCell align="right">
                  <IconButton color="error" onClick={() => handleDelete(q.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add MCQ Question</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Question" fullWidth multiline rows={2} required {...register('question')} />
            <TextField label="Option A" fullWidth required {...register('optionA')} />
            <TextField label="Option B" fullWidth required {...register('optionB')} />
            <TextField label="Option C" fullWidth required {...register('optionC')} />
            <TextField label="Option D" fullWidth required {...register('optionD')} />
            <Controller
              name="correctAnswer"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Correct Answer</InputLabel>
                  <Select label="Correct Answer" {...field}>
                    {(['A', 'B', 'C', 'D'] as const).map((o) => (
                      <MenuItem key={o} value={o}>
                        {o}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            <TextField label="Marks" type="number" fullWidth {...register('marks', { valueAsNumber: true })} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Add Question
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
