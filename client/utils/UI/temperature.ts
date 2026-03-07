import { TempUnit } from '@/types/temperature';
import { DEFAULT_TEMP_UNIT } from '@/constants/temperature';

export const getTemp = (
  temp: number,
  unit: TempUnit = DEFAULT_TEMP_UNIT,
): number => (unit === TempUnit.Fahrenheit ? (temp * 9) / 5 + 32 : temp);
