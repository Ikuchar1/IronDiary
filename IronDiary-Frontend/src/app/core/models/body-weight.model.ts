export interface BodyWeightLogDto {
  id: number;
  weight: number;
  date: string;
}

export interface CreateBodyWeightLogDto {
  weight: number;
  date: string;
}
