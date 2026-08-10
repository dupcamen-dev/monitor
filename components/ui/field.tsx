export const inputClass =
  "w-full rounded border border-card-border bg-surface-container-lowest px-3 py-2 font-mono text-code-label text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block font-mono text-code-label text-on-surface">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-body-sm text-on-surface-variant">{hint}</p>}
    </div>
  );
}
