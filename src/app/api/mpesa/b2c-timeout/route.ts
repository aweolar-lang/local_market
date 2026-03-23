import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("M-Pesa B2C Timeout hit");
  return NextResponse.json({ success: true });
}