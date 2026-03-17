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

}