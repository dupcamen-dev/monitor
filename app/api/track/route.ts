import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { createServerClientSSR } from "@/lib/supabase/auth";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const limited = rateLimit(request, 30);
    if (!limited.ok) {
      return NextResponse.json(
        { ok: true },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
      );
    }

    const body = await request.json().catch(() => null);
    const path = typeof body?.path === "string" ? body.path.slice(0, 500) : "/";
    if (!path.startsWith("/") || path.startsWith("/api")) {
      return NextResponse.json({ ok: true });
    }
    const referrer = typeof body?.referrer === "string" ? body.referrer.slice(0, 500) : null;

    let userId: string | null = null;
    try {
      const ssr = await createServerClientSSR();
      const {
        data: { user },
      } = await ssr.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      // not signed in or cookies unavailable — treat as anonymous visit
    }

    const admin = createAdminClient();
    await admin.from("page_visits").insert({ path, referrer, user_id: userId });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
