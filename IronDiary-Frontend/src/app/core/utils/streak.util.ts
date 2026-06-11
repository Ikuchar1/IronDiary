export interface StreakResult {
  streakDays: number;
  workoutSessions: number;
}

// Normalise any date string to its local-midnight timestamp (a "day key").
function toDayKey(dateStr: string): number {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function calculateStreak(
  workoutDates: string[],
  restDates: string[],
  today: Date = new Date()
): StreakResult {
  const workoutKeys = workoutDates.map(toDayKey);
  const activeDays = new Set([...workoutKeys, ...restDates.map(toDayKey)]);

  // Walk backwards from today, counting consecutive days that had any activity.
  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);

  // Grace day: if nothing is logged yet today, the streak can still be alive
  // from yesterday — today isn't "missed" until it's over.
  if (!activeDays.has(cursor.getTime())) {
    cursor.setDate(cursor.getDate() - 1);
  }

  const streakDayKeys = new Set<number>();
  while (activeDays.has(cursor.getTime())) {
    streakDayKeys.add(cursor.getTime());
    cursor.setDate(cursor.getDate() - 1);
  }

  const workoutSessions = workoutKeys.filter(k => streakDayKeys.has(k)).length;

  return { streakDays: streakDayKeys.size, workoutSessions };
}
