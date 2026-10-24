// Channels stay unrounded floats until formatting, so round trips don't drift.
// Out-of-gamut OKLCH lowers chroma at constant L and H, keeping hue (unlike a per-channel clip).

export type ColorFormat = "hex" | "rgb" | "hsl" | "oklch";

/** sRGB, channels 0–255 (unrounded), alpha 0–1. */
export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** Hue in degrees [0, 360), saturation and value 0–1, alpha 0–1. */
export interface Hsva {
  h: number;
  s: number;
  v: number;
  a: number;
}

/** Hue in degrees [0, 360), saturation and lightness 0–1, alpha 0–1. */
export interface Hsla {
  h: number;
  s: number;
  l: number;
  a: number;
}

/** Lightness 0–1, a/b roughly −0.4–0.4. */
export interface Oklab {
  l: number;
  a: number;
  b: number;
  alpha: number;
}

/** Lightness 0–1, chroma ≥ 0 (sRGB tops out near 0.37), hue in degrees [0, 360). */
export interface Oklch {
  l: number;
  c: number;
  h: number;
  alpha: number;
}

export const COLOR_FORMATS: readonly ColorFormat[] = ["hex", "rgb", "hsl", "oklch"];

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

/** Wraps any angle into [0, 360). */
export function normalizeHue(hue: number): number {
  const h = hue % 360;
  return h < 0 ? h + 360 : h === 0 ? 0 : h;
}

export function hsvToRgb({ h, s, v, a }: Hsva): Rgba {
  const f = (n: number) => {
    const k = (n + normalizeHue(h) / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return { r: f(5) * 255, g: f(3) * 255, b: f(1) * 255, a };
}

/** `fallbackHue` is used for greys, so the hue slider doesn't jump to red at the grey edge. */
export function rgbToHsv({ r, g, b, a }: Rgba, fallbackHue = 0): Hsva {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const h = delta === 0 ? fallbackHue : hueFromRgb(rn, gn, bn, max, delta);
  return { h, s: max === 0 ? 0 : delta / max, v: max, a };
}

export function hslToRgb({ h, s, l, a }: Hsla): Rgba {
  const k = (n: number) => (n + normalizeHue(h) / 30) % 12;
  const amount = s * Math.min(l, 1 - l);
  const f = (n: number) => l - amount * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return { r: f(0) * 255, g: f(8) * 255, b: f(4) * 255, a };
}

export function rgbToHsl({ r, g, b, a }: Rgba, fallbackHue = 0): Hsla {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  const h = delta === 0 ? fallbackHue : hueFromRgb(rn, gn, bn, max, delta);
  return { h, s: clamp(s), l, a };
}

export function hsvToHsl({ h, s, v, a }: Hsva): Hsla {
  const l = v * (1 - s / 2);
  const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
  return { h, s: sl, l, a };
}

export function hslToHsv({ h, s, l, a }: Hsla): Hsva {
  const v = l + s * Math.min(l, 1 - l);
  return { h, s: v === 0 ? 0 : 2 * (1 - l / v), v, a };
}

function hueFromRgb(r: number, g: number, b: number, max: number, delta: number): number {
  let h: number;
  if (max === r) h = ((g - b) / delta) % 6;
  else if (max === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;
  return normalizeHue(h * 60);
}

/** sRGB transfer, sign-preserving so out-of-gamut values survive the round trip. */
function srgbToLinear(channel: number): number {
  const c = Math.abs(channel);
  const linear = c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  return Math.sign(channel) * linear;
}

function linearToSrgb(channel: number): number {
  const c = Math.abs(channel);
  const encoded = c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
  return Math.sign(channel) * encoded;
}

export function rgbToOklab({ r, g, b, a }: Rgba): Oklab {
  const lr = srgbToLinear(r / 255);
  const lg = srgbToLinear(g / 255);
  const lb = srgbToLinear(b / 255);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return {
    l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    alpha: a,
  };
}

/** OKLab → sRGB without any gamut handling: channels may land outside 0–255. */
export function oklabToRgbUnclamped({ l: L, a: A, b: B, alpha }: Oklab): Rgba {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return {
    r: linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s) * 255,
    g: linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s) * 255,
    b: linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s) * 255,
    a: alpha,
  };
}

/** Below this chroma a colour has no meaningful hue. */
const ACHROMATIC = 1e-4;

export function oklabToOklch({ l, a, b, alpha }: Oklab, fallbackHue = 0): Oklch {
  const c = Math.hypot(a, b);
  const h = c < ACHROMATIC ? fallbackHue : normalizeHue((Math.atan2(b, a) * 180) / Math.PI);
  return { l, c, h, alpha };
}

export function oklchToOklab({ l, c, h, alpha }: Oklch): Oklab {
  const rad = (h * Math.PI) / 180;
  return { l, a: c * Math.cos(rad), b: c * Math.sin(rad), alpha };
}

export function rgbToOklch(rgb: Rgba, fallbackHue = 0): Oklch {
  return oklabToOklch(rgbToOklab(rgb), fallbackHue);
}

const GAMUT_EPSILON = 1e-3;

export function inSrgbGamut({ r, g, b }: Rgba): boolean {
  const ok = (c: number) => c >= -GAMUT_EPSILON && c <= 255 + GAMUT_EPSILON;
  return ok(r) && ok(g) && ok(b);
}

/** Out of gamut, chroma is bisected down until the colour fits. */
export function oklchToRgb(color: Oklch): Rgba {
  const l = clamp(color.l);
  const direct = oklabToRgbUnclamped(oklchToOklab({ ...color, l }));
  if (inSrgbGamut(direct)) return clampRgb(direct);
  let low = 0;
  let high = color.c;
  for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2;
    if (inSrgbGamut(oklabToRgbUnclamped(oklchToOklab({ ...color, l, c: mid })))) low = mid;
    else high = mid;
  }
  return clampRgb(oklabToRgbUnclamped(oklchToOklab({ ...color, l, c: low })));
}

export function clampRgb({ r, g, b, a }: Rgba): Rgba {
  return { r: clamp(r, 0, 255), g: clamp(g, 0, 255), b: clamp(b, 0, 255), a: clamp(a) };
}

/** Fixed decimals without trailing zeros: 0.2500 → "0.25", 12.0 → "12". */
function trim(value: number, decimals: number): string {
  const fixed = value.toFixed(decimals);
  const out = decimals > 0 ? fixed.replace(/\.?0+$/, "") : fixed;
  return out === "-0" ? "0" : out;
}

function alphaSuffix(a: number): string {
  return a >= 1 ? "" : ` / ${trim(a * 100, 1)}%`;
}

function hex2(channel: number): string {
  return Math.round(clamp(channel, 0, 255))
    .toString(16)
    .padStart(2, "0");
}

/** `#rrggbb`, or `#rrggbbaa` when the colour isn't opaque. */
export function rgbToHex({ r, g, b, a }: Rgba): string {
  const base = `#${hex2(r)}${hex2(g)}${hex2(b)}`;
  return a >= 1 ? base : `${base}${hex2(a * 255)}`;
}

/** CSS Color 4 space-separated syntax, which `parseColor` round-trips. */
export function formatColor(rgb: Rgba, format: ColorFormat, fallbackHue = 0): string {
  switch (format) {
    case "hex":
      return rgbToHex(rgb);
    case "rgb":
      return `rgb(${Math.round(rgb.r)} ${Math.round(rgb.g)} ${Math.round(rgb.b)}${alphaSuffix(rgb.a)})`;
    case "hsl": {
      const { h, s, l } = rgbToHsl(rgb, fallbackHue);
      return `hsl(${trim(h, 1)} ${trim(s * 100, 1)}% ${trim(l * 100, 1)}%${alphaSuffix(rgb.a)})`;
    }
    case "oklch": {
      const { l, c, h } = rgbToOklch(rgb, fallbackHue);
      return `oklch(${trim(l * 100, 2)}% ${trim(c, 4)} ${trim(h, 2)}${alphaSuffix(rgb.a)})`;
    }
  }
}

/** Accepts `#rgb`, `#rgba`, `#rrggbb` and `#rrggbbaa`, with or without the `#`. */
export function parseHex(input: string): Rgba | null {
  const hex = input.trim().replace(/^#/, "");
  if (!/^[\da-f]+$/i.test(hex)) return null;
  const expand = hex.length <= 4 ? hex.replace(/./g, "$&$&") : hex;
  if (expand.length !== 6 && expand.length !== 8) return null;
  const at = (i: number) => Number.parseInt(expand.slice(i, i + 2), 16);
  return { r: at(0), g: at(2), b: at(4), a: expand.length === 8 ? at(6) / 255 : 1 };
}

/** A number, a percentage of `percentOf`, or `none` (0). */
function parseNumber(token: string, percentOf: number): number | null {
  if (token === "none") return 0;
  const match = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(%?)$/i.exec(token);
  if (!match) return null;
  const value = Number(match[1]);
  return match[2] ? (value / 100) * percentOf : value;
}

function parseAngle(token: string): number | null {
  if (token === "none") return 0;
  const match = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(deg|turn|rad|grad)?$/i.exec(token);
  if (!match) return null;
  const value = Number(match[1]);
  switch (match[2]?.toLowerCase()) {
    case "turn":
      return value * 360;
    case "rad":
      return (value * 180) / Math.PI;
    case "grad":
      return value * 0.9;
    default:
      return value;
  }
}

/** Splits `fn(a b c / d)` and the comma syntax `fn(a, b, c, d)`. */
function parseFunction(input: string): { name: string; args: string[]; alpha?: string } | null {
  const match = /^([a-z]+)\(\s*([^)]*)\)$/i.exec(input.trim());
  if (!match) return null;
  const name = match[1]!.toLowerCase();
  const body = match[2]!.trim();
  if (body.includes(",")) {
    const parts = body.split(",").map((part) => part.trim());
    if (parts.some((part) => part === "")) return null;
    return { name, args: parts.slice(0, 3), alpha: parts[3] };
  }
  const [channels, alpha, extra] = body.split("/").map((part) => part.trim());
  if (extra !== undefined || channels === undefined) return null;
  return { name, args: channels.split(/\s+/), alpha };
}

/** Hex, rgb(a), hsl(a) and oklch, space or comma syntax. Null otherwise; no named colours. */
export function parseColor(input: string): Rgba | null {
  const text = input.trim().toLowerCase();
  if (text === "") return null;
  if (text.startsWith("#") || /^[\da-f]{3,8}$/.test(text)) return parseHex(text);
  const fn = parseFunction(text);
  if (!fn || fn.args.length !== 3) return null;
  const alpha = fn.alpha === undefined ? 1 : parseNumber(fn.alpha, 1);
  if (alpha === null) return null;
  const a = clamp(alpha);

  switch (fn.name) {
    case "rgb":
    case "rgba": {
      const [r, g, b] = fn.args.map((token) => parseNumber(token, 255));
      if (r == null || g == null || b == null) return null;
      return clampRgb({ r, g, b, a });
    }
    case "hsl":
    case "hsla": {
      const h = parseAngle(fn.args[0]!);
      const s = parseNumber(fn.args[1]!.endsWith("%") ? fn.args[1]! : `${fn.args[1]}%`, 1);
      const l = parseNumber(fn.args[2]!.endsWith("%") ? fn.args[2]! : `${fn.args[2]}%`, 1);
      if (h === null || s === null || l === null) return null;
      return clampRgb(hslToRgb({ h, s: clamp(s), l: clamp(l), a }));
    }
    case "oklch": {
      const l = parseNumber(fn.args[0]!, 1);
      // A percentage chroma is relative to 0.4, per CSS Color 4.
      const c = parseNumber(fn.args[1]!, 0.4);
      const h = parseAngle(fn.args[2]!);
      if (l === null || c === null || h === null) return null;
      return oklchToRgb({ l, c: Math.max(0, c), h: normalizeHue(h), alpha: a });
    }
    default:
      return null;
  }
}

/** Same colour, within rounding: two values that format to the same hex are equal. */
export function colorsEqual(a: Rgba, b: Rgba): boolean {
  return rgbToHex(a) === rgbToHex(b);
}

/** Relative luminance (WCAG 2), for picking a legible ink over a swatch. */
export function luminance({ r, g, b }: Rgba): number {
  return (
    0.2126 * srgbToLinear(r / 255) + 0.7152 * srgbToLinear(g / 255) + 0.0722 * srgbToLinear(b / 255)
  );
}
