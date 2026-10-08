import localFont from "next/font/local";

// Archivo variable (weight 400–900, width 62–125%), self-hosted and subset to
// Latin so builds never depend on a font CDN.
export const archivo = localFont({
  src: "./fonts/archivo-variable.woff2",
  variable: "--font-archivo",
  weight: "400 900",
  style: "normal",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
  adjustFontFallback: "Arial",
});
