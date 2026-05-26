export type SignalBias = "bullish" | "bearish";

export type SignalRow = {
  symbol: string;
  bias: SignalBias;
  keyLevel: number;
  notes?: string;
  date?: string;
  currentPrice?: number;
};

const DEFAULT_CACHE_SECONDS = 120;

function normalizeBias(value: string): SignalBias {
  return value.toLowerCase().includes("bull") ? "bullish" : "bearish";
}

function parseNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const normalized = value.replace(/[^0-9.-]/g, "");
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += ch;
  }

  cells.push(current.trim());
  return cells;
}

function indexByHeader(headers: string[]) {
  const map = new Map<string, number>();
  headers.forEach((header, idx) => {
    map.set(header.trim().toLowerCase(), idx);
  });
  return map;
}

function findColumn(
  headerMap: Map<string, number>,
  candidates: string[],
): number | undefined {
  for (const key of candidates) {
    const idx = headerMap.get(key);
    if (idx !== undefined) return idx;
  }
  return undefined;
}

function parseCsv(csv: string): SignalRow[] {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  const headerMap = indexByHeader(headers);
  let symbolCol = findColumn(headerMap, ["symbol", "ticker"]);
  const biasCol = findColumn(headerMap, [
    "bias",
    "direction",
    "sentiment",
  ]);
  const keyLevelCol = findColumn(headerMap, [
    "key level",
    "key_level",
    "keylevel",
    "level",
  ]);
  const notesCol = findColumn(headerMap, ["status / notes", "status", "notes"]);
  const dateCol = findColumn(headerMap, ["date", "updated", "last updated"]);
  const priceCol = findColumn(headerMap, ["price", "current price", "last"]);

  if (biasCol === undefined || keyLevelCol === undefined) {
    return [];
  }

  /** First column blank in header but ticker in data (common Sheets layout). */
  if (symbolCol === undefined) symbolCol = 0;

  const rows: SignalRow[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const cols = parseCsvLine(lines[i]);
    const symbol = cols[symbolCol]?.toUpperCase();
    const rawBias = cols[biasCol]?.toLowerCase();
    const keyLevel = parseNumber(cols[keyLevelCol]);

    if (!symbol || !rawBias || keyLevel === undefined) continue;
    if (!rawBias.includes("bull") && !rawBias.includes("bear")) continue;

    rows.push({
      symbol,
      bias: normalizeBias(rawBias),
      keyLevel,
      notes: notesCol !== undefined ? cols[notesCol] || undefined : undefined,
      date: dateCol !== undefined ? cols[dateCol] || undefined : undefined,
      currentPrice:
        priceCol !== undefined ? parseNumber(cols[priceCol]) : undefined,
    });
  }

  return rows;
}

function dateValue(value?: string): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function sortSignalsLatestFirst(rows: SignalRow[]): SignalRow[] {
  return [...rows].sort((a, b) => dateValue(b.date) - dateValue(a.date));
}

export async function fetchSignalsFromSheet(): Promise<SignalRow[]> {
  const csvUrl = process.env.SIGNALS_SHEET_CSV_URL?.replace(/^["']|["']$/g, "")
    .trim();
  if (!csvUrl) return [];

  const res = await fetch(csvUrl, {
    next: { revalidate: DEFAULT_CACHE_SECONDS },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch signals sheet: ${res.status}`);
  }

  const csvText = await res.text();
  return sortSignalsLatestFirst(parseCsv(csvText));
}
