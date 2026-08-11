import { createAdminClient } from "@/lib/supabase";
import { SeoForm } from "@/components/actions/seo-form";

export const dynamic = "force-dynamic";

interface SeoSettings {
  title: string;
  description: string;
  keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  updated_at: string | null;
  updated_by: string | null;
}

export default async function AdminSeoPage() {
  const admin = createAdminClient();
  const { data } = await admin.from("seo_settings").select("*").eq("id", 1).maybeSingle();

  const settings: SeoSettings = {
    title: data?.title ?? "",
    description: data?.description ?? "",
    keywords: data?.keywords ?? null,
    og_title: data?.og_title ?? null,
    og_description: data?.og_description ?? null,
    updated_at: data?.updated_at ?? null,
    updated_by: data?.updated_by ?? null,
  };

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-display-lg-mobile text-on-surface md:text-display-lg">SEO</h1>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          Meta tags for the landing page (topstatus.space).
        </p>
      </header>
      <div className="max-w-2xl">
        <SeoForm initial={settings} />
      </div>
    </div>
  );
}
