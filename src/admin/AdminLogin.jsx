import { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Paper } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { loginAdmin } from '../utils/api';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginAdmin(password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={2}
      sx={{ bgcolor: '#F9F5ED' }}
    >
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%', borderRadius: 3, boxShadow: '0 16px 48px rgba(11,61,46,0.1)' }}>
        <Typography
          variant="h5"
          sx={{ fontFamily: '"Playfair Display", serif', color: '#0B3D2E', fontWeight: 700, mb: 0.5 }}
        >
          AL HAYAT Admin
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Enter your admin password to continue
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handle}>
          <TextField
            fullWidth
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            sx={{ mb: 2 }}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: '#0B3D2E',
              py: 1.3,
              fontWeight: 700,
              borderRadius: 2,
              '&:hover': { bgcolor: '#0e4d3a' },
            }}
          >
            {loading ? 'Signing in…' : 'Login'}
          </Button>
        </form>
        <Button component={Link} to="/" fullWidth sx={{ mt: 2, color: '#0B3D2E', textTransform: 'none' }}>
          ← Back to website
        </Button>
      </Paper>
    </Box>
  );
}
