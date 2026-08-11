namespace DietApp.Application.DTOs;

public record SubscriptionStatusDto(bool IsPremium, DateTime? ExpiresAt);
