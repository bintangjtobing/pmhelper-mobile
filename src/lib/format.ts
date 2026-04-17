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

/**
 * Strip HTML tags + common Markdown syntax and decode HTML entities so a
 * mixed rich-text field (the API stores content as either HTML from TinyMCE
 * or Markdown copy-pasted from other tools) renders cleanly as plain text
 * in list cards and previews.
 *
 * We don't render formatting here — detail screens get the same treatment
 * to stay consistent. If we ever want real rendering, swap this for a
 * markdown renderer (react-native-markdown-display) at the call sites.
 */
export function stripRichText(input?: string | null): string {
  if (!input) return '';
  let s = input;

  // HTML block → newline so paragraphs don't collapse into a single run
  s = s.replace(/<br\s*\/?>/gi, '\n');
  // Table cells: put a bullet separator BEFORE the next cell so adjacent
  // cells don't smash together (e.g. "MetricValue" → "Metric · Value")
  s = s.replace(/<\/(td|th)>\s*<(td|th)[^>]*>/gi, ' · ');
  // Row / list / paragraph terminators → newline
  s = s.replace(/<\/(tr|p|div|li|h[1-6])>/gi, '\n');
  // Strip remaining HTML tags (including the lone <td>, <th>, etc.)
  s = s.replace(/<[^>]+>/g, '');

  // Markdown: fenced code, inline code, images, links
  s = s.replace(/```[\s\S]*?```/g, '');
  s = s.replace(/`([^`]+)`/g, '$1');
  s = s.replace(/!\[[^\]]*\]\([^)]*\)/g, '');
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Headings, blockquotes, lists, HR
  s = s.replace(/^[ \t]*#{1,6}[ \t]+/gm, '');
  s = s.replace(/^[ \t]*>[ \t]?/gm, '');
  s = s.replace(/^[ \t]*[-*+][ \t]+/gm, '');
  s = s.replace(/^[ \t]*\d+\.[ \t]+/gm, '');
  s = s.replace(/^[ \t]*[-*_]{3,}[ \t]*$/gm, '');

  // Bold / italic / strikethrough
  s = s.replace(/\*\*([^*]+)\*\*/g, '$1');
  s = s.replace(/__([^_]+)__/g, '$1');
  s = s.replace(/\*([^*]+)\*/g, '$1');
  s = s.replace(/_([^_]+)_/g, '$1');
  s = s.replace(/~~([^~]+)~~/g, '$1');

  // HTML entities
  s = s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&hellip;/g, '…');

  // Whitespace normalisation
  s = s.replace(/\r\n?/g, '\n');
  s = s.replace(/[ \t]+\n/g, '\n');
  s = s.replace(/\n{3,}/g, '\n\n');
  s = s.trim();

  return s;
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
