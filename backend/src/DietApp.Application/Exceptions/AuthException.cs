namespace DietApp.Application.Exceptions;

public enum AuthErrorCode
{
    EmailAlreadyRegistered,
    InvalidCredentials,
    InvalidExternalToken,
    InvalidRefreshToken,
}

public class AuthException(AuthErrorCode code, string message) : Exception(message)
{
    public AuthErrorCode Code { get; } = code;
}
