import { Box } from '@mui/material';
import { solar, solarApp } from '../../../theme/solar';
import { Product } from '../../../types/models';
import { estimateOutput, WP_PER_M2 } from '../../../utils/solarEstimate';
import EmptySitesState from './EmptySitesState';

// ----------------------------------------------------------------------
// Sites table card: header row + one grid row per site with edit / delete /
// Open (visualization) actions. Renders the designed empty state when the
// project has no sites.
// ----------------------------------------------------------------------

interface SitesTableProps {
  sites: Product[];
  onEdit: (site: Product) => void;
  onDelete: (site: Product) => void;
  onOpen: (site: Product) => void;
  onAddFirst: () => void;
  onUseMyLocation: () => void;
}

const GRID_COLUMNS = '1.5fr 1.2fr 0.8fr 0.7fr 0.6fr 1.1fr 1.2fr';

export function siteCapacityKwp(site: Product): number {
  return site.kwp ?? (site.area * WP_PER_M2[site.module ?? 'mono']) / 1000;
}

function siteAnnualOutput(site: Product): number {
  // Prefer the stored PVGIS estimate; fall back to the rough client formula
  // for sites saved while PVGIS was unreachable.
  if (site.estAnnualKwh != null) return Math.round(site.estAnnualKwh);
  const estimate = estimateOutput({
    area: site.area,
    lat: site.latitude,
    orientation: site.orientation,
    tilt: site.inclination,
    module: site.module ?? 'mono',
    mounting: site.mounting ?? 'roof',
    losses: site.losses ?? 14,
  });
  return estimate ? Math.round(estimate.annualKwh) : 0;
}

const iconButtonSx = {
  width: 32,
  height: 32,
  border: `1px solid ${solarApp.chipBorder}`,
  borderRadius: '8px',
  background: '#fff',
  color: solar.muted,
  fontSize: '13px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all .13s',
  '&:hover': { background: solarApp.chipHover, color: solar.ink },
} as const;

export default function SitesTable({ sites, onEdit, onDelete, onOpen, onAddFirst, onUseMyLocation }: SitesTableProps) {
  if (sites.length === 0) {
    return (
      <Box sx={{ background: '#fff', border: `1px solid ${solarApp.cardBorder}`, borderRadius: '18px', overflow: 'hidden' }}>
        <EmptySitesState onAddFirst={onAddFirst} onUseMyLocation={onUseMyLocation} />
      </Box>
    );
  }

  return (
    <Box sx={{ background: '#fff', border: `1px solid ${solarApp.cardBorder}`, borderRadius: '18px', overflow: 'hidden' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: GRID_COLUMNS,
          alignItems: 'center',
          gap: '12px',
          p: '15px 22px',
          background: '#FAF7EF',
          borderBottom: `1px solid ${solarApp.cardBorder}`,
        }}
      >
        {['Site', 'Coordinates', 'Capacity', 'Orient.', 'Tilt', 'Est. output', 'Actions'].map((heading) => (
          <Box
            key={heading}
            sx={{ fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: solarApp.chipCount }}
          >
            {heading}
          </Box>
        ))}
      </Box>

      {sites.map((site) => (
        <Box
          key={site.id}
          sx={{
            display: 'grid',
            gridTemplateColumns: GRID_COLUMNS,
            alignItems: 'center',
            gap: '12px',
            p: '15px 22px',
            fontSize: '14px',
            color: '#4A4536',
            '& + &': { borderTop: '1px solid #F3EEE2' },
            '&:hover': { background: '#FDFBF4' },
          }}
        >
          <Box sx={{ fontFamily: solar.fontDisplay, fontWeight: 600, color: solar.ink }}>{site.name}</Box>
          <Box sx={{ fontVariantNumeric: 'tabular-nums', color: solarApp.subtitle, fontSize: '13px' }}>
            {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
          </Box>
          <Box sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: solar.ink }}>
            {siteCapacityKwp(site).toFixed(1)} kWp
          </Box>
          <Box>
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                height: 24,
                px: '10px',
                borderRadius: '6px',
                background: '#F4EFE2',
                fontSize: '12px',
                fontWeight: 700,
                color: '#7A5B00',
              }}
            >
              {site.orientation}
            </Box>
          </Box>
          <Box sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: solar.ink }}>{site.inclination}°</Box>
          <Box sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: solar.ink }}>
            {siteAnnualOutput(site).toLocaleString('en-US')}{' '}
            <Box component="span" sx={{ fontWeight: 400, color: solarApp.chipCount }}>
              kWh/yr
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box component="button" type="button" title="Edit" aria-label={`Edit ${site.name}`} onClick={() => onEdit(site)} sx={iconButtonSx}>
              ✎
            </Box>
            <Box
              component="button"
              type="button"
              title="Delete"
              aria-label={`Delete ${site.name}`}
              onClick={() => onDelete(site)}
              sx={{
                ...iconButtonSx,
                '&:hover': { background: '#FDECEA', color: '#C0392B', borderColor: '#F3C9C2' },
              }}
            >
              🗑
            </Box>
            <Box
              component="button"
              type="button"
              onClick={() => onOpen(site)}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                height: 32,
                px: '13px',
                border: 'none',
                borderRadius: '8px',
                background: solar.ink,
                color: '#fff',
                fontFamily: solar.fontDisplay,
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'filter .15s',
                '&:hover': { filter: 'brightness(1.2)' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: 12 }}>
                {[5, 9, 12].map((height) => (
                  <Box key={height} sx={{ width: '3px', height: `${height}px`, background: solar.accent, borderRadius: '1px' }} />
                ))}
              </Box>
              Open
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
