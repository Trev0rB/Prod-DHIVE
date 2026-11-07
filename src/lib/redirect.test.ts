import { describe, expect, it } from "vitest";
import { isEmail, safeNext } from "./redirect";

describe("safeNext", () => {
  it("allows same-site paths", () => {
    expect(safeNext("/account")).toBe("/account");
    expect(safeNext("/p/lead-generation-chatbot?x=1")).toBe("/p/lead-generation-chatbot?x=1");
  });

  it("falls back for anything that could leave the site", () => {
    for (const bad of [
      null,
      undefined,
      "",
      "https://evil.com",
      "//evil.com",
      "/\\evil.com",
      "/\t/evil.com",
      "javascript:alert(1)",
      "account",
    ]) {
      expect(safeNext(bad)).toBe("/account");
    }
  });

  it("uses a custom fallback", () => {
    expect(safeNext("//x", "/")).toBe("/");
  });
});

describe("isEmail", () => {
  it("accepts normal addresses and rejects junk", () => {
    expect(isEmail("trevor@boschtech.co.za")).toBe(true);
    expect(isEmail("not-an-email")).toBe(false);
    expect(isEmail("a b@c.com")).toBe(false);
    expect(isEmail(`${"a".repeat(250)}@x.com`)).toBe(false);
  });
});
