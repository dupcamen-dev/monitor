import Link from "next/link";

export function Logo({ size = "md", href = "/" }: { size?: "sm" | "md"; href?: string }) {
  const box = size === "sm" ? "h-8 w-8 text-sm" : "h-9 w-9 text-base";
  const text = size === "sm" ? "text-headline-md" : "text-headline-md";
  return (
    <Link href={href} className="flex items-center gap-2.5">
      <span
        className={`${box} flex items-center justify-center rounded bg-primary font-bold text-on-primary`}
      >
        U
      </span>
      <span className={`${text} font-bold tracking-tighter text-on-surface`}>UpStatus</span>
    </Link>
  );
}
