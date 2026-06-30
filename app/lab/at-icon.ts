// Phosphor "at" (@, regular, 256 grid). The center "a" bowl is a HOLE punched in the
// fill (a 32-radius subpath wound against the rest), not a separate shape — so we keep
// the glyph as one path and animate it whole (transforms + an angular sweep mask)
// rather than splitting parts. Center is (128,128); the outer ring sits at radius ~104.
export const AT =
  "M128,24a104,104,0,0,0,0,208c21.51,0,44.1-6.48,60.43-17.33a8,8,0,0,0-8.86-13.33C166,210.38,146.21,216,128,216a88,88,0,1,1,88-88c0,26.45-10.88,32-20,32s-20-5.55-20-32V88a8,8,0,0,0-16,0v4.26a48,48,0,1,0,5.93,65.1c6,12,16.35,18.64,30.07,18.64,22.54,0,36-17.94,36-48A104.11,104.11,0,0,0,128,24Zm0,136a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z";
