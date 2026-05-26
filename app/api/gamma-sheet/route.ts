import { fetchGammaSheetLevels } from "@/lib/gamma-sheet";

export async function GET() {
  try {
    const data = await fetchGammaSheetLevels();
    return Response.json({ data });
  } catch (error) {
    console.error("Gamma sheet request failed:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to load gamma sheet data",
      },
      { status: 502 },
    );
  }
}
