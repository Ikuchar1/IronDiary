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
    public async Task<IActionResult> GetBodyWeightLogs()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var logs = await _context.BodyWeightLogs
            .Where(w => w.UserId == userId)
            .ToListAsync();
        return Ok(logs);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBodyWeightLog(BodyWeightLog log)
    {
        log.UserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        _context.BodyWeightLogs.Add(log);
        await _context.SaveChangesAsync();
        return Ok(log);
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
            return Forbid();
        }

        return Ok(log);
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
            return Forbid();
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