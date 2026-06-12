using System.Net;
using System.Net.Http.Json;

namespace IronDiary.Api.Tests;

public class WorkoutLogTests : IClassFixture<IronDiaryApiFactory>
{
    private readonly IronDiaryApiFactory _factory;

    public WorkoutLogTests(IronDiaryApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task CreatedWorkoutLog_IsReturnedByGetByIdAndList()
    {
        var client = await _factory.CreateAuthenticatedClientAsync();

        var create = new CreateWorkoutLogDto
        {
            Type = "Push",
            Description = "Bench and overhead press",
            Date = new DateTime(2026, 6, 10, 0, 0, 0, DateTimeKind.Utc)
        };

        var createResponse = await client.PostAsJsonAsync("/api/workoutlog", create);
        Assert.Equal(HttpStatusCode.OK, createResponse.StatusCode);
        var result = await createResponse.Content.ReadFromJsonAsync<WorkoutLogWriteResultDto>();
        Assert.NotNull(result);
        var created = result.Workout;
        Assert.Equal("Push", created.Type);

        var byId = await client.GetFromJsonAsync<WorkoutLogDetailDto>($"/api/workoutlog/{created.Id}");
        Assert.NotNull(byId);
        Assert.Equal(created.Id, byId.Id);
        Assert.Equal("Push", byId.Type);
        Assert.Equal("Bench and overhead press", byId.Description);

        var list = await client.GetFromJsonAsync<List<WorkoutLogDto>>("/api/workoutlog");
        Assert.NotNull(list);
        Assert.Contains(list, l => l.Id == created.Id && l.Type == "Push");
    }

    [Fact]
    public async Task TwoWorkoutLogsOnSameDate_AreBothAccepted()
    {
        var client = await _factory.CreateAuthenticatedClientAsync();
        var date = new DateTime(2026, 6, 9, 0, 0, 0, DateTimeKind.Utc);

        var first = await client.PostAsJsonAsync("/api/workoutlog",
            new CreateWorkoutLogDto { Type = "Push", Date = date });
        var second = await client.PostAsJsonAsync("/api/workoutlog",
            new CreateWorkoutLogDto { Type = "Legs", Date = date });

        Assert.Equal(HttpStatusCode.OK, first.StatusCode);
        Assert.Equal(HttpStatusCode.OK, second.StatusCode);

        var list = await client.GetFromJsonAsync<List<WorkoutLogDto>>("/api/workoutlog");
        Assert.NotNull(list);
        Assert.Equal(2, list.Count(l => l.Date == date));
    }

    [Fact]
    public async Task CreatingWorkoutLog_OnDateWithRestDay_DeletesRestDayAndFlagsOverride()
    {
        var client = await _factory.CreateAuthenticatedClientAsync();
        var date = new DateTime(2026, 6, 3, 0, 0, 0, DateTimeKind.Utc);

        var restDay = await client.PostAsJsonAsync("/api/restday",
            new CreateRestDayDto { Note = "planned rest", Date = date });
        restDay.EnsureSuccessStatusCode();

        var response = await client.PostAsJsonAsync("/api/workoutlog",
            new CreateWorkoutLogDto { Type = "Push", Date = date });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<WorkoutLogWriteResultDto>();
        Assert.NotNull(result);
        Assert.True(result.OverrodeRestDay);
        Assert.Equal("Push", result.Workout.Type);

        var restDays = await client.GetFromJsonAsync<List<RestDayDto>>("/api/restday");
        Assert.NotNull(restDays);
        Assert.DoesNotContain(restDays, r => r.Date == date);
    }

    [Fact]
    public async Task CreatingWorkoutLog_OnFreeDate_DoesNotFlagOverride()
    {
        var client = await _factory.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/workoutlog",
            new CreateWorkoutLogDto { Type = "Pull", Date = new DateTime(2026, 6, 2, 0, 0, 0, DateTimeKind.Utc) });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<WorkoutLogWriteResultDto>();
        Assert.NotNull(result);
        Assert.False(result.OverrodeRestDay);
        Assert.Equal("Pull", result.Workout.Type);
    }

    [Fact]
    public async Task CreatingWorkoutLog_DoesNotDeleteAnotherUsersRestDay()
    {
        var userA = await _factory.CreateAuthenticatedClientAsync();
        var userB = await _factory.CreateAuthenticatedClientAsync();
        var date = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc);

        var restDay = await userB.PostAsJsonAsync("/api/restday",
            new CreateRestDayDto { Note = "B rests", Date = date });
        restDay.EnsureSuccessStatusCode();

        var response = await userA.PostAsJsonAsync("/api/workoutlog",
            new CreateWorkoutLogDto { Type = "Legs", Date = date });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<WorkoutLogWriteResultDto>();
        Assert.NotNull(result);
        Assert.False(result.OverrodeRestDay); // user B's Rest Day is not user A's to override

        var userBRestDays = await userB.GetFromJsonAsync<List<RestDayDto>>("/api/restday");
        Assert.NotNull(userBRestDays);
        Assert.Contains(userBRestDays, r => r.Date == date);
    }

    [Fact]
    public async Task Override_IsDayGrained_DifferentTimesOnSameDateStillOverride()
    {
        var client = await _factory.CreateAuthenticatedClientAsync();

        var restDay = await client.PostAsJsonAsync("/api/restday",
            new CreateRestDayDto { Date = new DateTime(2026, 5, 31, 7, 0, 0, DateTimeKind.Utc) });
        restDay.EnsureSuccessStatusCode();

        var response = await client.PostAsJsonAsync("/api/workoutlog",
            new CreateWorkoutLogDto { Type = "Push", Date = new DateTime(2026, 5, 31, 21, 0, 0, DateTimeKind.Utc) });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<WorkoutLogWriteResultDto>();
        Assert.NotNull(result);
        Assert.True(result.OverrodeRestDay);

        var restDays = await client.GetFromJsonAsync<List<RestDayDto>>("/api/restday");
        Assert.NotNull(restDays);
        Assert.Empty(restDays);
    }

    [Fact]
    public async Task ProtectedEndpoint_WithoutToken_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/workoutlog");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
