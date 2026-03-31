export interface RestDayDto {
  id: number;
  note?: string;
  date: string;
}

export interface CreateRestDayDto {
  note?: string;
  date: string;
}
