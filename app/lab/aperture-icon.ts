/**
 * Phosphor "aperture" glyph — a camera iris: an outer ring, six blades fanned
 * around the centre, and the central hexagonal opening. ViewBox 0 0 256 256,
 * fill="currentColor".
 *
 * IMPORTANT: this must stay a SINGLE path. The blades and the thin gaps between
 * them are formed by fill-rule winding across its subpaths — splitting it into
 * separate <path> elements turns the ring into a solid disc. Its six-fold
 * symmetry means a rotation about the centre reads as a true iris turn.
 */
export const APERTURE =
  "M201.54,54.46A104,104,0,0,0,54.46,201.54,104,104,0,0,0,201.54,54.46ZM190.23,65.78a88.18,88.18,0,0,1,11,13.48L167.55,119,139.63,40.78A87.34,87.34,0,0,1,190.23,65.78ZM155.59,133l-18.16,21.37-27.59-5L100.41,123l18.16-21.37,27.59,5ZM65.77,65.78a87.34,87.34,0,0,1,56.66-25.59l17.51,49L58.3,74.32A88,88,0,0,1,65.77,65.78ZM46.65,161.54a88.41,88.41,0,0,1,2.53-72.62l51.21,9.35ZM65.77,190.22a88.18,88.18,0,0,1-11-13.48L88.45,137l27.92,78.18A87.34,87.34,0,0,1,65.77,190.22Zm124.46,0a87.34,87.34,0,0,1-56.66,25.59l-17.51-49,81.64,14.91A88,88,0,0,1,190.23,190.22Zm-34.62-32.49,53.74-63.27a88.41,88.41,0,0,1-2.53,72.62Z";

/** The six-fold symmetry step (degrees) — one blade maps onto the next. */
export const BLADE_STEP = 60;
