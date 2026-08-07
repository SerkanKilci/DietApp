using DietApp.Application.Abstractions;
using Google.Apis.Auth;
using Microsoft.Extensions.Options;

namespace DietApp.Infrastructure.ExternalAuth;

public class GoogleTokenValidator(IOptions<GoogleAuthOptions> options) : IExternalTokenValidator
{
    public async Task<ExternalUserInfo> ValidateAsync(string idToken, CancellationToken ct = default)
    {
        var settings = new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = options.Value.ClientIds,
        };

        var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);

        return new ExternalUserInfo(payload.Subject, payload.Email, payload.Name);
    }
}
