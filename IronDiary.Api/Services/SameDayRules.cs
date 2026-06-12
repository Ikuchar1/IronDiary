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
}
