import { Box, Typography, Link as MuiLink, Stack, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import Logo from "./Logo.jsx";
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=V2FH%2BPQ3%2C+Gule+Rana+Colony%2C+Soldier+Bazaar%2C+Karachi';

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: '#061a14', color: '#F9F5ED', py: 6, mt: 0 }}>
      <Box
        className="container"
        sx={{
          width: 'min(1200px, 92%)',
          mx: 'auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
          justifyContent: 'space-between',
        }}
      >
        <Box maxWidth={300}>
          <Logo variant="footer" to="/" />
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 2, lineHeight: 1.7 }}>
            Charcoal-grilled delights, delicious rolls and authentic Pakistani dishes in the heart of Soldier Bazaar, Karachi.
          </Typography>
        </Box>

        <Box>
          <Typography fontWeight={700} mb={1.5} sx={{ color: '#D4A017' }}>
            Explore
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <MuiLink component={Link} to="/menu" color="inherit" underline="hover" sx={{ opacity: 0.9 }}>
              Menu
            </MuiLink>
            <MuiLink component={Link} to="/about" color="inherit" underline="hover" sx={{ opacity: 0.9 }}>
              About
            </MuiLink>
            <MuiLink component={Link} to="/gallery" color="inherit" underline="hover" sx={{ opacity: 0.9 }}>
              Gallery
            </MuiLink>
            <MuiLink component={Link} to="/contact" color="inherit" underline="hover" sx={{ opacity: 0.9 }}>
              Contact
            </MuiLink>
          </Box>
        </Box>

        <Box maxWidth={280}>
          <Typography fontWeight={700} mb={1.5} sx={{ color: '#D4A017' }}>
            Contact
          </Typography>
          <Stack spacing={1.25}>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#D4A017', mt: 0.2 }} />
              <MuiLink
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.9, fontSize: '0.9rem', lineHeight: 1.5 }}
              >
                V2FH+PQ3, Gule Rana Colony
                <br />
                Soldier Bazaar, Karachi
              </MuiLink>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <PhoneIcon sx={{ fontSize: 18, color: '#D4A017' }} />
              <MuiLink href="tel:03077622276" color="inherit" underline="hover" sx={{ opacity: 0.9, fontWeight: 600 }}>
                0307 7622276
              </MuiLink>
            </Stack>
            <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.5 }}>
              PKR 1–1,000 per person · 3.5 ★ (59 reviews)
            </Typography>
          </Stack>
          <Button
            component="a"
            href="tel:03077622276"
            variant="outlined"
            size="small"
            startIcon={<PhoneIcon />}
            sx={{
              mt: 2,
              borderColor: 'rgba(212,160,23,0.5)',
              color: '#D4A017',
              borderRadius: 50,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { borderColor: '#D4A017', bgcolor: 'rgba(212,160,23,0.1)' },
            }}
          >
            Call now
          </Button>
        </Box>
      </Box>

      <Box
        className="container"
        sx={{
          width: 'min(1200px, 92%)',
          mx: 'auto',
          mt: 4,
          pt: 3,
          borderTop: '1px solid rgba(249,245,237,0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="caption" sx={{ opacity: 0.65 }}>
          © {new Date().getFullYear()} AL HAYAT Roll Point & Fast Food. All rights reserved.
        </Typography>
        <MuiLink
          component={Link}
          to="/admin/login"
          color="inherit"
          underline="hover"
          sx={{ opacity: 0.45, fontSize: 12 }}
        >
          Admin Access
        </MuiLink>
      </Box>
    </Box>
  );
}
