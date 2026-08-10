using DietApp.Application.Abstractions;
using DietApp.Application.DTOs;
using DietApp.Application.Exceptions;
using DietApp.Domain.Entities;
using DietApp.Domain.Interfaces;

namespace DietApp.Application.Services;

public class AiPlateService(
    IAiPlateAnalysisRepository repository,
    IVisionAnalysisService visionAnalysisService) : IAiPlateService
{
    // Gerçek bir maliyet/abuse önlemi: her OpenAI çağrısı para. Abonelik kontrolü RevenueCat
    // entegrasyonu ile gelene kadar (bkz. Aşama 5 notları) tek koruma bu günlük kota.
    private const int DailyQuota = 20;

    public async Task<AnalyzePlateResponse> AnalyzePlateAsync(Guid userId, byte[] imageBytes, string contentType, CancellationToken ct = default)
    {
        // TODO (RevenueCat entegrasyonu tamamlanınca): Burada Subscriptions tablosuna bakıp
        // premium olmayan kullanıcıyı reddet. Şimdilik her giriş yapmış kullanıcı için açık.
        var usedToday = await repository.CountTodayForUserAsync(userId, ct);
        if (usedToday >= DailyQuota)
        {
            throw new ValidationException($"Günlük AI analiz limitine ({DailyQuota}) ulaştın, yarın tekrar dene.");
        }

        if (imageBytes.Length == 0)
        {
            throw new ValidationException("Görsel boş.");
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
