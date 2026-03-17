using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        var photos = await _context.WorkoutPhotos
            .ToListAsync();
        return Ok(photos);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePhoto(WorkoutPhoto photo)
    {
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

        try
        {
            // delete the workout photo from the database
            _context.WorkoutPhotos.Remove(photo);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch(Exception ex)
        {
            // Log the exception (not implemented here)
            return StatusCode(500, "An error occurred while deleting the workout photo.");
        }

        
    }

}