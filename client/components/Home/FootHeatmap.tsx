import { View, Dimensions, Text } from 'react-native';
import {
  Canvas,
  Path,
  Circle,
  Group,
  BlurMask,
  Skia,
  SkPath,
  LinearGradient,
  RoundedRect,
  vec,
} from '@shopify/react-native-skia';
import { leftFootSVGPath, rightFootSVGPath } from '@/constants/ui';
import { jsColors } from '@/constants/themes';
import { useTheme } from '@/contexts/Theme';
import FadeAnimation from '@/utils/UI/FadeAnimation';
import { SensorReading } from '@/types/sensors';
import type { FootReading } from '@/types/metrics';
import { useCallback } from 'react';
import { LEFT_FOOT_KEY, RIGHT_FOOT_KEY } from '@/constants/ble';
import {
  HEATMAP_LEGEND_LABELS,
  SENSOR_POSITIONS,
  getHeatmapColor,
  HEATMAP_LEGEND_LABEL_COLORS,
  HEATMAP_LEGEND_LABEL_POSITIONS,
} from '@/utils/Home/HeatmapView';

const STROKE_WIDTH = 3;
const BLUR_VAL = 80;

type FootHeatmapProps = {
  reading: FootReading;
  scale?: number;
};

const FootHeatmap = ({ reading, scale = 1 }: FootHeatmapProps) => {
  const { theme } = useTheme();
  const colors = jsColors[theme];

  const buildForceMap = useCallback(
    (reading?: SensorReading) => {
      if (!reading) return {};
      const map: Record<number, number> = {};
      reading.forceSensors.forEach(
        (fs) => (map[fs.sensorID] = fs.relativeForce),
      );
      return map;
    },
    [reading],
  );

  const leftForceMap = buildForceMap(reading[LEFT_FOOT_KEY]);
  const rightForceMap = buildForceMap(reading[RIGHT_FOOT_KEY]);

  const leftFootPath = Skia.Path.MakeFromSVGString(leftFootSVGPath);
  const rightFootPath = Skia.Path.MakeFromSVGString(rightFootSVGPath);

  if (!leftFootPath || !rightFootPath) return null;

  const bounds = leftFootPath.getBounds();
  const aspectRatio = bounds.height / bounds.width;

  const scaleView = 0.75 * scale;
  const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
  let footWidth = (windowWidth / 2) * scaleView;
  let footHeight = footWidth * aspectRatio;
  const maxHeight = windowHeight * 0.5;
  if (footHeight > maxHeight) {
    footHeight = maxHeight;
    footWidth = footHeight / aspectRatio;
  }

  const scaleX = footWidth / bounds.width;
  const scaleY = footHeight / bounds.height;

  const baseWidth = 200;
  const scaleFactor = footWidth / baseWidth;

  const heatmapLegendWidth = footWidth * 2 + 16;
  const heatmapLegendHeight = 8 * scale;

  const renderFoot = (path: SkPath, side: keyof typeof SENSOR_POSITIONS) => (
    <FadeAnimation
      axis="horizontal"
      amount={side === LEFT_FOOT_KEY ? -10 : 10}
      duration={750}
    >
      <View
        style={{ width: footWidth, height: footHeight }}
        className={side === LEFT_FOOT_KEY ? 'mr-2' : 'ml-2'}
      >
        <Canvas style={{ width: '100%', height: '100%' }}>
          <Group transform={[{ scaleX }, { scaleY }]}>
            <Path
              path={path}
              color={colors.secondaryText}
              style="stroke"
              strokeWidth={STROKE_WIDTH}
            />
            <Group clip={side === LEFT_FOOT_KEY ? leftFootPath : rightFootPath}>
              {SENSOR_POSITIONS[side].map(({ id, x, y, r }) => {
                const value =
                  (side === LEFT_FOOT_KEY
                    ? leftForceMap[id]
                    : rightForceMap[id]) || 0;
                if (value <= 0 || !reading[side]) return null;
                return (
                  <Circle
                    key={`${side}-${id}`}
                    cx={x}
                    cy={y}
                    r={(30 + 20 * value) * scaleFactor * r}
                    color={getHeatmapColor(value)}
                  >
                    <BlurMask blur={BLUR_VAL * scaleFactor} style="normal" />
                  </Circle>
                );
              })}
            </Group>
          </Group>
        </Canvas>
      </View>
    </FadeAnimation>
  );

  return (
    <FadeAnimation duration={800}>
      <View className="items-center justify-center">
        <View
          className="mb-2 flex-row items-center justify-center"
          style={{ height: footHeight }}
        >
          {renderFoot(leftFootPath, LEFT_FOOT_KEY)}
          {renderFoot(rightFootPath, RIGHT_FOOT_KEY)}
        </View>
        <View style={{ width: heatmapLegendWidth, marginTop: 4 * scale }}>
          <Canvas
            style={{ width: heatmapLegendWidth, height: heatmapLegendHeight }}
          >
            <RoundedRect
              x={0}
              y={0}
              r={heatmapLegendHeight / 2}
              width={heatmapLegendWidth}
              height={heatmapLegendHeight}
            >
              <LinearGradient
                start={vec(0, 0)}
                end={vec(heatmapLegendWidth, 0)}
                colors={HEATMAP_LEGEND_LABEL_COLORS}
                positions={HEATMAP_LEGEND_LABEL_POSITIONS}
              />
            </RoundedRect>
          </Canvas>
          <View
            className="flex-row justify-between"
            style={{ marginTop: 2 * scale, marginBottom: 2 * scale }}
          >
            {HEATMAP_LEGEND_LABELS.map((label) => (
              <Text
                className="text-center text-secondary-text"
                key={label}
                style={{ fontSize: 10 * scale, minWidth: 24 * scale }}
              >
                {label}%
              </Text>
            ))}
          </View>
        </View>
      </View>
    </FadeAnimation>
  );
};

export default FootHeatmap;
