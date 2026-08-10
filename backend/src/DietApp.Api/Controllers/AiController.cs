using DietApp.Application.DTOs;
using DietApp.Application.Exceptions;
using DietApp.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DietApp.Api.Controllers;

[Authorize]
[Route("api/ai")]
public class AiController(IAiPlateService aiPlateService) : ApiControllerBase
{
    private const long MaxImageBytes = 8 * 1024 * 1024;

    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/webp",
    };

    [HttpPost("analyze-plate")]
    [RequestSizeLimit(MaxImageBytes + 1024)]
    public async Task<ActionResult<AnalyzePlateResponse>> AnalyzePlate(IFormFile image, CancellationToken ct)
    {
        if (image is null || image.Length == 0)
        {
            return Problem(title: "Görsel gerekli.", statusCode: StatusCodes.Status400BadRequest);
        }

        if (image.Length > MaxImageBytes)
        {
            return Problem(title: "Görsel çok büyük (en fazla 8MB).", statusCode: StatusCodes.Status400BadRequest);
        }

        if (!AllowedContentTypes.Contains(image.ContentType))
        {
            return Problem(title: "Desteklenmeyen görsel formatı (jpeg/png/webp olmalı).", statusCode: StatusCodes.Status400BadRequest);
        }

        using var memoryStream = new MemoryStream();
        await image.CopyToAsync(memoryStream, ct);

        try
        {
            return await aiPlateService.AnalyzePlateAsync(CurrentUserId, memoryStream.ToArray(), image.ContentType, ct);
        }
        catch (ValidationException ex)
        {
            return Problem(title: ex.Message, statusCode: StatusCodes.Status400BadRequest);
        }
        catch (InvalidOperationException ex)
        {
            return Problem(title: "AI analizi başarısız oldu: " + ex.Message, statusCode: StatusCodes.Status502BadGateway);
        }
    }
}
