import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';

const DRAWER_WIDTH = 260;

export interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface SidebarProps {
  items: NavItem[];
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ items, mobileOpen, onMobileClose }: SidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <SchoolIcon color="primary" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
            TestPrep Pro
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Offline Desktop
          </Typography>
        </Box>
      </Box>
      <List sx={{ px: 1.5, flex: 1 }}>
        {items.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            end={item.path.endsWith('/dashboard') || item.path === '/student'}
            onClick={isMobile ? onMobileClose : undefined}
            sx={{
              mb: 0.5,
              borderRadius: 2,
              '&.active': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '& .MuiListItemIcon-root': { color: 'inherit' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
      >
        {drawer}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
      }}
    >
      {drawer}
    </Drawer>
  );
}

export const SIDEBAR_WIDTH = DRAWER_WIDTH;
