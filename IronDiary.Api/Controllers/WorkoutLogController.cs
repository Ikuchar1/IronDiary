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

    //get by id
    [HttpGet("{id}")]
    public async Task<IActionResult> GetWorkoutLogById(int id)
    {
        var log = await _context.WorkoutLogs
            .Include(w => w.Photos)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (log == null)
        {
            return NotFound();
        }

        return Ok(log);
    }

    //delete by id
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteWorkoutLogById(int id)
    {
        var log = await _context.WorkoutLogs.FindAsync(id);

        if(log == null)
        {
            return NotFound();
        }

        try
        {
            // delete the workout log from the database
            _context.WorkoutLogs.Remove(log);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch(Exception)
        {
            // Log the exception (not implemented here)
            return StatusCode(500, "An error occurred while deleting the workout log.");
        }

        
    }

    //get by date range
    [HttpGet("range")]
    public async Task<IActionResult> GetWorkoutLogsByDateRange ([FromQuery]DateTime startDate, [FromQuery]DateTime endDate)
    {
        var logs = await _context.WorkoutLogs
            .Where(w => w.Date >= startDate && w.Date <= endDate)
            .Include(w => w.Photos)
            .OrderByDescending(w => w.Date)
            .ToListAsync();

        return Ok(logs);
    }

}