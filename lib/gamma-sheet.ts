export interface SheetGammaLevelRow {
  symbol: string;
  gexFlip: number;
  callWall: number;
  putWall: number;
  hvl: number;
  maxPain: number;
  volTriggerUp: number;
  volTriggerDown: number;
  mid?: number;
}

const SHEET_ID = "1WIIMg9b53AqQWf5fE_k02T-SEhBSe32Cj2zF-uK77rE";
const SHEET_GID = "0";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GID}`;

interface GoogleSheetCell {
  v?: unknown;
  f?: string;
}

interface GoogleSheetRow {
  c: Array<GoogleSheetCell | null>;
}

interface GoogleSheetTable {
  cols: Array<{ label: string; type: string }>;
  rows: GoogleSheetRow[];
}

interface GoogleSheetResponse {
  table: GoogleSheetTable;
}

const normalizeSymbol = (symbol: string) =>
  symbol.trim().toUpperCase().split(":").pop() || symbol.toUpperCase();

const parseNumberCell = (cell: GoogleSheetCell | null | undefined): number | null => {
  if (!cell) return null;
  if (typeof cell.v === "number") {
    return cell.v;
  }

  const raw = typeof cell.f === "string" ? cell.f : String(cell.v ?? "");
  const cleaned = raw.replace(/,/g, "").trim();
  const asNumber = Number(cleaned);

  return Number.isFinite(asNumber) ? asNumber : null;
};

const parseJsonPayload = (payload: string): GoogleSheetResponse => {
  const match = payload.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);

  if (!match) {
    throw new Error("Invalid Google Sheets response payload");
  }

  return JSON.parse(match[1]) as GoogleSheetResponse;
};

export async function fetchGammaSheetLevels(): Promise<Record<string, SheetGammaLevelRow>> {
  const response = await fetch(SHEET_URL);

  if (!response.ok) {
    throw new Error(`Google Sheet request failed: ${response.status}`);
  }

  const text = await response.text();
  const payload = parseJsonPayload(text);
  const rows = payload.table.rows ?? [];

  const result: Record<string, SheetGammaLevelRow> = {};

  for (const row of rows) {
    const cells = row.c;
    const symbolCell = cells[1];
    if (!symbolCell) continue;

    const symbol = normalizeSymbol(String(symbolCell.v ?? symbolCell.f ?? "").trim());
    if (!symbol) continue;

    const volTriggerUp = parseNumberCell(cells[2]);
    const callWall = parseNumberCell(cells[3]);
    const mid = parseNumberCell(cells[4]);
    const gexFlip = parseNumberCell(cells[6]);
    const hvl = parseNumberCell(cells[7]);
    const maxPain = parseNumberCell(cells[9]);
    const putWall = parseNumberCell(cells[10]);
    const volTriggerDown = parseNumberCell(cells[11]);

    if (
      volTriggerUp == null ||
      callWall == null ||
      gexFlip == null ||
      hvl == null ||
      maxPain == null ||
      putWall == null ||
      volTriggerDown == null
    ) {
      continue;
    }

    result[symbol] = {
      symbol,
      gexFlip,
      callWall,
      putWall,
      hvl,
      maxPain,
      volTriggerUp,
      volTriggerDown,
      mid: mid ?? undefined,
    };
  }

  return result;
}
