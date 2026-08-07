using DietApp.Application.Abstractions;
using DietApp.Application.Services;
using DietApp.Domain.Enums;
using DietApp.Domain.Interfaces;
using DietApp.Infrastructure.ExternalAuth;
using DietApp.Infrastructure.Nutrition;
using DietApp.Infrastructure.Persistence;
using DietApp.Infrastructure.Repositories;
using DietApp.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DietApp.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<DietAppDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DietAppDb")));

        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.Configure<GoogleAuthOptions>(configuration.GetSection(GoogleAuthOptions.SectionName));
        services.Configure<AppleAuthOptions>(configuration.GetSection(AppleAuthOptions.SectionName));

        services.AddMemoryCache();
        services.AddHttpClient(nameof(AppleTokenValidator));

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<IUserProfileRepository, UserProfileRepository>();
        services.AddScoped<INutritionGoalRepository, NutritionGoalRepository>();
        services.AddScoped<IFoodItemRepository, FoodItemRepository>();
        services.AddScoped<IMealEntryRepository, MealEntryRepository>();
        services.AddScoped<IMealEntryItemRepository, MealEntryItemRepository>();

        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<IJwtTokenService, JwtTokenService>();
        services.AddSingleton<INutritionCalculatorService, NutritionCalculatorService>();

        services.AddKeyedScoped<IExternalTokenValidator, GoogleTokenValidator>(ExternalLoginProvider.Google);
        services.AddKeyedScoped<IExternalTokenValidator, AppleTokenValidator>(ExternalLoginProvider.Apple);

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IProfileService, ProfileService>();
        services.AddScoped<IFoodService, FoodService>();
        services.AddScoped<IMealDiaryService, MealDiaryService>();

        return services;
    }
}
