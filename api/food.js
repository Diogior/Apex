// Vercel serverless function: food search for the phone app.
//   GET /api/food?q=chicken     searches USDA FoodData Central and Open Food Facts together
//   GET /api/food?barcode=...   looks one product up on Open Food Facts
// Needs a Firebase ID token like chat.js. The USDA key (FDC_API_KEY) stays on the server.
import { makeLimiter, verifyUser } from "./_auth.js";

const FDC_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";
const OFF_SEARCH = "https://world.openfoodfacts.org/cgi/search.pl";
const OFF_PRODUCT = "https://world.openfoodfacts.org/api/v2/product";
const OFF_FIELDS = "code,product_name,brands,nutriments,serving_quantity,serving_size";
const USER_AGENT = "ApexFitnessApp/1.0";
const TIMEOUT_MS = 8000;
const MAX_RESULTS = 25;

export const limited = makeLimiter(60);

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};
const round1 = (n) => Math.round(n * 10) / 10;
const per100 = (kcal, p, c, f) => ({ kcal: Math.round(num(kcal)), p: round1(num(p)), c: round1(num(c)), f: round1(num(f)) });
const sentence = (s) => {
  const t = String(s || "").trim().toLowerCase();
  return t ? t[0].toUpperCase() + t.slice(1) : "";
};
const titleCase = (s) => String(s || "").trim().toLowerCase().replace(/(^|[\s(/-])([a-z])/g, (_, a, b) => a + b.toUpperCase());

/** USDA FoodData Central search hit -> the app's food shape, or null when it has no calories. */
export function normalizeFdc(food) {
  const byId = {};
  for (const n of food.foodNutrients || []) byId[String(n.nutrientId ?? n.nutrientNumber)] = n.value;
  const kcal = byId["1008"] ?? byId["208"] ?? byId["2047"] ?? byId["2048"];
  if (kcal === undefined || num(kcal) <= 0 && num(byId["1003"]) + num(byId["1005"]) + num(byId["1004"]) === 0) return null;
  const unit = String(food.servingSizeUnit || "").toLowerCase();
  const servingG = (unit === "g" || unit === "grm") && num(food.servingSize) > 0 ? Math.round(num(food.servingSize)) : 0;
  return {
    id: `usda:${food.fdcId}`,
    name: titleCase(food.description),
    brand: titleCase(food.brandName || food.brandOwner || ""),
    servingG,
    servingLabel: servingG ? sentence(food.householdServingFullText) || `${servingG} g` : "100 g",
    per100: per100(kcal, byId["1003"] ?? byId["203"], byId["1005"] ?? byId["205"], byId["1004"] ?? byId["204"]),
    source: "usda",
  };
}

/** Open Food Facts product -> the app's food shape, or null when it has no name or calories. */
export function normalizeOff(p) {
  const n = p.nutriments || {};
  const kcal = n["energy-kcal_100g"] ?? (n["energy_100g"] !== undefined ? num(n["energy_100g"]) / 4.184 : undefined);
  const name = String(p.product_name || "").trim();
  if (!name || kcal === undefined || Number.isNaN(Number(kcal))) return null;
  const servingG = num(p.serving_quantity) > 0 ? Math.round(num(p.serving_quantity)) : 0;
  return {
    id: `off:${p.code}`,
    name,
    brand: String(p.brands || "").split(",")[0].trim(),
    servingG,
    servingLabel: servingG ? p.serving_size || `${servingG} g` : "100 g",
    per100: per100(kcal, n["proteins_100g"], n["carbohydrates_100g"], n["fat_100g"]),
    source: "off",
  };
}

/**
 * Whole foods first, then branded USDA products and Open Food Facts products taking turns.
 * Repeats (same name and brand) are dropped and the list is capped.
 */
export function mergeResults({ whole = [], branded = [], off = [] }, limit = MAX_RESULTS) {
  const seen = new Set();
  const out = [];
  const add = (f) => {
    if (!f) return;
    const key = `${f.name}|${f.brand}`.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(f);
  };
  whole.forEach(add);
  for (let i = 0; i < Math.max(branded.length, off.length); i++) {
    add(branded[i]);
    add(off[i]);
  }
  return out.slice(0, limit);
}

const getJson = async (url) => {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

async function searchUsdaType(q, dataType, pageSize) {
  const url = `${FDC_URL}?${new URLSearchParams({ query: q, pageSize: String(pageSize), dataType, api_key: process.env.FDC_API_KEY })}`;
  const data = await getJson(url);
  return (data.foods || []).map(normalizeFdc).filter(Boolean);
}

/** Whole foods (Foundation, SR Legacy) and branded products are searched separately so plain foods rank first. */
async function searchUsda(q) {
  if (!process.env.FDC_API_KEY) return { whole: [], branded: [] };
  const [whole, branded] = await Promise.all([searchUsdaType(q, "Foundation,SR Legacy", 6), searchUsdaType(q, "Branded", 10)]);
  return { whole, branded };
}

async function searchOff(q) {
  const url = `${OFF_SEARCH}?${new URLSearchParams({ search_terms: q, search_simple: "1", action: "process", json: "1", page_size: "15", fields: OFF_FIELDS })}`;
  const data = await getJson(url);
  return (data.products || []).map(normalizeOff).filter(Boolean);
}

/** Search both sources. Null only when both fail; one failing still returns the other's results. */
export async function searchFoods(query) {
  const [usda, off] = await Promise.allSettled([searchUsda(query), searchOff(query)]);
  if (usda.status === "rejected" && off.status === "rejected") return null;
  const u = usda.status === "fulfilled" ? usda.value : {};
  return mergeResults({ whole: u.whole, branded: u.branded, off: off.status === "fulfilled" ? off.value : [] });
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const uid = await verifyUser(req);
  if (!uid) return res.status(401).json({ error: "Sign in required" });
  if (limited(uid)) return res.status(429).json({ error: "Too many searches. Try again in a few minutes." });

  const { q, barcode } = req.query || {};

  if (barcode !== undefined) {
    const code = String(barcode).trim();
    if (!/^\d{8,14}$/.test(code)) return res.status(400).json({ error: "Barcode must be 8-14 digits" });
    try {
      const data = await getJson(`${OFF_PRODUCT}/${code}.json?fields=${OFF_FIELDS}`);
      const food = data.status === 1 && data.product ? normalizeOff({ ...data.product, code }) : null;
      return food ? res.status(200).json({ food }) : res.status(404).json({ error: "Product not found" });
    } catch (err) {
      return res.status(502).json({ error: "Food lookup failed", detail: err.message });
    }
  }

  const query = String(q || "").trim();
  if (query.length < 2 || query.length > 80) return res.status(400).json({ error: "Search must be 2-80 characters" });

  const results = await searchFoods(query);
  if (!results) return res.status(502).json({ error: "Food search is unavailable right now" });
  return res.status(200).json({ results });
}
