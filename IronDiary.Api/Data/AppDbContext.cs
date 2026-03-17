using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<WorkoutLog> WorkoutLogs { get; set; }
    public DbSet<RestDay> RestDays { get; set; }
    public DbSet<BodyWeightLog> BodyWeightLogs { get; set; }
    public DbSet<WorkoutPhoto> WorkoutPhotos { get; set; }
}