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
        var logs = await _context.RestDays
            .ToListAsync();
        return Ok(logs);
    }

    [HttpPost]
    public async Task<IActionResult> CreateRestDay(RestDay log)
    {
        _context.RestDays.Add(log);
        await _context.SaveChangesAsync();
        return Ok(log);
    }

}