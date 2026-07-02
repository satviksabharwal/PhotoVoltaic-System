import { Box } from '@mui/material';
import { solar } from '../../theme/solar';
import {
  PeriodKey,
  PeriodTotals,
  PERIOD_NOUN,
  co2Display,
  comparisonLine,
  formatKwh,
  formatMoney,
} from './insightsData';

// ----------------------------------------------------------------------
// The four homeowner insight cards: Energy produced (hero, with delta),
// Money saved, Best day and CO₂ avoided. `locked` renders the cold-start
// skeleton variant (dashed, "—" values, "Soon" badges).
// ----------------------------------------------------------------------

interface InsightCardsProps {
  locked?: boolean;
  totals?: PeriodTotals;
  period?: PeriodKey;
  tariff?: number | null;
  best?: { label: string; kwh: number } | null;
}

interface CardData {
  icon: string;
  hero?: boolean;
  deltaPct?: number | null;
  value: string;
  unit?: string;
  label: string;
  sub?: string;
}

function DeltaPill({ pct }: { pct: number }) {
  const up = pct >= 0;
  return (
    <Box
      component="span"
      sx={{
        fontSize: '12px',
        fontWeight: 700,
        p: '3px 8px',
        borderRadius: '999px',
        background: up ? '#E7F6EC' : '#FBE9E6',
        color: up ? '#1F8A5B' : '#C0392B',
      }}
    >
      {up ? '↑' : '↓'} {Math.abs(pct)}%
    </Box>
  );
}

export default function InsightCards({ locked = false, totals, period = 'week', tariff, best }: InsightCardsProps) {
  let cards: CardData[];
  if (locked || !totals) {
    cards = [
      { icon: '⚡', value: '—', label: 'Energy produced' },
      { icon: '💶', value: '—', label: 'Money saved' },
      { icon: '🏆', value: '—', label: 'Best day' },
      { icon: '🌱', value: '—', label: 'CO₂ avoided' },
    ];
  } else {
    const hasTariff = tariff != null && tariff > 0;
    const co2 = co2Display(totals.kwh);
    cards = [
      {
        icon: '⚡',
        hero: true,
        deltaPct: totals.deltaPct,
        value: formatKwh(totals.kwh),
        unit: 'kWh',
        label: 'Energy produced',
        sub: comparisonLine(totals, period),
      },
      {
        icon: '💶',
        deltaPct: hasTariff ? totals.deltaPct : null,
        value: hasTariff ? `€${formatMoney(totals.kwh * (tariff as number))}` : '—',
        label: 'Money saved',
        sub: hasTariff ? `at your €${tariff}/kWh tariff` : 'set a tariff on this site to see savings',
      },
      {
        icon: '🏆',
        value: best ? formatKwh(best.kwh) : '—',
        unit: best ? 'kWh' : undefined,
        label: 'Best day',
        sub: best ? `${best.label} · ${PERIOD_NOUN[period]}` : PERIOD_NOUN[period],
      },
      {
        icon: '🌱',
        value: co2.value,
        unit: co2.unit,
        label: 'CO₂ avoided',
        sub: PERIOD_NOUN[period],
      },
    ];
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: '18px', mb: '22px' }}>
      {cards.map((card) => (
        <Box
          key={card.label}
          sx={{
            background: locked ? '#FAF8F3' : card.hero ? 'linear-gradient(135deg, #FFF6DC, #FFFDF7)' : '#fff',
            border: `1px ${locked ? 'dashed' : 'solid'} ${card.hero ? '#F4E4A6' : '#EEE8DA'}`,
            borderRadius: '16px',
            p: '20px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '14px' }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '11px',
                background: locked ? '#EFEDE6' : '#FFF3D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '19px',
              }}
            >
              {card.icon}
            </Box>
            {locked && <Box sx={{ fontSize: '11px', fontWeight: 600, color: '#A39B87' }}>Soon</Box>}
            {!locked && card.deltaPct != null && <DeltaPill pct={card.deltaPct} />}
          </Box>
          <Box
            sx={{
              fontFamily: solar.fontDisplay,
              fontSize: '30px',
              fontWeight: 700,
              color: locked ? '#C7BFAC' : solar.ink,
              lineHeight: 1,
              letterSpacing: '-0.01em',
            }}
          >
            {card.value}{' '}
            {card.unit && (
              <Box component="small" sx={{ fontSize: '15px', fontWeight: 600, color: solar.muted }}>
                {card.unit}
              </Box>
            )}
          </Box>
          <Box sx={{ fontSize: '13px', fontWeight: 600, color: '#6B6455', mt: '7px' }}>{card.label}</Box>
          {card.sub && <Box sx={{ fontSize: '12px', color: '#A39B87', mt: '3px' }}>{card.sub}</Box>}
        </Box>
      ))}
    </Box>
  );
}
