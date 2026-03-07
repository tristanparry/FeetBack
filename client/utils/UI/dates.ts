import { DAYS_PER_WEEK } from '@/constants/dates';
import i18n from '@/i18n/index';

export const getFormattedDate = (
  date: Date,
  short?: boolean,
  includeYear: boolean = true,
) => {
  return date.toLocaleDateString(i18n.language, {
    weekday: short ? 'short' : 'long',
    year: includeYear ? 'numeric' : undefined,
    month: short ? 'short' : 'long',
    day: 'numeric',
  });
};

export const getFormattedWeekday = (date: Date, short?: boolean) => {
  return date.toLocaleDateString(i18n.language, {
    weekday: short ? 'short' : 'long',
  });
};

export const getFormattedMonth = (date: Date, short?: boolean) => {
  return date.toLocaleDateString(i18n.language, {
    month: short ? 'short' : 'long',
  });
};

export const extractTimeFromUTCString = (utcString: string) => {
  const date = new Date(utcString);
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  };
  return date.toLocaleTimeString(i18n.language, options);
};

export const extractDateFromUTCString = (utcString: string) => {
  const date = new Date(utcString);
  return date.toLocaleDateString(i18n.language);
};

export const getDateAndTime = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const dateString = formatDateToYYYYMMDD(date);
  return {
    date: dateString,
    year,
    month,
  };
};

export const getLocalDateAsUTC = (localDateString: string): string => {
  const [year, month, day] = localDateString.split('-').map(Number);
  const localDate = new Date(year, month - 1, day, 0, 0, 0, 0);
  const utcYear = localDate.getUTCFullYear();
  const utcMonth = String(localDate.getUTCMonth() + 1).padStart(2, '0');
  const utcDay = String(localDate.getUTCDate()).padStart(2, '0');
  return `${utcYear}-${utcMonth}-${utcDay}`;
};

export const convertHourToString = (hour: number): string => {
  if (hour < 0 || hour > 23) {
    return '';
  }
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  const formatted = date.toLocaleTimeString(i18n.language, {
    hour: 'numeric',
    hour12: true,
  });
  return formatted.replace(/\s+/g, '').replace(/:/g, '').toLowerCase();
};

export const getFormattedDayLabel = (date: Date) => {
  return `${getFormattedDate(date, false, date.getFullYear() !== new Date().getFullYear())}`;
};

export const getFormattedWeekLabel = (date: Date): string => {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(0, 0, 0, 0);
  const currentYear = new Date().getFullYear();
  const startYear = weekStart.getFullYear();
  const endYear = weekEnd.getFullYear();
  const spansYears = startYear !== endYear;
  const bothDifferentYear =
    startYear !== currentYear && endYear !== currentYear;
  const startMonth = getFormattedMonth(weekStart);
  const startDay = weekStart.getDate();
  const endMonth = getFormattedMonth(weekEnd);
  const endDay = weekEnd.getDate();
  let label = '';
  if (spansYears) {
    const startMonthLong = getFormattedMonth(weekStart);
    const endMonthLong = getFormattedMonth(weekEnd);
    label = `${startMonthLong} ${startDay}, ${startYear} - ${endMonthLong} ${endDay}, ${endYear}`;
  } else if (bothDifferentYear) {
    const startMonthLong = getFormattedMonth(weekStart);
    const endMonthLong = getFormattedMonth(weekEnd);
    if (weekStart.getMonth() === weekEnd.getMonth()) {
      label = `${startMonthLong} ${startDay}-${endDay}, ${startYear}`;
    } else {
      label = `${startMonthLong} ${startDay} - ${endMonthLong} ${endDay}, ${startYear}`;
    }
  } else {
    if (weekStart.getMonth() === weekEnd.getMonth()) {
      label = `${startMonth} ${startDay}-${endDay}`;
    } else {
      label = `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
    }
  }

  return label;
};

export const getFormattedMonthLabel = (date: Date) => {
  return `${getFormattedMonth(date)} ${date.getFullYear()}`;
};

export const normalizeDate = (date: string): string => {
  return date.split('T')[0];
};

export const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateParts = (
  year: number,
  month: number,
  day: number,
): string => {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

export const parseDateString = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

export const getWeekStart = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? parseDateString(date) : date;
  const weekStart = new Date(dateObj);
  const dayOfWeek = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

export const getWeekDatesAsDates = (date: Date | string): Date[] => {
  const weekStart = getWeekStart(date);
  return Array.from({ length: DAYS_PER_WEEK }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return date;
  });
};

export const getWeekDatesAsStrings = (date: Date | string): string[] => {
  return getWeekDatesAsDates(date).map(formatDateToYYYYMMDD);
};

export const getMonthDatesAsDates = (year: number, month: number): Date[] => {
  const daysInMonth = getDaysInMonth(year, month);
  return Array.from({ length: daysInMonth }, (_, i) => {
    return new Date(year, month - 1, i + 1);
  });
};

export const getMonthDatesAsStrings = (
  year: number,
  month: number,
): string[] => {
  return getMonthDatesAsDates(year, month).map(formatDateToYYYYMMDD);
};
