export interface WorkoutPhotoDto {
  id: number;
  url: string;
  workoutLogId: number;
}

export interface WorkoutLogDto {
  id: number;
  type: string;
  description?: string;
  date: string;
}

export interface WorkoutLogDetailDto {
  id: number;
  type: string;
  description?: string;
  date: string;
  photos: WorkoutPhotoDto[];
}

export interface WorkoutLogWriteResultDto {
  workout: WorkoutLogDto;
  overrodeRestDay: boolean;
}

export interface CreateWorkoutLogDto {
  type: string;
  description?: string;
  date: string;
}
