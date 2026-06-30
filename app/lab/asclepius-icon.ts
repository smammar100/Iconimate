// Phosphor "asclepius" (regular, 256 grid) — the Rod of Asclepius: a serpent coiled
// around a staff (the medical symbol). The shipped glyph is one path; here we also
// split off the serpent's HEAD (the curl at the bottom-left) from the BODY (staff +
// coil) so the lab variants can choreograph them — the staff rises, then the head
// strikes. Recombined, the parts are pixel-identical to the source.

/** Staff + coiled serpent body (everything except the head curl). */
export const ASCLEPIUS_BODY =
  "M216,79v1a40,40,0,0,1-40,40H136v80h8a16,16,0,0,0,10.67-27.93,8,8,0,0,1,10.66-11.92A32,32,0,0,1,144,216h-8v16a8,8,0,0,1-16,0V216H96a8,8,0,0,1,0-16h24V120H96a16,16,0,0,0,0,32,8,8,0,0,1,0,16,32,32,0,0,1,0-64h24V24a8,8,0,0,1,16,0v80h40a24,24,0,0,0,24-24V79a23,23,0,0,0-23-23H160a8,8,0,0,1,0-16h17a39,39,0,0,1,39,39Z";

/** The serpent's head curl (bottom-left). Two subpaths — outer + the notch — that
 *  render as one shape with the default winding, exactly as in the source. */
export const ASCLEPIUS_HEAD =
  "M56,96H32a8,8,0,0,1-8-8V80A40,40,0,0,1,64,40H96a8,8,0,0,1,0,16A40,40,0,0,1,56,96ZM80,56H64A24,24,0,0,0,40,80H56A24,24,0,0,0,80,56Z";

/** Approx. center of the head curl, in viewBox units — the anchor for its strike. */
export const ASCLEPIUS_HEAD_CENTER = { x: 58, y: 66 };

/** The exact shipped glyph — body + head as a single path. */
export const ASCLEPIUS = ASCLEPIUS_BODY + ASCLEPIUS_HEAD;
