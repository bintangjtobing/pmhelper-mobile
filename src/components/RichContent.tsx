import React, { useMemo } from 'react';
import { useWindowDimensions, Linking } from 'react-native';
import RenderHtml, { MixedStyleRecord, defaultSystemFonts } from 'react-native-render-html';
import { colors, spacing } from '../theme/colors';
import { fonts } from '../theme/typography';
import { Text } from './Text';

type Props = {
  /** Either HTML (TinyMCE output from the web) or plain markdown-ish text. */
  body?: string | null;
  placeholder?: string;
};

/**
 * Convert common Markdown syntax to HTML so `react-native-render-html`
 * can style both inputs consistently. Intentionally conservative — we only
 * translate the patterns that actually show up in PMHelper content so we
 * don't introduce surprises.
 */
function mdToHtml(raw: string): string {
  let s = raw.replace(/\r\n?/g, '\n');

  // Fenced code blocks first
  s = s.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${escape(code)}</code></pre>`);

  // Headings
  s = s.replace(/^[ \t]*######[ \t]+(.+)$/gm, '<h6>$1</h6>');
  s = s.replace(/^[ \t]*#####[ \t]+(.+)$/gm, '<h5>$1</h5>');
  s = s.replace(/^[ \t]*####[ \t]+(.+)$/gm, '<h4>$1</h4>');
  s = s.replace(/^[ \t]*###[ \t]+(.+)$/gm, '<h3>$1</h3>');
  s = s.replace(/^[ \t]*##[ \t]+(.+)$/gm, '<h2>$1</h2>');
  s = s.replace(/^[ \t]*#[ \t]+(.+)$/gm, '<h1>$1</h1>');

  // Blockquotes
  s = s.replace(/^[ \t]*>[ \t]?(.*)$/gm, '<blockquote>$1</blockquote>');

  // Unordered + ordered list items — collapse consecutive into <ul>/<ol>
  s = s.replace(/(^|\n)((?:[ \t]*[-*+][ \t]+.+\n?)+)/g, (_, pre, block) => {
    const items = block.trim().split(/\n/).map((l: string) => l.replace(/^[ \t]*[-*+][ \t]+/, '').trim());
    return `${pre}<ul>${items.map((i: string) => `<li>${i}</li>`).join('')}</ul>`;
  });
  s = s.replace(/(^|\n)((?:[ \t]*\d+\.[ \t]+.+\n?)+)/g, (_, pre, block) => {
    const items = block.trim().split(/\n/).map((l: string) => l.replace(/^[ \t]*\d+\.[ \t]+/, '').trim());
    return `${pre}<ol>${items.map((i: string) => `<li>${i}</li>`).join('')}</ol>`;
  });

  // Inline code
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Bold + italic
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  s = s.replace(/_([^_]+)_/g, '<em>$1</em>');
  s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  // Links + images
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Paragraph breaks — double newline between text blocks → <br><br>
  s = s.replace(/\n{2,}/g, '<br/><br/>');
  s = s.replace(/\n/g, '<br/>');

  return s;
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function looksLikeHtml(s: string): boolean {
  return /<(p|div|h[1-6]|table|ul|ol|strong|em|br|img)\b/i.test(s);
}

const systemFonts = [...defaultSystemFonts, fonts.body, fonts.bodyBold, fonts.bodyMedium, fonts.display, fonts.mono];

const baseStyle = {
  color: colors.text,
  fontFamily: fonts.body,
  fontSize: 15,
  lineHeight: 23,
};

const tagsStyles: MixedStyleRecord = {
  body: baseStyle,
  p: { marginBottom: spacing.md, marginTop: 0 },
  h1: { fontFamily: fonts.display, fontSize: 26, lineHeight: 30, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm, letterSpacing: -0.4 },
  h2: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm, letterSpacing: -0.3 },
  h3: { fontFamily: fonts.display, fontSize: 18, lineHeight: 24, color: colors.text, marginTop: spacing.md, marginBottom: 4 },
  h4: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 22, color: colors.text, marginTop: spacing.md, marginBottom: 2 },
  h5: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.text, marginTop: spacing.md },
  h6: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.textSecondary, marginTop: spacing.md, textTransform: 'uppercase', letterSpacing: 1 },
  strong: { fontFamily: fonts.bodyBold, color: colors.text },
  b: { fontFamily: fonts.bodyBold, color: colors.text },
  em: { fontStyle: 'italic', color: colors.text },
  i: { fontStyle: 'italic', color: colors.text },
  del: { textDecorationLine: 'line-through', color: colors.textMuted },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    paddingLeft: spacing.md,
    marginVertical: spacing.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  a: { color: colors.accent, textDecorationLine: 'underline' },
  code: {
    fontFamily: fonts.mono,
    fontSize: 13,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  pre: {
    fontFamily: fonts.mono,
    fontSize: 12,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: 8,
    marginVertical: spacing.sm,
    color: colors.text,
  },
  ul: { marginBottom: spacing.sm, paddingLeft: spacing.md },
  ol: { marginBottom: spacing.sm, paddingLeft: spacing.md },
  li: { marginBottom: 4 },
  table: {
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tr: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  th: {
    flex: 1,
    padding: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.textSecondary,
  },
  td: {
    flex: 1,
    padding: spacing.sm,
    fontSize: 14,
    color: colors.text,
  },
  hr: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  img: { maxWidth: '100%', borderRadius: 8 },
};

export function RichContent({ body, placeholder }: Props) {
  const { width } = useWindowDimensions();

  const html = useMemo(() => {
    if (!body || !body.trim()) return null;
    return looksLikeHtml(body) ? body : mdToHtml(body);
  }, [body]);

  if (!html) {
    return (
      <Text variant="body" dim italic>
        {placeholder ?? 'Nothing yet.'}
      </Text>
    );
  }

  return (
    <RenderHtml
      contentWidth={width - spacing.lg * 2}
      source={{ html }}
      systemFonts={systemFonts}
      tagsStyles={tagsStyles}
      baseStyle={baseStyle}
      renderersProps={{
        a: {
          onPress: (_, href) => {
            if (href) Linking.openURL(href).catch(() => {});
          },
        },
      }}
      defaultTextProps={{ selectable: true }}
    />
  );
}
