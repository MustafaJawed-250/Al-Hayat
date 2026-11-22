import { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Paper, CircularProgress, Alert, Stack, Chip, List, ListItem, ListItemText,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { getStats } from '../utils/api';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TodayIcon from '@mui/icons-material/Today';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import CategoryIcon from '@mui/icons-material/Category';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

const cardSx = {
  p: 2.5,
  borderRadius: 3,
  height: '100%',
  boxShadow: '0 8px 28px rgba(11,61,46,0.06)',
  border: '1px solid rgba(11,61,46,0.06)',
  bgcolor: '#fff',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 32px rgba(11,61,46,0.1)' },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getStats()
      .then((r) => setStats(r.data?.data))
      .catch((e) => setError(e.response?.data?.message || 'Failed to load statistics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress sx={{ color: '#0B3D2E' }} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const cards = [
    { label: 'Total Orders', value: stats?.totalOrders ?? 0, icon: <ReceiptLongIcon sx={{ color: '#0B3D2E' }} />, to: '/admin/orders' },
    { label: "Today's Orders", value: stats?.todayOrders ?? 0, icon: <TodayIcon sx={{ color: '#D4A017' }} />, to: '/admin/orders' },
    { label: 'Pending (New)', value: stats?.newOrders ?? 0, icon: <PendingActionsIcon sx={{ color: '#c45c26' }} />, to: '/admin/orders' },
    { label: 'Revenue', value: `PKR ${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: <AttachMoneyIcon sx={{ color: '#0B3D2E' }} />, to: '/admin/orders' },
    { label: 'Menu Items', value: stats?.totalProducts ?? 0, icon: <RestaurantMenuIcon sx={{ color: '#0B3D2E' }} />, to: '/admin/menu' },
    { label: 'Categories', value: stats?.totalCategories ?? 0, icon: <CategoryIcon sx={{ color: '#0B3D2E' }} />, to: '/admin/categories' },
    { label: 'Unread Messages', value: stats?.unreadMessages ?? 0, icon: <MailOutlineIcon sx={{ color: '#D4A017' }} />, to: '/admin/messages' },
  ];

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ fontFamily: '"Playfair Display", serif', color: '#0B3D2E', mb: 0.5, fontWeight: 700 }}
      >
        Dashboard
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Live overview of AL HAYAT operations
      </Typography>

      <Grid container spacing={2.5}>
        {cards.map((c) => (
          <Grid item xs={6} sm={4} md={3} key={c.label}>
            <Paper
              component={RouterLink}
              to={c.to}
              sx={{ ...cardSx, textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} mb={0.5}>
                    {c.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="#0B3D2E">
                    {c.value}
                  </Typography>
                </Box>
                {c.icon}
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {stats?.popularDishes?.length > 0 && (
        <Paper sx={{ ...cardSx, mt: 3 }}>
          <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", serif', color: '#0B3D2E', mb: 2 }}>
            Popular dishes
          </Typography>
          <List dense disablePadding>
            {stats.popularDishes.map((d, i) => (
              <ListItem key={d._id || i} disableGutters sx={{ py: 0.75, borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                <ListItemText
                  primary={d._id || 'Unknown'}
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
                <Chip label={`${d.count} sold`} size="small" sx={{ bgcolor: 'rgba(11,61,46,0.08)', fontWeight: 600 }} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
