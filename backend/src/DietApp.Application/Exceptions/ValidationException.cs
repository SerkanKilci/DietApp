namespace DietApp.Application.Exceptions;

public enum ValidationErrorCode
{
    FoodNameRequired,
    FoodValuesNegative,
    QuantityMustBePositive,
    FoodNotFound,
    AiAnalysisNotFound,
    DescriptionRequired,
    ValuesOutOfRange,
    OnboardingRequired,
    DailyCaloriesRange,
    MacrosNegative,
    MacrosUnrealistic,
    HeightRange,
    WeightRange,
    AgeRange,
    AiDailyQuotaReached,
    ImageEmpty,
}

// message: Türkçe metin log/Swagger için ProblemDetails.title'da kalır; mobil taraf bunu göstermez,
// Code'u kendi çeviri tablosunda (errors.*) çözüp gösterir. errorParams, mesaja gömülü değerleri
// (ör. AiDailyQuotaReached için kota sayısı) mobile ayrı bir alan olarak taşır ki orada da interpolate edilebilsin.
public class ValidationException(ValidationErrorCode code, string message, IReadOnlyDictionary<string, object>? errorParams = null)
    : Exception(message)
{
    public ValidationErrorCode Code { get; } = code;
    public IReadOnlyDictionary<string, object>? ErrorParams { get; } = errorParams;
}
