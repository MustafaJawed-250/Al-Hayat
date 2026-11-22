import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Box, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Badge, Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { useCart } from '../hooks/useCart';
import Logo from "./Logo.jsx";

const links = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/about', label: 'About' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar({ onCartOpen }) {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const location = useLocation();

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'rgba(6, 26, 20, 0.96)',
          backdropFilter: 'blur(12px)',
          color: '#F9F5ED',
          borderBottom: '1px solid rgba(212,160,23,0.15)',
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            maxWidth: 1200,
            width: '100%',
            mx: 'auto',
            py: 0.5,
            minHeight: { xs: 64, sm: 72 },
          }}
        >
          <Logo variant="navbar" />

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
            {links.map((l) => (
              <Button
                key={l.to}
                component={Link}
                to={l.to}
                sx={{
                  color: location.pathname === l.to ? '#D4A017' : 'rgba(249,245,237,0.9)',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  borderBottom: location.pathname === l.to ? '2px solid #D4A017' : '2px solid transparent',
                  borderRadius: 0,
                  px: 1.5,
                  '&:hover': { color: '#D4A017', bgcolor: 'transparent' },
                }}
              >
                {l.label}
              </Button>
            ))}
            <Button
              onClick={onCartOpen}
              startIcon={
                <Badge badgeContent={count} sx={{ '& .MuiBadge-badge': { bgcolor: '#D4A017', color: '#1a1a1a' } }}>
                  <ShoppingBagOutlinedIcon sx={{ color: 'inherit' }} />
                </Badge>
              }
              sx={{
                ml: 1,
                color: '#1a1a1a',
                bgcolor: '#D4A017',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: 50,
                px: 2,
                '&:hover': { bgcolor: '#c49215' },
              }}
            >
              My Cart
            </Button>
          </Box>

          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 0.5 }}>
            <IconButton onClick={onCartOpen} aria-label="Cart" sx={{ color: '#F9F5ED' }}>
              <Badge badgeContent={count} sx={{ '& .MuiBadge-badge': { bgcolor: '#D4A017', color: '#1a1a1a' } }}>
                <ShoppingBagOutlinedIcon />
              </Badge>
            </IconButton>
            <IconButton onClick={() => setOpen(true)} sx={{ color: '#F9F5ED' }} aria-label="Menu">
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { bgcolor: '#0B3D2E', color: '#F9F5ED', width: 280 } }}
      >
        <Box sx={{ p: 2 }}>
          <Logo variant="footer" to="/" />
        </Box>
        <List sx={{ pt: 1 }}>
          {links.map((l) => (
            <ListItem key={l.to} disablePadding>
              <ListItemButton
                component={Link}
                to={l.to}
                onClick={() => setOpen(false)}
                sx={{
                  color: location.pathname === l.to ? '#D4A017' : '#F9F5ED',
                  fontWeight: 600,
                }}
              >
                <ListItemText primary={l.label} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>
          ))}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                setOpen(false);
                onCartOpen();
              }}
            >
              <ListItemText primary={`My Cart (${count})`} primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
}
