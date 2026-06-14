import { JournalEntry } from '../models/journal-entry.model';
import { WorkoutLogDto } from '../models/workout-log.model';
import { RestDayDto } from '../models/rest-day.model';

export function mergeJournalEntries(
  workouts: WorkoutLogDto[],
  restDays: RestDayDto[]
): JournalEntry[] {
  const workoutEntries: JournalEntry[] = workouts.map(w => ({
    kind: 'workout',
    id: w.id,
    date: w.date,
    data: w,
  }));
  const restEntries: JournalEntry[] = restDays.map(r => ({
    kind: 'rest',
    id: r.id,
    date: r.date,
    data: r,
  }));

  return [...workoutEntries, ...restEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
