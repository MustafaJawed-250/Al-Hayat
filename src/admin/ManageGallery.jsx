import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box, Typography, Button, TextField, Grid, Paper, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Stack, Alert, CircularProgress, Card, CardMedia, CardActions, CardContent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  getGallery, adminAddGallery, adminUpdateGallery, adminDeleteGallery, uploadMedia,
} from '../utils/api';

const empty = { image: '', caption: '', order: 0 };
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/jpg';

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
  const [localPreview, setLocalPreview] = useState(null); // object URL
  const [localFile, setLocalFile] = useState(null);
  const fileRef = useRef();

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

  useEffect(() => () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  const clearLocal = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    setLocalFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setFormErrors({});
    clearLocal();
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
    clearLocal();
    setDialogOpen(true);
  };

  const onPickLocal = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\//i.test(file.type)) {
      setFormErrors({ image: 'Please choose an image file' });
      return;
    }
    if (localPreview) URL.revokeObjectURL(localPreview);
    const url = URL.createObjectURL(file);
    setLocalFile(file);
    setLocalPreview(url);
    setForm((f) => ({ ...f, image: '' })); // clear URL when using file
    setFormErrors({});
  };

  const validate = () => {
    const er = {};
    if (!localFile && !form.image.trim()) er.image = 'Choose a file from your computer or paste an image URL';
    setFormErrors(er);
    return Object.keys(er).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setError('');
    try {
      let imageUrl = form.image.trim();

      // Upload local file → Cloudinary → get URL
      if (localFile) {
        const fd = new FormData();
        fd.append('image', localFile);
        fd.append('assignment', 'gallery');
        if (form.caption.trim()) {
          fd.append('caption', form.caption.trim());
          fd.append('alt', form.caption.trim());
        }
        const up = await uploadMedia(fd);
        const media = Array.isArray(up.data?.data) ? up.data.data[0] : up.data?.data;
        if (!media?.url) throw new Error('Upload succeeded but no URL returned');
        imageUrl = media.url;
      }

      const payload = {
        image: imageUrl,
        caption: form.caption.trim(),
        order: Number(form.order) || 0,
      };

      if (editing) {
        await adminUpdateGallery(editing._id, payload);
        setSuccess('Gallery image updated');
      } else {
        // If we uploaded with assignment gallery, Media route may already have created a Gallery row.
        // Avoid exact duplicate URL if possible by still creating when editing path wasn't used.
        if (!localFile) {
          await adminAddGallery(payload);
        } else {
          // Upload already applied gallery assignment; refresh list. If missing, add.
          await load();
          const exists = (await getGallery()).data?.data?.some((g) => g.image === imageUrl);
          if (!exists) await adminAddGallery(payload);
        }
        setSuccess(localFile ? 'Image uploaded to Cloudinary and added to gallery' : 'Image added');
      }

      setDialogOpen(false);
      clearLocal();
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminDeleteGallery(deleteId);
      setSuccess('Deleted');
      setDeleteId(null);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={3} gap={2}>
        <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, color: '#0B3D2E' }}>
          Gallery
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{ bgcolor: '#0B3D2E', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#0e4d3a' } }}
        >
          Add image
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {loading ? (
        <Box textAlign="center" py={6}><CircularProgress sx={{ color: '#0B3D2E' }} /></Box>
      ) : images.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No gallery images yet. Upload from your computer or paste a URL.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {images.map((img) => (
            <Grid item xs={12} sm={6} md={4} key={img._id}>
              <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <CardMedia component="img" height="180" image={img.image} alt={img.caption || ''} sx={{ objectFit: 'cover' }} />
                <CardContent sx={{ py: 1.5 }}>
                  <Typography variant="body2" noWrap>{img.caption || 'No caption'}</Typography>
                  <Typography variant="caption" color="text.secondary">Order: {img.order ?? 0}</Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <IconButton size="small" onClick={() => openEdit(img)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => setDeleteId(img._id)}><DeleteIcon fontSize="small" /></IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontFamily: '"Playfair Display", serif', color: '#0B3D2E' }}>
          {editing ? 'Edit image' : 'Add image'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{ textTransform: 'none', borderColor: '#0B3D2E', color: '#0B3D2E', fontWeight: 600 }}
            >
              Upload from computer
              <input ref={fileRef} type="file" hidden accept={ACCEPT} onChange={onPickLocal} />
            </Button>

            {(localPreview || form.image) && (
              <Box
                component="img"
                src={localPreview || form.image}
                alt="Preview"
                sx={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 2 }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            {localFile && (
              <Typography variant="caption" color="text.secondary">
                Selected: {localFile.name} ({Math.round(localFile.size / 1024)} KB) — will upload to Cloudinary
              </Typography>
            )}

            <TextField
              label="Or paste image URL"
              value={form.image}
              onChange={(e) => {
                setForm({ ...form, image: e.target.value });
                if (e.target.value.trim()) clearLocal();
              }}
              error={!!formErrors.image}
              helperText={formErrors.image || 'Optional if you uploaded a file above'}
              fullWidth
              disabled={Boolean(localFile)}
            />
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
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{ bgcolor: '#0B3D2E', '&:hover': { bgcolor: '#0e4d3a' } }}
          >
            {saving ? <CircularProgress size={22} color="inherit" /> : editing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Delete image?</DialogTitle>
        <DialogContent><Typography>This removes it from the public gallery. This cannot be undone.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
