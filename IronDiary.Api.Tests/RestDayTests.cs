using System.Net;
using System.Net.Http.Json;

namespace IronDiary.Api.Tests;

public class RestDayTests : IClassFixture<IronDiaryApiFactory>
{
    private readonly IronDiaryApiFactory _factory;

    public RestDayTests(IronDiaryApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task CreatingRestDay_OnDateWithWorkoutLog_ReturnsConflict()
    {
        var client = await _factory.CreateAuthenticatedClientAsync();
        var date = new DateTime(2026, 6, 8, 0, 0, 0, DateTimeKind.Utc);

        var workout = await client.PostAsJsonAsync("/api/workoutlog",
            new CreateWorkoutLogDto { Type = "Pull", Date = date });
        workout.EnsureSuccessStatusCode();

        var restDay = await client.PostAsJsonAsync("/api/restday",
            new CreateRestDayDto { Note = "sore", Date = date });

        Assert.Equal(HttpStatusCode.Conflict, restDay.StatusCode);
        var message = await restDay.Content.ReadAsStringAsync();
        Assert.False(string.IsNullOrWhiteSpace(message)); // displayable, per ADR-0002
    }

    [Fact]
    public async Task CreatingRestDay_OnFreeDate_Succeeds()
    {
        var client = await _factory.CreateAuthenticatedClientAsync();
        var date = new DateTime(2026, 6, 7, 0, 0, 0, DateTimeKind.Utc);

        var response = await client.PostAsJsonAsync("/api/restday",
            new CreateRestDayDto { Note = "deload week", Date = date });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<RestDayDto>();
        Assert.NotNull(created);
        Assert.Equal("deload week", created.Note);
    }

    [Fact]
    public async Task CreatingRestDay_OnDateWithExistingRestDay_Succeeds()
    {
        var client = await _factory.CreateAuthenticatedClientAsync();
        var date = new DateTime(2026, 6, 6, 0, 0, 0, DateTimeKind.Utc);

        var first = await client.PostAsJsonAsync("/api/restday",
            new CreateRestDayDto { Date = date });
        var second = await client.PostAsJsonAsync("/api/restday",
            new CreateRestDayDto { Note = "still resting", Date = date });

        Assert.Equal(HttpStatusCode.OK, first.StatusCode);
        Assert.Equal(HttpStatusCode.OK, second.StatusCode); // duplicates tolerated (ADR-0002)

        var list = await client.GetFromJsonAsync<List<RestDayDto>>("/api/restday");
        Assert.NotNull(list);
        Assert.Equal(2, list.Count(r => r.Date == date));
    }

    [Fact]
    public async Task CreatingRestDay_OnDateWithAnotherUsersWorkoutLog_Succeeds()
    {
        var userA = await _factory.CreateAuthenticatedClientAsync();
        var userB = await _factory.CreateAuthenticatedClientAsync();
        var date = new DateTime(2026, 6, 5, 0, 0, 0, DateTimeKind.Utc);

        var workout = await userB.PostAsJsonAsync("/api/workoutlog",
            new CreateWorkoutLogDto { Type = "Legs", Date = date });
        workout.EnsureSuccessStatusCode();

        var restDay = await userA.PostAsJsonAsync("/api/restday",
            new CreateRestDayDto { Date = date });

        Assert.Equal(HttpStatusCode.OK, restDay.StatusCode);
    }

    [Fact]
    public async Task ConflictCheck_IsDayGrained_DifferentTimesOnSameDateStillConflict()
    {
        var client = await _factory.CreateAuthenticatedClientAsync();

        var workout = await client.PostAsJsonAsync("/api/workoutlog",
            new CreateWorkoutLogDto { Type = "Push", Date = new DateTime(2026, 6, 4, 7, 30, 0, DateTimeKind.Utc) });
        workout.EnsureSuccessStatusCode();

        var restDay = await client.PostAsJsonAsync("/api/restday",
            new CreateRestDayDto { Date = new DateTime(2026, 6, 4, 21, 0, 0, DateTimeKind.Utc) });

        Assert.Equal(HttpStatusCode.Conflict, restDay.StatusCode);
    }
}
