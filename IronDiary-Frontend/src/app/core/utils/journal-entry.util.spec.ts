import { mergeJournalEntries } from './journal-entry.util';
import { WorkoutLogDto } from '../models/workout-log.model';
import { RestDayDto } from '../models/rest-day.model';

describe('mergeJournalEntries', () => {
  it('maps a workout into a workout entry and a rest day into a rest entry', () => {
    const workouts: WorkoutLogDto[] = [
      { id: 1, type: 'Push', description: 'bench', date: '2026-06-10' },
    ];
    const restDays: RestDayDto[] = [
      { id: 1, note: 'sore', date: '2026-06-09' },
    ];

    const result = mergeJournalEntries(workouts, restDays);

    expect(result).toEqual([
      { kind: 'workout', id: 1, date: '2026-06-10', data: workouts[0] },
      { kind: 'rest', id: 1, date: '2026-06-09', data: restDays[0] },
    ]);
  });

  it('interleaves workouts and rest days newest-first by date', () => {
    const workouts: WorkoutLogDto[] = [
      { id: 1, type: 'Push', date: '2026-06-08' },
      { id: 2, type: 'Pull', date: '2026-06-11' },
    ];
    const restDays: RestDayDto[] = [
      { id: 1, date: '2026-06-12' },
      { id: 2, date: '2026-06-09' },
    ];

    const result = mergeJournalEntries(workouts, restDays);

    expect(result.map(e => ({ kind: e.kind, date: e.date }))).toEqual([
      { kind: 'rest', date: '2026-06-12' },
      { kind: 'workout', date: '2026-06-11' },
      { kind: 'rest', date: '2026-06-09' },
      { kind: 'workout', date: '2026-06-08' },
    ]);
  });

  it('keeps a workout and rest day with the same numeric id distinct via kind', () => {
    const workouts: WorkoutLogDto[] = [
      { id: 5, type: 'Legs', date: '2026-06-10' },
    ];
    const restDays: RestDayDto[] = [
      { id: 5, date: '2026-06-09' },
    ];

    const result = mergeJournalEntries(workouts, restDays);

    const workout = result.find(e => e.kind === 'workout');
    const rest = result.find(e => e.kind === 'rest');
    expect(result.length).toBe(2);
    expect(workout?.id).toBe(5);
    expect(rest?.id).toBe(5);
    expect(workout?.kind).toBe('workout');
    expect(rest?.kind).toBe('rest');
  });
});
