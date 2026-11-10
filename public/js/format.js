const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const money = (centavos) => brl.format((centavos ?? 0) / 100);

/** "1.234,50" ou "1234.5" -> 123450 (centavos) */
export function parseMoneyToCents(text) {
  const raw = String(text).trim();
  const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw;
  const value = Number(normalized);
  return Number.isFinite(value) ? Math.round(value * 100) : NaN;
}

export const centsToInput = (centavos) => (centavos / 100).toFixed(2).replace('.', ',');

/** "2026-11-09" -> "09/11/2026" */
export function dateBR(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

export function dateTimeBR(sqliteDateTime) {
  if (!sqliteDateTime) return '';
  const [date, time = ''] = sqliteDateTime.split(' ');
  return `${dateBR(date)} ${time.slice(0, 5)}`.trim();
}

export function todayISO() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export const thisMonth = () => todayISO().slice(0, 7);
