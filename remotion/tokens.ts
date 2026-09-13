import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";

/** Colours, straight from app/globals.css `[data-theme="dark"]`. */
export const BG = "#0a0a0a";
export const TEXT = "#ededed";
export const DIM = "#a1a1a1";
export const FAINT = "#8f8f8f";
export const ACCENT = "#0a85ff";
export const GLOW = "#22C55E"; // alien eyes only
export const VIOLET = "#6e56f7";
export const SURFACE = "#121213";
export const BORDER = "#23232b";

/** The site's rainbow (.dc-btn--rainbow): a 1px edge revealed by an inset fill. */
export const RAINBOW =
  "linear-gradient(90deg, hsl(0,100%,63%), hsl(90,100%,63%), hsl(210,100%,63%), hsl(195,100%,63%), hsl(270,100%,63%), hsl(0,100%,63%))";

/** Type: Geist for UI and the wordmark's neighbours, Geist Mono for readouts and
 *  the terminal, Caveat for the wordmark and the one handwritten annotation. The
 *  same three families app/layout.tsx loads. */
const geist = loadGeist("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });
const mono = loadGeistMono("normal", { weights: ["400", "500"], subsets: ["latin"] });
const caveat = loadCaveat("normal", { weights: ["600"], subsets: ["latin"] });

export const SANS = `${geist.fontFamily}, system-ui, sans-serif`;
export const MONO = `${mono.fontFamily}, ui-monospace, monospace`;
export const SCRIPT = `${caveat.fontFamily}, cursive`;

export const GH_PATH =
  "M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.5v-1.85c-2.78.62-3.37-1.37-3.37-1.37-.46-1.19-1.11-1.51-1.11-1.51-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.89 1.57 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9v2.82c0 .28.18.61.69.5C19.14 20.61 22 16.78 22 12.25 22 6.58 17.52 2 12 2Z";
export const STAR_PATH = "m12 2 2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2Z";
