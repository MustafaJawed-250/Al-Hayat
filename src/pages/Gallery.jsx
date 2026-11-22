import { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Container, Grid, CircularProgress, Dialog, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getGallery } from '../utils/api';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const fallback = [
  { image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80', caption: 'Dining room' },
  { image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=80', caption: 'Open kitchen' },
  { image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80', caption: 'Signature plating' },
  { image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&q=80', caption: 'Fresh ingredients' },
  { image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=900&q=80', caption: 'Evening service' },
  { image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=900&q=80', caption: 'Our chefs' },
  { image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=900&q=80', caption: 'Grill station' },
  { image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=900&q=80', caption: 'Table setting' },
];

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const gridRef = useRef(null);

  useEffect(() => {
    getGallery()
      .then((r) => {
        const data = r.data?.data || [];
        setImages(data.length ? data : fallback);
      })
      .catch(() => setImages(fallback))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || !gridRef.current) return;
    const items = gridRef.current.querySelectorAll('.gal-item');
    gsap.fromTo(
      items,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.07,
        ease: 'power2.out',
        scrollTrigger: { trigger: gridRef.current, start: 'top 85%' },
      }
    );
  }, [loading, images]);

  return (
    <Box sx={{ bgcolor: '#F9F5ED', minHeight: '80vh', pb: 8 }}>
      <Box
        sx={{
          bgcolor: '#0B3D2E',
          color: '#F9F5ED',
          py: { xs: 6, md: 8 },
          textAlign: 'center',
        }}
      >
        <Container>
          <Typography variant="overline" sx={{ color: '#D4A017', fontWeight: 700, letterSpacing: 3 }}>
            ATMOSPHERE
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700,
              fontSize: { xs: '2.2rem', md: '3rem' },
              mt: 1,
            }}
          >
            Inside AL HAYAT
          </Typography>
          <Typography sx={{ opacity: 0.8, mt: 1.5, maxWidth: 440, mx: 'auto' }}>
            Moments from our kitchen, dining room and the plates that leave them.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 5 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress sx={{ color: '#0B3D2E' }} />
          </Box>
        ) : (
          <Grid container spacing={2} ref={gridRef}>
            {images.map((img, i) => (
              <Grid item xs={6} md={i % 5 === 0 ? 8 : 4} key={img._id || i}>
                <Box
                  className="gal-item"
                  onClick={() => setLightbox(img)}
                  sx={{
                    position: 'relative',
                    height: { xs: 160, sm: 220, md: i % 5 === 0 ? 360 : 260 },
                    borderRadius: 2,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    '&:hover img': { transform: 'scale(1.06)' },
                    '&:hover .caption': { opacity: 1 },
                  }}
                >
                  <Box
                    component="img"
                    src={img.image}
                    alt={img.caption || 'Gallery'}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease',
                    }}
                  />
                  {img.caption && (
                    <Box
                      className="caption"
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(11,61,46,0.75), transparent 50%)',
                        display: 'flex',
                        alignItems: 'flex-end',
                        p: 2,
                        opacity: 0,
                        transition: 'opacity 0.3s',
                      }}
                    >
                      <Typography sx={{ color: '#F9F5ED', fontWeight: 600, fontSize: '0.95rem' }}>
                        {img.caption}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Dialog
        open={!!lightbox}
        onClose={() => setLightbox(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none', overflow: 'visible' } }}
      >
        {lightbox && (
          <Box sx={{ position: 'relative' }}>
            <IconButton
              onClick={() => setLightbox(null)}
              sx={{ position: 'absolute', top: -40, right: 0, color: '#fff' }}
            >
              <CloseIcon />
            </IconButton>
            <Box
              component="img"
              src={lightbox.image}
              alt={lightbox.caption || ''}
              sx={{ width: '100%', borderRadius: 2, maxHeight: '80vh', objectFit: 'contain' }}
            />
            {lightbox.caption && (
              <Typography textAlign="center" sx={{ color: '#F9F5ED', mt: 1.5 }}>
                {lightbox.caption}
              </Typography>
            )}
          </Box>
        )}
      </Dialog>
    </Box>
  );
}
