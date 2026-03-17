using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
    public async Task<IActionResult> GetRestDays()
    {
        var restDays = await _context.RestDays
            .ToListAsync();
        return Ok(restDays);
    }

    [HttpPost]
    public async Task<IActionResult> CreateRestDay(RestDay restDay)
    {
        _context.RestDays.Add(restDay);
        await _context.SaveChangesAsync();
        return Ok(restDay);
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

        return Ok(restDay);
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

        try
        {
            // delete the rest day from the database
            _context.RestDays.Remove(restDay);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch(Exception ex)
        {
            // Log the exception (not implemented here)
            return StatusCode(500, "An error occurred while deleting the rest day.");
        }

        
    }

}