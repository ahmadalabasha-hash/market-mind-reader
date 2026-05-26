import { NextResponse } from "next/server";
import { generateMockOptionsData } from "@/lib/mock-options";
import { verifySessionToken } from "@/lib/auth";
import { parseCookies, SESSION_COOKIE_NAME } from "@/lib/auth-types";

export async function GET(req: Request) {
  const cookies = parseCookies(req.headers.get("cookie"));
  const token = cookies[SESSION_COOKIE_NAME];
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20", 10)));
  const search = (searchParams.get("search") || "").toLowerCase();
  const sortBy = searchParams.get("sortBy") || "ivRank1y";
  const sortDir = searchParams.get("sortDir") || "desc";

  let data = generateMockOptionsData();

  if (search) {
    data = data.filter(
      (item) =>
        item.symbol.toLowerCase().includes(search) ||
        item.name.toLowerCase().includes(search),
    );
  }

  data.sort((a, b) => {
    let aVal: number = 0;
    let bVal: number = 0;

    if (sortBy === "ivRank1y") {
      aVal = a.ivRank1y;
      bVal = b.ivRank1y;
    } else if (sortBy === "impliedVolatility") {
      aVal = a.impliedVolatility;
      bVal = b.impliedVolatility;
    } else if (sortBy === "volume") {
      aVal = a.volume;
      bVal = b.volume;
    } else if (sortBy === "openInterest") {
      aVal = a.openInterest;
      bVal = b.openInterest;
    }

    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
  });

  const total = data.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = data.slice(start, end);

  return NextResponse.json({
    data: paginatedData,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}
