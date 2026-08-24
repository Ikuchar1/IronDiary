using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;

namespace IronDiary.Api.Tests;

/// <summary>
/// Hosts the API in-memory with SQLite in place of PostgreSQL.
/// The single open connection keeps the in-memory database alive
/// for the lifetime of the fixture (it is destroyed when the last
/// connection closes).
/// </summary>
public class IronDiaryApiFactory : WebApplicationFactory<Program>
{
    // Known fake Cloudinary credentials so signature tests can recompute the SHA1.
    // These never reach real Cloudinary — the signing math runs locally in the controller.
    public const string CloudinaryCloudName = "test-cloud";
    public const string CloudinaryApiKey = "test-api-key";
    public const string CloudinaryApiSecret = "test-api-secret";

    // Throwaway signing key for tests only. HMAC-SHA256 needs >= 256 bits, so keep it 32+ chars.
    private const string JwtKey = "test-only-jwt-signing-key-please-ignore-32+";

    static IronDiaryApiFactory()
    {
        // Supplied as environment variables (`__` is the nesting separator), NOT via
        // ConfigureAppConfiguration below: that only applies during builder.Build(), which is
        // too late for Program.cs's startup guard and JWT setup — both read configuration
        // beforehand. CreateBuilder() reads environment variables upfront, so these land in
        // time for every read site. Keeps tests independent of the developer's user-secrets.
        Environment.SetEnvironmentVariable("Jwt__Key", JwtKey);
        Environment.SetEnvironmentVariable("Cloudinary__CloudName", CloudinaryCloudName);
        Environment.SetEnvironmentVariable("Cloudinary__ApiKey", CloudinaryApiKey);
        Environment.SetEnvironmentVariable("Cloudinary__ApiSecret", CloudinaryApiSecret);
    }

    private readonly SqliteConnection _connection = new("DataSource=:memory:");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        _connection.Open();

        builder.ConfigureServices(services =>
        {
            // strip the Npgsql registration from Program.cs (EF 9 registers both of these)
            services.RemoveAll(typeof(DbContextOptions<AppDbContext>));
            services.RemoveAll(typeof(IDbContextOptionsConfiguration<AppDbContext>));

            services.AddDbContext<AppDbContext>(options => options.UseSqlite(_connection));
        });
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);

        using var scope = host.Services.CreateScope();
        scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.EnsureCreated();

        return host;
    }

    /// <summary>
    /// Registers a fresh user and returns a client with its Bearer token attached,
    /// going through the real /api/auth endpoints like any client would.
    /// </summary>
    public async Task<HttpClient> CreateAuthenticatedClientAsync()
    {
        var client = CreateClient();
        var credentials = new { Email = $"test-{Guid.NewGuid():N}@example.com", Password = "Test1234!" };

        var register = await client.PostAsJsonAsync("/api/auth/register", credentials);
        register.EnsureSuccessStatusCode();

        var login = await client.PostAsJsonAsync("/api/auth/login", credentials);
        login.EnsureSuccessStatusCode();
        var body = await login.Content.ReadFromJsonAsync<LoginResponse>();

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", body!.Token);
        return client;
    }

    private record LoginResponse(string Token);

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing) _connection.Dispose();
    }
}
