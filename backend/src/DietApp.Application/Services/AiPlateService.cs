using DietApp.Application.Abstractions;
using DietApp.Application.DTOs;
using DietApp.Application.Exceptions;
using DietApp.Domain.Entities;
using DietApp.Domain.Interfaces;

namespace DietApp.Application.Services;

public class AiPlateService(
    IAiPlateAnalysisRepository repository,
    IVisionAnalysisService visionAnalysisService,
    ISubscriptionService subscriptionService) : IAiPlateService
{
    // Premium kontrolünden SONRA da uygulanan bir abuse/maliyet güvenlik ağı — her OpenAI çağrısı
    // para, aboneliği olan bir hesap ele geçirilse bile günlük harcama üst sınırlı kalsın diye.
    private const int DailyQuota = 50;

    public async Task<AnalyzePlateResponse> AnalyzePlateAsync(Guid userId, byte[] imageBytes, string contentType, CancellationToken ct = default)
    {
        if (!await subscriptionService.IsPremiumAsync(userId, ct))
        {
            throw new ValidationException(ValidationErrorCode.PremiumRequired, "Bu özellik premium üyelik gerektiriyor.");
        }

        var usedToday = await repository.CountTodayForUserAsync(userId, ct);
        if (usedToday >= DailyQuota)
        {
            throw new ValidationException(
                ValidationErrorCode.AiDailyQuotaReached,
                $"Günlük AI analiz limitine ({DailyQuota}) ulaştın, yarın tekrar dene.",
                new Dictionary<string, object> { ["quota"] = DailyQuota });
        }

        if (imageBytes.Length == 0)
        {
            throw new ValidationException(ValidationErrorCode.ImageEmpty, "Görsel boş.");
        }

        var result = await visionAnalysisService.AnalyzePlateAsync(imageBytes, contentType, ct);

        var analysis = new AiPlateAnalysis
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Description = result.Description,
            EstimatedCalories = result.Calories,
            EstimatedProteinG = result.ProteinG,
            EstimatedCarbG = result.CarbG,
            EstimatedFatG = result.FatG,
            RawResponseJson = result.RawResponseJson,
            CreatedAt = DateTime.UtcNow,
        };

        await repository.AddAsync(analysis, ct);

        return new AnalyzePlateResponse(
            analysis.Id, analysis.Description, analysis.EstimatedCalories, analysis.EstimatedProteinG, analysis.EstimatedCarbG, analysis.EstimatedFatG);
    }
}
