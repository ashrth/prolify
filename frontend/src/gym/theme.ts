// Two looks you can switch on and off per video. Text is never affected.

export type ThemeSettings = {
  exposure?: number; // 0 = as filmed. +0.5 brighter, -0.5 darker (whole image, highlights too)
  contrast?: number; // 1 = as filmed. 1.3 = punchier, 0.8 = flatter
  brightness?: number; // 1 = as filmed. 1.2 lifts the darks, 0.8 deepens them (whites stay white)
};

export type Themes = {
  blackAndWhite: boolean;
  colorBoost: boolean; // if both are true, black and white wins
  bw?: ThemeSettings;
  boost?: ThemeSettings & { amount?: number }; // amount: how strong the color boost is, 1.8 by default
};

const adjust = (s: ThemeSettings = {}) => {
  const parts: string[] = [];
  if (s.exposure) parts.push(`brightness(${2 ** s.exposure})`);
  if (s.brightness && s.brightness !== 1) {
    const b = Math.min(1.6, Math.max(0.6, s.brightness));
    parts.push(`brightness(${b}) contrast(${0.5 / (b - 0.5)})`); // moves the darks and mids, keeps white at white
  }
  if (s.contrast && s.contrast !== 1) parts.push(`contrast(${s.contrast})`);
  return parts.join(" ");
};

/** The CSS filter for the active theme ("" when both are off). */
export const themeFilter = (t?: Themes): string => {
  if (!t) return "";
  if (t.blackAndWhite) return `grayscale(1) ${adjust(t.bw)}`.trim();
  if (t.colorBoost) return `saturate(${(t.boost?.amount ?? 1.8) / 0.7}) ${adjust(t.boost)}`.trim(); // ÷0.7 undoes the footage's base desaturation
  return "";
};