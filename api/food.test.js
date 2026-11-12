import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({ uid: "user-1", limited: false }));
vi.mock("./_auth.js", () => ({
  verifyUser: async () => auth.uid,
  makeLimiter: () => () => auth.limited,
}));

import handler, { mergeResults, normalizeFdc, normalizeOff, searchFoods } from "./food.js";

function mockRes() {
  const res = { statusCode: 0, body: null };
  res.status = (c) => ((res.statusCode = c), res);
  res.json = (b) => ((res.body = b), res);
  return res;
}
const call = async (query, method = "GET") => {
  const res = mockRes();
  await handler({ method, query, headers: {} }, res);
  return res;
};

const fdc = (over = {}) => ({
  fdcId: 171477,
  description: "CHICKEN, BREAST, RAW",
  foodNutrients: [
    { nutrientId: 1008, value: 120 },
    { nutrientId: 1003, value: 22.5 },
    { nutrientId: 1005, value: 0 },
    { nutrientId: 1004, value: 2.6 },
  ],
  ...over,
});
const off = (over = {}) => ({
  code: "3017620422003",
  product_name: "Hazelnut spread",
  brands: "Brand A, Brand B",
  serving_quantity: "15",
  serving_size: "15 g",
  nutriments: { "energy-kcal_100g": 539, proteins_100g: 6.3, carbohydrates_100g: 57.5, fat_100g: 30.9 },
  ...over,
});

describe("normalizeFdc", () => {
  it("maps a whole food to per-100g macros with a tidy name", () => {
    expect(normalizeFdc(fdc())).toEqual({
      id: "usda:171477",
      name: "Chicken, Breast, Raw",
      brand: "",
      servingG: 0,
      servingLabel: "100 g",
      per100: { kcal: 120, p: 22.5, c: 0, f: 2.6 },
      source: "usda",
    });
  });

  it("keeps brand and gram serving for branded products", () => {
    const f = normalizeFdc(fdc({ brandOwner: "ACME FOODS", servingSize: 28, servingSizeUnit: "g", householdServingFullText: "1 SLICE" }));
    expect(f.brand).toBe("Acme Foods");
    expect(f.servingG).toBe(28);
    expect(f.servingLabel).toBe("1 slice");
  });

  it("ignores a serving that isn't in grams", () => {
    expect(normalizeFdc(fdc({ servingSize: 240, servingSizeUnit: "ml" })).servingG).toBe(0);
  });

  it("falls back to the Atwater energy id and skips foods with no energy at all", () => {
    expect(normalizeFdc(fdc({ foodNutrients: [{ nutrientId: 2047, value: 90 }] })).per100.kcal).toBe(90);
    expect(normalizeFdc(fdc({ foodNutrients: [] }))).toBeNull();
  });
});

describe("normalizeOff", () => {
  it("maps a product, taking the first brand and the serving size", () => {
    expect(normalizeOff(off())).toEqual({
      id: "off:3017620422003",
      name: "Hazelnut spread",
      brand: "Brand A",
      servingG: 15,
      servingLabel: "15 g",
      per100: { kcal: 539, p: 6.3, c: 57.5, f: 30.9 },
      source: "off",
    });
  });

  it("converts kilojoules when kcal is missing", () => {
    expect(normalizeOff(off({ nutriments: { energy_100g: 418.4 } })).per100.kcal).toBe(100);
  });

  it("skips products with no name or no energy", () => {
    expect(normalizeOff(off({ product_name: "  " }))).toBeNull();
    expect(normalizeOff(off({ nutriments: {} }))).toBeNull();
  });
});

describe("mergeResults", () => {
  const f = (name, brand = "") => ({ name, brand });
  it("lists whole foods first, then alternates branded and Open Food Facts, dropping repeats", () => {
    const out = mergeResults({
      whole: [f("Oats")],
      branded: [f("Oats", "A"), f("Oats", "B")],
      off: [f("Oats", "C"), f("oats", "a")],
    });
    expect(out.map((x) => x.brand)).toEqual(["", "A", "C", "B"]);
  });

  it("caps the list", () => {
    const many = Array.from({ length: 40 }, (_, i) => f(`Food ${i}`));
    expect(mergeResults({ whole: many }, 25)).toHaveLength(25);
  });
});

describe("handler", () => {
  beforeEach(() => {
    auth.uid = "user-1";
    auth.limited = false;
    process.env.FDC_API_KEY = "test-key";
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.FDC_API_KEY;
  });

  const stubFetch = (route) =>
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url) => {
        const r = route(String(url));
        return { ok: r.ok ?? true, status: r.status ?? 200, json: async () => r.body };
      }),
    );

  it("refuses unsigned requests before touching any food source", async () => {
    auth.uid = null;
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const res = await call({ q: "egg" });
    expect(res.statusCode).toBe(401);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rate limits and rejects other methods", async () => {
    auth.limited = true;
    expect((await call({ q: "egg" })).statusCode).toBe(429);
    expect((await call({ q: "egg" }, "POST")).statusCode).toBe(405);
  });

  it("validates the search text and the barcode", async () => {
    expect((await call({ q: "a" })).statusCode).toBe(400);
    expect((await call({ q: "x".repeat(81) })).statusCode).toBe(400);
    expect((await call({})).statusCode).toBe(400);
    expect((await call({ barcode: "12ab" })).statusCode).toBe(400);
  });

  it("merges both sources, never sends the key to Open Food Facts, and uses it for USDA", async () => {
    const urls = [];
    stubFetch((url) => {
      urls.push(url);
      if (url.includes("api.nal.usda.gov")) return { body: { foods: [fdc()] } };
      return { body: { products: [off()] } };
    });
    const res = await call({ q: "chicken" });
    expect(res.statusCode).toBe(200);
    expect(res.body.results.map((r) => r.source)).toEqual(["usda", "off"]);
    expect(urls.filter((u) => u.includes("api.nal.usda.gov")).every((u) => u.includes("api_key=test-key"))).toBe(true);
    expect(urls.filter((u) => u.includes("openfoodfacts")).some((u) => u.includes("test-key"))).toBe(false);
  });

  it("still answers from one source when the other fails, and 502s when both do", async () => {
    stubFetch((url) => (url.includes("openfoodfacts") ? { ok: false, status: 503, body: {} } : { body: { foods: [fdc()] } }));
    const partial = await call({ q: "chicken" });
    expect(partial.statusCode).toBe(200);
    expect(partial.body.results.every((r) => r.source === "usda")).toBe(true);

    stubFetch(() => ({ ok: false, status: 500, body: {} }));
    expect((await call({ q: "chicken" })).statusCode).toBe(502);
  });

  it("works without a USDA key by using Open Food Facts only", async () => {
    delete process.env.FDC_API_KEY;
    const urls = [];
    stubFetch((url) => (urls.push(url), { body: { products: [off()] } }));
    const results = await searchFoods("spread");
    expect(results).toHaveLength(1);
    expect(urls.some((u) => u.includes("usda"))).toBe(false);
  });

  it("looks up a barcode, and says not found when the product is unknown", async () => {
    stubFetch(() => ({ body: { status: 1, product: off() } }));
    const found = await call({ barcode: "3017620422003" });
    expect(found.statusCode).toBe(200);
    expect(found.body.food.id).toBe("off:3017620422003");

    stubFetch(() => ({ body: { status: 0 } }));
    expect((await call({ barcode: "3017620422003" })).statusCode).toBe(404);
  });
});
