import { useState } from 'react';
import {
  Box, Typography, Container, Grid, TextField, Button, Paper, Stack,
  Divider, Alert, CircularProgress, List, ListItem, ListItemText,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { placeOrder } from '../utils/api';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const initial = {
  fullName: '',
  phone: '',
  email: '',
  city: '',
  address: '',
  notes: '',
};

export default function Checkout() {
  const { items, subtotal, deliveryCharge, total, clearCart } = useCart();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: '' }));
  };

  const validate = () => {
    const er = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) er.fullName = 'Full name is required';
    if (!form.phone.trim() || !/^[\d+\-\s]{10,15}$/.test(form.phone.replace(/\s/g, ''))) er.phone = 'Valid phone number required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = 'Valid email is required';
    if (!form.city.trim()) er.city = 'City is required';
    if (!form.address.trim() || form.address.trim().length < 8) er.address = 'Complete delivery address required';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) {
      setApiError('Your cart is empty');
      return;
    }
    setSubmitting(true);
    setApiError('');
    try {
      const payload = {
        customer: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          city: form.city.trim(),
          address: form.address.trim(),
          notes: form.notes.trim() || undefined,
        },
        items: items.map((i) => ({
          menuItem: i._id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
      };
      const res = await placeOrder(payload);
      const data = res.data?.data;
      setSuccess(data);
      clearCart();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ bgcolor: '#F9F5ED', minHeight: '70vh', py: 10 }}>
        <Container maxWidth="sm">
          <Paper sx={{ p: { xs: 3, md: 5 }, textAlign: 'center', borderRadius: 3 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 64, color: '#0B3D2E', mb: 2 }} />
            <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", serif', color: '#0B3D2E', mb: 1 }}>
              Order placed
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Thank you! Your order has been received. We will call you shortly to confirm.
            </Typography>
            <Box sx={{ bgcolor: 'rgba(11,61,46,0.06)', borderRadius: 2, p: 2, mb: 3, textAlign: 'left' }}>
              <Typography variant="body2" color="text.secondary">Order ID</Typography>
              <Typography fontWeight={700} fontSize="1.2rem" color="#0B3D2E">{success.orderId}</Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>Total</Typography>
              <Typography fontWeight={700}>PKR {success.total}</Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>Status</Typography>
              <Typography fontWeight={600}>{success.status}</Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button component={Link} to="/menu" variant="contained" sx={{ bgcolor: '#0B3D2E', borderRadius: 50 }}>
                Back to menu
              </Button>
              <Button component={Link} to="/" variant="outlined" sx={{ borderColor: '#0B3D2E', color: '#0B3D2E', borderRadius: 50 }}>
                Home
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box sx={{ bgcolor: '#F9F5ED', minHeight: '60vh', py: 10, textAlign: 'center' }}>
        <Container>
          <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", serif', color: '#0B3D2E', mb: 2 }}>
            Your cart is empty
          </Typography>
          <Button component={Link} to="/menu" variant="contained" sx={{ bgcolor: '#0B3D2E', borderRadius: 50, mt: 2 }}>
            Browse menu
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F9F5ED', minHeight: '80vh', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          sx={{
            fontFamily: '"Playfair Display", serif',
            color: '#0B3D2E',
            mb: 4,
            fontSize: { xs: '1.8rem', md: '2.4rem' },
          }}
        >
          Checkout
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2} color="#0B3D2E">
                Delivery details
              </Typography>
              {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full name *"
                      name="fullName"
                      value={form.fullName}
                      onChange={onChange}
                      error={!!errors.fullName}
                      helperText={errors.fullName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone *"
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                      error={!!errors.phone}
                      helperText={errors.phone}
                      placeholder="03XX XXXXXXX"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email (optional)"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={onChange}
                      error={!!errors.email}
                      helperText={errors.email}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="City *"
                      name="city"
                      value={form.city}
                      onChange={onChange}
                      error={!!errors.city}
                      helperText={errors.city}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Complete delivery address *"
                      name="address"
                      value={form.address}
                      onChange={onChange}
                      error={!!errors.address}
                      helperText={errors.address}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Order notes (optional)"
                      name="notes"
                      value={form.notes}
                      onChange={onChange}
                      multiline
                      rows={2}
                      placeholder="e.g. extra spicy, no onions…"
                    />
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={submitting}
                  sx={{
                    mt: 3,
                    bgcolor: '#0B3D2E',
                    borderRadius: 50,
                    py: 1.5,
                    fontWeight: 700,
                    fontSize: '1rem',
                    '&:hover': { bgcolor: '#0e4d3a' },
                  }}
                >
                  {submitting ? <CircularProgress size={24} color="inherit" /> : `Place order · PKR ${total}`}
                </Button>
                <Typography variant="caption" display="block" textAlign="center" mt={1.5} color="text.secondary">
                  Payment: Cash on Delivery (COD)
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, position: 'sticky', top: 88 }}>
              <Typography variant="h6" fontWeight={700} mb={2} color="#0B3D2E">
                Order summary
              </Typography>
              <List dense disablePadding>
                {items.map((item) => (
                  <ListItem key={item._id} disableGutters sx={{ py: 1 }}>
                    <ListItemText
                      primary={`${item.name} × ${item.quantity}`}
                      secondary={`PKR ${item.price} each`}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }}
                    />
                    <Typography fontWeight={600}>PKR {item.price * item.quantity}</Typography>
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Subtotal</Typography>
                  <Typography>PKR {subtotal}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Delivery</Typography>
                  <Typography>PKR {deliveryCharge}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontWeight={700} fontSize="1.1rem">
                    Total
                  </Typography>
                  <Typography fontWeight={700} fontSize="1.1rem" color="#0B3D2E">
                    PKR {total}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
