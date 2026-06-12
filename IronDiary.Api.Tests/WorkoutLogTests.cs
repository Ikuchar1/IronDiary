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
        var created = await createResponse.Content.ReadFromJsonAsync<WorkoutLogDto>();
        Assert.NotNull(created);
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
    public async Task ProtectedEndpoint_WithoutToken_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/workoutlog");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
