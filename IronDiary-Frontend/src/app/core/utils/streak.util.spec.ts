import { calculateStreak } from './streak.util';

// Fixed reference "today" so tests never depend on the real clock.
const TODAY = new Date(2026, 5, 10, 12, 0, 0); // 2026-06-10, local noon

// Build an ISO date string N days before TODAY (local time, noon → no TZ day-crossing).
function daysAgo(n: number): string {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

describe('calculateStreak', () => {
  it('returns zero streak and zero sessions when there is no activity', () => {
    const result = calculateStreak([], []);

    expect(result).toEqual({ streakDays: 0, workoutSessions: 0 });
  });

  it('counts a single workout logged today', () => {
    const result = calculateStreak([daysAgo(0)], [], TODAY);

    expect(result).toEqual({ streakDays: 1, workoutSessions: 1 });
  });

  it('counts consecutive workout days ending today', () => {
    const result = calculateStreak([daysAgo(0), daysAgo(1), daysAgo(2)], [], TODAY);

    expect(result).toEqual({ streakDays: 3, workoutSessions: 3 });
  });

  it('stops at a gap and ignores activity before it', () => {
    // Active today + yesterday, gap on day 2, then workouts on days 3 and 4.
    const result = calculateStreak(
      [daysAgo(0), daysAgo(1), daysAgo(3), daysAgo(4)],
      [],
      TODAY
    );

    expect(result).toEqual({ streakDays: 2, workoutSessions: 2 });
  });

  it('keeps the streak alive when a rest day fills the gap between workouts', () => {
    // Workout today + two days ago, rest day yesterday bridges them.
    const result = calculateStreak(
      [daysAgo(0), daysAgo(2)],
      [daysAgo(1)],
      TODAY
    );

    // 3 straight days of activity, but only 2 of them were workout sessions.
    expect(result).toEqual({ streakDays: 3, workoutSessions: 2 });
  });

  it('counts multiple workouts on the same day as separate sessions', () => {
    // Morning + evening workout today = one streak day, two sessions.
    const result = calculateStreak([daysAgo(0), daysAgo(0)], [], TODAY);

    expect(result).toEqual({ streakDays: 1, workoutSessions: 2 });
  });

  it('counts a day with both a workout and a rest entry only once toward the streak', () => {
    const result = calculateStreak([daysAgo(0)], [daysAgo(0)], TODAY);

    expect(result).toEqual({ streakDays: 1, workoutSessions: 1 });
  });

  it('keeps the streak alive when yesterday was active but today is not logged yet', () => {
    // Nothing today; the streak should survive the still-in-progress day.
    const result = calculateStreak([daysAgo(1), daysAgo(2)], [], TODAY);

    expect(result).toEqual({ streakDays: 2, workoutSessions: 2 });
  });

  it('resets when neither today nor yesterday had activity', () => {
    const result = calculateStreak([daysAgo(2), daysAgo(3)], [], TODAY);

    expect(result).toEqual({ streakDays: 0, workoutSessions: 0 });
  });
});
