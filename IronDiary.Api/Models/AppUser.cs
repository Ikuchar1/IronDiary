using Microsoft.AspNetCore.Identity;

public class AppUser : IdentityUser
{

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? ProfilePictureUrl { get; set; } = string.Empty; //URL to the user's profile picture (could be a local path or a cloud storage URL)

}