import { MaterialCommunityIcons } from '@expo/vector-icons';

type MaterialCommunityIconName = React.ComponentProps<
  typeof MaterialCommunityIcons
>['name'];

export const getBatteryIconName = (
  batteryLevel?: number | null,
): MaterialCommunityIconName => {
  if (batteryLevel == null || batteryLevel < 0) {
    return 'battery-unknown';
  }

  if (batteryLevel <= 10) return 'battery-remove-outline';
  if (batteryLevel <= 15) return 'battery-10';
  if (batteryLevel <= 20) return 'battery-20';
  if (batteryLevel <= 30) return 'battery-30';
  if (batteryLevel <= 40) return 'battery-40';
  if (batteryLevel <= 50) return 'battery-50';
  if (batteryLevel <= 60) return 'battery-60';
  if (batteryLevel <= 70) return 'battery-70';
  if (batteryLevel <= 80) return 'battery-80';
  if (batteryLevel <= 90) return 'battery-90';
  if (batteryLevel <= 100) return 'battery';

  return 'battery-remove-outline';
};
