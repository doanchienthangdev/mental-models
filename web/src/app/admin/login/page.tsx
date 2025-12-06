"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const res = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Login failed");
      setLoading(false);
      return;
    }
    router.replace("/admin");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d1821] text-slate-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 rounded-xl border border-[#1e3442] bg-[#0f202d] p-6 shadow-card">
        <h1 className="text-xl font-semibold text-white">Admin Login</h1>
        <div className="space-y-2">
          <label className="text-sm text-slate-300">Email</label>
          <Input name="email" type="email" placeholder="admin@example.com" required className="h-11" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-300">Password</label>
          <Input name="password" type="password" placeholder="••••••••" required className="h-11" />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" className="w-full bg-[#2ea0e1] text-slate-900 hover:bg-[#248bc5]" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
