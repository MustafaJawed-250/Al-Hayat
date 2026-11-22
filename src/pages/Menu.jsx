import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box, Typography, Container, Grid, Card, CardMedia, CardContent, Button,
  Chip, TextField, CircularProgress, Stack, Dialog, DialogContent, IconButton,
  InputAdornment, Rating, Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { getMenu, getCategories } from '../utils/api';
import { useCart } from '../hooks/useCart';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);


function PriceDisplay({ item, size = 'body1' }) {
  const sell = item.price;
  const orig = item.originalPrice;
  const from = item.isFromPrice;
  const discounted = orig != null && Number(orig) > Number(sell);
  return (
    <Box>
      <Typography
        component="span"
        variant={size}
        sx={{ fontWeight: 700, color: '#0B3D2E', fontSize: size === 'h6' ? undefined : '1rem' }}
      >
        {from ? 'From ' : ''}PKR {Number(sell).toFixed(Number(sell) % 1 ? 2 : 0)}
      </Typography>
      {discounted && (
        <>
          <Typography
            component="span"
            variant="body2"
            sx={{ ml: 1, textDecoration: 'line-through', color: 'text.secondary' }}
          >
            PKR {Number(orig).toFixed(Number(orig) % 1 ? 2 : 0)}
          </Typography>
          <Chip
            size="small"
            label={`${Math.round((1 - sell / orig) * 100)}% OFF`}
            sx={{ ml: 1, height: 22, bgcolor: '#D4A017', color: '#1a1a1a', fontWeight: 700, fontSize: 11 }}
          />
        </>
      )}
    </Box>
  );
}

export default function Menu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const gridRef = useRef(null);
  const { addItem } = useCart();

  useEffect(() => {
    Promise.all([getMenu(), getCategories()])
      .then(([menuRes, catRes]) => {
        setItems(menuRes.data?.data || []);
        setCategories(catRes.data?.data || []);
      })
      .catch(() => setError('Unable to load menu. Please ensure the backend is running.'))
      .finally(() => setLoading(false));
  }, []);

  const featured = items.filter((i) => i.isFeatured).slice(0, 5);
  const currentFeatured = featured[featuredIndex] || featured[0];

  useEffect(() => {
    if (featured.length < 2) return;
    const t = setInterval(() => {
      setFeaturedIndex((i) => (i + 1) % featured.length);
    }, 4500);
    return () => clearInterval(t);
  }, [featured.length]);

  useEffect(() => {
    if (loading || !gridRef.current) return;
    const cards = gridRef.current.querySelectorAll('.menu-card');
    gsap.fromTo(
      cards,
      { y: 36, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.55,
        stagger: 0.06,
        ease: 'power2.out',
        overwrite: true,
      }
    );
  }, [loading, activeCat, search, items]);

  const filtered = items.filter((i) => {
    const matchCat =
      activeCat === 'all' ||
      i.category?._id === activeCat ||
      (typeof i.category === 'string' && i.category === activeCat);
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      i.name?.toLowerCase().includes(q) ||
      i.description?.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const openDetail = (item) => {
    setSelected(item);
    setQty(1);
  };

  const handleAdd = useCallback(
    (item, quantity = 1) => {
      addItem(item, quantity);
    },
    [addItem]
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress sx={{ color: '#0B3D2E' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F9F5ED', minHeight: '100vh', pb: 8 }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: '#0B3D2E',
          color: '#F9F5ED',
          pt: { xs: 6, md: 8 },
          pb: { xs: 5, md: 7 },
          textAlign: 'center',
        }}
      >
        <Container>
          <Typography variant="overline" sx={{ color: '#D4A017', fontWeight: 700, letterSpacing: 3 }}>
            THE MENU
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700,
              fontSize: { xs: '2.2rem', md: '3.2rem' },
              mt: 1,
              mb: 1.5,
            }}
          >
            From the grill & the wok
          </Typography>
          <Typography sx={{ opacity: 0.8, maxWidth: 480, mx: 'auto' }}>
            Charcoal-fired, spice-led, made to order. Browse by category or search for your favourite.
          </Typography>
        </Container>
      </Box>

      {/* Featured orbit-style showcase */}
      {currentFeatured && (
        <Container maxWidth="lg" sx={{ mt: { xs: -4, md: -5 }, mb: 5, position: 'relative', zIndex: 2 }}>
          <Box
            sx={{
              bgcolor: '#fff',
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(11,61,46,0.12)',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              minHeight: { md: 340 },
            }}
          >
            <Box
              sx={{
                flex: { md: '0 0 48%' },
                position: 'relative',
                bgcolor: currentFeatured.accent || '#0B3D2E',
                minHeight: { xs: 220, md: 'auto' },
              }}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentFeatured._id}
                  src={currentFeatured.image}
                  alt={currentFeatured.name}
                  initial={{ opacity: 0, scale: 0.92, rotate: -4 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.95, rotate: 4 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    position: 'absolute',
                    inset: 0,
                  }}
                />
              </AnimatePresence>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  bgcolor: 'rgba(11,61,46,0.85)',
                  color: '#F9F5ED',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 50,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                Featured
              </Box>
            </Box>
            <Box sx={{ flex: 1, p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeatured._id + '-text'}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.4 }}
                >
                  <Typography variant="overline" sx={{ color: '#D4A017', fontWeight: 700, letterSpacing: 1.5 }}>
                    {currentFeatured.chef || 'AL HAYAT Kitchen'}
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontFamily: '"Playfair Display", serif',
                      color: '#0B3D2E',
                      fontSize: { xs: '1.6rem', md: '2rem' },
                      mt: 0.5,
                      mb: 1,
                    }}
                  >
                    {currentFeatured.title || currentFeatured.name?.split(' ')[0]}{' '}
                    <Box component="span" sx={{ fontWeight: 800 }}>
                      {currentFeatured.subtitle || currentFeatured.name?.split(' ').slice(1).join(' ')}
                    </Box>
                  </Typography>
                  <Typography sx={{ color: '#666', mb: 2, lineHeight: 1.7, fontSize: '0.95rem' }}>
                    {currentFeatured.description}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <Rating value={currentFeatured.rating || 4.5} precision={0.1} readOnly size="small" />
                    <PriceDisplay item={currentFeatured} />
                  </Stack>
                  <Stack direction="row" spacing={1.5}>
                    <Button
                      variant="contained"
                      startIcon={<ShoppingBagOutlinedIcon />}
                      onClick={() => handleAdd(currentFeatured)}
                      sx={{
                        bgcolor: '#0B3D2E',
                        borderRadius: 50,
                        px: 3,
                        fontWeight: 600,
                        '&:hover': { bgcolor: '#0e4d3a' },
                      }}
                    >
                      Add to cart
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => openDetail(currentFeatured)}
                      sx={{ borderColor: '#0B3D2E', color: '#0B3D2E', borderRadius: 50 }}
                    >
                      Details
                    </Button>
                  </Stack>
                </motion.div>
              </AnimatePresence>
              {featured.length > 1 && (
                <Stack direction="row" spacing={1} mt={3}>
                  {featured.map((_, i) => (
                    <Box
                      key={i}
                      onClick={() => setFeaturedIndex(i)}
                      sx={{
                        width: i === featuredIndex ? 24 : 8,
                        height: 8,
                        borderRadius: 4,
                        bgcolor: i === featuredIndex ? '#0B3D2E' : 'rgba(11,61,46,0.25)',
                        cursor: 'pointer',
                        transition: 'width 0.3s, background 0.3s',
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </Box>
        </Container>
      )}

      <Container maxWidth="lg">
        {/* Filters */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ md: 'center' }}
          justifyContent="space-between"
          mb={4}
          flexWrap="wrap"
        >
          <TextField
            size="small"
            placeholder="Search dishes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              minWidth: { xs: '100%', sm: 260 },
              bgcolor: '#fff',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': { borderRadius: 2 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#999' }} />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ overflowX: 'auto', maxWidth: '100%', pb: 0.5 }}>
            <Stack direction="row" spacing={1}>
              <Chip
                label="All"
                onClick={() => setActiveCat('all')}
                sx={{
                  fontWeight: 600,
                  bgcolor: activeCat === 'all' ? '#0B3D2E' : '#fff',
                  color: activeCat === 'all' ? '#F9F5ED' : '#0B3D2E',
                  '&:hover': { bgcolor: activeCat === 'all' ? '#0e4d3a' : '#f0ebe3' },
                }}
              />
              {categories.map((c) => (
                <Chip
                  key={c._id}
                  label={c.name}
                  onClick={() => setActiveCat(c._id)}
                  sx={{
                    fontWeight: 600,
                    bgcolor: activeCat === c._id ? '#0B3D2E' : '#fff',
                    color: activeCat === c._id ? '#F9F5ED' : '#0B3D2E',
                    whiteSpace: 'nowrap',
                    '&:hover': { bgcolor: activeCat === c._id ? '#0e4d3a' : '#f0ebe3' },
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Stack>

        {error && (
          <Typography color="error" mb={3} textAlign="center">
            {error}
          </Typography>
        )}

        {/* Product grid */}
        <Grid container spacing={3} ref={gridRef}>
          {filtered.length === 0 && (
            <Grid item xs={12}>
              <Typography textAlign="center" color="text.secondary" py={6}>
                No dishes match your search. Try another category or keyword.
              </Typography>
            </Grid>
          )}
          {filtered.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <Card
                className="menu-card"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 10px 32px rgba(11,61,46,0.07)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'pointer',
                  bgcolor: '#fff',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 18px 44px rgba(11,61,46,0.13)',
                  },
                }}
                onClick={() => openDetail(item)}
              >
                <Box sx={{ position: 'relative', pt: '62%', overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    image={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'}
                    alt={item.name}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  {!item.isAvailable && (
                    <Chip
                      label="Sold out"
                      size="small"
                      sx={{ position: 'absolute', top: 12, left: 12, bgcolor: 'rgba(0,0,0,0.7)', color: '#fff' }}
                    />
                  )}
                  {item.isFeatured && (
                    <Chip
                      label="Popular"
                      size="small"
                      sx={{ position: 'absolute', top: 12, right: 12, bgcolor: '#D4A017', color: '#1a1a1a', fontWeight: 600 }}
                    />
                  )}
                </Box>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="h6"
                    sx={{ fontFamily: '"Playfair Display", serif', fontSize: '1.15rem', color: '#0B3D2E', mb: 0.5 }}
                  >
                    {item.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1.5, flex: 1, fontSize: '0.85rem', lineHeight: 1.55 }}
                  >
                    {(item.description || '').slice(0, 85)}
                    {(item.description || '').length > 85 ? '…' : ''}
                  </Typography>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <PriceDisplay item={item} />
                    <Button
                      size="small"
                      variant="contained"
                      disabled={!item.isAvailable}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdd(item);
                      }}
                      sx={{
                        bgcolor: '#0B3D2E',
                        borderRadius: 50,
                        px: 2,
                        minWidth: 0,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        '&:hover': { bgcolor: '#0e4d3a' },
                      }}
                    >
                      Add
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Detail dialog */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {selected && (
          <>
            <Box sx={{ position: 'relative' }}>
              <Box
                component="img"
                src={selected.image}
                alt={selected.name}
                sx={{ width: '100%', height: 260, objectFit: 'cover' }}
              />
              <IconButton
                onClick={() => setSelected(null)}
                sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <DialogContent>
              <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", serif', color: '#0B3D2E', mb: 0.5 }}>
                {selected.name}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                <Rating value={selected.rating || 4.5} precision={0.1} readOnly size="small" />
                <Typography variant="body2" color="text.secondary">
                  {selected.chef || 'AL HAYAT Kitchen'}
                </Typography>
              </Stack>
              <Typography sx={{ color: '#555', mb: 2, lineHeight: 1.7 }}>{selected.description}</Typography>
              {selected.ingredients?.length > 0 && (
                <Box mb={2}>
                  <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
                    Ingredients
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.8}>
                    {selected.ingredients.map((ing) => (
                      <Chip key={ing} label={ing} size="small" sx={{ bgcolor: 'rgba(11,61,46,0.08)' }} />
                    ))}
                  </Stack>
                </Box>
              )}
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <PriceDisplay item={selected} size="h6" />
                <Stack direction="row" alignItems="center" spacing={1}>
                  <IconButton size="small" onClick={() => setQty((q) => Math.max(1, q - 1))} sx={{ border: '1px solid #ddd' }}>
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography fontWeight={600} minWidth={24} textAlign="center">
                    {qty}
                  </Typography>
                  <IconButton size="small" onClick={() => setQty((q) => q + 1)} sx={{ border: '1px solid #ddd' }}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                  <Button
                    variant="contained"
                    disabled={!selected.isAvailable}
                    onClick={() => {
                      handleAdd(selected, qty);
                      setSelected(null);
                    }}
                    sx={{
                      bgcolor: '#0B3D2E',
                      borderRadius: 50,
                      px: 3,
                      ml: 1,
                      fontWeight: 600,
                      '&:hover': { bgcolor: '#0e4d3a' },
                    }}
                  >
                    Add · PKR {(selected.price * qty).toFixed(2)}
                  </Button>
                </Stack>
              </Stack>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}
