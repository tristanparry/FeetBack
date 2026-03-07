import { LEFT_FOOT_KEY, RIGHT_FOOT_KEY } from '@/constants/ble';

export const SENSOR_POSITIONS = {
  [LEFT_FOOT_KEY]: [
    { id: 1,  x: 250, y: 80,  r: 1.5 },
    { id: 2,  x: 170, y: 50,  r: 1.5 },
    { id: 3,  x: 50,  y: 450, r: 2   },
    { id: 4,  x: 100, y: 100, r: 1.5 },
    { id: 5,  x: 225, y: 550, r: 2   },
    { id: 6,  x: 150, y: 400, r: 2   },
    { id: 7,  x: 80,  y: 625, r: 2   },
    { id: 8,  x: 160, y: 800, r: 2   },
    { id: 9,  x: 225, y: 200, r: 3   },
    { id: 10, x: 80,  y: 250, r: 3   },
    { id: 11, x: 160, y: 700, r: 3   },
  ],
  [RIGHT_FOOT_KEY]: [
    { id: 1,  x: 80,  y: 80,  r: 1.5 },
    { id: 2,  x: 160, y: 50,  r: 1.5 },
    { id: 3,  x: 280, y: 450, r: 2   },
    { id: 4,  x: 215, y: 100, r: 1.5 },
    { id: 5,  x: 105, y: 550, r: 2   },
    { id: 6,  x: 180, y: 400, r: 2   },
    { id: 7,  x: 230, y: 625, r: 2   },
    { id: 8,  x: 170, y: 800, r: 2   },
    { id: 9,  x: 105, y: 200, r: 3   },
    { id: 10, x: 250, y: 250, r: 3   },
    { id: 11, x: 170, y: 700, r: 3   },
  ],
};

const BLUE = [0, 0, 255];
const GREEN = [0, 255, 0];
const YELLOW = [255, 200, 0];
const RED = [255, 0, 0];
export const HEATMAP_COLOR_THRESHOLDS = [
  { threshold: 0.0, color: BLUE },
  { threshold: 0.33, color: GREEN },
  { threshold: 0.66, color: YELLOW },
  { threshold: 1.0, color: RED },
];

export const getHeatmapColor = (value: number) => {
  for (let i = 0; i < HEATMAP_COLOR_THRESHOLDS.length; i++) {
    const currentColor = HEATMAP_COLOR_THRESHOLDS[i];
    const nextColor = HEATMAP_COLOR_THRESHOLDS[i + 1];
    if (value >= currentColor.threshold && value <= nextColor.threshold) {
      const calculatedColor = currentColor.color.map((color, index) =>
        Math.round(
          color +
            ((value - currentColor.threshold) /
              (nextColor.threshold - currentColor.threshold)) *
              (nextColor.color[index] - color),
        ),
      );
      return `rgb(${calculatedColor[0]}, ${calculatedColor[1]}, ${calculatedColor[2]})`;
    }
  }
  return `rgb(0, 0, 0)`;
};

export const HEATMAP_LEGEND_LABELS = [0, 20, 40, 60, 80, 100];
export const HEATMAP_LEGEND_LABEL_COLORS = HEATMAP_COLOR_THRESHOLDS.map(
  ({ threshold }) => getHeatmapColor(threshold),
);
export const HEATMAP_LEGEND_LABEL_POSITIONS = HEATMAP_COLOR_THRESHOLDS.map(
  ({ threshold }) => threshold,
);
