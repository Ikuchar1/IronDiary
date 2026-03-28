public class RestDayDto
{
    public int Id { get; set; }
    public string? Note { get; set; }
    public DateTime Date { get; set; }
}

public class CreateRestDayDto
{
    public string? Note { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow;
}