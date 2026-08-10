using DietApp.Application.DTOs;
using DietApp.Application.Exceptions;
using DietApp.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DietApp.Api.Controllers;

[Authorize]
[Route("api/meals")]
public class MealController(IMealDiaryService mealDiaryService) : ApiControllerBase
{
    [HttpGet("daily-summary")]
    public async Task<ActionResult<DailySummaryDto>> GetDailySummary([FromQuery] DateOnly? date, CancellationToken ct)
    {
        try
        {
            return await mealDiaryService.GetDailySummaryAsync(CurrentUserId, date ?? DateOnly.FromDateTime(DateTime.UtcNow), ct);
        }
        catch (ValidationException ex)
        {
            return Problem(title: ex.Message, statusCode: StatusCodes.Status400BadRequest);
        }
    }

    [HttpPost("items")]
    public async Task<ActionResult<MealEntryItemDto>> AddItem(AddMealItemRequest request, CancellationToken ct)
    {
        try
        {
            return await mealDiaryService.AddItemAsync(CurrentUserId, request, ct);
        }
        catch (ValidationException ex)
        {
            return Problem(title: ex.Message, statusCode: StatusCodes.Status400BadRequest);
        }
    }

    [HttpPost("items/from-ai")]
    public async Task<ActionResult<MealEntryItemDto>> AddAiEstimate(AddAiEstimateToMealRequest request, CancellationToken ct)
    {
        try
        {
            return await mealDiaryService.AddAiEstimateAsync(CurrentUserId, request, ct);
        }
        catch (ValidationException ex)
        {
            return Problem(title: ex.Message, statusCode: StatusCodes.Status400BadRequest);
        }
    }

    [HttpDelete("items/{id:guid}")]
    public async Task<IActionResult> DeleteItem(Guid id, CancellationToken ct)
    {
        await mealDiaryService.DeleteItemAsync(CurrentUserId, id, ct);
        return NoContent();
    }
}
