public class WorkoutPhotoDto
{
    public int Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public int WorkoutLogId { get; set; }
}


public class CreateWorkoutPhotoDto
{
    public string Url { get; set; } = string.Empty;
    public int WorkoutLogId { get; set; }
}
