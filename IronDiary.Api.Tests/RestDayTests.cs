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
    public async Task UpdatingRestDay_ChangesNoteAndDate()
    {
        var client = await _factory.CreateAuthenticatedClientAsync();

        var createResponse = await client.PostAsJsonAsync("/api/restday",
            new CreateRestDayDto { Note = "rest", Date = new DateTime(2026, 5, 20, 0, 0, 0, DateTimeKind.Utc) });
        createResponse.EnsureSuccessStatusCode();
        var created = (await createResponse.Content.ReadFromJsonAsync<RestDayDto>())!;

        var newDate = new DateTime(2026, 5, 19, 0, 0, 0, DateTimeKind.Utc);
        var response = await client.PutAsJsonAsync($"/api/restday/{created.Id}",
            new CreateRestDayDto { Note = "moved my rest day", Date = newDate });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = await response.Content.ReadFromJsonAsync<RestDayDto>();
        Assert.NotNull(updated);
        Assert.Equal(created.Id, updated.Id);
        Assert.Equal("moved my rest day", updated.Note);
        Assert.Equal(newDate, updated.Date);

        var byId = await client.GetFromJsonAsync<RestDayDto>($"/api/restday/{created.Id}");
        Assert.NotNull(byId);
        Assert.Equal("moved my rest day", byId.Note); // edit persisted, not just echoed
        Assert.Equal(newDate, byId.Date);
    }

    [Fact]
    public async Task UpdatingRestDay_OntoDateWithWorkoutLog_ReturnsConflictAndLeavesRestDayUnchanged()
    {
        var client = await _factory.CreateAuthenticatedClientAsync();
        var originalDate = new DateTime(2026, 5, 18, 0, 0, 0, DateTimeKind.Utc);
        var workoutDate = new DateTime(2026, 5, 17, 0, 0, 0, DateTimeKind.Utc);

        var createResponse = await client.PostAsJsonAsync("/api/restday",
            new CreateRestDayDto { Note = "easy day", Date = originalDate });
        createResponse.EnsureSuccessStatusCode();
        var created = (await createResponse.Content.ReadFromJsonAsync<RestDayDto>())!;

        var workout = await client.PostAsJsonAsync("/api/workoutlog",
            new CreateWorkoutLogDto { Type = "Push", Date = workoutDate });
        workout.EnsureSuccessStatusCode();

        var response = await client.PutAsJsonAsync($"/api/restday/{created.Id}",
            new CreateRestDayDto { Note = "trying to move", Date = workoutDate });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var message = await response.Content.ReadAsStringAsync();
        Assert.False(string.IsNullOrWhiteSpace(message)); // displayable, per ADR-0002

        var byId = await client.GetFromJsonAsync<RestDayDto>($"/api/restday/{created.Id}");
        Assert.NotNull(byId);
        Assert.Equal("easy day", byId.Note); // original untouched
        Assert.Equal(originalDate, byId.Date);
    }

    [Fact]
    public async Task UpdatingRestDay_OntoDateWithAnotherRestDay_Succeeds()
    {
        var client = await _factory.CreateAuthenticatedClientAsync();
        var targetDate = new DateTime(2026, 5, 16, 0, 0, 0, DateTimeKind.Utc);

        var existing = await client.PostAsJsonAsync("/api/restday",
            new CreateRestDayDto { Note = "already resting", Date = targetDate });
        existing.EnsureSuccessStatusCode();

        var createResponse = await client.PostAsJsonAsync("/api/restday",
            new CreateRestDayDto { Date = new DateTime(2026, 5, 15, 0, 0, 0, DateTimeKind.Utc) });
        createResponse.EnsureSuccessStatusCode();
        var created = (await createResponse.Content.ReadFromJsonAsync<RestDayDto>())!;

        var response = await client.PutAsJsonAsync($"/api/restday/{created.Id}",
            new CreateRestDayDto { Date = targetDate });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode); // duplicates tolerated (ADR-0002)

        var list = await client.GetFromJsonAsync<List<RestDayDto>>("/api/restday");
        Assert.NotNull(list);
        Assert.Equal(2, list.Count(r => r.Date == targetDate));
    }

    [Fact]
    public async Task UpdatingNonexistentRestDay_ReturnsNotFound()
    {
        var client = await _factory.CreateAuthenticatedClientAsync();

        var response = await client.PutAsJsonAsync("/api/restday/999999",
            new CreateRestDayDto { Date = new DateTime(2026, 5, 14, 0, 0, 0, DateTimeKind.Utc) });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdatingAnotherUsersRestDay_ReturnsNotFound()
    {
        var userA = await _factory.CreateAuthenticatedClientAsync();
        var userB = await _factory.CreateAuthenticatedClientAsync();
        var date = new DateTime(2026, 5, 13, 0, 0, 0, DateTimeKind.Utc);

        var createResponse = await userB.PostAsJsonAsync("/api/restday",
            new CreateRestDayDto { Note = "B's rest", Date = date });
        createResponse.EnsureSuccessStatusCode();
        var created = (await createResponse.Content.ReadFromJsonAsync<RestDayDto>())!;

        var response = await userA.PutAsJsonAsync($"/api/restday/{created.Id}",
            new CreateRestDayDto { Note = "hacked", Date = date });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var byId = await userB.GetFromJsonAsync<RestDayDto>($"/api/restday/{created.Id}");
        Assert.NotNull(byId);
        Assert.Equal("B's rest", byId.Note); // user B's rest day untouched
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
