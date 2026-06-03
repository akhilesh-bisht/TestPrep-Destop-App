import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <Box textAlign="center" py={6} px={2}>
      {icon && (
        <Box mb={2} color="text.secondary" display="flex" justifyContent="center">
          {icon}
        </Box>
      )}
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography color="text.secondary" mb={2}>
          {description}
        </Typography>
      )}
      {action}
    </Box>
  );
}
