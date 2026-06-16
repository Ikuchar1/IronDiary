using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BodyWeightLogController : ControllerBase
{
    
    private readonly AppDbContext _context;

    public BodyWeightLogController(AppDbContext context)
    {
        _context = context;
    }


    [HttpGet]
    public async Task<ActionResult<IEnumerable<BodyWeightLogDto>>> GetAll()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var logs = await _context.BodyWeightLogs
            .Where(w => w.UserId == userId)
            .Select(w => new BodyWeightLogDto
            {
                Id = w.Id,
                Weight = w.Weight,
                Date = w.Date
            })
            .ToListAsync();

        return Ok(logs);

    }

    [HttpPost]
    public async Task<IActionResult> CreateBodyWeightLog(CreateBodyWeightLogDto dto)
    {
        var log = new BodyWeightLog
        {
            Weight = dto.Weight,
            // Stamp Utc (not ToUniversalTime) so Npgsql can write the timestamptz
            // without shifting the calendar day. The frontend sends a bare
            // YYYY-MM-DD, which binds to midnight-Unspecified. See ADR-0003.
            Date = DateTime.SpecifyKind(dto.Date, DateTimeKind.Utc)
        };
        
        log.UserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        _context.BodyWeightLogs.Add(log);
        await _context.SaveChangesAsync();
        return Ok(new BodyWeightLogDto
        {
            Id = log.Id,
            Weight = log.Weight,
            Date = log.Date
        });
    }

    //get by id
    [HttpGet("{id}")]
    public async Task<IActionResult> GetBodyWeightLogById(int id)
    {
        var log = await _context.BodyWeightLogs.FindAsync(id);

        if(log == null)
        {
            return NotFound();
        }

        //make sure the it belongs to current user
        if(log.UserId != User.FindFirstValue(ClaimTypes.NameIdentifier))
        {
            return NotFound();
        }

        return Ok(new BodyWeightLogDto
        {
            Id = log.Id,
            Weight = log.Weight,
            Date = log.Date
        });
    }

    //update by id
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBodyWeightLog(int id, CreateBodyWeightLogDto dto)
    {
        var log = await _context.BodyWeightLogs.FindAsync(id);

        if (log == null)
        {
            return NotFound();
        }

        //make sure it belongs to current user
        if (log.UserId != User.FindFirstValue(ClaimTypes.NameIdentifier))
        {
            return NotFound();
        }

        log.Weight = dto.Weight;
        // Stamp Utc (not ToUniversalTime) so Npgsql can write the timestamptz
        // without shifting the calendar day. See ADR-0003.
        log.Date = DateTime.SpecifyKind(dto.Date, DateTimeKind.Utc);
        await _context.SaveChangesAsync();

        return Ok(new BodyWeightLogDto
        {
            Id = log.Id,
            Weight = log.Weight,
            Date = log.Date
        });
    }

    //delete by id
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBodyWeightLogById(int id)
    {
        var log = await _context.BodyWeightLogs.FindAsync(id);

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
            // delete the body weight log from the database
            _context.BodyWeightLogs.Remove(log);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch(Exception)
        {
            // Log the exception (not implemented here)
            return StatusCode(500, "An error occurred while deleting the body weight log.");
        }

        
    }

}