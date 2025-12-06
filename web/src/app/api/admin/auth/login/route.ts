import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";
import { supabaseAdmin } from "@/lib/supabase/client";
import jwt from "jsonwebtoken";
import { env } from "@/lib/env";
import crypto from "crypto";

function verifyPassword(stored: string, password: string) {
  // format: algorithm$iterations$salt$hash
  const parts = stored.split("$");
  if (parts.length !== 4) return false;
  const [, iterStr, salt, hash] = parts;
  const iterations = parseInt(iterStr, 10);
  const derived = crypto.pbkdf2Sync(password, salt, iterations, hash.length / 2, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    if (!supabaseAdmin) throw new Error("Missing service role key");
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .single<Database["public"]["Tables"]["users"]["Row"]>();
    if (error || !user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    if (!verifyPassword(user.hashed_password, password)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role ?? "viewer" }, env.adminApiKey ?? "admin-secret", {
      expiresIn: "7d",
    });
    const res = NextResponse.json({ success: true });
    res.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return res;
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
