import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography,
  IconButton, AppBar, Toolbar, useMediaQuery, useTheme, Divider, Button,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import CategoryIcon from '@mui/icons-material/Category';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CollectionsIcon from '@mui/icons-material/Collections';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { logoutAdmin } from '../utils/api';

const DRAWER_WIDTH = 260;

const navItems = [
  { to: '/admin', end: true, label: 'Dashboard', icon: <DashboardIcon /> },
  { to: '/admin/menu', label: 'Menu', icon: <RestaurantMenuIcon /> },
  { to: '/admin/categories', label: 'Categories', icon: <CategoryIcon /> },
  { to: '/admin/orders', label: 'Orders', icon: <ReceiptLongIcon /> },
  { to: '/admin/gallery', label: 'Gallery', icon: <CollectionsIcon /> },
  { to: '/admin/messages', label: 'Messages', icon: <MailOutlineIcon /> },
  { to: '/admin/media', label: 'Media Library', icon: <PhotoLibraryIcon /> },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch (_) {}
    navigate('/admin/login');
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#0B3D2E', color: '#F9F5ED' }}>
      <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(249,245,237,0.12)' }}>
        <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, fontSize: '1.35rem', letterSpacing: 1 }}>
          AL HAYAT
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>Admin Panel</Typography>
      </Box>
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: 'rgba(249,245,237,0.85)',
              '&.active': {
                bgcolor: 'rgba(212,160,23,0.2)',
                color: '#D4A017',
                '& .MuiListItemIcon-root': { color: '#D4A017' },
              },
              '&:hover': { bgcolor: 'rgba(249,245,237,0.08)' },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }} />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ borderColor: 'rgba(249,245,237,0.12)' }} />
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            color: 'rgba(249,245,237,0.8)',
            borderColor: 'rgba(249,245,237,0.25)',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { borderColor: '#D4A017', color: '#D4A017' },
          }}
          variant="outlined"
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F9F5ED' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'rgba(249,245,237,0.95)',
          backdropFilter: 'blur(10px)',
          color: '#0B3D2E',
          borderBottom: '1px solid rgba(11,61,46,0.08)',
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1, color: '#0B3D2E' }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 600, flex: 1 }}>
            Restaurant Management
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 0 },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 0 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px',
          p: { xs: 2, md: 3 },
          maxWidth: '100%',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
