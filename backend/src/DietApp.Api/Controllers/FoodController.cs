using DietApp.Application.DTOs;
using DietApp.Application.Exceptions;
using DietApp.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DietApp.Api.Controllers;

[Authorize]
[Route("api/foods")]
public class FoodController(IFoodService foodService) : ApiControllerBase
{
    [HttpGet]
    public Task<ActionResult<FoodSearchResult>> Search(
        [FromQuery] string? q, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default) =>
        ExecuteAsync(() => foodService.SearchAsync(q, CurrentUserId, RequestLanguage, page, pageSize, ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<FoodDetailDto>> GetById(Guid id, CancellationToken ct)
    {
        var food = await foodService.GetByIdAsync(id, CurrentUserId, RequestLanguage, ct);
        return food is null ? NotFound() : food;
    }

    [HttpPost]
    public async Task<ActionResult<FoodDetailDto>> CreateCustomFood(CreateCustomFoodRequest request, CancellationToken ct)
    {
        try
        {
            var food = await foodService.CreateCustomFoodAsync(CurrentUserId, request, ct);
            return CreatedAtAction(nameof(GetById), new { id = food.Id }, food);
        }
        catch (ValidationException ex)
        {
            return ValidationProblem(ex);
        }
    }

    private async Task<ActionResult<T>> ExecuteAsync<T>(Func<Task<T>> action)
    {
        try
        {
            return await action();
        }
        catch (ValidationException ex)
        {
            return ValidationProblem(ex);
        }
    }
}
