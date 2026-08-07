export function toDateOnlyString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayDateString(): string {
  return toDateOnlyString(new Date());
}

export function guessMealTypeByTime(date: Date = new Date()): 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return 'Breakfast';
  if (hour >= 11 && hour < 16) return 'Lunch';
  if (hour >= 16 && hour < 21) return 'Dinner';
  return 'Snack';
}
