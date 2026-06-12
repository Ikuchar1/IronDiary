using Microsoft.EntityFrameworkCore;

/// <summary>
/// Same-day Journal Entry invariants (ADR-0002). Shared by the create and
/// edit paths for both entry kinds so the rules cannot drift.
/// </summary>
public static class SameDayRules
{
    public const string RestDayConflictMessage =
        "You logged a workout on this date — a Rest Day can't go on a day you trained.";

    /// <summary>
    /// True when the user already has a Workout Log on the given calendar
    /// date (day-grained, matching the Streak).
    /// </summary>
    public static Task<bool> HasWorkoutLogOnDateAsync(AppDbContext context, string userId, DateTime date)
    {
        var day = date.Date;
        return context.WorkoutLogs.AnyAsync(w => w.UserId == userId && w.Date.Date == day);
    }

    /// <summary>
    /// Marks the user's Rest Days on the given calendar date for deletion
    /// (a Workout Log overrides them, ADR-0002). Plural because duplicate
    /// Rest Days on one date are tolerated. The caller owns SaveChangesAsync
    /// so the override and the workout write land in one save.
    /// Returns true when any Rest Day was overridden.
    /// </summary>
    public static async Task<bool> OverrideRestDaysOnDateAsync(AppDbContext context, string userId, DateTime date)
    {
        var day = date.Date;
        var restDays = await context.RestDays
            .Where(r => r.UserId == userId && r.Date.Date == day)
            .ToListAsync();

        context.RestDays.RemoveRange(restDays);
        return restDays.Count > 0;
    }
}
