import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, Grid, Paper, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Stack, Alert, CircularProgress, Card, CardMedia, CardActions, CardContent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getGallery, adminAddGallery, adminUpdateGallery, adminDeleteGallery } from '../utils/api';

const empty = { image: '', caption: '', order: 0 };

export default function ManageGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getGallery();
      setImages(r.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setFormErrors({});
    setDialogOpen(true);
  };

  const openEdit = (img) => {
    setEditing(img);
    setForm({
      image: img.image || '',
      caption: img.caption || '',
      order: img.order ?? 0,
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const validate = () => {
    const er = {};
    if (!form.image.trim()) er.image = 'Image URL is required';
    setFormErrors(er);
    return Object.keys(er).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        image: form.image.trim(),
        caption: form.caption.trim(),
        order: Number(form.order) || 0,
      };
      if (editing) {
        await adminUpdateGallery(editing._id, payload);
        setSuccess('Image updated');
      } else {
        await adminAddGallery(payload);
        setSuccess('Image added');
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminDeleteGallery(deleteId);
      setSuccess('Image deleted');
      setDeleteId(null);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Delete failed');
      setDeleteId(null);
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={3} gap={2}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", serif', color: '#0B3D2E', fontWeight: 700 }}>
            Gallery
          </Typography>
          <Typography color="text.secondary" variant="body2">{images.length} images</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{ bgcolor: '#0B3D2E', borderRadius: 2, fontWeight: 600, '&:hover': { bgcolor: '#0e4d3a' } }}
        >
          Add image
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress sx={{ color: '#0B3D2E' }} /></Box>
      ) : images.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <Typography color="text.secondary">No gallery images yet. Add one with an image URL.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {images.map((img) => (
            <Grid item xs={12} sm={6} md={4} key={img._id}>
              <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 28px rgba(11,61,46,0.06)' }}>
                <CardMedia component="img" height="180" image={img.image} alt={img.caption || ''} sx={{ objectFit: 'cover' }} />
                <CardContent sx={{ py: 1.5 }}>
                  <Typography fontWeight={600} noWrap>{img.caption || 'No caption'}</Typography>
                  <Typography variant="caption" color="text.secondary">Order: {img.order ?? 0}</Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                  <IconButton size="small" onClick={() => openEdit(img)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => setDeleteId(img._id)}><DeleteIcon fontSize="small" /></IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontFamily: '"Playfair Display", serif', color: '#0B3D2E' }}>
          {editing ? 'Edit image' : 'Add image'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Image URL *"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              error={!!formErrors.image}
              helperText={formErrors.image || 'Paste a full image URL (e.g. Unsplash)'}
              fullWidth
            />
            {form.image && (
              <Box component="img" src={form.image} alt="Preview" sx={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 2 }} onError={(e) => { e.target.style.display = 'none'; }} />
            )}
            <TextField
              label="Caption"
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              fullWidth
            />
            <TextField
              label="Display order"
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ bgcolor: '#0B3D2E', '&:hover': { bgcolor: '#0e4d3a' } }}>
            {saving ? <CircularProgress size={22} color="inherit" /> : editing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Delete image?</DialogTitle>
        <DialogContent><Typography>This cannot be undone.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
