import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
  Select, MenuItem, Switch, FormControlLabel, Stack, Alert, CircularProgress, InputAdornment, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import {
  adminGetMenu, adminCreateItem, adminUpdateItem, adminDeleteItem, adminGetCategories,
} from '../utils/api';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: '',
  image: '',
  ingredients: '',
  rating: 4.5,
  isAvailable: true,
  isFeatured: false,
  title: '',
  subtitle: '',
  accent: '#D4A017',
  chef: 'AL HAYAT Kitchen',
};

export default function ManageMenu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [filterAvail, setFilterAvail] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [menuRes, catRes] = await Promise.all([adminGetMenu(), adminGetCategories()]);
      setItems(menuRes.data?.data || []);
      setCategories(catRes.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter((item) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || item.name?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q);
    const catId = item.category?._id || item.category;
    const matchCat = filterCat === 'all' || catId === filterCat;
    const matchAvail =
      filterAvail === 'all' ||
      (filterAvail === 'available' && item.isAvailable) ||
      (filterAvail === 'unavailable' && !item.isAvailable);
    return matchSearch && matchCat && matchAvail;
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name || '',
      description: item.description || '',
      price: item.price ?? '',
      category: item.category?._id || item.category || '',
      image: item.image || '',
      ingredients: Array.isArray(item.ingredients) ? item.ingredients.join(', ') : '',
      rating: item.rating ?? 4.5,
      isAvailable: item.isAvailable !== false,
      isFeatured: !!item.isFeatured,
      title: item.title || '',
      subtitle: item.subtitle || '',
      accent: item.accent || '#D4A017',
      chef: item.chef || 'AL HAYAT Kitchen',
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = 'Name is required';
    if (form.price === '' || Number(form.price) < 0) er.price = 'Valid price required';
    if (!form.category) er.category = 'Category is required';
    setFormErrors(er);
    return Object.keys(er).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setError('');
    setSuccess('');
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category,
      image: form.image.trim(),
      ingredients: form.ingredients
        ? form.ingredients.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      rating: Number(form.rating) || 4.5,
      isAvailable: form.isAvailable,
      isFeatured: form.isFeatured,
      title: form.title.trim() || undefined,
      subtitle: form.subtitle.trim() || undefined,
      accent: form.accent || '#D4A017',
      chef: form.chef.trim() || 'AL HAYAT Kitchen',
    };
    try {
      if (editing) {
        await adminUpdateItem(editing._id, payload);
        setSuccess('Menu item updated');
      } else {
        await adminCreateItem(payload);
        setSuccess('Menu item created');
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (item, field) => {
    try {
      await adminUpdateItem(item._id, { [field]: !item[field] });
      setItems((prev) => prev.map((i) => (i._id === item._id ? { ...i, [field]: !i[field] } : i)));
    } catch (e) {
      setError(e.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminDeleteItem(deleteId);
      setSuccess('Item deleted');
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
            Menu Items
          </Typography>
          <Typography color="text.secondary" variant="body2">{items.length} products</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{ bgcolor: '#0B3D2E', borderRadius: 2, fontWeight: 600, '&:hover': { bgcolor: '#0e4d3a' } }}
        >
          Add item
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={2}>
        <TextField
          size="small"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 220, bgcolor: '#fff' }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        <FormControl size="small" sx={{ minWidth: 160, bgcolor: '#fff' }}>
          <InputLabel>Category</InputLabel>
          <Select value={filterCat} label="Category" onChange={(e) => setFilterCat(e.target.value)}>
            <MenuItem value="all">All categories</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140, bgcolor: '#fff' }}>
          <InputLabel>Availability</InputLabel>
          <Select value={filterAvail} label="Availability" onChange={(e) => setFilterAvail(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="available">Available</MenuItem>
            <MenuItem value="unavailable">Unavailable</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress sx={{ color: '#0B3D2E' }} /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 8px 28px rgba(11,61,46,0.06)' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(11,61,46,0.04)' }}>
                <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Price</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Available</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Featured</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No menu items found
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((item) => (
                <TableRow key={item._id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      {item.image && (
                        <Box component="img" src={item.image} alt="" sx={{ width: 44, height: 44, borderRadius: 1, objectFit: 'cover' }} />
                      )}
                      <Box>
                        <Typography fontWeight={600} fontSize="0.9rem">{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                          {(item.description || '').slice(0, 50)}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip label={item.category?.name || '—'} size="small" sx={{ fontWeight: 500 }} />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {item.isFromPrice ? 'From ' : ''}PKR {item.price}
                    {item.originalPrice ? (
                      <Typography component="span" variant="caption" sx={{ display: 'block', textDecoration: 'line-through', color: 'text.secondary' }}>
                        PKR {item.originalPrice}
                      </Typography>
                    ) : null}
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      size="small"
                      checked={!!item.isAvailable}
                      onChange={() => handleToggle(item, 'isAvailable')}
                      color="success"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      size="small"
                      checked={!!item.isFeatured}
                      onChange={() => handleToggle(item, 'isFeatured')}
                      sx={{ '& .Mui-checked': { color: '#D4A017' } }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(item)}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => setDeleteId(item._id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontFamily: '"Playfair Display", serif', color: '#0B3D2E' }}>
          {editing ? 'Edit menu item' : 'Add menu item'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={!!formErrors.name}
              helperText={formErrors.name}
              fullWidth
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Selling price (PKR) *"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                error={!!formErrors.price}
                helperText={formErrors.price}
                fullWidth
              />
              <TextField
                label="Original price (strikethrough)"
                type="number"
                value={form.originalPrice}
                onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                helperText="Leave empty if no discount"
                fullWidth
              />
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl fullWidth error={!!formErrors.category}>
                <InputLabel>Category *</InputLabel>
                <Select
                  value={form.category}
                  label="Category *"
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {categories.map((c) => (
                    <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControlLabel
                control={<Switch checked={Boolean(form.isFromPrice)} onChange={(e) => setForm({ ...form, isFromPrice: e.target.checked })} />}
                label='Show "From"'
                sx={{ minWidth: 140 }}
              />
            </Stack>
            <TextField
              label="Image URL"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              fullWidth
              placeholder="https://..."
            />
            <TextField
              label="Ingredients (comma-separated)"
              value={form.ingredients}
              onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Title (thin line)"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                fullWidth
              />
              <TextField
                label="Subtitle (heavy)"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                fullWidth
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Rating"
                type="number"
                inputProps={{ min: 0, max: 5, step: 0.1 }}
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                fullWidth
              />
              <TextField
                label="Accent colour"
                value={form.accent}
                onChange={(e) => setForm({ ...form, accent: e.target.value })}
                fullWidth
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <FormControlLabel
                control={<Switch checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} />}
                label="Available"
              />
              <FormControlLabel
                control={<Switch checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />}
                label="Featured"
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{ bgcolor: '#0B3D2E', '&:hover': { bgcolor: '#0e4d3a' } }}
          >
            {saving ? <CircularProgress size={22} color="inherit" /> : editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Delete menu item?</DialogTitle>
        <DialogContent>
          <Typography>This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
