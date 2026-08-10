import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-xl border border-card-border bg-card p-8">
          <h1 className="text-headline-md text-on-surface">Sign in to your workspace</h1>
          <p className="mt-2 text-body-sm text-on-surface-variant">
            Each workspace is private and tied to your email. New accounts start with an empty
            dashboard.
          </p>
          <div className="mt-6">
            <GoogleSignInButton />
          </div>
        </div>
        <p className="mt-6 text-center font-mono text-code-label text-on-surface-variant">
          <Link href="/" className="hover:text-on-surface">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
