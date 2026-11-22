import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Switch, FormControlLabel,
  Stack, Alert, CircularProgress, Tooltip, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory,
} from '../utils/api';

const empty = { name: '', slug: '', order: 0, description: '', isActive: true };

export default function ManageCategories() {
  const [cats, setCats] = useState([]);
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
      const r = await adminGetCategories();
      setCats(r.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load categories');
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

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name || '',
      slug: c.slug || '',
      order: c.order ?? 0,
      description: c.description || '',
      isActive: c.isActive !== false,
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const onNameChange = (name) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setForm((f) => ({ ...f, name, slug: editing ? f.slug : slug }));
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = 'Name is required';
    setFormErrors(er);
    return Object.keys(er).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || form.name.toLowerCase().replace(/\s+/g, '-'),
        order: Number(form.order) || 0,
        description: form.description.trim(),
        isActive: form.isActive,
      };
      if (editing) {
        await adminUpdateCategory(editing._id, payload);
        setSuccess('Category updated');
      } else {
        await adminCreateCategory(payload);
        setSuccess('Category created');
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
      await adminDeleteCategory(deleteId);
      setSuccess('Category deleted');
      setDeleteId(null);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Cannot delete — products may still use this category');
      setDeleteId(null);
    }
  };

  const toggleActive = async (c) => {
    try {
      await adminUpdateCategory(c._id, { isActive: !c.isActive });
      setCats((prev) => prev.map((x) => (x._id === c._id ? { ...x, isActive: !x.isActive } : x)));
    } catch (e) {
      setError(e.response?.data?.message || 'Update failed');
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={3} gap={2}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", serif', color: '#0B3D2E', fontWeight: 700 }}>
            Categories
          </Typography>
          <Typography color="text.secondary" variant="body2">{cats.length} categories</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{ bgcolor: '#0B3D2E', borderRadius: 2, fontWeight: 600, '&:hover': { bgcolor: '#0e4d3a' } }}
        >
          Add category
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress sx={{ color: '#0B3D2E' }} /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 8px 28px rgba(11,61,46,0.06)' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(11,61,46,0.04)' }}>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Slug</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Order</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Active</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cats.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>No categories yet</TableCell>
                </TableRow>
              )}
              {[...cats].sort((a, b) => (a.order || 0) - (b.order || 0)).map((c) => (
                <TableRow key={c._id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{c.name}</Typography>
                    {c.description && (
                      <Typography variant="caption" color="text.secondary">{c.description}</Typography>
                    )}
                  </TableCell>
                  <TableCell><Chip label={c.slug} size="small" variant="outlined" /></TableCell>
                  <TableCell align="center">{c.order ?? 0}</TableCell>
                  <TableCell align="center">
                    <Switch size="small" checked={c.isActive !== false} onChange={() => toggleActive(c)} color="success" />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(c)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => setDeleteId(c._id)}><DeleteIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontFamily: '"Playfair Display", serif', color: '#0B3D2E' }}>
          {editing ? 'Edit category' : 'Add category'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Name *"
              value={form.name}
              onChange={(e) => onNameChange(e.target.value)}
              error={!!formErrors.name}
              helperText={formErrors.name}
              fullWidth
            />
            <TextField
              label="Slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              fullWidth
            />
            <TextField
              label="Display order"
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <FormControlLabel
              control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />}
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ bgcolor: '#0B3D2E', '&:hover': { bgcolor: '#0e4d3a' } }}>
            {saving ? <CircularProgress size={22} color="inherit" /> : editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Delete category?</DialogTitle>
        <DialogContent>
          <Typography>
            If this category still has menu items, deletion will be blocked by the server. Reassign products first.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
