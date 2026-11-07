import { describe, expect, it } from "vitest";
import { formatBytes, parseListingForm, parsePriceToCents, slugify, uniqueSlug } from "./listing";

const SELLER = "aaaaaaaa-0000-0000-0000-000000000001";
const CATS = ["templates", "ai-automation"];

function form(values: Record<string, string>) {
  return { get: (k: string) => values[k] ?? null };
}

const valid = {
  title: "  WhatsApp   Lead Bot ",
  summary: "Qualifies leads on WhatsApp around the clock.",
  description: "Setup guide included.",
  category: "ai-automation",
  price: "R 1 299,50",
  icon: "🤖",
  integrations: "WhatsApp, Email, whatsapp, ,Email",
};

describe("parsePriceToCents", () => {
  it("accepts common rand formats", () => {
    expect(parsePriceToCents("499")).toBe(49_900);
    expect(parsePriceToCents("R1299.99")).toBe(129_999);
    expect(parsePriceToCents("r 1 299,5")).toBe(129_950);
    expect(parsePriceToCents("0")).toBe(0);
  });
  it("rejects junk, negatives, too many decimals and absurd prices", () => {
    for (const bad of ["", "abc", "-5", "1.999", "1e5", "200000"]) expect(parsePriceToCents(bad)).toBeNull();
  });
});

describe("slugify / uniqueSlug", () => {
  it("makes URL-safe slugs", () => {
    expect(slugify("AI & Automation: Café Bot!")).toBe("ai-and-automation-cafe-bot");
    expect(slugify("!!!")).toBe("");
  });
  it("adds a suffix and survives empty titles", () => {
    expect(uniqueSlug("Lead Bot", () => 0)).toBe("lead-bot-0000");
    expect(uniqueSlug("???", () => 0.5)).toMatch(/^listing-[a-z0-9]{4}$/);
    expect(uniqueSlug("x".repeat(200))).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });
});

describe("parseListingForm", () => {
  it("normalises a valid submission", () => {
    const r = parseListingForm(form(valid), SELLER, CATS);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.title).toBe("WhatsApp Lead Bot");
    expect(r.data.priceCents).toBe(129_950);
    expect(r.data.integrations).toEqual(["WhatsApp", "Email", "whatsapp"]);
    expect(r.data.file).toBeNull();
  });

  it("reports every bad field", () => {
    const r = parseListingForm(form({ title: "x", summary: "short", category: "nope", price: "free" }), SELLER, CATS);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(Object.keys(r.errors).sort()).toEqual(["categorySlug", "priceCents", "summary", "title"]);
  });

  it("accepts an uploaded file in the seller's folder", () => {
    const r = parseListingForm(
      form({ ...valid, filePath: `${SELLER}/abc/kit.zip`, fileName: "kit.zip", fileSize: "1024" }),
      SELLER,
      CATS,
    );
    expect(r.ok && r.data.file).toEqual({ path: `${SELLER}/abc/kit.zip`, name: "kit.zip", size: 1024 });
  });

  it("rejects files outside the seller's folder or with path tricks", () => {
    for (const filePath of ["someone-else/kit.zip", `${SELLER}/../other/kit.zip`]) {
      const r = parseListingForm(form({ ...valid, filePath, fileName: "kit.zip", fileSize: "1" }), SELLER, CATS);
      expect(r.ok).toBe(false);
    }
  });

  it("only accepts cover images from the listing-images bucket", () => {
    const ok = parseListingForm(
      form({ ...valid, imageUrl: "https://abc.supabase.co/storage/v1/object/public/listing-images/u/x.png" }),
      SELLER,
      CATS,
    );
    expect(ok.ok).toBe(true);
    const bad = parseListingForm(form({ ...valid, imageUrl: "https://evil.example/x.png" }), SELLER, CATS);
    expect(bad.ok).toBe(false);
  });
});

describe("formatBytes", () => {
  it("is human friendly", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
  });
});
