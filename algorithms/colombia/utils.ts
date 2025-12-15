export function parseDateString(input: string): Date | string {
  // Handle "yyyyMMdd" format
  const match = /^(\d{4})(\d{2})(\d{2})$/.exec(input);
  if (match) {
    const [_, year, month, day] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  return input;
}

export function toExcelSerial(date: Date): string {
  return Math.floor(date.getTime() / (1000 * 86400) + 25569).toString();
}
