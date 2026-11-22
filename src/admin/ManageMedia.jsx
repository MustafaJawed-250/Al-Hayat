import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box, Typography, Button, Grid, Paper, Stack, Alert, CircularProgress, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select,
  MenuItem, Chip, IconButton, InputAdornment,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getMedia, uploadMedia, updateMedia, deleteMedia, updateSiteSetting } from '../utils/api';

const ASSIGNMENTS = [
  { value: 'unassigned', label: 'Unassigned' },
  { value: 'site-logo', label: 'Site logo' },
  { value: 'home-hero', label: 'Home hero' },
  { value: 'about-main', label: 'About main' },
  { value: 'menu-product', label: 'Menu product' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'other', label: 'Other' },
];

export default function ManageMedia() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [cloudinaryOk, setCloudinaryOk] = useState(true);
  const fileRef = useRef();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filter) params.assignment = filter;
      if (search.trim()) params.search = search.trim();
      const r = await getMedia(params);
      setItems(r.data?.data || []);
      setCloudinaryOk(r.data?.cloudinaryConfigured !== false);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load media');
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load]);

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('assignment', 'unassigned');
      const r = await uploadMedia(fd);
      setSuccess('Image uploaded');
      setItems((prev) => [r.data.data, ...prev]);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const saveAssignment = async () => {
    if (!selected) return;
    setUploading(true);
    try {
      const r = await updateMedia(selected._id, {
        assignment: selected.assignment,
        alt: selected.alt || '',
      });
      // Site settings also updated by backend for hero/about/logo
      if (['home-hero', 'about-main', 'site-logo'].includes(selected.assignment)) {
        await updateSiteSetting(selected.assignment, {
          url: selected.url,
          publicId: selected.publicId,
          mediaId: selected._id,
        });
      }
      setSuccess('Assignment saved — public site will use this image');
      setItems((prev) => prev.map((m) => (m._id === selected._id ? r.data.data : m)));
      setSelected(null);
    } catch (e) {
      setError(e.response?.data?.message || 'Save failed');
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this image from Cloudinary and the library?')) return;
    try {
      await deleteMedia(id);
      setItems((prev) => prev.filter((m) => m._id !== id));
      setSuccess('Deleted');
      if (selected?._id === id) setSelected(null);
    } catch (e) {
      setError(e.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={3} gap={2}>
        <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, color: '#0B3D2E' }}>
          Media Library
        </Typography>
        <Stack direction="row" spacing={1}>
          <IconButton onClick={load}><RefreshIcon /></IconButton>
          <Button
            variant="contained"
            component="label"
            startIcon={uploading ? <CircularProgress size={18} color="inherit" /> : <CloudUploadIcon />}
            disabled={uploading}
            sx={{ bgcolor: '#0B3D2E', textTransform: 'none', fontWeight: 700 }}
          >
            Upload image
            <input ref={fileRef} type="file" hidden accept="image/jpeg,image/png,image/webp,image/gif" onChange={onUpload} />
          </Button>
        </Stack>
      </Stack>

      {!cloudinaryOk && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Cloudinary is not configured on the server. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
        <TextField
          size="small"
          placeholder="Search filename or tags…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ minWidth: 220 }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Assignment</InputLabel>
          <Select label="Assignment" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {ASSIGNMENTS.map((a) => (
              <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {loading ? (
        <Box textAlign="center" py={6}><CircularProgress sx={{ color: '#0B3D2E' }} /></Box>
      ) : items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No images yet. Upload from your computer to get started.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {items.map((m) => (
            <Grid item xs={6} sm={4} md={3} key={m._id}>
              <Paper
                sx={{
                  overflow: 'hidden',
                  borderRadius: 2,
                  cursor: 'pointer',
                  border: selected?._id === m._id ? '2px solid #D4A017' : '2px solid transparent',
                }}
                onClick={() => setSelected({ ...m })}
              >
                <Box component="img" src={m.url} alt={m.alt || m.filename} sx={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
                <Box sx={{ p: 1.2 }}>
                  <Typography variant="caption" noWrap display="block">{m.filename || m.publicId}</Typography>
                  <Chip size="small" label={m.assignment} sx={{ mt: 0.5, height: 22, fontSize: 11 }} />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        {selected && (
          <>
            <DialogTitle>Edit image</DialogTitle>
            <DialogContent dividers>
              <Box component="img" src={selected.url} alt="" sx={{ width: '100%', maxHeight: 280, objectFit: 'contain', mb: 2, borderRadius: 1 }} />
              <TextField
                fullWidth
                label="Alt text"
                value={selected.alt || ''}
                onChange={(e) => setSelected({ ...selected, alt: e.target.value })}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth>
                <InputLabel>Assign to section</InputLabel>
                <Select
                  label="Assign to section"
                  value={selected.assignment || 'unassigned'}
                  onChange={(e) => setSelected({ ...selected, assignment: e.target.value })}
                >
                  {ASSIGNMENTS.map((a) => (
                    <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" display="block" mt={1.5}>
                Assigning to Home hero / About / Site logo updates the public website immediately.
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 1, wordBreak: 'break-all', opacity: 0.7 }}>
                {selected.url}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button color="error" startIcon={<DeleteIcon />} onClick={() => onDelete(selected._id)}>Delete</Button>
              <Box flex={1} />
              <Button onClick={() => setSelected(null)}>Cancel</Button>
              <Button variant="contained" onClick={saveAssignment} disabled={uploading} sx={{ bgcolor: '#0B3D2E' }}>
                Save assignment
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
