import { Box, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { solar } from '../../theme/solar';

const SUPPORT_EMAIL = 'createwithsatvik@gmail.com';
const HINT = 'If this keeps happening, report it at github.com/satviksabharwal/PhotoVoltaic-System/issues';

interface ProjectsErrorStateProps {
  error: unknown;
  onRetry: () => void;
}

interface ErrorDescription {
  body: string;
  lead: string;
  detail?: string;
  auth?: boolean;
}

function endpointOf(error: import('axios').AxiosError): string {
  return `/api${error.config?.url ?? ''}`;
}

function describeError(error: unknown): ErrorDescription {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return {
        body: 'This is taking longer than expected. Try again in a moment.',
        lead: 'Timed out ·',
        detail: endpointOf(error),
      };
    }
    if (!error.response) {
      return {
        body: "We can't reach SolarSense right now. Check your connection and try again.",
        lead: 'Network error',
      };
    }
    if (error.response.status === 401) {
      return {
        body: 'Your session expired. Sign in again to see your projects.',
        lead: 'Request failed ·',
        detail: `401 · ${endpointOf(error)}`,
        auth: true,
      };
    }
    return {
      body: 'Something went wrong reaching SolarSense. Your projects are safe — this is a connection problem on our end. Try again in a moment.',
      lead: 'Request failed ·',
      detail: `${error.response.status} · ${endpointOf(error)}`,
    };
  }
  return {
    body: 'Something went wrong reaching SolarSense. Your projects are safe — this is a connection problem on our end. Try again in a moment.',
    lead: 'Request failed',
  };
}

export default function ProjectsErrorState({ error, onRetry }: ProjectsErrorStateProps) {
  const navigate = useNavigate();
  const { body, lead, detail, auth } = describeError(error);

  return (
    <Box
      role="alert"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        p: '58px 24px 62px',
        border: '1px solid #F0DDD6',
        borderRadius: '22px',
        background: 'linear-gradient(180deg, #FDF6F4, rgba(253,246,244,0))',
      }}
    >
      {/* Icon medallion: two concentric rings around a warning disc */}
      <Box
        aria-hidden
        sx={{
          position: 'relative',
          width: 104,
          height: 104,
          mb: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ position: 'absolute', inset: '-14px', borderRadius: '50%', border: '1.5px solid #F7E6E1' }} />
        <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid #F2D6CF' }} />
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '18px',
            background: '#FBE4DF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '30px',
          }}
        >
          ⚠️
        </Box>
      </Box>

      <Typography
        component="h3"
        sx={{ fontFamily: solar.fontDisplay, fontSize: '23px', fontWeight: 700, color: solar.ink, m: 0 }}
      >
        We couldn&apos;t load your projects
      </Typography>
      <Typography
        sx={{
          fontFamily: solar.fontBody,
          fontSize: '14.5px',
          lineHeight: 1.55,
          color: '#8A8270',
          maxWidth: 452,
          m: '11px 0 0',
        }}
      >
        {body}
      </Typography>

      {/* Error code pill */}
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          mt: '16px',
          p: '6px 12px',
          borderRadius: '999px',
          background: '#fff',
          border: '1px solid #F0DDD6',
          fontFamily: solar.fontDisplay,
          fontSize: '12px',
          fontWeight: 600,
          color: '#B23A2A',
        }}
      >
        <Box component="span" sx={{ width: 7, height: 7, borderRadius: '50%', background: '#D9503B' }} />
        {lead}
        {detail && (
          <Box component="b" sx={{ color: '#8A6459', fontWeight: 600 }}>
            {detail}
          </Box>
        )}
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', mt: '28px' }}>
        <Box
          component="button"
          type="button"
          onClick={auth ? () => navigate('/login') : onRetry}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '9px',
            height: 50,
            px: '26px',
            border: 'none',
            borderRadius: '12px',
            background: solar.ink,
            color: '#fff',
            fontFamily: solar.fontDisplay,
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'filter .15s, transform .1s',
            '&:hover': { filter: 'brightness(1.25)' },
            '&:active': { transform: 'translateY(1px)' },
            '&:focus-visible': { outline: `2px solid ${solar.accent}`, outlineOffset: 2 },
          }}
        >
          {!auth && (
            <Box component="span" sx={{ fontSize: '16px', mt: '-1px' }}>
              ↻
            </Box>
          )}
          {auth ? 'Sign in' : 'Try again'}
        </Box>
        <Box
          component="a"
          href={`mailto:${SUPPORT_EMAIL}?subject=SolarSense%20support`}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            height: 50,
            px: '22px',
            border: '1px solid #E4DDCB',
            borderRadius: '12px',
            background: '#fff',
            color: '#6B6455',
            fontFamily: solar.fontDisplay,
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'none',
            '&:hover': { background: '#FAF6EC', color: solar.ink },
            '&:focus-visible': { outline: `2px solid ${solar.accent}`, outlineOffset: 2 },
          }}
        >
          Contact support
        </Box>
      </Box>

      <Typography sx={{ fontFamily: solar.fontBody, fontSize: '12.5px', color: '#A39B87', m: '22px 0 0' }}>
        {HINT}
      </Typography>
    </Box>
  );
}
