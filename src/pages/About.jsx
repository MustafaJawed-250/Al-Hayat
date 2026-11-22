import { useState, useEffect, useRef } from 'react';
import { getSiteSettings } from '../utils/api';
import { Box, Typography, Container, Grid, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function About() {
  const [aboutMain, setAboutMain] = useState('https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=900&q=80');
  useEffect(() => {
    getSiteSettings()
      .then((r) => {
        const url = r.data?.data?.['about-main']?.url;
        if (url) setAboutMain(url);
      })
      .catch(() => {});
  }, []);

  const storyRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.about-reveal').forEach((el) => {
        gsap.from(el, {
          y: 50,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        });
      });
    }, storyRef);
    return () => ctx.revert();
  }, []);

  return (
    <Box sx={{ bgcolor: '#F9F5ED' }} ref={storyRef}>
      {/* Hero banner */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 320, md: 420 },
          background: `
            linear-gradient(to bottom, rgba(11,61,46,0.7), rgba(11,61,46,0.85)),
            url(https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&q=80) center/cover
          `,
          display: 'flex',
          alignItems: 'flex-end',
          color: '#F9F5ED',
        }}
      >
        <Container maxWidth="lg" sx={{ pb: 6 }}>
          <Typography variant="overline" sx={{ color: '#D4A017', fontWeight: 700, letterSpacing: 2 }}>
            OUR STORY
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700,
              fontSize: { xs: '2.2rem', md: '3.2rem' },
              mt: 1,
            }}
          >
            Built on fire, spice & family
          </Typography>
        </Container>
      </Box>

      {/* Origin story */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box className="about-reveal">
              <Typography variant="overline" sx={{ color: '#D4A017', fontWeight: 700, letterSpacing: 2 }}>
                THE BEGINNING
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  color: '#0B3D2E',
                  mt: 1,
                  mb: 2,
                  fontSize: { xs: '1.7rem', md: '2.2rem' },
                }}
              >
                From a small grill to a city favourite
              </Typography>
              <Typography sx={{ color: '#555', lineHeight: 1.85, mb: 2 }}>
                AL HAYAT started as a single charcoal grill on Harbour Street. The founder, Chef Imran, wanted one thing: the taste of home-cooked Pakistani food without compromise — the same smoke, the same spice, the same slow patience his mother used in the kitchen.
              </Typography>
              <Typography sx={{ color: '#555', lineHeight: 1.85 }}>
                Word spread. Regulars became family. Today we still grill over real charcoal, still grind spices every morning, and still plate every dish as if it were for someone we love.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              className="about-reveal"
              component="img"
              src={aboutMain}
              alt="Chef at work"
              sx={{ width: '100%', borderRadius: 4, boxShadow: '0 20px 50px rgba(11,61,46,0.12)', maxHeight: 440, objectFit: 'cover' }}
            />
          </Grid>
        </Grid>
      </Container>

      {/* Quote band */}
      <Box sx={{ bgcolor: '#0B3D2E', color: '#F9F5ED', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography
            className="about-reveal"
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: '1.4rem', md: '1.9rem' },
              fontStyle: 'italic',
              lineHeight: 1.6,
              mb: 2,
            }}
          >
            “We don’t chase trends. We chase the perfect sear, the perfect gravy, the perfect moment when a guest takes the first bite and smiles.”
          </Typography>
          <Typography sx={{ color: '#D4A017', fontWeight: 600 }}>— Chef Imran, Founder</Typography>
        </Container>
      </Box>

      {/* Values / pillars */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box textAlign="center" mb={6} className="about-reveal">
          <Typography variant="overline" sx={{ color: '#D4A017', fontWeight: 700, letterSpacing: 2 }}>
            WHAT WE STAND FOR
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontFamily: '"Playfair Display", serif',
              color: '#0B3D2E',
              mt: 1,
              fontSize: { xs: '1.7rem', md: '2.3rem' },
            }}
          >
            Three promises we keep every day
          </Typography>
        </Box>
        <Grid container spacing={4}>
          {[
            {
              title: 'Real fire',
              text: 'No electric grills. Every piece of meat that leaves our kitchen has tasted live charcoal. That is non-negotiable.',
              img: 'https://images.unsplash.com/photo-1555939596-5761c9d0d0e0?w=700&q=80',
            },
            {
              title: 'Honest ingredients',
              text: 'We source from trusted local suppliers. Yoghurt is set in-house. Spices are ground daily. Nothing frozen that should be fresh.',
              img: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=700&q=80',
            },
            {
              title: 'Warm hospitality',
              text: 'Whether you dine in or order at home, you are a guest. We treat every order with the care we would give our own family.',
              img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&q=80',
            },
          ].map((item, i) => (
            <Grid item xs={12} md={4} key={item.title}>
              <motion.div custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Box
                  component="img"
                  src={item.img}
                  alt={item.title}
                  sx={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 3, mb: 2 }}
                />
                <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", serif', color: '#0B3D2E', mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography sx={{ color: '#555', lineHeight: 1.75, fontSize: '0.95rem' }}>{item.text}</Typography>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Experience strip */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={5}>
              <Box className="about-reveal">
                <Typography variant="overline" sx={{ color: '#D4A017', fontWeight: 700, letterSpacing: 2 }}>
                  THE EXPERIENCE
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontFamily: '"Playfair Display", serif',
                    color: '#0B3D2E',
                    mt: 1,
                    mb: 2,
                    fontSize: { xs: '1.6rem', md: '2.1rem' },
                  }}
                >
                  Dine with us or let us come to you
                </Typography>
                <Typography sx={{ color: '#555', lineHeight: 1.8 }}>
                  Our dining room is warm and unhurried — dark wood, soft light, the quiet crackle of the grill in the background. Prefer home? Our delivery team brings the same care to your door, cash on delivery, across the city.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={7}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} className="about-reveal">
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700&q=80"
                  alt="Dining room"
                  sx={{ flex: 1, height: 280, objectFit: 'cover', borderRadius: 3 }}
                />
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=700&q=80"
                  alt="Food plating"
                  sx={{ flex: 1, height: 280, objectFit: 'cover', borderRadius: 3 }}
                />
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
