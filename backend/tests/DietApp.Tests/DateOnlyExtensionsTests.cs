using DietApp.Domain.Common;

namespace DietApp.Tests;

public class DateOnlyExtensionsTests
{
    [Fact]
    public void GetAge_ReturnsExactYears_WhenBirthdayAlreadyPassedThisYear()
    {
        var birthDate = new DateOnly(2000, 3, 1);
        var asOf = new DateOnly(2026, 8, 7);

        Assert.Equal(26, birthDate.GetAge(asOf));
    }

    [Fact]
    public void GetAge_DoesNotCountCurrentYear_WhenBirthdayNotYetReachedThisYear()
    {
        var birthDate = new DateOnly(2000, 12, 31);
        var asOf = new DateOnly(2026, 8, 7);

        Assert.Equal(25, birthDate.GetAge(asOf));
    }

    [Fact]
    public void GetAge_TurnsOverExactlyOnBirthday()
    {
        var birthDate = new DateOnly(2000, 8, 7);
        var asOf = new DateOnly(2026, 8, 7);

        Assert.Equal(26, birthDate.GetAge(asOf));
    }

    [Fact]
    public void GetAge_HandlesLeapDayBirthdate()
    {
        var birthDate = new DateOnly(2000, 2, 29);

        // 2025 değil bir artık yıl olmadığından 28 Şubat'ta henüz doğum günü gelmemiş sayılmalı.
        Assert.Equal(24, birthDate.GetAge(new DateOnly(2025, 2, 28)));
        Assert.Equal(25, birthDate.GetAge(new DateOnly(2025, 3, 1)));
    }
}
