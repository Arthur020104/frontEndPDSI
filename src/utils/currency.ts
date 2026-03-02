export function isValidBrazilianCurrency(value: string): boolean
{
  const regex = /^(?!0\.000)(?:\d{1,3}(?:\.\d{3})*|\d+)(?:,\d{1,2})?$/;
  return regex.test(value);
}

export function parseBrazilianCurrency(value: string): number
{
  const normalized = value.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(normalized);
  return isNaN(n) ? 0 : n;
}
