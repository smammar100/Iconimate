/**
 * Phosphor airplane-taxiing glyph. ViewBox 0 0 256 256, fill="currentColor".
 * Split into the airframe and the two main wheels, so the body can bob and pitch
 * on its oleo struts while the wheels stay planted on the tarmac — the look of a
 * plane trundling along a taxiway. Nose points left; the plane rolls toward it.
 */

/** Full compound path — used for the static source-preview chip. */
export const TAXI =
  "M208,96H147.32L101.66,50.34A8,8,0,0,0,96,48H88A16,16,0,0,0,72.83,69.06l9,26.94H59.32L37.66,74.34A8,8,0,0,0,32,72H24A16,16,0,0,0,8.69,92.6l14.07,46.89A39.75,39.75,0,0,0,61.07,168H240a8,8,0,0,0,8-8V136A40,40,0,0,0,208,96Zm24,56H61.07a23.85,23.85,0,0,1-23-17.1L24,88h4.68l21.66,21.66A8,8,0,0,0,56,112h36.9a8,8,0,0,0,7.59-10.53L88,64h4.68l45.66,45.66A8,8,0,0,0,144,112h64a24,24,0,0,1,24,24Zm-8,48a16,16,0,1,1-16-16A16,16,0,0,1,224,200Zm-96,0a16,16,0,1,1-16-16A16,16,0,0,1,128,200Z";

/** The airframe (everything except the two main wheels). */
export const BODY =
  "M208,96H147.32L101.66,50.34A8,8,0,0,0,96,48H88A16,16,0,0,0,72.83,69.06l9,26.94H59.32L37.66,74.34A8,8,0,0,0,32,72H24A16,16,0,0,0,8.69,92.6l14.07,46.89A39.75,39.75,0,0,0,61.07,168H240a8,8,0,0,0,8-8V136A40,40,0,0,0,208,96Zm24,56H61.07a23.85,23.85,0,0,1-23-17.1L24,88h4.68l21.66,21.66A8,8,0,0,0,56,112h36.9a8,8,0,0,0,7.59-10.53L88,64h4.68l45.66,45.66A8,8,0,0,0,144,112h64a24,24,0,0,1,24,24Z";

/** The two main wheels — they stay planted on the ground. */
export const WHEELS = [
  "M224,200a16,16,0,1,1-16-16A16,16,0,0,1,224,200Z",
  "M128,200a16,16,0,1,1-16-16A16,16,0,0,1,128,200Z",
];

/** Main-gear contact line — pivot for the airframe pitching on its struts. */
export const GEAR_PIVOT = { x: 0.625, y: 0.78 };
