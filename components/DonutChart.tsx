import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Colors } from '@/constants/colors';

export interface DonutSegment {
  value: number;       // raw value (e.g. spent amount)
  color: string;
  label?: string;
}

interface Props {
  segments: DonutSegment[];
  totalLabel: string;        // center top line (e.g. "$14,206")
  subLabel?: string;         // center bottom line (e.g. "49%")
  size?: number;
  strokeWidth?: number;
  /** If true, render as a single arc (progress ring) up to `progressPct` */
  progressMode?: boolean;
  progressPct?: number;      // 0-100
  progressColor?: string;
}

const TAU = 2 * Math.PI;

/**
 * Lightweight SVG donut chart using stroke-dasharray technique.
 * Works with react-native-svg (included in Expo SDK).
 */
export function DonutChart({
  segments,
  totalLabel,
  subLabel,
  size = 200,
  strokeWidth = 22,
  progressMode = false,
  progressPct = 0,
  progressColor = Colors.accent,
}: Props) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = TAU * r;

  // Start from the top (−90°)
  const startOffset = circumference * 0.25;

  // Build segments
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  let accumulatedPct = 0;
  const renderedSegments = segments.map((seg, i) => {
    const pct = total > 0 ? seg.value / total : 0;
    const dashArray = `${pct * circumference} ${circumference}`;
    // offset = circumference * (1 - accumulated) so each segment starts after the previous
    const dashOffset = circumference * (1 - accumulatedPct) + startOffset;
    accumulatedPct += pct;
    return (
      <Circle
        key={i}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={seg.color}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
      />
    );
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G>
          {/* Track ring */}
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={Colors.surfaceElevated}
            strokeWidth={strokeWidth}
          />
          {progressMode ? (
            <Circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={progressColor}
              strokeWidth={strokeWidth}
              strokeDasharray={`${(progressPct / 100) * circumference} ${circumference}`}
              strokeDashoffset={startOffset}
              strokeLinecap="round"
            />
          ) : (
            renderedSegments
          )}
        </G>
      </Svg>

      {/* Center labels */}
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.centerMain}>{totalLabel}</Text>
        {subLabel ? <Text style={styles.centerSub}>{subLabel}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
  },
  centerMain: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  centerSub: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
});
