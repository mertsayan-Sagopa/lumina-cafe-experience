"use client";

export type LuxuryTheme = "silk-cream" | "matte-obsidian";

const THEME_STORAGE_KEY = "lumina_luxury_theme_v1";

export function getSavedTheme(): LuxuryTheme {
  if (typeof window === "undefined") return "silk-cream";
  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "matte-obsidian" || saved === "silk-cream") {
    return saved;
  }
  return "silk-cream";
}

export function applyLuxuryTheme(theme: LuxuryTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}
