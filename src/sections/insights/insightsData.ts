// ----------------------------------------------------------------------
// Data layer for the Insights page: period filtering, totals + deltas,
// the sunshine-fingerprint heatmap rows/colors, the peak-production
// window and the CO₂-equivalence chips. All computed client-side from
// the site's raw hourly readings (one fetch, instant period switching).
// ----------------------------------------------------------------------

export type PeriodKey = 'today' | 'week' | 'month' | 'all';

/** Row shape returned by GET /product/readings. */
export interface ApiReading {
  recordedAt: string;
  kwh: number;
  solarRad?: number | null;
}

export interface HourlyReading {
  date: Date;
  kwh: number;
}

export const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'Month' },
  { key: 'all', label: 'All' },
];

export const PERIOD_NOUN: Record<PeriodKey, string> = {
  today: 'today',
  week: 'this week',
  month: 'this month',
  all: 'all time',
};

const PREVIOUS_NOUN: Record<Exclude<PeriodKey, 'all'>, string> = {
  today: 'yesterday',
  week: 'last week',
  month: 'last month',
};

const PERIOD_DAYS: Record<Exclude<PeriodKey, 'all'>, number> = { today: 1, week: 7, month: 30 };

/** Grid emission factor: kg CO₂ avoided per solar kWh. */
export const CO2_KG_PER_KWH = 0.38;

/** A mature tree absorbs roughly this much CO₂ per year, in kg. */
const TREE_KG_PER_YEAR = 21;
/** Average petrol car: kg CO₂ per km. */
const CAR_KG_PER_KM = 0.12;
/** One full phone charge, in kWh. */
const PHONE_CHARGE_KWH = 0.0122;

/** Insights unlock once at least one full day of readings exists. */
export const READY_THRESHOLD = 24;

/** Most day-rows the fingerprint renders (the "All" period is capped). */
export const MAX_HEATMAP_DAYS = 31;

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function parseReadings(rows: ApiReading[]): HourlyReading[] {
  return rows.map((row) => ({ date: new Date(row.recordedAt), kwh: row.kwh ?? 0 }));
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function shiftDays(day: Date, days: number): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate() + days);
}

function dayLabel(day: Date): string {
  return `${MONTH_NAMES[day.getMonth()]} ${day.getDate()}`;
}

function sumKwh(readings: HourlyReading[]): number {
  return readings.reduce((total, reading) => total + reading.kwh, 0);
}

// ---------------------------------------------------------------- totals

export interface PeriodTotals {
  kwh: number;
  /** Total of the equally-long period immediately before; null for "all" or no data. */
  prevKwh: number | null;
  /** Whole-percent change vs the previous period; null when not computable. */
  deltaPct: number | null;
  /** Readings inside the selected period, oldest first. */
  inRange: HourlyReading[];
}

export function periodTotals(readings: HourlyReading[], period: PeriodKey, now = new Date()): PeriodTotals {
  if (period === 'all') {
    return { kwh: sumKwh(readings), prevKwh: null, deltaPct: null, inRange: readings };
  }
  const days = PERIOD_DAYS[period];
  const from = shiftDays(startOfDay(now), -(days - 1));
  const prevFrom = shiftDays(from, -days);
  const inRange = readings.filter((reading) => reading.date >= from);
  const previous = readings.filter((reading) => reading.date >= prevFrom && reading.date < from);
  const kwh = sumKwh(inRange);
  const prevKwh = previous.length > 0 ? sumKwh(previous) : null;
  const deltaPct = prevKwh != null && prevKwh > 0 ? Math.round(((kwh - prevKwh) / prevKwh) * 100) : null;
  return { kwh, prevKwh, deltaPct, inRange };
}

/** Sub-line for the energy card, e.g. "this week · vs 434 last week". */
export function comparisonLine(totals: PeriodTotals, period: PeriodKey): string {
  if (period === 'all' || totals.prevKwh == null) return PERIOD_NOUN[period];
  return `${PERIOD_NOUN[period]} · vs ${formatKwh(totals.prevKwh)} ${PREVIOUS_NOUN[period]}`;
}

export function bestDay(inRange: HourlyReading[]): { label: string; kwh: number } | null {
  const byDay = new Map<number, number>();
  inRange.forEach((reading) => {
    const key = startOfDay(reading.date).getTime();
    byDay.set(key, (byDay.get(key) ?? 0) + reading.kwh);
  });
  let best: { key: number; kwh: number } | null = null;
  byDay.forEach((kwh, key) => {
    if (!best || kwh > best.kwh) best = { key, kwh };
  });
  if (!best) return null;
  const found = best as { key: number; kwh: number };
  return { label: dayLabel(new Date(found.key)), kwh: found.kwh };
}

// --------------------------------------------------------------- heatmap

export interface HeatDay {
  label: string;
  /** kWh per hour of this day, index 0–23 (local time). */
  cells: number[];
}

export function heatmapDays(inRange: HourlyReading[], period: PeriodKey, now = new Date()): HeatDay[] {
  if (inRange.length === 0) return [];
  const today = startOfDay(now);
  let from: Date;
  if (period === 'all') {
    const first = startOfDay(inRange[0].date);
    const cap = shiftDays(today, -(MAX_HEATMAP_DAYS - 1));
    from = first > cap ? first : cap;
  } else {
    from = shiftDays(today, -(PERIOD_DAYS[period] - 1));
  }

  const byDay = new Map<number, number[]>();
  inRange.forEach((reading) => {
    const key = startOfDay(reading.date).getTime();
    if (key < from.getTime()) return;
    const cells = byDay.get(key) ?? new Array<number>(24).fill(0);
    cells[reading.date.getHours()] += reading.kwh;
    byDay.set(key, cells);
  });

  const days: HeatDay[] = [];
  for (let offset = 0; ; offset += 1) {
    const day = shiftDays(from, offset);
    if (day > today) break;
    days.push({ label: dayLabel(day), cells: byDay.get(day.getTime()) ?? new Array<number>(24).fill(0) });
  }
  return days;
}

/** True when the "All" period has more history than the fingerprint shows. */
export function heatmapCapped(inRange: HourlyReading[], period: PeriodKey, now = new Date()): boolean {
  if (period !== 'all' || inRange.length === 0) return false;
  return startOfDay(inRange[0].date) < shiftDays(startOfDay(now), -(MAX_HEATMAP_DAYS - 1));
}

/**
 * Heatmap cell color for intensity t in 0..1 (hour kWh ÷ max hour kWh):
 * pale for night/none, then a yellow→amber ramp per the design spec.
 */
export function heatColor(t: number): string {
  if (t <= 0.015) return '#F2EEE2';
  const clamped = Math.min(1, t);
  const lerp = (a: number, b: number) => Math.round(a + (b - a) * clamped);
  return `rgb(${lerp(0xff, 0xcf)},${lerp(0xe7, 0x63)},${lerp(0x9e, 0x08)})`;
}

// ------------------------------------------------------ takeaway + chips

function formatHour(hour: number): string {
  const wrapped = ((hour % 24) + 24) % 24;
  if (wrapped === 0) return '12am';
  if (wrapped === 12) return '12pm';
  return wrapped < 12 ? `${wrapped}am` : `${wrapped - 12}pm`;
}

/** The 2-hour band with the highest average production, e.g. "12–2pm". */
export function peakWindow(inRange: HourlyReading[]): string | null {
  const byHour = new Array<number>(24).fill(0);
  inRange.forEach((reading) => {
    byHour[reading.date.getHours()] += reading.kwh;
  });
  const max = Math.max(...byHour);
  if (max <= 0) return null;
  const peakHour = byHour.indexOf(max);
  return `${formatHour(peakHour)}–${formatHour(peakHour + 2)}`;
}

/** Relatable CO₂/energy equivalents for the period, filtered to ones ≥ 1. */
export function equivalents(kwh: number): string[] {
  const co2Kg = kwh * CO2_KG_PER_KWH;
  const trees = Math.round(co2Kg / TREE_KG_PER_YEAR);
  const km = Math.round(co2Kg / CAR_KG_PER_KM);
  const chargesRaw = kwh / PHONE_CHARGE_KWH;
  const charges = chargesRaw > 1000 ? Math.round(chargesRaw / 100) * 100 : Math.round(chargesRaw);
  const chips: string[] = [];
  if (trees >= 1) chips.push(`🌳 ≈ ${trees.toLocaleString('en-US')} ${trees === 1 ? 'tree' : 'trees'} planted`);
  if (km >= 1) chips.push(`🚗 ≈ ${km.toLocaleString('en-US')} km not driven`);
  if (charges >= 1) chips.push(`📱 ≈ ${charges.toLocaleString('en-US')} phone charges`);
  return chips;
}

// ------------------------------------------------------------ formatting

export function formatKwh(value: number): string {
  if (value >= 100) return Math.round(value).toLocaleString('en-US');
  if (value >= 10) return value.toFixed(1);
  return value.toFixed(2);
}

export function formatMoney(value: number): string {
  return value >= 100 ? Math.round(value).toLocaleString('en-US') : value.toFixed(2);
}

/** CO₂ for a card: tonnes when meaningful, kilograms for small amounts. */
export function co2Display(kwh: number): { value: string; unit: string } {
  const kg = kwh * CO2_KG_PER_KWH;
  if (kg >= 50) return { value: (kg / 1000).toFixed(2), unit: 't' };
  return { value: kg >= 1 ? Math.round(kg).toString() : kg.toFixed(1), unit: 'kg' };
}
