using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using DietApp.Application.Abstractions;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace DietApp.Infrastructure.ExternalAuth;

public class AppleTokenValidator(IHttpClientFactory httpClientFactory, IMemoryCache cache, IOptions<AppleAuthOptions> options)
    : IExternalTokenValidator
{
    private const string JwksUrl = "https://appleid.apple.com/auth/keys";
    private const string CacheKey = "apple-jwks";

    public async Task<ExternalUserInfo> ValidateAsync(string idToken, CancellationToken ct = default)
    {
        var signingKeys = await GetSigningKeysAsync(ct);

        var parameters = new TokenValidationParameters
        {
            ValidIssuer = "https://appleid.apple.com",
            ValidAudiences = options.Value.ClientIds,
            IssuerSigningKeys = signingKeys,
            ValidateLifetime = true,
        };

        ClaimsPrincipal principal;
        try
        {
            principal = new JwtSecurityTokenHandler().ValidateToken(idToken, parameters, out _);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("Apple id_token doğrulanamadı.", ex);
        }

        var subject = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? throw new InvalidOperationException("Apple id_token'da subject claim'i bulunamadı.");
        var email = principal.FindFirst(JwtRegisteredClaimNames.Email)?.Value;

        // Apple, kullanıcı adını id_token'a değil; yalnızca ilk yetkilendirmede native
        // ASAuthorizationAppleIDCredential üzerinden döner — mobil taraf bunu ayrıca iletmelidir.
        return new ExternalUserInfo(subject, email, null);
    }

    private async Task<IList<SecurityKey>> GetSigningKeysAsync(CancellationToken ct)
    {
        if (cache.TryGetValue(CacheKey, out IList<SecurityKey>? cached) && cached is not null)
        {
            return cached;
        }

        var client = httpClientFactory.CreateClient(nameof(AppleTokenValidator));
        var json = await client.GetStringAsync(JwksUrl, ct);
        var keys = new JsonWebKeySet(json).GetSigningKeys();

        cache.Set(CacheKey, keys, TimeSpan.FromHours(24));
        return keys;
    }
}
