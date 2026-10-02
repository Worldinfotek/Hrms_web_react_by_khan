import dayjs from 'dayjs';

/** Working days in the range, skipping weekly off and public holidays. A half day is 0.5. */
export function leaveDates(start: string, end: string, halfDay: boolean, weeklyOff: string[], holidays: string[]) {
  const holidaySet = new Set(holidays);
  const off = new Set(weeklyOff);
  const dates: string[] = [];
  let cursor = dayjs(start).startOf('day');
  const last = dayjs(end).startOf('day');
  if (last.isBefore(cursor, 'day')) return dates;
  while (!cursor.isAfter(last, 'day')) {
    const label = cursor.format('dddd');
    const key = cursor.format('YYYY-MM-DD');
    if (!off.has(label) && !holidaySet.has(key)) dates.push(key);
    cursor = cursor.add(1, 'day');
  }
  if (halfDay) return dates.slice(0, 1);
  return dates;
}

export function leaveDayCount(dates: string[], halfDay: boolean) {
  if (dates.length === 0) return 0;
  return halfDay ? 0.5 : dates.length;
}
