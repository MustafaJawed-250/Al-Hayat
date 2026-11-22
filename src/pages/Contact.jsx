import { useState } from 'react';
import {
  Box, Typography, Container, Grid, TextField, Button, Paper, Stack,
  Alert, CircularProgress,
} from '@mui/material';
import { sendMessage } from '../utils/api';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';

const initial = { name: '', email: '', phone: '', subject: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((er) => ({ ...er, [e.target.name]: '' }));
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = 'Name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = 'Valid email required';
    if (!form.subject.trim()) er.subject = 'Subject is required';
    if (!form.message.trim() || form.message.trim().length < 10) er.message = 'Please write a message (min 10 characters)';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    setSuccess(false);
    try {
      await sendMessage(form);
      setSuccess(true);
      setForm(initial);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#F9F5ED', minHeight: '80vh' }}>
      <Box
        sx={{
          bgcolor: '#0B3D2E',
          color: '#F9F5ED',
          py: { xs: 6, md: 8 },
          textAlign: 'center',
        }}
      >
        <Container>
          <Typography variant="overline" sx={{ color: '#D4A017', fontWeight: 700, letterSpacing: 3 }}>
            GET IN TOUCH
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700,
              fontSize: { xs: '2.2rem', md: '3rem' },
              mt: 1,
            }}
          >
            We would love to hear from you
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Grid container spacing={5}>
          <Grid item xs={12} md={5}>
            <Typography
              variant="h5"
              sx={{ fontFamily: '"Playfair Display", serif', color: '#0B3D2E', mb: 3 }}
            >
              Visit or call us
            </Typography>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box sx={{ mt: 0.3 }}><LocationOnOutlinedIcon sx={{ color: '#D4A017' }} /></Box>
                <Box>
                  <Typography fontWeight={700} color="#0B3D2E" fontSize="0.95rem">Address</Typography>
                  <Typography
                    component="a"
                    href="https://www.google.com/maps/search/?api=1&query=V2FH%2BPQ3%2C+Gule+Rana+Colony%2C+Soldier+Bazaar%2C+Karachi"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="body2"
                    sx={{ color: 'text.secondary', lineHeight: 1.7, textDecoration: 'none', display: 'block', whiteSpace: 'pre-line', '&:hover': { color: '#0B3D2E' } }}
                  >
                    {`V2FH+PQ3, Gule Rana Colony
Gul e Rana Colony, Soldier Bazaar
Karachi, Pakistan`}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box sx={{ mt: 0.3 }}><PhoneOutlinedIcon sx={{ color: '#D4A017' }} /></Box>
                <Box>
                  <Typography fontWeight={700} color="#0B3D2E" fontSize="0.95rem">Phone</Typography>
                  <Typography
                    component="a"
                    href="tel:03077622276"
                    variant="body2"
                    sx={{ color: 'text.secondary', fontWeight: 600, textDecoration: 'none', '&:hover': { color: '#0B3D2E' } }}
                  >
                    0307 7622276
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box sx={{ mt: 0.3 }}><AccessTimeOutlinedIcon sx={{ color: '#D4A017' }} /></Box>
                <Box>
                  <Typography fontWeight={700} color="#0B3D2E" fontSize="0.95rem">Price & rating</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                    {`PKR 1–1,000 per person
3.5 ★ (59 reviews)`}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1555939596-5761c9d0d0e0?w=700&q=80"
              alt="AL HAYAT grilled food"
              sx={{ width: '100%', borderRadius: 3, mt: 4, maxHeight: 220, objectFit: 'cover' }}
            />
          </Grid>

          <Grid item xs={12} md={7}>
            <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2} color="#0B3D2E">
                Send a message
              </Typography>
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Message sent successfully. We will get back to you soon.
                </Alert>
              )}
              {apiError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {apiError}
                </Alert>
              )}
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Your name *"
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      error={!!errors.name}
                      helperText={errors.name}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email *"
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
                      label="Phone"
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Subject *"
                      name="subject"
                      value={form.subject}
                      onChange={onChange}
                      error={!!errors.subject}
                      helperText={errors.subject}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message *"
                      name="message"
                      value={form.message}
                      onChange={onChange}
                      error={!!errors.message}
                      helperText={errors.message}
                      multiline
                      rows={5}
                    />
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    bgcolor: '#0B3D2E',
                    borderRadius: 50,
                    px: 5,
                    py: 1.4,
                    fontWeight: 700,
                    '&:hover': { bgcolor: '#0e4d3a' },
                  }}
                >
                  {loading ? <CircularProgress size={22} color="inherit" /> : 'Send message'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
