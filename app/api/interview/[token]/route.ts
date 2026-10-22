import { NextResponse } from "next/server";
import { getInterviewState } from "@/lib/interview/state";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const state = await getInterviewState(token);
  if (!state) {
    return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  }
  return NextResponse.json(state);
}
