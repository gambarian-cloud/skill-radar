export function getLocalTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function parseRunDate(input?: string): Date {
  if (!input) {
    return new Date();
  }

  if (/^\d{4}-\d{2}-\d{2}$/u.test(input)) {
    return new Date(`${input}T23:59:59`);
  }

  return new Date(input);
}

export function buildWindow(end: Date, hours: number): { start: Date; end: Date } {
  return {
    start: new Date(end.getTime() - hours * 60 * 60 * 1000),
    end,
  };
}

export function isWithinWindow(value: string, start: Date, end: Date): boolean {
  const date = new Date(value);
  return date >= start && date <= end;
}

export function formatReportDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: getLocalTimeZone(),
  }).format(new Date(dateString));
}

export function formatWindowLabel(start: Date, end: Date): string {
  return `${formatDateTime(start.toISOString())} -> ${formatDateTime(end.toISOString())}`;
}
