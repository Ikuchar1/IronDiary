public class WorkoutLog
{
    public int Id { get; set; }
    
    public string Type { get; set; } = string.Empty; // "Push", "Pull", "Legs"
    public string? Description { get; set; } //optional notes about the workout
    public DateTime Date { get; set; } = DateTime.UtcNow; //date of the workout
    public ICollection<WorkoutPhoto> Photos { get; set; } = new List<WorkoutPhoto>(); //collection of pump pics
}