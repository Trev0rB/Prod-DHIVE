import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DHIVE — the AI marketplace where creators keep 100%",
    template: "%s · DHIVE",
  },
  description:
    "Buy and sell AI tools, automations, templates and courses. Zero platform fees: sellers keep every rand.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://dhive.co.za"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-ZA" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
