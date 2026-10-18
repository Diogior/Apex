import { describe, expect, it, vi } from "vitest";
import handler, { MAX_TOKENS, rateLimited, validateBody } from "./chat.js";

const ok = { model: "claude-haiku-4-5-20251001", max_tokens: 300, messages: [{ role: "user", content: "hi" }] };

function mockRes() {
  const res = { statusCode: 0, body: null };
  res.status = (c) => ((res.statusCode = c), res);
  res.json = (b) => ((res.body = b), res);
  return res;
}

describe("validateBody", () => {
  it("accepts the shapes the app sends", () => {
    expect(validateBody(ok)).toBeNull();
    expect(validateBody({ ...ok, model: "claude-sonnet-4-6", max_tokens: 1200, system: "x" })).toBeNull();
  });

  it("rejects other models, oversized or missing token limits, and empty messages", () => {
    expect(validateBody({ ...ok, model: "claude-opus-4-1" })).toMatch(/Model/);
    expect(validateBody({ ...ok, max_tokens: MAX_TOKENS + 1 })).toMatch(/max_tokens/);
    expect(validateBody({ ...ok, max_tokens: undefined })).toMatch(/max_tokens/);
    expect(validateBody({ ...ok, messages: [] })).toMatch(/messages/);
    expect(validateBody(null)).toMatch(/body/);
  });
});

describe("rateLimited", () => {
  it("allows a burst, then blocks until the window resets", () => {
    const t0 = 1_000_000;
    let blocked = 0;
    for (let i = 0; i < 45; i++) if (rateLimited("user-a", t0)) blocked++;
    expect(blocked).toBe(5);
    expect(rateLimited("user-a", t0 + 11 * 60 * 1000)).toBe(false);
    expect(rateLimited("user-b", t0)).toBe(false);
  });
});

describe("handler", () => {
  it("refuses requests without a signed-in user before calling Anthropic", async () => {
    process.env.ANTHROPIC_KEY = "test-key";
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const res = mockRes();
    await handler({ method: "POST", headers: {}, body: ok }, res);
    expect(res.statusCode).toBe(401);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("only accepts POST", async () => {
    const res = mockRes();
    await handler({ method: "GET", headers: {} }, res);
    expect(res.statusCode).toBe(405);
  });
});
