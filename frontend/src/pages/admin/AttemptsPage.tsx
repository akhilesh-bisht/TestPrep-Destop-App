import {
  Box,
  Card,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import AssignmentIcon from '@mui/icons-material/Assignment';
import type { Attempt } from '@/types';
import { formatDate, formatPercent } from '@/utils/format';

type AttemptRow = Attempt & { student_name: string; test_title: string };

export function AttemptsPage() {
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getAllAttempts()
      .then((d) => setAttempts((d as AttemptRow[]).filter((a) => a.status !== 'in_progress')))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  return (
    <>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/admin/dashboard')} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          Test Attempts & Results
        </Typography>
      </Box>
      {attempts.length === 0 ? (
        <Card>
          <EmptyState
            title="No completed attempts"
            description="Student results will appear here after tests are submitted."
            icon={<AssignmentIcon sx={{ fontSize: 48 }} />}
          />
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Test</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Correct / Wrong</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Completed</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attempts.map((a) => (
                <TableRow
                  key={a.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/student/result/${a.id}`)}
                >
                  <TableCell>{a.student_name}</TableCell>
                  <TableCell>{a.test_title}</TableCell>
                  <TableCell>
                    {a.score}/{a.total_marks} ({formatPercent(a.percentage)})
                  </TableCell>
                  <TableCell>
                    {a.correct_count} / {a.incorrect_count}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={a.status === 'auto_submitted' ? 'Auto-submitted' : 'Completed'}
                      size="small"
                      color={a.status === 'auto_submitted' ? 'warning' : 'success'}
                    />
                  </TableCell>
                  <TableCell>{formatDate(a.completed_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
}
