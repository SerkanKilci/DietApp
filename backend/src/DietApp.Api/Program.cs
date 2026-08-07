using System.Text;
using System.Text.Json.Serialization;
using DietApp.Infrastructure;
using DietApp.Infrastructure.Persistence;
using DietApp.Infrastructure.Persistence.Seed;
using DietApp.Infrastructure.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    // Enum'ları sayı yerine string olarak serialize/deserialize et (örn. "Google"), mobil taraf için daha okunabilir/güvenli.
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddInfrastructure(builder.Configuration);

var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
    ?? throw new InvalidOperationException("Jwt configuration section is missing.");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Varsayılan davranış "sub" claim'ini ClaimTypes.NameIdentifier'a eşler;
        // token'ı üretirken kullandığımız claim adlarıyla (sub, email...) birebir eşleşsin diye kapatıyoruz.
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Key)),
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ClockSkew = TimeSpan.FromSeconds(30),
        };
    });

builder.Services.AddAuthorization();

const string DevCorsPolicy = "DevCors";
builder.Services.AddCors(options =>
{
    // Sadece geliştirme ortamında: Expo web (localhost:8090 vb. portlar) tarayıcıdan API'ye
    // erişebilsin diye. Mobil (iOS/Android) istekleri tarayıcı değil, Origin header'ı taşımaz —
    // CORS zaten onları etkilemez; bu politika native build'lerde hiç devreye girmez.
    options.AddPolicy(DevCorsPolicy, policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors(DevCorsPolicy);
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<DietAppDbContext>();
    await FoodCatalogSeeder.SeedAsync(dbContext);
}

app.Run();
