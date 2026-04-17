import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Datum = { label: string; value: number; color?: string };

type Props = {
  data: Datum[];
  height?: number;
  maxBars?: number;
};

/**
 * Minimalist editorial bar chart — thin bars, baseline, numeric callouts.
 * No chart library to keep bundle small; pure react-native-svg.
 */
export function BarChart({ data, height = 140, maxBars = 8 }: Props) {
  const items = data.slice(0, maxBars);
  if (!items.length) return null;

  const max = Math.max(...items.map((d) => d.value), 1);
  const gap = 16;
  const [width, setWidth] = React.useState(320);
  const barWidth = Math.max(8, (width - gap * (items.length - 1)) / items.length);
  const chartHeight = height - 36; // space for labels below

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ height, width: '100%' }}
    >
      <Svg width={width} height={height}>
        {/* baseline */}
        <Line
          x1={0}
          x2={width}
          y1={chartHeight}
          y2={chartHeight}
          stroke={colors.border}
          strokeWidth={1}
        />
        {items.map((d, i) => {
          const h = (d.value / max) * (chartHeight - 24);
          const x = i * (barWidth + gap);
          const y = chartHeight - h;
          return (
            <React.Fragment key={i}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={h || 2}
                fill={d.color ?? colors.accent}
                rx={2}
              />
              <SvgText
                x={x + barWidth / 2}
                y={y - 6}
                fill={colors.text}
                fontFamily={fonts.mono}
                fontSize={11}
                textAnchor="middle"
              >
                {d.value}
              </SvgText>
              <SvgText
                x={x + barWidth / 2}
                y={chartHeight + 18}
                fill={colors.textSecondary}
                fontFamily={fonts.body}
                fontSize={10}
                textAnchor="middle"
              >
                {d.label.slice(0, 8)}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}
