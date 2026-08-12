import { getUserOrg } from "@/lib/org";

export async function getUserOrgId(): Promise<string | null> {
  const org = await getUserOrg();
  return org?.id ?? null;
}
