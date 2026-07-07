export type DotStyle =
  | "square"
  | "rounded"
  | "dots"
  | "extra-rounded"
  | "classy"
  | "classy-rounded";

export type EyeStyle = "square" | "extra-rounded" | "dot";
export type EyeDotStyle = "square" | "dot";

export interface QRSettings {
  fgColor: string;
  fgColor2: string;
  fgGradient: boolean;
  gradientType: "linear" | "radial";
  bgColor: string;
  dotStyle: DotStyle;
  eyeStyle: EyeStyle;
  eyeDotStyle: EyeDotStyle;
  eyeColor: string;
  logo: string | null;
  logoSize: number;
  logoBg: boolean;
  ecl: "L" | "M" | "Q" | "H";
  margin: number;
}

export const defaultSettings: QRSettings = {
  fgColor: "#7c3aed",
  fgColor2: "#ec4899",
  fgGradient: true,
  gradientType: "linear",
  bgColor: "#ffffff",
  dotStyle: "rounded",
  eyeStyle: "extra-rounded",
  eyeDotStyle: "dot",
  eyeColor: "",
  logo: null,
  logoSize: 0.3,
  logoBg: true,
  ecl: "H",
  margin: 8,
};