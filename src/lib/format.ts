import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { colors } from '../theme/colors';

export function fmtDate(iso?: string | null, pattern = 'MMM d, yyyy'): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), pattern);
  } catch {
    return iso;
  }
}

export function fmtRelative(iso?: string | null): string {
  if (!iso) return '—';
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

export function fmtWeek(start?: string, end?: string): string {
  if (!start || !end) return '—';
  try {
    const s = parseISO(start);
    const e = parseISO(end);
    if (s.getMonth() === e.getMonth()) {
      return `${format(s, 'MMM d')} – ${format(e, 'd, yyyy')}`;
    }
    return `${format(s, 'MMM d')} – ${format(e, 'MMM d, yyyy')}`;
  } catch {
    return `${start} – ${end}`;
  }
}

export function priorityColor(name?: string | null): string {
  switch (name?.toLowerCase()) {
    case 'blocker':
      return colors.priorityBlocker;
    case 'critical':
      return colors.priorityCritical;
    case 'high':
      return colors.priorityHigh;
    case 'normal':
      return colors.priorityNormal;
    case 'low':
      return colors.priorityLow;
    default:
      return colors.textSecondary;
  }
}
