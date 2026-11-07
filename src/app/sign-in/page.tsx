import type { Metadata } from "next";
import { Suspense } from "react";
import { safeNext } from "@/lib/redirect";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const ERRORS: Record<string, string> = {
  link: "That sign-in link has expired or was already used. Request a new one below.",
};

export default function SignInPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <h1 className="font-display text-3xl font-bold">Sign in to DHIVE</h1>
      <p className="mt-2 text-ink-soft">Buy tools, track your purchases, and sell your own.</p>
      <div className="mt-8">
        <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-wash" />}>
          <SignInBody searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function SignInBody({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const error = ERRORS[one(params.error) ?? ""];
  return (
    <>
      {error && (
        <p role="alert" className="mb-5 rounded-lg bg-honey-wash p-3 text-sm text-amber-900">
          {error}
        </p>
      )}
      <SignInForm next={safeNext(one(params.next))} />
    </>
  );
}
