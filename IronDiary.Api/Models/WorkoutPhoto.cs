public class WorkoutPhoto
{
    public int Id { get; set; }
    public string Url { get; set; } = string.Empty; //URL of the photo (could be a local path or a cloud storage URL)
    public int WorkoutLogId { get; set; } //foreign key to associate with a WorkoutLog
    public WorkoutLog WorkoutLog { get; set; } = null!; //navigation property to the associated WorkoutLog
}