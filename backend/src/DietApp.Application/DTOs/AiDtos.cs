using DietApp.Domain.Enums;

namespace DietApp.Application.DTOs;

public record AnalyzePlateResponse(
    Guid AnalysisId,
    string Description,
    int EstimatedCalories,
    int ProteinG,
    int CarbG,
    int FatG);

/// <summary>
/// Kullanıcı AI tahminini günlüğe eklemeden önce düzenleyebilir — bu yüzden burada gönderilen
/// değerler AiPlateAnalysis'teki ham tahmin değil, kullanıcının onayladığı nihai değerlerdir.
/// AiPlateAnalysisId sadece sahiplik/denetim doğrulaması için kullanılır.
/// </summary>
public record AddAiEstimateToMealRequest(
    DateOnly LogDate,
    MealType MealType,
    Guid AiPlateAnalysisId,
    string Description,
    int Calories,
    int ProteinG,
    int CarbG,
    int FatG);
