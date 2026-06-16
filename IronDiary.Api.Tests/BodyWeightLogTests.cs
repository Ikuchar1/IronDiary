using System.Net;
using System.Net.Http.Json;

namespace IronDiary.Api.Tests;

public class BodyWeightLogTests : IClassFixture<IronDiaryApiFactory>
{
    private readonly IronDiaryApiFactory _factory;

    public BodyWeightLogTests(IronDiaryApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task UpdatingBodyWeightLog_ChangesFieldsAndPersists()
    {
        var client = await _factory.CreateAuthenticatedClientAsync();

        var createResponse = await client.PostAsJsonAsync("/api/bodyweightlog",
            new CreateBodyWeightLogDto { Weight = 180, Date = new DateTime(2026, 6, 10, 0, 0, 0, DateTimeKind.Utc) });
        createResponse.EnsureSuccessStatusCode();
        var created = (await createResponse.Content.ReadFromJsonAsync<BodyWeightLogDto>())!;

        var newDate = new DateTime(2026, 6, 9, 0, 0, 0, DateTimeKind.Utc);
        var response = await client.PutAsJsonAsync($"/api/bodyweightlog/{created.Id}",
            new CreateBodyWeightLogDto { Weight = 178.5f, Date = newDate });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = await response.Content.ReadFromJsonAsync<BodyWeightLogDto>();
        Assert.NotNull(updated);
        Assert.Equal(created.Id, updated.Id);
        Assert.Equal(178.5f, updated.Weight);
        Assert.Equal(newDate, updated.Date);

        var byId = await client.GetFromJsonAsync<BodyWeightLogDto>($"/api/bodyweightlog/{created.Id}");
        Assert.NotNull(byId);
        Assert.Equal(178.5f, byId.Weight); // edit persisted, not just echoed
        Assert.Equal(newDate, byId.Date);
    }

    [Fact]
    public async Task UpdatingNonexistentBodyWeightLog_ReturnsNotFound()
    {
        var client = await _factory.CreateAuthenticatedClientAsync();

        var response = await client.PutAsJsonAsync("/api/bodyweightlog/999999",
            new CreateBodyWeightLogDto { Weight = 175, Date = new DateTime(2026, 6, 8, 0, 0, 0, DateTimeKind.Utc) });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdatingAnotherUsersBodyWeightLog_ReturnsNotFound()
    {
        var userA = await _factory.CreateAuthenticatedClientAsync();
        var userB = await _factory.CreateAuthenticatedClientAsync();

        var createResponse = await userB.PostAsJsonAsync("/api/bodyweightlog",
            new CreateBodyWeightLogDto { Weight = 200, Date = new DateTime(2026, 6, 7, 0, 0, 0, DateTimeKind.Utc) });
        createResponse.EnsureSuccessStatusCode();
        var created = (await createResponse.Content.ReadFromJsonAsync<BodyWeightLogDto>())!;

        var response = await userA.PutAsJsonAsync($"/api/bodyweightlog/{created.Id}",
            new CreateBodyWeightLogDto { Weight = 1, Date = new DateTime(2026, 6, 7, 0, 0, 0, DateTimeKind.Utc) });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var byId = await userB.GetFromJsonAsync<BodyWeightLogDto>($"/api/bodyweightlog/{created.Id}");
        Assert.NotNull(byId);
        Assert.Equal(200, byId.Weight); // user B's log untouched
    }
}
