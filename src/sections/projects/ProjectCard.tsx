import { Box, Typography } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { solar, solarApp } from '../../theme/solar';
import { Project } from '../../types/models';

// ----------------------------------------------------------------------
// SolarSense project card: status accent bar, sun icon tile + status pill,
// name, location, Sites/kWp stats and an "Open →" hover affordance.
// ----------------------------------------------------------------------

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
}

const statusStyles = {
  active: {
    iconBg: '#FFF3D0',
    disc: solar.accent,
    discRing: 'rgba(255,193,7,.22)',
    pillBg: '#FBEFC2',
    pillText: '#8A6A00',
    pillDot: '#E0A400',
    name: solar.ink,
    statNumber: solar.ink,
    cardBg: '#fff',
  },
  inactive: {
    iconBg: '#EFEDE6',
    disc: '#C6C0B0',
    discRing: 'rgba(198,192,176,.25)',
    pillBg: '#EDEAE1',
    pillText: '#8A8270',
    pillDot: '#B6AE9C',
    name: '#5B5648',
    statNumber: '#6B6455',
    cardBg: '#FAF8F3',
  },
} as const;

function formatUpdated(updatedAt?: string): string {
  if (!updatedAt) return '—';
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return '—';
  return formatDistanceToNow(date, { addSuffix: true });
}

export default function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const active = project.active ?? true;
  const styles = active ? statusStyles.active : statusStyles.inactive;

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={`${project.name} — ${active ? 'Active' : 'Inactive'} project`}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
      sx={{
        position: 'relative',
        background: styles.cardBg,
        border: `1px solid ${solarApp.cardBorder}`,
        borderRadius: '18px',
        p: '22px 22px 20px',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'transform .16s, box-shadow .16s, border-color .16s',
        '&:hover, &:focus-visible': {
          transform: 'translateY(-3px)',
          boxShadow: '0 18px 40px rgba(29,26,20,.12)',
          borderColor: solarApp.cardBorderHover,
        },
        '&:hover .open-link, &:focus-visible .open-link': { opacity: 1, transform: 'translateX(0)' },
        '&:focus-visible': { outline: `2px solid ${solar.accent}`, outlineOffset: 2 },
        // Left status accent bar.
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: active ? `linear-gradient(180deg, ${solar.accent}, #FFD54F)` : 'transparent',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: '16px' }}>
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: '14px',
            background: styles.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: styles.disc,
              boxShadow: `0 0 0 4px ${styles.discRing}`,
            }}
          />
        </Box>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            height: 28,
            px: '12px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.02em',
            fontFamily: solar.fontBody,
            background: styles.pillBg,
            color: styles.pillText,
          }}
        >
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: styles.pillDot }} />
          {active ? 'Active' : 'Inactive'}
        </Box>
      </Box>

      <Typography
        component="h3"
        sx={{
          fontFamily: solar.fontDisplay,
          fontSize: '19px',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          m: 0,
          color: styles.name,
        }}
      >
        {project.name}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: solar.muted, mt: '6px' }}>
        <Box
          sx={{
            width: 11,
            height: 11,
            borderRadius: '50% 50% 50% 0',
            transform: 'rotate(-45deg)',
            border: '2px solid #C2BAA6',
            flexShrink: 0,
          }}
        />
        {project.autoLocation || 'No location yet'}
      </Box>

      <Box sx={{ height: '1px', background: solarApp.topBarBorder, m: '18px 0 14px' }} />

      <Box sx={{ display: 'flex', gap: '28px' }}>
        {[
          { value: project.sites ?? 0, label: 'Sites' },
          { value: project.capacity ?? 0, label: 'kWp' },
        ].map((stat) => (
          <Box key={stat.label} sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <Box
              sx={{
                fontFamily: solar.fontDisplay,
                fontSize: '20px',
                fontWeight: 700,
                color: styles.statNumber,
                lineHeight: 1,
              }}
            >
              {stat.value}
            </Box>
            <Box
              sx={{
                fontSize: '11.5px',
                fontWeight: 600,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                color: solarApp.label,
              }}
            >
              {stat.label}
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: '18px' }}>
        <Box sx={{ fontSize: '12.5px', color: solarApp.label }}>Updated {formatUpdated(project.updatedAt)}</Box>
        <Box
          className="open-link"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontFamily: solar.fontDisplay,
            fontSize: '13px',
            fontWeight: 700,
            color: active ? solar.accentDeep : solar.muted,
            opacity: 0,
            transform: 'translateX(-4px)',
            transition: 'all .16s',
          }}
        >
          Open →
        </Box>
      </Box>
    </Box>
  );
}
