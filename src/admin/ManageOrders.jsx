import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, MenuItem, Stack, Alert, CircularProgress, Button, Divider, InputAdornment,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { getOrders, confirmOrder } from '../utils/api';

const statusColor = { New: 'warning', Confirmed: 'success' };

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      const r = await getOrders(params);
      setOrders(r.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load]);

  const handleConfirm = async () => {
    if (!confirmTarget) return;
    setUpdating(true);
    setError('');
    try {
      const r = await confirmOrder(confirmTarget._id || confirmTarget.orderId);
      const updated = r.data?.data;
      setSuccess(`Order ${confirmTarget.orderId} confirmed${r.data?.email === 'sent' ? ' — customer email sent' : ''}`);
      setOrders((prev) =>
        prev.map((o) => (o._id === confirmTarget._id ? { ...o, ...updated, status: 'Confirmed' } : o))
      );
      if (selected?._id === confirmTarget._id) setSelected({ ...selected, ...updated, status: 'Confirmed' });
      setConfirmTarget(null);
    } catch (e) {
      setError(e.response?.data?.message || 'Confirmation failed');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={3} gap={2}>
        <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, color: '#0B3D2E' }}>
          Orders
        </Typography>
        <IconButton onClick={load} aria-label="Refresh"><RefreshIcon /></IconButton>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <TextField
          size="small"
          placeholder="Search order ID, name, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ minWidth: 240 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="New">New</MenuItem>
            <MenuItem value="Confirmed">Confirmed</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {loading ? (
        <Box textAlign="center" py={6}><CircularProgress sx={{ color: '#0B3D2E' }} /></Box>
      ) : orders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No orders found.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#F9F5ED' }}>
                <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Total</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o._id} hover>
                  <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{o.orderId}</TableCell>
                  <TableCell>{o.customer?.fullName}</TableCell>
                  <TableCell>{o.customer?.phone}</TableCell>
                  <TableCell align="right">Rs. {Number(o.total).toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip size="small" label={o.status} color={statusColor[o.status] || 'default'} />
                  </TableCell>
                  <TableCell>{o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      {o.status === 'New' && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CheckCircleOutlineIcon />}
                          onClick={() => setConfirmTarget(o)}
                          sx={{ bgcolor: '#0B3D2E', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#0e4d3a' } }}
                        >
                          Confirm Order
                        </Button>
                      )}
                      <IconButton size="small" onClick={() => setSelected(o)} aria-label="View">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Detail dialog */}
      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        {selected && (
          <>
            <DialogTitle sx={{ fontFamily: '"Playfair Display", serif' }}>
              Order {selected.orderId}
              <Chip size="small" label={selected.status} color={statusColor[selected.status]} sx={{ ml: 1.5 }} />
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="subtitle2" color="text.secondary">Customer</Typography>
              <Typography>{selected.customer?.fullName}</Typography>
              <Typography variant="body2">{selected.customer?.phone} · {selected.customer?.email}</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selected.customer?.address}, {selected.customer?.city}
              </Typography>
              {selected.customer?.notes && (
                <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>Notes: {selected.customer.notes}</Typography>
              )}
              <Divider sx={{ my: 1.5 }} />
              {(selected.items || []).map((it, i) => (
                <Stack key={i} direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
                  <Typography variant="body2">
                    {it.quantity}× {it.name}{it.variantName ? ` (${it.variantName})` : ''}
                  </Typography>
                  <Typography variant="body2">Rs. {(it.price * it.quantity).toFixed(2)}</Typography>
                </Stack>
              ))}
              <Divider sx={{ my: 1.5 }} />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Subtotal</Typography>
                <Typography variant="body2">Rs. {Number(selected.subtotal).toFixed(2)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Delivery</Typography>
                <Typography variant="body2">Rs. {Number(selected.deliveryCharge).toFixed(2)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" mt={1}>
                <Typography fontWeight={700}>Total</Typography>
                <Typography fontWeight={700}>Rs. {Number(selected.total).toFixed(2)}</Typography>
              </Stack>
              {selected.confirmedAt && (
                <Typography variant="caption" color="text.secondary" display="block" mt={2}>
                  Confirmed at {new Date(selected.confirmedAt).toLocaleString()}
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              {selected.status === 'New' && (
                <Button
                  variant="contained"
                  onClick={() => { setConfirmTarget(selected); }}
                  sx={{ bgcolor: '#0B3D2E', textTransform: 'none', fontWeight: 700 }}
                >
                  Confirm Order
                </Button>
              )}
              <Button onClick={() => setSelected(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Confirm dialog */}
      <Dialog open={Boolean(confirmTarget)} onClose={() => !updating && setConfirmTarget(null)}>
        <DialogTitle>Are you sure you want to confirm this order?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Order <strong>{confirmTarget?.orderId}</strong> for {confirmTarget?.customer?.fullName}.
            A confirmation email will be sent to <strong>{confirmTarget?.customer?.email}</strong>.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmTarget(null)} disabled={updating}>Go Back</Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={updating}
            sx={{ bgcolor: '#0B3D2E', textTransform: 'none', fontWeight: 700 }}
          >
            {updating ? <CircularProgress size={22} color="inherit" /> : 'Yes, Confirm Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
