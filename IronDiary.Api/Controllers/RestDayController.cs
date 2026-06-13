using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RestDayController : ControllerBase
{
    
    private readonly AppDbContext _context;

    public RestDayController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RestDayDto>>> GetAll()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var restDays = await _context.RestDays
            .Where(r => r.UserId == userId)
            .Select(r => new RestDayDto
            {
                Id = r.Id,
                Note = r.Note,
                Date = r.Date
            })
            .ToListAsync();

        return Ok(restDays);
    }

    [HttpPost]
    public async Task<IActionResult> CreateRestDay(CreateRestDayDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        //ADR-0002: a date with a workout can't also be a rest day
        if (await SameDayRules.HasWorkoutLogOnDateAsync(_context, userId, dto.Date))
        {
            return Conflict(SameDayRules.RestDayConflictMessage);
        }

        var restDay = new RestDay
        {
            Note = dto.Note,
            Date = dto.Date
        };
        restDay.UserId = userId;
        _context.RestDays.Add(restDay);
        await _context.SaveChangesAsync();
        return Ok(ToDto(restDay));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRestDay(int id, CreateRestDayDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var restDay = await _context.RestDays
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

        if (restDay == null) return NotFound();

        //ADR-0002: a date with a workout can't also be a rest day
        if (await SameDayRules.HasWorkoutLogOnDateAsync(_context, userId, dto.Date))
        {
            return Conflict(SameDayRules.RestDayConflictMessage);
        }

        restDay.Note = dto.Note;
        restDay.Date = dto.Date;
        await _context.SaveChangesAsync();

        return Ok(ToDto(restDay));
    }

    //get by id
    [HttpGet("{id}")]
    public async Task<IActionResult> GetRestDayById(int id)
    {
        var restDay = await _context.RestDays.FindAsync(id);

        if(restDay == null)
        {
            return NotFound();
        }

        //make sure the it belongs to current user
        if(restDay.UserId != User.FindFirstValue(ClaimTypes.NameIdentifier))
        {
            return NotFound();
        }

        return Ok(ToDto(restDay));
    }

    //delete by id
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRestDayById(int id)
    {

        var restDay = await _context.RestDays.FindAsync(id);

        if(restDay == null)
        {
            return NotFound();
        }

        //make sure the it belongs to current user
        if(restDay.UserId != User.FindFirstValue(ClaimTypes.NameIdentifier))
        {
            return NotFound();
        }

        try
        {
            // delete the rest day from the database
            _context.RestDays.Remove(restDay);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch(Exception)
        {
            // Log the exception (not implemented here)
            return StatusCode(500, "An error occurred while deleting the rest day.");
        }


    }

    private static RestDayDto ToDto(RestDay restDay) => new()
    {
        Id = restDay.Id,
        Note = restDay.Note,
        Date = restDay.Date
    };

}