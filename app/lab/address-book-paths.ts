/**
 * Phosphor "address-book" glyph, split into independently-animatable parts so each
 * prototype variant can move the person, the card frame, or the whole thing.
 * Filled style (render with `fill="currentColor"`, no stroke).
 */

/** The person — head + shoulders (a filled shape with the head as a counter-hole). */
export const PERSON =
  "M83.19,174.4a8,8,0,0,0,11.21-1.6,52,52,0,0,1,83.2,0,8,8,0,1,0,12.8-9.6A67.88,67.88,0,0,0,163,141.51a40,40,0,1,0-53.94,0A67.88,67.88,0,0,0,81.6,163.2,8,8,0,0,0,83.19,174.4ZM112,112a24,24,0,1,1,24,24A24,24,0,0,1,112,112Z";

/** The card frame + the three binder rings on the left spine (outer shape with inner hole). */
export const FRAME =
  "M208,24H64A16,16,0,0,0,48,40V64H32a8,8,0,0,0,0,16H48v40H32a8,8,0,0,0,0,16H48v40H32a8,8,0,0,0,0,16H48v24a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V40A16,16,0,0,0,208,24Zm0,192H64V40H208Z";
