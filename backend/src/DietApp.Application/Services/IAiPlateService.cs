using DietApp.Application.DTOs;

namespace DietApp.Application.Services;

public interface IAiPlateService
{
    Task<AnalyzePlateResponse> AnalyzePlateAsync(Guid userId, byte[] imageBytes, string contentType, CancellationToken ct = default);
}
