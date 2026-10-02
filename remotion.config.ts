import { Config } from "@remotion/cli/config";

// The promo's own assets (the soundtrack) live beside the film, not in Next's
// public/ — nothing here should ship with the site.
Config.setPublicDir("./remotion/public");
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
