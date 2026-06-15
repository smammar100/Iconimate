/**
 * Phosphor "presentation" glyph — a board mounted on an easel A-frame stand.
 * ViewBox 0 0 256 256, fill="currentColor". The full compound path splits into two
 * natural bodies so the board can move independently of the stand:
 *   STAND — the easel legs (triangle with the cut-out).
 *   BOARD — the screen / presentation surface.
 */

/** Easel A-frame stand (legs + inner triangle cut-out). */
export const STAND =
  "M134.08,154.79a8,8,0,0,0-12.15,0l-48,56A8,8,0,0,0,80,224h96a8,8,0,0,0,6.07-13.21ZM97.39,208,128,172.29,158.61,208Z";

/** Presentation board / screen frame. */
export const BOARD =
  "M232,64V176a24,24,0,0,1-24,24h-8a8,8,0,0,1,0-16h8a8,8,0,0,0,8-8V64a8,8,0,0,0-8-8H48a8,8,0,0,0-8,8V176a8,8,0,0,0,8,8h8a8,8,0,0,1,0,16H48a24,24,0,0,1-24-24V64A24,24,0,0,1,48,40H208A24,24,0,0,1,232,64Z";

/** Full glyph (stand + board) for static previews. */
export const PRESENTATION = `${STAND}${BOARD}`;

/** Bounding-box centre as a view-box fraction — pivot for whole-icon spins / pops. */
export const PRESENTATION_PIVOT = { x: 0.5, y: 0.52 };

/** Board's own centre — pivot for board-only flips. */
export const BOARD_PIVOT = { x: 0.5, y: 0.469 };

/** Bottom edge of the board as a view-box fraction — origin for a "rise / reveal". */
export const BOARD_BASE = { x: 0.5, y: 0.781 };

/**
 * A right-pointing "play" triangle, built so its centroid lands exactly on the
 * board centre (128, 112). Use inside the board for a play / spin variant.
 */
export const PLAY_TRI = "M112,86L160,112L112,138Z";

/** Centroid of PLAY_TRI as a view-box fraction — pivot to rotate it in place. */
export const PLAY_PIVOT = { x: 0.5, y: 0.4375 };
