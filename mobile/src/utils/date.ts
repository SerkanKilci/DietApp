export function toDateOnlyString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayDateString(): string {
  return toDateOnlyString(new Date());
}

// new Date("YYYY-MM-DD") UTC gece yarısı olarak yorumlanır ve UTC'nin gerisindeki saat
// dilimlerinde bir gün geriye kayabilir — bunun yerine yerel saatte inşa ediyoruz.
export function fromDateOnlyString(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function guessMealTypeByTime(date: Date = new Date()): 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return 'Breakfast';
  if (hour >= 11 && hour < 16) return 'Lunch';
  if (hour >= 16 && hour < 21) return 'Dinner';
  return 'Snack';
}
