import { Box } from '@mui/material';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, type NavItem, SIDEBAR_WIDTH } from './Sidebar';
import { TopNavbar } from './TopNavbar';

interface AppLayoutProps {
  navItems: NavItem[];
  title?: string;
}

export function AppLayout({ navItems, title = 'Dashboard' }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box display="flex" minHeight="100vh" bgcolor="background.default">
      <Sidebar
        items={navItems}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Box
        component="main"
        flex={1}
        sx={{ width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` }, minWidth: 0 }}
      >
        <TopNavbar title={title} onMenuClick={() => setMobileOpen(true)} />
        <Box p={{ xs: 2, md: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
