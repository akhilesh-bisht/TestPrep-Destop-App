import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '@/services/api';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import QuizIcon from '@mui/icons-material/Quiz';
import { useToast } from '@/hooks/useToast';
import { useAuthStore } from '@/store/authStore';
import type { Test } from '@/types';
import { formatDuration } from '@/utils/format';

interface TestForm {
  title: string;
  description: string;
  duration: number;
  isPublished: boolean;
}

export function TestsManagePage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Test | null>(null);
  const navigate = useNavigate();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const { register, handleSubmit, reset, setValue } = useForm<TestForm>({
    defaultValues: { title: '', description: '', duration: 60, isPublished: false },
  });

  const load = () => {
    setLoading(true);
    api
      .listTests()
      .then((d) => setTests(d as Test[]))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const openCreate = () => {
    setEditing(null);
    reset({ title: '', description: '', duration: 60, isPublished: false });
    setDialogOpen(true);
  };

  const openEdit = (test: Test) => {
    setEditing(test);
    setValue('title', test.title);
    setValue('description', test.description ?? '');
    setValue('duration', test.duration);
    setValue('isPublished', !!test.is_published);
    setDialogOpen(true);
  };

  const onSubmit = async (data: TestForm) => {
    try {
      const payload = {
        title: data.title,
        description: data.description,
        duration: Number(data.duration),
        isPublished: data.isPublished === true || String(data.isPublished) === 'true',
      };
      if (editing) {
        await api.updateTest(editing.id, payload);
        toast.success('Test updated');
      } else {
        await api.createTest(payload, user?.id);
        toast.success('Test created');
      }
      setDialogOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this test and all questions?')) return;
    try {
      await api.deleteTest(id);
      toast.success('Test deleted');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    }
  };

  if (loading) return <LoadingState />;

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Manage Tests
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Create Test
        </Button>
      </Box>

      {tests.length === 0 ? (
        <Card>
          <EmptyState
            title="No tests yet"
            description="Create your first test to get started."
            icon={<QuizIcon sx={{ fontSize: 48 }} />}
            action={
              <Button variant="contained" onClick={openCreate}>
                Create Test
              </Button>
            }
          />
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Marks</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tests.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{t.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t.description?.slice(0, 60)}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDuration(t.duration)}</TableCell>
                  <TableCell>{t.total_marks}</TableCell>
                  <TableCell>
                    <Chip
                      label={t.is_published ? 'Published' : 'Draft'}
                      color={t.is_published ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => navigate(`/admin/tests/${t.id}`)} title="Questions">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => openEdit(t)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(t.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Test' : 'Create Test'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Title" fullWidth required {...register('title')} />
            <TextField label="Description" fullWidth multiline rows={3} {...register('description')} />
            <TextField
              label="Duration (minutes)"
              type="number"
              fullWidth
              required
              {...register('duration', { valueAsNumber: true })}
            />
            <TextField
              select
              label="Status"
              fullWidth
              SelectProps={{ native: true }}
              {...register('isPublished')}
              defaultValue="false"
            >
              <option value="false">Draft</option>
              <option value="true">Published</option>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editing ? 'Save' : 'Create'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
