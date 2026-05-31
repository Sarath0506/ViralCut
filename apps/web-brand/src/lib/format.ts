/** Format integer paise as INR display */
export function formatInr(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function formatViews(views: number): string {
  if (views >= 100_000) {
    return `${(views / 100_000).toFixed(1)}L`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return String(views);
}
