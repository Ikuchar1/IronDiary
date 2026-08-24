public class UploadSignatureDto
{
    public long Timestamp { get; set; }
    public string Signature { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string CloudName { get; set; } = string.Empty;
}
