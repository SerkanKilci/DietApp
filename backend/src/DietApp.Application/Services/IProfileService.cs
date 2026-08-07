using DietApp.Application.DTOs;

namespace DietApp.Application.Services;

public interface IProfileService
{
    Task<ProfileDto?> GetProfileAsync(Guid userId, CancellationToken ct = default);
    Task<ProfileDto> CompleteOnboardingAsync(Guid userId, OnboardingRequest request, CancellationToken ct = default);
}
