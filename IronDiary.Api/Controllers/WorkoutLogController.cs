using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class WorkoutLogController : ControllerBase
{
    
    private readonly AppDbContext _context;

    public WorkoutLogController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetLogs()
    {
        var logs = await _context.WorkoutLogs
            .Include(w => w.Photos) // Include related photos
            .ToListAsync();
        return Ok(logs);
    }

    [HttpPost]
    public async Task<IActionResult> CreateLog(WorkoutLog log)
    {
        _context.WorkoutLogs.Add(log);
        await _context.SaveChangesAsync();
        return Ok(log);
        //return CreatedAtAction(nameof(GetLogs), new { id = log.Id }, log);
    }

}