export function getTimeDiff(elapsed: number) {
  const approxYears = elapsed / 31556952000 + Number.EPSILON;
  const years = Math.round(approxYears * 10) / 10;

  return years === 1 ? '1 year' : `${years} years`;
}
