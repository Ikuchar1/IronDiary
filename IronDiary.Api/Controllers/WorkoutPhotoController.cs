using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class WorkoutPhotoController : ControllerBase
{
    
    private readonly AppDbContext _context;

    public WorkoutPhotoController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetPhotos()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var photos = await _context.WorkoutPhotos
            .ToListAsync();
        return Ok(photos);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePhoto(CreateWorkoutPhotoDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var logExists = await _context.WorkoutLogs
            .AnyAsync(w => w.Id == dto.WorkoutLogId && w.UserId == userId);

        if (!logExists)
            return BadRequest("WorkoutLog not found or does not belong to you.");

        var photo = new WorkoutPhoto
        {
            Url = dto.Url,
            WorkoutLogId = dto.WorkoutLogId,
            UserId = userId
        };

        _context.WorkoutPhotos.Add(photo);
        await _context.SaveChangesAsync();
        return Ok(photo);
    }

    //get by id
    [HttpGet("{id}")]
    public async Task<IActionResult> GetWorkoutPhotoById(int id)
    {
        var photo = await _context.WorkoutPhotos.FindAsync(id);

        if(photo == null)
        {
            return NotFound();
        }

        //make sure the it belongs to current user
        if(photo.UserId != User.FindFirstValue(ClaimTypes.NameIdentifier))
        {
            return Forbid();
        }

        return Ok(photo);
    }

    //delete by id
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteWorkoutPhotoById(int id)
    {
        var photo = await _context.WorkoutPhotos.FindAsync(id);

        if(photo == null)
        {
            return NotFound();
        }

        //make sure the it belongs to current user
        if(photo.UserId != User.FindFirstValue(ClaimTypes.NameIdentifier))
        {
            return Forbid();
        }

        try
        {
            // delete the workout photo from the database
            _context.WorkoutPhotos.Remove(photo);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch(Exception)
        {
            // Log the exception (not implemented here)
            return StatusCode(500, "An error occurred while deleting the workout photo.");
        }

        
    }

}