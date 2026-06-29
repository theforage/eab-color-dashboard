(function (global) {
  "use strict";

  const { hexToHsl, hslToHex, isValidBrandInput } = global.EABColor.convert;

  /** Forage Color Generator 4000 — 10-step partner-safe ramp. */
  const LIGHTNESS_MIN = 15;
  const LIGHTNESS_MAX = 90;

  function generateBrandArray(inputHex) {
    const normalized = inputHex.toUpperCase();
    const hsl = hexToHsl(normalized);
    if (!hsl || !isValidBrandInput(normalized)) {
      return {
        error:
          "Starting color lightness must be between 15% and 85% to generate a full brand array (position 0 → 90%, position 5 → input, position 9 → 15%).",
      };
    }

    const { h, s, l } = hsl;
    const lightStep = (LIGHTNESS_MAX - l) / 5;
    const darkStep = (l - LIGHTNESS_MIN) / 4;
    const colors = [];

    for (let i = 0; i <= 9; i++) {
      if (i === 5) {
        colors.push({ index: i, hex: normalized, hsl });
        continue;
      }
      let lightness;
      if (i < 5) {
        lightness = l + lightStep * (5 - i);
      } else {
        lightness = l - darkStep * (i - 5);
      }
      const hex = hslToHex(h, s, lightness);
      colors.push({ index: i, hex, hsl: hexToHsl(hex) });
    }

    return { colors };
  }

  global.EABColor = global.EABColor || {};
  global.EABColor.brandArray = {
    generateBrandArray,
    LIGHTNESS_MIN,
    LIGHTNESS_MAX,
  };
})(typeof window !== "undefined" ? window : globalThis);
