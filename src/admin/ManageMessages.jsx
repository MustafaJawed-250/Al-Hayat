import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Stack, Alert,
  CircularProgress, Button, InputAdornment,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import SearchIcon from '@mui/icons-material/Search';
import { getMessages, markMessageRead, deleteMessage } from '../utils/api';

export default function ManageMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getMessages();
      setMessages(r.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = messages.filter((m) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.subject?.toLowerCase().includes(q)
    );
  });

  const openDetail = async (msg) => {
    setSelected(msg);
    if (!msg.isRead) {
      try {
        await markMessageRead(msg._id);
        setMessages((prev) => prev.map((m) => (m._id === msg._id ? { ...m, isRead: true } : m)));
        setSelected((s) => (s ? { ...s, isRead: true } : s));
      } catch (_) {}
    }
  };

  const handleMarkRead = async (msg) => {
    try {
      await markMessageRead(msg._id);
      setMessages((prev) => prev.map((m) => (m._id === msg._id ? { ...m, isRead: true } : m)));
      setSuccess('Marked as read');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMessage(deleteId);
      setSuccess('Message deleted');
      setDeleteId(null);
      if (selected?._id === deleteId) setSelected(null);
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
            Messages
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {messages.filter((m) => !m.isRead).length} unread · {messages.length} total
          </Typography>
        </Box>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <TextField
        size="small"
        placeholder="Search by name, email, subject…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, minWidth: 280, bgcolor: '#fff' }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress sx={{ color: '#0B3D2E' }} /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 8px 28px rgba(11,61,46,0.06)' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(11,61,46,0.04)' }}>
                <TableCell sx={{ fontWeight: 700 }}>From</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>No messages</TableCell>
                </TableRow>
              )}
              {filtered.map((m) => (
                <TableRow
                  key={m._id}
                  hover
                  sx={{ bgcolor: m.isRead ? 'transparent' : 'rgba(212,160,23,0.06)' }}
                >
                  <TableCell>
                    <Typography fontWeight={m.isRead ? 500 : 700} fontSize="0.9rem">{m.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{m.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={m.isRead ? 400 : 600} noWrap sx={{ maxWidth: 220 }}>
                      {m.subject}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {m.createdAt ? new Date(m.createdAt).toLocaleString() : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={m.isRead ? 'Read' : 'Unread'}
                      size="small"
                      color={m.isRead ? 'default' : 'warning'}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openDetail(m)} title="View">
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    {!m.isRead && (
                      <IconButton size="small" onClick={() => handleMarkRead(m)} title="Mark read">
                        <MarkEmailReadIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton size="small" color="error" onClick={() => setDeleteId(m._id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {selected && (
          <>
            <DialogTitle sx={{ fontFamily: '"Playfair Display", serif', color: '#0B3D2E' }}>
              {selected.subject}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">From</Typography>
                  <Typography fontWeight={600}>{selected.name}</Typography>
                  <Typography variant="body2">{selected.email}</Typography>
                  {selected.phone && <Typography variant="body2">{selected.phone}</Typography>}
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                  <Typography variant="body2">
                    {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Message</Typography>
                  <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{selected.message}</Typography>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelected(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Delete message?</DialogTitle>
        <DialogContent><Typography>This cannot be undone.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
