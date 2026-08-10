namespace DietApp.Application.Abstractions;

public record VisionAnalysisResult(string Description, int Calories, int ProteinG, int CarbG, int FatG, string RawResponseJson);

public interface IVisionAnalysisService
{
    Task<VisionAnalysisResult> AnalyzePlateAsync(byte[] imageBytes, string contentType, CancellationToken ct = default);
}
