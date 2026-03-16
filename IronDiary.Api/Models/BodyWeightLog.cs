public class BodyWeightLog
{
    public int Id { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow; //date of the weight measurement
    public float Weight { get; set; } //body weight in pounds
}