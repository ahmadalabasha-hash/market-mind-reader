import { NextResponse } from "next/server";
import { isSheetsConfigured } from "@/lib/google-sheets";

export async function GET() {
  return NextResponse.json({
    sheetsConfigured: isSheetsConfigured(),
  });
}
