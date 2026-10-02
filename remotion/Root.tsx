import { Composition } from "remotion";
import { Promo, PROMO } from "./Promo";

export function Root() {
  return (
    <Composition
      id="Promo"
      component={Promo}
      durationInFrames={PROMO.fps * PROMO.seconds}
      fps={PROMO.fps}
      width={1920}
      height={1080}
      defaultProps={{ withAudio: true }}
    />
  );
}
