import { format, getTime, formatDistanceToNow } from 'date-fns';

// ----------------------------------------------------------------------

type InputDate = string | number | Date | null | undefined;

export function fDate(date: InputDate, newFormat?: string): string {
  const fm = newFormat || 'dd MMM yyyy';

  return date ? format(new Date(date), fm) : '';
}

export function fDateTime(date: InputDate, newFormat?: string): string {
  const fm = newFormat || 'dd MMM yyyy p';

  return date ? format(new Date(date), fm) : '';
}

export function fTimestamp(date: InputDate): number | string {
  return date ? getTime(new Date(date)) : '';
}

export function fToNow(date: InputDate): string {
  return date
    ? formatDistanceToNow(new Date(date), {
        addSuffix: true,
      })
    : '';
}
