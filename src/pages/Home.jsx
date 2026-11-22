import { useEffect, useRef, useState } from 'react';
import { Box, Typography, Container, Button, Grid, Card, CardMedia, CardContent, Stack, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getMenu, getGallery, getSiteSettings } from '../utils/api';
import { useCart } from '../hooks/useCart';
import Logo from '../components/Logo';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import StarIcon from '@mui/icons-material/Star';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SpaIcon from "@mui/icons-material/Spa";

gsap.registerPlugin(ScrollTrigger);

const HERO_FOOD =
  'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=1400&q=85';
// Grilled skewers / BBQ — warm, appetizing

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=V2FH%2BPQ3%2C+Gule+Rana+Colony%2C+Soldier+Bazaar%2C+Karachi';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [heroImage, setHeroImage] = useState(HERO_FOOD);
  const heroRef = useRef(null);
  const { addItem } = useCart();

  useEffect(() => {
    getMenu({ featured: 'true' })
      .then((r) => setFeatured((r.data?.data || []).slice(0, 4)))
      .catch(() => setFeatured([]));
    getGallery()
      .then((r) => setGallery((r.data?.data || []).slice(0, 4)))
      .catch(() => {});
    getSiteSettings()
      .then((r) => {
        const url = r.data?.data?.['home-hero']?.url;
        if (url) setHeroImage(url);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-brand', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.15 });
      gsap.from('.hero-heading', { y: 36, opacity: 0, duration: 0.85, ease: 'power3.out', delay: 0.35 });
      gsap.from('.hero-desc', { y: 28, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.5 });
      gsap.from('.hero-cta', { y: 24, opacity: 0, duration: 0.75, ease: 'power3.out', delay: 0.65 });
      gsap.from('.hero-meta', { y: 20, opacity: 0, duration: 0.7, ease: 'power3.out', delay: 0.8 });
      gsap.from('.hero-food', { x: 50, opacity: 0, duration: 1.1, ease: 'power3.out', delay: 0.3 });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <Box sx={{ bgcolor: '#F9F5ED', overflow: 'hidden' }}>
      {/* ========== HERO — matches reference layout ========== */}
      <Box
        ref={heroRef}
        sx={{
          position: 'relative',
          minHeight: { xs: 'auto', md: '92vh' },
          display: 'flex',
          alignItems: 'center',
          bgcolor: '#061a14',
          color: '#F9F5ED',
          overflow: 'hidden',
        }}
      >
        {/* Soft radial glow behind food */}
        <Box
          sx={{
            position: 'absolute',
            right: { xs: '-20%', md: '5%' },
            top: { xs: '40%', md: '10%' },
            width: { xs: '90%', md: '55%' },
            height: { xs: '50%', md: '80%' },
            background: 'radial-gradient(ellipse at center, rgba(212,160,23,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: { xs: 5, md: 6 } }}>
          <Grid container spacing={{ xs: 4, md: 3 }} alignItems="center">
            {/* LEFT — brand + copy + CTAs + meta */}
            <Grid item xs={12} md={6}>
              <Box className="hero-brand" sx={{ mb: { xs: 2.5, md: 3 } }}>
                <Logo variant="hero" to={null} />
              </Box>

              <Typography
                className="hero-heading"
                sx={{
                  fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                  fontWeight: 600,
                  fontSize: { xs: '1.05rem', md: '1.2rem' },
                  color: 'rgba(249,245,237,0.92)',
                  mb: 1.5,
                  maxWidth: 420,
                }}
              >
                Fast Food Restaurant in{' '}
                <Box component="span" sx={{ color: '#D4A017', fontWeight: 700 }}>
                  Soldier Bazaar, Karachi
                </Box>
              </Typography>

              <Typography
                className="hero-desc"
                sx={{
                  fontSize: { xs: '0.95rem', md: '1.05rem' },
                  opacity: 0.82,
                  maxWidth: 440,
                  mb: 3.5,
                  lineHeight: 1.7,
                  fontWeight: 400,
                }}
              >
                Charcoal-grilled delights, delicious rolls, mouth-watering burgers and authentic Pakistani dishes — all under one roof.
              </Typography>

              <Stack className="hero-cta" direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mb={4}>
                <Button
                  component={Link}
                  to="/menu"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    bgcolor: '#D4A017',
                    color: '#1a1a1a',
                    fontWeight: 700,
                    px: 3.5,
                    py: 1.4,
                    borderRadius: 50,
                    fontSize: '0.95rem',
                    boxShadow: '0 8px 28px rgba(212,160,23,0.35)',
                    '&:hover': { bgcolor: '#c49215', boxShadow: '0 10px 32px rgba(212,160,23,0.45)' },
                  }}
                >
                  View Menu
                </Button>
                <Button
                  component="a"
                  href="tel:03077622276"
                  variant="outlined"
                  size="large"
                  startIcon={<PhoneIcon />}
                  sx={{
                    borderColor: 'rgba(249,245,237,0.4)',
                    color: '#F9F5ED',
                    fontWeight: 600,
                    px: 3,
                    py: 1.4,
                    borderRadius: 50,
                    '&:hover': {
                      borderColor: '#D4A017',
                      color: '#D4A017',
                      bgcolor: 'rgba(212,160,23,0.08)',
                    },
                  }}
                >
                  0307 7622276
                </Button>
              </Stack>

              {/* Meta row: address · price · rating */}
              <Stack
                className="hero-meta"
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1.5, sm: 3 }}
                flexWrap="wrap"
                useFlexGap
              >
                <Stack direction="row" spacing={1} alignItems="flex-start" maxWidth={260}>
                  <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#D4A017', mt: 0.2 }} />
                  <Box>
                    <Typography
                      component="a"
                      href={MAPS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'rgba(249,245,237,0.9)',
                        fontSize: '0.8rem',
                        lineHeight: 1.45,
                        textDecoration: 'none',
                        '&:hover': { color: '#D4A017' },
                      }}
                    >
                      V2FH+PQ3, Gule Rana Colony
                      <br />
                      Soldier Bazaar, Karachi
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ fontSize: '1.1rem', color: '#D4A017', fontWeight: 700 }}>₨</Typography>
                  <Typography sx={{ fontSize: '0.8rem', opacity: 0.85, lineHeight: 1.4 }}>
                    PKR 1–1,000
                    <br />
                    <Box component="span" sx={{ opacity: 0.7 }}>per person</Box>
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.8} alignItems="center">
                  <StarIcon sx={{ fontSize: 18, color: '#D4A017' }} />
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>3.5</Typography>
                  <Typography sx={{ fontSize: '0.75rem', opacity: 0.7 }}>(59 Reviews)</Typography>
                </Stack>
              </Stack>
            </Grid>

            {/* RIGHT — food photography */}
            <Grid item xs={12} md={6}>
              <Box
                className="hero-food"
                sx={{
                  position: 'relative',
                  borderRadius: { xs: 3, md: '24px 0 0 24px' },
                  overflow: 'hidden',
                  ml: { md: 2 },
                  boxShadow: {
                    xs: '0 20px 50px rgba(0,0,0,0.4)',
                    md: '-20px 0 60px rgba(0,0,0,0.35)',
                  },
                }}
              >
                <Box
                  component="img"
                  src={heroImage}
                  alt="AL HAYAT grilled chicken, rolls and burgers"
                  sx={{
                    width: '100%',
                    height: { xs: 280, sm: 360, md: 480 },
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block',
                  }}
                />
                {/* Fade left edge into dark bg on desktop */}
                <Box
                  sx={{
                    display: { xs: 'none', md: 'block' },
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 80,
                    background: 'linear-gradient(to right, #061a14, transparent)',
                    pointerEvents: 'none',
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>

        {/* Bottom cream wave into next section */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: { xs: 40, md: 64 },
            background: 'linear-gradient(to top, #F9F5ED, transparent)',
            pointerEvents: 'none',
          }}
        />
      </Box>

      {/* ========== INTRO STRIP (unchanged structure) ========== */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#F9F5ED' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}>
                <Typography variant="overline" sx={{ color: '#D4A017', fontWeight: 700, letterSpacing: 2, mb: 1, display: 'block' }}>
                  WELCOME TO AL HAYAT
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 600,
                    mb: 2,
                    color: '#0B3D2E',
                    fontSize: { xs: '1.9rem', md: '2.5rem' },
                  }}
                >
                  Where every plate tells a story
                </Typography>
                <Typography sx={{ color: '#555', lineHeight: 1.8, mb: 3 }}>
                  From the first spark of charcoal to the last bite of a fresh roll, we cook with patience and the recipes that define Soldier Bazaar flavour. Our kitchen is open, our spices are ground daily, and every order is prepared with care.
                </Typography>
                <Button component={Link} to="/about" sx={{ color: '#0B3D2E', fontWeight: 600 }} endIcon={<ArrowForwardIcon />}>
                  Read our story
                </Button>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1555939596-5761c9d0d0e0?w=900&q=80"
                alt="Grilled food at AL HAYAT"
                sx={{
                  width: '100%',
                  borderRadius: 4,
                  boxShadow: '0 24px 60px rgba(11,61,46,0.15)',
                  maxHeight: 420,
                  objectFit: 'cover',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ========== VALUES ========== */}
      <Box sx={{ py: 8, bgcolor: '#0B3D2E', color: '#F9F5ED' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {[
              { icon: <LocalFireDepartmentIcon sx={{ fontSize: 36, color: '#D4A017' }} />, title: 'Charcoal fire', text: 'Every tikka, boti and seekh is seared over live charcoal for that unmistakable smoky depth.' },
             { icon: <SpaIcon sx={{ fontSize: 36, color: '#D4A017' }} />, title: 'Daily fresh', text: 'Spices ground in-house, dough rolled to order, greens delivered at dawn.' },
              { icon: <RestaurantIcon sx={{ fontSize: 36, color: '#D4A017' }} />, title: 'Local favourite', text: 'Proudly serving Soldier Bazaar with rolls, grills, burgers and desi classics.' },
            ].map((v, i) => (
              <Grid item xs={12} md={4} key={v.title}>
                <motion.div custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                  <Box sx={{ textAlign: 'center', px: 2 }}>
                    {v.icon}
                    <Typography variant="h6" sx={{ mt: 2, mb: 1, fontFamily: '"Playfair Display", serif' }}>
                      {v.title}
                    </Typography>
                    <Typography sx={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.7 }}>{v.text}</Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ========== FEATURED DISHES ========== */}
      <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: '#F9F5ED' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="overline" sx={{ color: '#D4A017', fontWeight: 700, letterSpacing: 2 }}>
              FROM THE KITCHEN
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontFamily: '"Playfair Display", serif',
                color: '#0B3D2E',
                mt: 1,
                fontSize: { xs: '1.9rem', md: '2.6rem' },
              }}
            >
              Featured dishes
            </Typography>
          </Box>
          {featured.length === 0 ? (
            <Typography textAlign="center" color="text.secondary">
              Featured dishes will appear here once the menu is loaded from the kitchen.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {featured.map((item, i) => (
                <Grid item xs={12} sm={6} md={3} key={item._id || i}>
                  <motion.div custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        overflow: 'hidden',
                        boxShadow: '0 12px 40px rgba(11,61,46,0.08)',
                        transition: 'transform 0.35s ease, box-shadow 0.35s ease',
                        '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 20px 50px rgba(11,61,46,0.14)' },
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'}
                        alt={item.name}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent>
                        <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", serif', fontSize: '1.15rem', mb: 0.5 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, minHeight: 40, fontSize: '0.85rem' }}>
                          {(item.description || '').slice(0, 70)}…
                        </Typography>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography fontWeight={700} color="#0B3D2E" component="span">
                              {item.isFromPrice ? 'From ' : ''}PKR {item.price}
                            </Typography>
                            {item.originalPrice ? (
                              <Typography component="span" variant="caption" sx={{ ml: 0.8, textDecoration: 'line-through', color: 'text.secondary' }}>
                                {item.originalPrice}
                              </Typography>
                            ) : null}
                          </Box>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => addItem(item)}
                            sx={{ bgcolor: '#0B3D2E', borderRadius: 50, px: 2, fontSize: '0.8rem', '&:hover': { bgcolor: '#0e4d3a' } }}
                          >
                            Add
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
          <Box textAlign="center" mt={5}>
            <Button
              component={Link}
              to="/menu"
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              sx={{
                borderColor: '#0B3D2E',
                color: '#0B3D2E',
                borderRadius: 50,
                px: 4,
                fontWeight: 600,
                '&:hover': { bgcolor: 'rgba(11,61,46,0.06)' },
              }}
            >
              View full menu
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ========== GALLERY PREVIEW ========== */}
      <Box sx={{ py: 8, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={5}>
            <Typography variant="overline" sx={{ color: '#D4A017', fontWeight: 700, letterSpacing: 2 }}>
              ATMOSPHERE
            </Typography>
            <Typography variant="h3" sx={{ fontFamily: '"Playfair Display", serif', color: '#0B3D2E', mt: 1, fontSize: { xs: '1.9rem', md: '2.4rem' } }}>
              Inside AL HAYAT
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {(gallery.length
              ? gallery
              : [
                  { image: 'https://images.unsplash.com/photo-1555939596-5761c9d0d0e0?w=800', caption: 'Grill station' },
                  { image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800', caption: 'Seekh kabab' },
                  { image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', caption: 'Burgers' },
                  { image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800', caption: 'Fresh rolls' },
                ]
            ).map((g, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Box
                  component="img"
                  src={g.image}
                  alt={g.caption || ''}
                  sx={{
                    width: '100%',
                    height: { xs: 140, md: 200 },
                    objectFit: 'cover',
                    borderRadius: 2,
                    transition: 'transform 0.4s ease',
                    '&:hover': { transform: 'scale(1.03)' },
                  }}
                />
              </Grid>
            ))}
          </Grid>
          <Box textAlign="center" mt={4}>
            <Button component={Link} to="/gallery" sx={{ color: '#0B3D2E', fontWeight: 600 }} endIcon={<ArrowForwardIcon />}>
              View gallery
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ========== CTA ========== */}
      <Box
        sx={{
          py: 10,
          background: `
            linear-gradient(135deg, rgba(11,61,46,0.92), rgba(11,61,46,0.85)),
            url(https://images.unsplash.com/photo-1555939596-5761c9d0d0e0?w=1600) center/cover
          `,
          color: '#F9F5ED',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="h3" sx={{ fontFamily: '"Playfair Display", serif', mb: 2, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
            Ready to order?
          </Typography>
          <Typography sx={{ opacity: 0.85, mb: 4 }}>
            Cash on delivery across the city. Fresh from our kitchen in Soldier Bazaar to your table.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              component={Link}
              to="/menu"
              variant="contained"
              size="large"
              sx={{
                bgcolor: '#D4A017',
                color: '#1a1a1a',
                fontWeight: 700,
                px: 5,
                py: 1.6,
                borderRadius: 50,
                '&:hover': { bgcolor: '#c49215' },
              }}
            >
              Order now
            </Button>
            <Button
              component="a"
              href="tel:03077622276"
              variant="outlined"
              size="large"
              startIcon={<PhoneIcon />}
              sx={{
                borderColor: 'rgba(249,245,237,0.5)',
                color: '#F9F5ED',
                fontWeight: 600,
                px: 4,
                py: 1.6,
                borderRadius: 50,
                '&:hover': { borderColor: '#D4A017', color: '#D4A017' },
              }}
            >
              Call 0307 7622276
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
