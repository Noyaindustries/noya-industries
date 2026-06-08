import { NextResponse } from "next/server";
import { getOverviewData } from "@/lib/dashboard/overview-data";

export async function GET() {
  return NextResponse.json(await getOverviewData());
}
