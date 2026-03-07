export const getStartEndOfWeek = (dateStr: string) => {
  const date = new Date(`${dateStr}T00:00:00Z`);
  const day = date.getUTCDay();
  const start = new Date(date);
  start.setUTCDate(date.getUTCDate() - day);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
};

export const getStartEndOfMonth = (year: number, month: number) => {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(start);
  end.setUTCMonth(start.getUTCMonth() + 1);
  end.setUTCDate(0);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
};

export const getDaysInRange = (start: string, end: string): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.max(
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1,
    0,
  );
};
