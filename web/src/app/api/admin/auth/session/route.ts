import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { env } from "@/lib/env";

export async function GET(request: Request) {
  try {
    const cookie = request.headers.get("cookie") || "";
    const token = cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("admin_token="))
      ?.split("=")[1];
    if (!token) return NextResponse.json({ role: null }, { status: 401 });
    const decoded = jwt.verify(token, env.adminApiKey ?? "admin-secret") as { role?: string };
    return NextResponse.json({ role: decoded.role ?? null });
  } catch {
    return NextResponse.json({ role: null }, { status: 401 });
  }
}
