export function zar(n: number) {
  const sign = n < 0 ? "-" : "";
  const abs = Math.round(Math.abs(n));
  const grouped = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${sign}R${grouped}`;
}

export function zarCompact(n: number) {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    const m = abs / 1_000_000;
    const digits = m >= 10 ? 1 : 2;
    return `${sign}R${Number(m.toFixed(digits))}m`;
  }
  return `${sign}${zar(abs)}`;
}

export function kmText(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(km < 10 ? 1 : 0)} km`;
}
