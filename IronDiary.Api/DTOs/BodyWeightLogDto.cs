public class BodyWeightLogDto
{
    public int Id { get; set; }
    public float Weight { get; set; }
    public DateTime Date { get; set; }
}

public class CreateBodyWeightLogDto
{
    public float Weight { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow;
}