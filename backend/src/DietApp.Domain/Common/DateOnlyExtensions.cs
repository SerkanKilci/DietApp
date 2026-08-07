namespace DietApp.Domain.Common;

public static class DateOnlyExtensions
{
    public static int GetAge(this DateOnly birthDate, DateOnly? asOf = null)
    {
        var today = asOf ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var age = today.Year - birthDate.Year;
        if (birthDate > today.AddYears(-age))
        {
            age--;
        }

        return age;
    }
}
