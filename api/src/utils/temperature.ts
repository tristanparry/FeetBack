export enum TempUnit {
  Celsius = 'C',
  Fahrenheit = 'F',
}

export const TEMP_UNIT_NAMES = {
  [TempUnit.Celsius]: 'common.temperature.celsius.name',
  [TempUnit.Fahrenheit]: 'common.temperature.fahrenheit.name',
};

export const TEMP_UNIT_SYMBOLS = {
  [TempUnit.Celsius]: 'common.temperature.celsius.symbol',
  [TempUnit.Fahrenheit]: 'common.temperature.fahrenheit.symbol',
};

export const DEFAULT_TEMP_UNIT: TempUnit = TempUnit.Celsius;

export const getTemp = (
  temp: number,
  unit: TempUnit = DEFAULT_TEMP_UNIT,
): number => (unit === TempUnit.Fahrenheit ? (temp * 9) / 5 + 32 : temp);
