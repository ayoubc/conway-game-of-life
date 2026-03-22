export function requestPositiveInt(message: string, defaultValue: number): number | null {
  while (true) {
    const input = window.prompt(message, String(defaultValue));
    if (input === null) return null;

    const parsed = Number.parseInt(input, 10);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }

    window.alert('Please enter a positive integer !');
  }
}
