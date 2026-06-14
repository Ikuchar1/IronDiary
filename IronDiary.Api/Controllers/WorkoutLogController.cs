using System.Reflection.Metadata;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
[Authorize]
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
    public async Task<ActionResult<IEnumerable<WorkoutLogDto>>> GetAll()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var logs = await _context.WorkoutLogs
            .Where(l => l.UserId == userId)
            .Select(l => new WorkoutLogDto
            {
                Id = l.Id,
                Type = l.Type,
                Description = l.Description,
                Date = l.Date
            })
            .ToListAsync();

        return Ok(logs);
    }

    [HttpPost]
    public async Task<IActionResult> CreateLog(CreateWorkoutLogDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        // Stamp the incoming calendar date as UTC so Npgsql can write it to the
        // timestamptz column. SpecifyKind (not ToUniversalTime) keeps the same
        // day — converting would shift it, the off-by-one ADR-0003 guards against.
        dto.Date = DateTime.SpecifyKind(dto.Date, DateTimeKind.Utc);
        var log = new WorkoutLog
        {
            Type = dto.Type,
            Description = dto.Description,
            Date = dto.Date,
            UserId = userId
        };
        var overrodeRestDay = await SameDayRules.OverrideRestDaysOnDateAsync(_context, userId, dto.Date);
        _context.WorkoutLogs.Add(log);
        await _context.SaveChangesAsync();
        return Ok(ToWriteResult(log, overrodeRestDay));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateLog(int id, CreateWorkoutLogDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var log = await _context.WorkoutLogs
            .FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);

        if (log == null) return NotFound();

        // See CreateLog: stamp as UTC for the timestamptz column without shifting the day.
        dto.Date = DateTime.SpecifyKind(dto.Date, DateTimeKind.Utc);
        log.Type = dto.Type;
        log.Description = dto.Description;
        log.Date = dto.Date;
        var overrodeRestDay = await SameDayRules.OverrideRestDaysOnDateAsync(_context, userId, dto.Date);
        await _context.SaveChangesAsync();

        return Ok(ToWriteResult(log, overrodeRestDay));
    }

    private static WorkoutLogWriteResultDto ToWriteResult(WorkoutLog log, bool overrodeRestDay) => new()
    {
        Workout = new WorkoutLogDto
        {
            Id = log.Id,
            Type = log.Type,
            Description = log.Description,
            Date = log.Date
        },
        OverrodeRestDay = overrodeRestDay
    };

    //get by id
    [HttpGet("{id}")]
    public async Task<IActionResult> GetWorkoutLogById(int id)
    {
        var log = await _context.WorkoutLogs
            .Include(w => w.Photos)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (log == null) return NotFound();
        if (log.UserId != User.FindFirstValue(ClaimTypes.NameIdentifier))
            return NotFound();

        return Ok(new WorkoutLogDetailDto
        {
            Id = log.Id,
            Type = log.Type,
            Description = log.Description,
            Date = log.Date,
            Photos = log.Photos.Select(p => new WorkoutPhotoDto
            {
                Id = p.Id,
                Url = p.Url,
                WorkoutLogId = p.WorkoutLogId
            }).ToList()
        });
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

        //make sure the it belongs to current user
        if(log.UserId != User.FindFirstValue(ClaimTypes.NameIdentifier))
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
        var start = DateTime.SpecifyKind(startDate, DateTimeKind.Utc);
        var end = DateTime.SpecifyKind(endDate, DateTimeKind.Utc);

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var logs = await _context.WorkoutLogs
            .Where(w => w.UserId == userId && w.Date >= start && w.Date <= end)
            .OrderByDescending(w => w.Date)
            .Select(w => new WorkoutLogDto
            {
                Id = w.Id,
                Type = w.Type,
                Description = w.Description,
                Date = w.Date
            })
            .ToListAsync();

        return Ok(logs);
    }

}