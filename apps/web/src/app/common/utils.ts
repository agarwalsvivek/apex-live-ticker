export const LAUNCH_DATE = new Date('2026-09-25T00:00:00').getTime();

export const getRemaining = (target: number) => {
  const total = Math.max(0, target - Date.now());
  const days = Math.floor(total / (24 * 60 * 60 * 1000));
  const hours = Math.floor((total / (60 * 60 * 1000)) % 24);
  const minutes = Math.floor((total / (60 * 1000)) % 60);
  const seconds = Math.floor((total / 1000) % 60);
  return { days, hours, minutes, seconds };
};

export const pad = (value: number, padding = 2) =>
  String(value).padStart(padding, '0');
