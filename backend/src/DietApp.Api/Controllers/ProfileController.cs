using DietApp.Application.DTOs;
using DietApp.Application.Exceptions;
using DietApp.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DietApp.Api.Controllers;

[Authorize]
[Route("api/profile")]
public class ProfileController(IProfileService profileService) : ApiControllerBase
{
    [HttpGet("me")]
    public async Task<ActionResult<ProfileDto>> GetMe(CancellationToken ct)
    {
        var profile = await profileService.GetProfileAsync(CurrentUserId, ct);
        return profile is null ? NotFound() : profile;
    }

    [HttpPost("onboarding")]
    public async Task<ActionResult<ProfileDto>> CompleteOnboarding(OnboardingRequest request, CancellationToken ct)
    {
        try
        {
            return await profileService.CompleteOnboardingAsync(CurrentUserId, request, ct);
        }
        catch (ValidationException ex)
        {
            return Problem(title: ex.Message, statusCode: StatusCodes.Status400BadRequest);
        }
    }

    [HttpPut("nutrition-goal")]
    public async Task<ActionResult<ProfileDto>> SetCustomNutritionGoal(SetCustomNutritionGoalRequest request, CancellationToken ct)
    {
        try
        {
            return await profileService.SetCustomNutritionGoalAsync(CurrentUserId, request, ct);
        }
        catch (ValidationException ex)
        {
            return Problem(title: ex.Message, statusCode: StatusCodes.Status400BadRequest);
        }
    }
}
