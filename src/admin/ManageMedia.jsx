import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box, Typography, Button, Grid, Paper, Stack, Alert, CircularProgress, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select,
  MenuItem, Chip, IconButton, InputAdornment, LinearProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CollectionsIcon from '@mui/icons-material/Collections';
import {
  getMedia, uploadMedia, updateMedia, deleteMedia, updateSiteSetting, replaceMedia,
} from '../utils/api';

const ASSIGNMENTS = [
  { value: 'unassigned', label: 'Unassigned' },
  { value: 'site-logo', label: 'Site logo' },
  { value: 'home-hero', label: 'Home hero' },
  { value: 'about-main', label: 'About main' },
  { value: 'menu-product', label: 'Menu product' },
  { value: 'gallery', label: 'Website gallery' },
  { value: 'other', label: 'Other' },
];

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/jpg';

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
  const [dragOver, setDragOver] = useState(false);

  // Local preview before upload
  const [pendingFiles, setPendingFiles] = useState([]); // { file, previewUrl }
  const [uploadAssignment, setUploadAssignment] = useState('unassigned');
  const [uploadCaption, setUploadCaption] = useState('');

  const fileRef = useRef();
  const replaceRef = useRef();

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

  // Revoke object URLs on unmount / clear
  useEffect(() => () => {
    pendingFiles.forEach((p) => URL.revokeObjectURL(p.previewUrl));
  }, [pendingFiles]);

  const addLocalFiles = (fileList) => {
    const files = Array.from(fileList || []).filter((f) => /^image\//i.test(f.type));
    if (!files.length) {
      setError('Please choose image files (JPEG, PNG, WebP or GIF).');
      return;
    }
    const next = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));
    setPendingFiles((prev) => [...prev, ...next].slice(0, 12));
    setError('');
  };

  const removePending = (idx) => {
    setPendingFiles((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[idx].previewUrl);
      copy.splice(idx, 1);
      return copy;
    });
  };

  const clearPending = () => {
    pendingFiles.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPendingFiles([]);
    if (fileRef.current) fileRef.current.value = '';
  };

  const doUpload = async () => {
    if (!pendingFiles.length) return;
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const fd = new FormData();
      pendingFiles.forEach((p) => fd.append('images', p.file));
      fd.append('assignment', uploadAssignment);
      if (uploadCaption.trim()) fd.append('caption', uploadCaption.trim());
      if (uploadCaption.trim()) fd.append('alt', uploadCaption.trim());

      const r = await uploadMedia(fd);
      const data = r.data?.data;
      const list = Array.isArray(data) ? data : data ? [data] : [];
      setItems((prev) => [...list, ...prev]);
      setSuccess(
        list.length === 1
          ? 'Image uploaded to Cloudinary and saved.'
          : `${list.length} images uploaded to Cloudinary and saved.`
      );
      if (uploadAssignment === 'gallery') {
        setSuccess((s) => `${s} Added to the website gallery.`);
      }
      clearPending();
      setUploadCaption('');
      setUploadAssignment('unassigned');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const saveAssignment = async () => {
    if (!selected) return;
    setUploading(true);
    setError('');
    try {
      const r = await updateMedia(selected._id, {
        assignment: selected.assignment,
        alt: selected.alt || '',
      });
      if (['home-hero', 'about-main', 'site-logo'].includes(selected.assignment)) {
        await updateSiteSetting(selected.assignment, {
          url: selected.url,
          publicId: selected.publicId,
          mediaId: selected._id,
        });
      }
      setSuccess(
        selected.assignment === 'gallery'
          ? 'Saved and added to the public website gallery.'
          : 'Assignment saved — public site will use this image where applicable.'
      );
      setItems((prev) => prev.map((m) => (m._id === selected._id ? r.data.data : m)));
      setSelected(null);
    } catch (e) {
      setError(e.response?.data?.message || 'Save failed');
    } finally {
      setUploading(false);
    }
  };

  const onReplace = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selected) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      const r = await replaceMedia(selected._id, fd);
      setSuccess('Image replaced on Cloudinary.');
      setItems((prev) => prev.map((m) => (m._id === selected._id ? r.data.data : m)));
      setSelected(r.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Replace failed');
    } finally {
      setUploading(false);
      if (replaceRef.current) replaceRef.current.value = '';
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

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer?.files?.length) addLocalFiles(e.dataTransfer.files);
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={3} gap={2}>
        <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, color: '#0B3D2E' }}>
          Media Library
        </Typography>
        <IconButton onClick={load} aria-label="Refresh"><RefreshIcon /></IconButton>
      </Stack>

      {!cloudinaryOk && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Cloudinary is not configured on the server. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend .env.
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Upload from computer */}
      <Paper
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          border: dragOver ? '2px dashed #D4A017' : '2px dashed rgba(11,61,46,0.25)',
          bgcolor: dragOver ? 'rgba(212,160,23,0.08)' : '#F9F5ED',
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <Box flex={1}>
            <Typography fontWeight={700} color="#0B3D2E" gutterBottom>
              Upload from your computer
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Drag &amp; drop images here, or choose files. Images are stored on Cloudinary; URLs are saved in MongoDB.
            </Typography>
          </Box>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            disabled={uploading}
            sx={{ bgcolor: '#0B3D2E', textTransform: 'none', fontWeight: 700, px: 3, '&:hover': { bgcolor: '#0e4d3a' } }}
          >
            Choose images
            <input
              ref={fileRef}
              type="file"
              hidden
              accept={ACCEPT}
              multiple
              onChange={(e) => {
                if (e.target.files?.length) addLocalFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </Button>
        </Stack>

        {pendingFiles.length > 0 && (
          <Box mt={2.5}>
            <Grid container spacing={1.5}>
              {pendingFiles.map((p, idx) => (
                <Grid item xs={4} sm={3} md={2} key={p.previewUrl}>
                  <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                    <Box component="img" src={p.previewUrl} alt={p.name} sx={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
                    <IconButton
                      size="small"
                      onClick={() => removePending(idx)}
                      sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' } }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="caption" noWrap sx={{ display: 'block', px: 0.5, py: 0.3, bgcolor: '#fff', fontSize: 10 }}>
                      {p.name}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={2} alignItems={{ sm: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Assign on upload</InputLabel>
                <Select
                  label="Assign on upload"
                  value={uploadAssignment}
                  onChange={(e) => setUploadAssignment(e.target.value)}
                >
                  {ASSIGNMENTS.map((a) => (
                    <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                size="small"
                label="Caption / alt (optional)"
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                sx={{ minWidth: 220 }}
              />
              <Box flex={1} />
              <Button onClick={clearPending} disabled={uploading}>Clear</Button>
              <Button
                variant="contained"
                onClick={doUpload}
                disabled={uploading}
                startIcon={uploading ? <CircularProgress size={18} color="inherit" /> : <CloudUploadIcon />}
                sx={{ bgcolor: '#D4A017', color: '#1a1a1a', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#c49215' } }}
              >
                {uploading ? 'Uploading…' : `Upload ${pendingFiles.length} image${pendingFiles.length > 1 ? 's' : ''}`}
              </Button>
            </Stack>
            {uploading && <LinearProgress sx={{ mt: 1.5, borderRadius: 1 }} />}
          </Box>
        )}
      </Paper>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
        <TextField
          size="small"
          placeholder="Search filename…"
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
          <CollectionsIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
          <Typography color="text.secondary">No images yet. Upload from your computer above.</Typography>
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
                  transition: 'border-color 0.2s',
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

      {/* Edit / assign / replace / delete */}
      <Dialog open={Boolean(selected)} onClose={() => !uploading && setSelected(null)} maxWidth="sm" fullWidth>
        {selected && (
          <>
            <DialogTitle sx={{ fontFamily: '"Playfair Display", serif', color: '#0B3D2E' }}>
              Manage image
            </DialogTitle>
            <DialogContent dividers>
              <Box
                component="img"
                src={selected.url}
                alt=""
                sx={{ width: '100%', maxHeight: 280, objectFit: 'contain', mb: 2, borderRadius: 1, bgcolor: '#f5f5f5' }}
              />
              <TextField
                fullWidth
                label="Alt text / caption"
                value={selected.alt || ''}
                onChange={(e) => setSelected({ ...selected, alt: e.target.value })}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
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
              <Typography variant="caption" color="text.secondary" display="block">
                Assigning to <strong>Website gallery</strong> adds this image to the public Gallery page.
                Home hero / About / Site logo update the live website immediately.
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 1, wordBreak: 'break-all', opacity: 0.65 }}>
                {selected.url}
              </Typography>
            </DialogContent>
            <DialogActions sx={{ flexWrap: 'wrap', gap: 1, px: 2, pb: 2 }}>
              <Button color="error" startIcon={<DeleteIcon />} onClick={() => onDelete(selected._id)} disabled={uploading}>
                Delete
              </Button>
              <Button component="label" startIcon={<SwapHorizIcon />} disabled={uploading} sx={{ textTransform: 'none' }}>
                Replace from computer
                <input ref={replaceRef} type="file" hidden accept={ACCEPT} onChange={onReplace} />
              </Button>
              <Box flex={1} />
              <Button onClick={() => setSelected(null)} disabled={uploading}>Cancel</Button>
              <Button
                variant="contained"
                onClick={saveAssignment}
                disabled={uploading}
                sx={{ bgcolor: '#0B3D2E', textTransform: 'none', fontWeight: 700 }}
              >
                {uploading ? <CircularProgress size={22} color="inherit" /> : 'Save assignment'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
