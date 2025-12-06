import { env } from "./env";
import jwt from "jsonwebtoken";

export type Role = "admin" | "manager" | "viewer";

export function assertAdminApiKey(headers: Headers) {
  const incoming = headers.get("x-admin-key");
  if (!env.adminApiKey || incoming !== env.adminApiKey) {
    throw new Error("Unauthorized");
  }
}

export function requireAdminToken(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  const token = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("admin_token="))
    ?.split("=")[1];
  if (!token) throw new Error("Unauthorized");
  const decoded = jwt.verify(token, env.adminApiKey ?? "admin-secret") as { role?: string };
  if (!decoded.role || !["admin", "manager"].includes(decoded.role)) throw new Error("Forbidden");
  return decoded.role as Role;
}
