public class RestDay
{
    public int Id { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow; //date of the rest day
    public string? Note { get; set; } //optional notes about the rest day
}