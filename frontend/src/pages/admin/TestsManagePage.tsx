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
import UploadFileIcon from '@mui/icons-material/UploadFile';
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
  const [importMode, setImportMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ArrayBuffer | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const navigate = useNavigate();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const { register, handleSubmit, reset, setValue, getValues } = useForm<TestForm>({
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
    setImportMode(false);
    reset({ title: '', description: '', duration: 60, isPublished: false });
    setDialogOpen(true);
  };

  const openCreateFromExcel = () => {
    setEditing(null);
    setImportMode(true);
    setSelectedFile(null);
    setSelectedFileName('');
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

  const handleSelectExcelFile = async () => {
    try {
      const buffer = await api.openExcelFile();
      if (buffer) {
        setSelectedFile(buffer);
        // Extract filename from file picker or use a default
        setSelectedFileName('Excel file selected');
      }
    } catch (e) {
      toast.error('Failed to select file');
    }
  };

  const handleCreateFromExcel = async () => {
    if (!selectedFile) {
      toast.error('Please select an Excel file');
      return;
    }
    try {
      const values = getValues();
      const payload = {
        title: values.title,
        description: values.description,
        duration: Number(values.duration),
        isPublished: values.isPublished === true || String(values.isPublished) === 'true',
      };
      const result = (await api.createTestWithExcel(payload, selectedFile, user?.id)) as {
        test: Test;
        imported: number;
      };
      toast.success(`Created test and imported ${result.imported} questions`);
      setDialogOpen(false);
      setSelectedFile(null);
      setSelectedFileName('');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create test from Excel');
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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={1}
      >
        <Typography variant="h5" fontWeight={700}>
          Manage Tests
        </Typography>
        <Box display="flex" gap={1}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Create Test
          </Button>
          <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={openCreateFromExcel}>
            Create from Excel
          </Button>
        </Box>
      </Box>

      {tests.length === 0 ? (
        <Card>
          <EmptyState
            title="No tests yet"
            description="Create your first test to get started."
            icon={<QuizIcon sx={{ fontSize: 48 }} />}
            action={
              <Box display="flex" gap={1} flexWrap="wrap">
                <Button variant="contained" onClick={openCreate}>
                  Create Test
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<UploadFileIcon />}
                  onClick={openCreateFromExcel}
                >
                  Create from Excel
                </Button>
              </Box>
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

      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedFile(null);
          setSelectedFileName('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editing ? 'Edit Test' : importMode ? 'Create Test from Excel' : 'Create Test'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {importMode && (
              <Box
                sx={{
                  p: 2,
                  border: '2px dashed',
                  borderColor: selectedFile ? 'success.main' : 'divider',
                  borderRadius: 1,
                  textAlign: 'center',
                  backgroundColor: selectedFile ? 'success.light' : 'action.hover',
                }}
              >
                {selectedFile ? (
                  <>
                    <Typography variant="body2" color="success.dark" fontWeight={600}>
                      ✓ {selectedFileName}
                    </Typography>
                    <Button size="small" onClick={handleSelectExcelFile} sx={{ mt: 1 }}>
                      Change File
                    </Button>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Select an Excel file (.xlsx, .xls, or .csv) with your questions
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<UploadFileIcon />}
                      onClick={handleSelectExcelFile}
                    >
                      Select File
                    </Button>
                  </>
                )}
              </Box>
            )}
            <TextField label="Title" fullWidth required {...register('title')} />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              {...register('description')}
            />
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
            {importMode ? (
              <Button
                type="button"
                variant="contained"
                onClick={handleCreateFromExcel}
                disabled={!selectedFile}
              >
                Create & Import
              </Button>
            ) : (
              <Button type="submit" variant="contained">
                {editing ? 'Save' : 'Create'}
              </Button>
            )}
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
