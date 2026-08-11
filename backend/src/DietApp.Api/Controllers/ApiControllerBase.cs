using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using DietApp.Application.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace DietApp.Api.Controllers;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected Guid CurrentUserId => Guid.Parse(User.FindFirstValue(JwtRegisteredClaimNames.Sub)!);

    // Mobil taraf Accept-Language'ı aktif i18n diline göre gönderiyor (bkz. client.ts).
    // "tr-TR,tr;q=0.9,en;q=0.8" gibi bir değerden sadece ilk 2 harfli birincil dili çıkarır;
    // desteklenmeyen/boş bir değer olsa da zararsız — çeviri bulunamayınca İngilizce'ye düşülür.
    protected string RequestLanguage
    {
        get
        {
            var header = Request.Headers.AcceptLanguage.ToString();
            if (string.IsNullOrWhiteSpace(header))
            {
                return "en";
            }

            var primary = header.Split(',')[0].Split(';')[0].Split('-')[0].Trim().ToLowerInvariant();
            return string.IsNullOrWhiteSpace(primary) ? "en" : primary;
        }
    }

    // title alanı Türkçe kalır (log/Swagger için); mobil taraf bunu göstermez, extensions.code'u
    // kendi çeviri tablosunda (errors.*) çözüp kullanıcıya kendi dilinde gösterir.
    protected ObjectResult ValidationProblem(ValidationException ex) =>
        BuildProblem(ex.Message, StatusCodes.Status400BadRequest, ex.Code.ToString(), ex.ErrorParams);

    protected ObjectResult ValidationProblem(string code, string title) =>
        BuildProblem(title, StatusCodes.Status400BadRequest, code);

    protected ObjectResult AuthProblem(AuthException ex)
    {
        var statusCode = ex.Code == AuthErrorCode.EmailAlreadyRegistered
            ? StatusCodes.Status409Conflict
            : StatusCodes.Status401Unauthorized;

        return BuildProblem(ex.Message, statusCode, ex.Code.ToString());
    }

    protected static ObjectResult BuildProblem(string title, int statusCode, string code, IReadOnlyDictionary<string, object>? errorParams = null)
    {
        var problemDetails = new ProblemDetails { Title = title, Status = statusCode };
        problemDetails.Extensions["code"] = code;

        if (errorParams is not null)
        {
            foreach (var (key, value) in errorParams)
            {
                problemDetails.Extensions[key] = value;
            }
        }

        return new ObjectResult(problemDetails) { StatusCode = statusCode };
    }
}
