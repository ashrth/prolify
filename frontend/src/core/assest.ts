import { staticFile } from "remotion";

/** A path in /public, or a full URL (media served by the local server). */
export const asset = (src: string) =>
  /^https?:\/\//.test(src) ? src : staticFile(src);
