import { WorkoutLogDto } from './workout-log.model';
import { RestDayDto } from './rest-day.model';

// Frontend-only view model. The `kind` discriminant drives badge rendering and
// which detail route a row links to, sidestepping the overlapping numeric `id`s
// of the two underlying resources.
export type JournalEntry =
  | { kind: 'workout'; id: number; date: string; data: WorkoutLogDto }
  | { kind: 'rest'; id: number; date: string; data: RestDayDto };
