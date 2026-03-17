using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
    public async Task<IActionResult> GetBodyWeightLogs()
    {
        var logs = await _context.BodyWeightLogs
            .ToListAsync();
        return Ok(logs);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBodyWeightLog(BodyWeightLog log)
    {
        _context.BodyWeightLogs.Add(log);
        await _context.SaveChangesAsync();
        return Ok(log);
    }

}