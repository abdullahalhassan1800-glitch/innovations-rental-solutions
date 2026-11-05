import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(value: number | null | undefined) {
  if (value == null) return "—";
  return inr.format(value);
}

export function formatPriceShort(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  if (value >= 10000000) {
    const cr = value / 10000000;
    return `₹${trim(cr)} Cr`;
  }
  if (value >= 100000) {
    const lakh = value / 100000;
    return `₹${trim(lakh)} L`;
  }
  if (value >= 1000) return `₹${trim(value / 1000)}K`;
  return `₹${value}`;
}

function trim(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
}

export function formatPriceRange(min: number, max?: number | null) {
  if (!max || max === min) return formatPriceShort(min);
  return `${formatPriceShort(min)} – ${formatPriceShort(max)}`;
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatMonthYear(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" }).format(date);
}

export function parseJsonArray<T = string>(value: string | null | undefined): T[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function parseBhk(value: string | null | undefined): string[] {
  return parseJsonArray<string>(value);
}

export function toJsonList(values: string[] | undefined | null) {
  if (!values || values.length === 0) return null;
  return JSON.stringify(values.filter(Boolean));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function truncate(value: string, length = 140) {
  if (value.length <= length) return value;
  return `${value.slice(0, length).trimEnd()}…`;
}

export function safeNextPath(value: string | null | undefined, fallback = "/dashboard") {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

export function absoluteUrl(path: string) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function whatsappLink(message: string, number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919205908398") {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function cxNumber(value: number | string | undefined | null) {
  return value == null ? "" : String(value);
}
