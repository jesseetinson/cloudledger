export function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Math.abs(cents) / 100);
}

export function dollarsToCents(value: string | number) {
  const amount = typeof value === "number" ? value : Number(value);
  return Math.round(amount * 100);
}
