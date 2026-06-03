import {
  Box,
  Card,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  IconButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import HistoryIcon from '@mui/icons-material/History';
import type { Attempt } from '@/types';
import { formatDate, formatPercent } from '@/utils/format';

export function HistoryPage() {
  const user = useAuthStore((s) => s.user)!;
  const [history, setHistory] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getUserHistory(user.id)
      .then((d) => setHistory(d as Attempt[]))
      .finally(() => setLoading(false));
  }, [user.id]);

  if (loading) return <LoadingState />;

  return (
    <>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/student/dashboard')} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          Test History
        </Typography>
      </Box>
      {history.length === 0 ? (
        <Card>
          <EmptyState
            title="No test history"
            description="Completed tests will appear here."
            icon={<HistoryIcon sx={{ fontSize: 48 }} />}
          />
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Test ID</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Percentage</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Completed</TableCell>
                <TableCell align="right">View</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>Test #{a.test_id}</TableCell>
                  <TableCell>
                    {a.score}/{a.total_marks}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={formatPercent(a.percentage)}
                      size="small"
                      color={a.percentage >= 70 ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{a.status}</TableCell>
                  <TableCell>{formatDate(a.completed_at)}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => navigate(`/student/result/${a.id}`)}>
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
}
