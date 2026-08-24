using System.Net;
using System.Net.Http.Json;

namespace IronDiary.Api.Tests;

public class WorkoutPhotoTests : IClassFixture<IronDiaryApiFactory>
{
    private readonly IronDiaryApiFactory _factory;

    public WorkoutPhotoTests(IronDiaryApiFactory factory)
    {
        _factory = factory;
    }

    private static async Task<int> CreateWorkoutAsync(HttpClient client)
    {
        var response = await client.PostAsJsonAsync("/api/workoutlog",
            new CreateWorkoutLogDto { Type = "Push", Date = new DateTime(2026, 6, 10, 0, 0, 0, DateTimeKind.Utc) });
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<WorkoutLogWriteResultDto>();
        return result!.Workout.Id;
    }

    private static string CloudinaryUrl(string path = "image/upload/v1/photo.jpg") =>
        $"https://res.cloudinary.com/{IronDiaryApiFactory.CloudinaryCloudName}/{path}";

    [Fact]
    public async Task CreatePhoto_WithNonCloudinaryUrl_ReturnsBadRequest()
    {
        var client = await _factory.CreateAuthenticatedClientAsync();
        var workoutId = await CreateWorkoutAsync(client);

        var response = await client.PostAsJsonAsync("/api/workoutphoto",
            new CreateWorkoutPhotoDto { Url = "https://evil.example.com/pic.jpg", WorkoutLogId = workoutId });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreatePhoto_WithHttpCloudinaryUrl_ReturnsBadRequest()
    {
        var client = await _factory.CreateAuthenticatedClientAsync();
        var workoutId = await CreateWorkoutAsync(client);

        // A Cloudinary upload response carries both `url` (http) and `secure_url` (https).
        // Only the secure one is accepted, so a client that reads the wrong field fails loudly
        // here rather than shipping progress photos over plaintext.
        var insecureUrl =
            $"http://res.cloudinary.com/{IronDiaryApiFactory.CloudinaryCloudName}/image/upload/v1/photo.jpg";

        var response = await client.PostAsJsonAsync("/api/workoutphoto",
            new CreateWorkoutPhotoDto { Url = insecureUrl, WorkoutLogId = workoutId });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreatePhoto_WithValidCloudinaryUrl_IsReturnedByGet()
    {
        var client = await _factory.CreateAuthenticatedClientAsync();
        var workoutId = await CreateWorkoutAsync(client);
        var url = CloudinaryUrl();

        var response = await client.PostAsJsonAsync("/api/workoutphoto",
            new CreateWorkoutPhotoDto { Url = url, WorkoutLogId = workoutId });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var created = await response.Content.ReadFromJsonAsync<WorkoutPhotoDto>();
        Assert.NotNull(created);
        Assert.Equal(url, created.Url);
        Assert.Equal(workoutId, created.WorkoutLogId);

        var list = await client.GetFromJsonAsync<List<WorkoutPhotoDto>>("/api/workoutphoto");
        Assert.NotNull(list);
        Assert.Contains(list, p => p.Id == created.Id && p.Url == url);
    }

    [Fact]
    public async Task CreatePhoto_ValidUrl_ButAnotherUsersWorkout_ReturnsBadRequest()
    {
        var userA = await _factory.CreateAuthenticatedClientAsync();
        var userB = await _factory.CreateAuthenticatedClientAsync();
        var userBWorkoutId = await CreateWorkoutAsync(userB);

        // Valid Cloudinary URL clears that check, so this proves tethering/ownership still holds.
        var response = await userA.PostAsJsonAsync("/api/workoutphoto",
            new CreateWorkoutPhotoDto { Url = CloudinaryUrl(), WorkoutLogId = userBWorkoutId });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
