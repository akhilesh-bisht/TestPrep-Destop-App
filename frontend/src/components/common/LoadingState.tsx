import { Box, CircularProgress, Typography } from '@mui/material';

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight={240}
      gap={2}
    >
      <CircularProgress size={40} />
      <Typography color="text.secondary">{message}</Typography>
    </Box>
  );
}
