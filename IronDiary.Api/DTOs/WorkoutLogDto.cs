public class WorkoutLogDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime Date { get; set; }
}

public class CreateWorkoutLogDto
{
    public string Type { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow;
}

public class WorkoutLogDetailDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime Date { get; set; }
    public List<WorkoutPhotoDto> Photos { get; set; } = new();
}
public class WorkoutLogWriteResultDto
{
    public WorkoutLogDto Workout { get; set; } = null!;
    public bool OverrodeRestDay { get; set; }
}
