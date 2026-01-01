type PaletteSteps = {
  0: string;
  50: string;
  100: string;
  150: string;
  200: string;
  250: string;
  300: string;
  350: string;
  400: string;
  450: string;
  500: string;
  550: string;
  600: string;
  650: string;
  700: string;
  750: string;
  800: string;
  850: string;
  900: string;
  950: string;
  1000: string;
};

export function generateColorPalette(H: string | number, S: string | number, alpha = false) {
  H = String(H);
  S = String(S);

  const colorSteps = Array.from({ length: 21 }, (_, i) => i * 50);

  const lightnessSteps = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 59, 64, 68, 73, 77, 82, 86, 95, 100];

  const p = colorSteps.reduce((palette, step, index) => {
    const A = alpha ? (lightnessSteps[index] as number) / 100 : 1;
    const L = alpha ? 50 : lightnessSteps[colorSteps.length - 1 - index];
    // @ts-expect-error: step is a number but PaletteSteps keys are specific numbers
    palette[step] = `hsl(${H} ${S}% ${L}% / ${A})`;
    return palette;
  }, {} as PaletteSteps);

  return p;
}
