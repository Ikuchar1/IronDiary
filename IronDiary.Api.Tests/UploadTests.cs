using System.Net;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;

namespace IronDiary.Api.Tests;

public class UploadTests : IClassFixture<IronDiaryApiFactory>
{
    private readonly IronDiaryApiFactory _factory;

    public UploadTests(IronDiaryApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task SignatureEndpoint_WithoutToken_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsync("/api/upload/signature", null);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task SignatureEndpoint_Authenticated_ReturnsSignatureMatchingConfiguredSecret()
    {
        var client = await _factory.CreateAuthenticatedClientAsync();

        var response = await client.PostAsync("/api/upload/signature", null);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var dto = await response.Content.ReadFromJsonAsync<UploadSignatureResponse>();
        Assert.NotNull(dto);
        Assert.Equal(IronDiaryApiFactory.CloudinaryApiKey, dto.ApiKey);
        Assert.Equal(IronDiaryApiFactory.CloudinaryCloudName, dto.CloudName);
        Assert.True(dto.Timestamp > 0);

        var expected = Convert.ToHexString(
            SHA1.HashData(Encoding.UTF8.GetBytes(
                $"timestamp={dto.Timestamp}{IronDiaryApiFactory.CloudinaryApiSecret}")))
            .ToLowerInvariant();
        Assert.Equal(expected, dto.Signature);
    }

    private record UploadSignatureResponse(long Timestamp, string Signature, string ApiKey, string CloudName);
}
