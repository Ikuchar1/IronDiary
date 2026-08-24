using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly IConfiguration _config;

    public UploadController(IConfiguration config)
    {
        _config = config;
    }

    // Generic signed-upload endpoint (ADR-0006). Reusable for any future
    // direct-from-browser Cloudinary upload (e.g. profile pictures).
    [HttpPost("signature")]
    public IActionResult GetSignature()
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var apiSecret = _config["Cloudinary:ApiSecret"]!;

        // Cloudinary signed upload: SHA1 of the sorted params to sign + the API secret.
        // We only sign the timestamp, so the string is fixed-shape.
        var signature = Convert.ToHexString(
            SHA1.HashData(Encoding.UTF8.GetBytes($"timestamp={timestamp}{apiSecret}")))
            .ToLowerInvariant();

        return Ok(new UploadSignatureDto
        {
            Timestamp = timestamp,
            Signature = signature,
            ApiKey = _config["Cloudinary:ApiKey"]!,
            CloudName = _config["Cloudinary:CloudName"]!,
        });
    }
}
