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
            return ValidationProblem("ImageRequired", "Görsel gerekli.");
        }

        if (image.Length > MaxImageBytes)
        {
            return ValidationProblem("ImageTooLarge", "Görsel çok büyük (en fazla 8MB).");
        }

        if (!AllowedContentTypes.Contains(image.ContentType))
        {
            return ValidationProblem("UnsupportedImageFormat", "Desteklenmeyen görsel formatı (jpeg/png/webp olmalı).");
        }

        using var memoryStream = new MemoryStream();
        await image.CopyToAsync(memoryStream, ct);

        try
        {
            return await aiPlateService.AnalyzePlateAsync(CurrentUserId, memoryStream.ToArray(), image.ContentType, ct);
        }
        catch (ValidationException ex)
        {
            return ValidationProblem(ex);
        }
        catch (InvalidOperationException ex)
        {
            return BuildProblem("AI analizi başarısız oldu: " + ex.Message, StatusCodes.Status502BadGateway, "AiRequestFailed");
        }
    }
}
