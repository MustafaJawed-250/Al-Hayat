import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

/**
 * AL HAYAT brand mark matching the shop sign:
 * - Golden Arabic ماشاءاللہ
 * - Bold red AL HAYAT
 * - White italic "Roll Point & Fast Food"
 */
export default function Logo({ variant = 'navbar', to = '/' }) {
  const isHero = variant === 'hero';
  const isFooter = variant === 'footer';
  const isDark = isHero || isFooter || variant === 'dark';

  return (
    <Box
      component={to ? Link : 'div'}
      to={to || undefined}
      sx={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: isHero ? 'flex-start' : 'center',
        textDecoration: 'none',
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      {/* Arabic: ماشاءاللہ */}
      <Typography
        component="span"
        sx={{
          fontFamily: '"Noto Naskh Arabic", "Amiri", "Traditional Arabic", serif',
          color: '#D4A017',
          fontWeight: 700,
          fontSize: isHero ? { xs: '1.15rem', sm: '1.45rem', md: '1.75rem' } : isFooter ? '0.85rem' : '0.7rem',
          letterSpacing: '0.04em',
          lineHeight: 1.2,
          direction: 'rtl',
          textShadow: isHero ? '0 2px 12px rgba(212,160,23,0.35)' : 'none',
        }}
      >
        ماشاءاللہ
      </Typography>

      {/* AL HAYAT — red brush-style */}
      <Typography
        component="span"
        sx={{
          fontFamily: '"Playfair Display", "Impact", Georgia, serif',
          fontWeight: 900,
          fontStyle: 'italic',
          color: '#E31C23',
          fontSize: isHero
            ? { xs: '2.6rem', sm: '3.4rem', md: '4.4rem' }
            : isFooter
              ? '1.5rem'
              : { xs: '1.15rem', sm: '1.35rem' },
          letterSpacing: isHero ? '0.02em' : '0.01em',
          lineHeight: 0.95,
          textTransform: 'uppercase',
          textShadow: isHero
            ? '0 3px 0 rgba(0,0,0,0.25), 0 8px 24px rgba(227,28,35,0.35)'
            : '0 1px 2px rgba(0,0,0,0.2)',
          mt: isHero ? 0.3 : 0.15,
        }}
      >
        AL HAYAT
      </Typography>

      {/* Tagline */}
      <Typography
        component="span"
        sx={{
          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
          fontStyle: 'italic',
          fontWeight: 500,
          color: isDark ? 'rgba(249,245,237,0.95)' : '#0B3D2E',
          fontSize: isHero
            ? { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' }
            : isFooter
              ? '0.75rem'
              : { xs: '0.55rem', sm: '0.62rem' },
          letterSpacing: '0.02em',
          mt: isHero ? 0.6 : 0.2,
          whiteSpace: 'nowrap',
        }}
      >
        Roll Point & Fast Food
      </Typography>
    </Box>
  )
}