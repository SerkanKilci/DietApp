using DietApp.Application.DTOs;
using DietApp.Application.Exceptions;
using DietApp.Application.Services;
using DietApp.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DietApp.Api.Controllers;

[Route("api/auth")]
public class AuthController(IAuthService authService, IUserRepository userRepository) : ApiControllerBase
{
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> Me(CancellationToken ct)
    {
        var user = await userRepository.GetByIdAsync(CurrentUserId, ct);

        if (user is null)
        {
            return NotFound();
        }

        return new UserDto(user.Id, user.Email, user.DisplayName, user.IsEmailVerified);
    }

    [HttpPost("register")]
    public Task<ActionResult<AuthResponse>> Register(RegisterRequest request, CancellationToken ct) =>
        Execute(() => authService.RegisterAsync(request, GetClientIp(), ct));

    [HttpPost("login")]
    public Task<ActionResult<AuthResponse>> Login(LoginRequest request, CancellationToken ct) =>
        Execute(() => authService.LoginAsync(request, GetClientIp(), ct));

    [HttpPost("external-login")]
    public Task<ActionResult<AuthResponse>> ExternalLogin(ExternalLoginRequest request, CancellationToken ct) =>
        Execute(() => authService.ExternalLoginAsync(request, GetClientIp(), ct));

    [HttpPost("refresh")]
    public Task<ActionResult<AuthResponse>> Refresh(RefreshRequest request, CancellationToken ct) =>
        Execute(() => authService.RefreshAsync(request, GetClientIp(), ct));

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(RefreshRequest request, CancellationToken ct)
    {
        await authService.LogoutAsync(request, ct);
        return NoContent();
    }

    [Authorize]
    [HttpDelete("me")]
    public async Task<IActionResult> DeleteMe(CancellationToken ct)
    {
        await authService.DeleteAccountAsync(CurrentUserId, ct);
        return NoContent();
    }

    private async Task<ActionResult<AuthResponse>> Execute(Func<Task<AuthResponse>> action)
    {
        try
        {
            return await action();
        }
        catch (AuthException ex)
        {
            return AuthProblem(ex);
        }
    }

    private string? GetClientIp() => HttpContext.Connection.RemoteIpAddress?.ToString();
}
