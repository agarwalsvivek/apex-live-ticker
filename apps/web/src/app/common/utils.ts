export const LAUNCH_DATE = new Date('2026-09-25T00:00:00').getTime();

export const getRemaining = (target: number) => {
  const total = Math.max(0, target - Date.now());

  // total divided by the number of ms in a day (24 * 60 * 60 * 1000), floored down to a whole number.
  const days = Math.floor(total / (24 * 60 * 60 * 1000));

  //total in hours ( total / (60 * 60 * 1000) ), then % 24 to get just the leftover hours after full days are accounted for.
  const hours = Math.floor((total / (60 * 60 * 1000)) % 24);

  // same idea: total in minutes, % 60 to get leftover minutes after full hours.
  const minutes = Math.floor((total / (60 * 1000)) % 60);

  // total in seconds, % 60 for leftover seconds after full minutes.
  const seconds = Math.floor((total / 1000) % 60);
  return { days, hours, minutes, seconds };
};

export const pad = (value: number, padding = 2) =>
  String(value).padStart(padding, '0');
