(function (global) {
  "use strict";

  const { hslToHex, hexToHsl } = global.EABColor.convert;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Map tonality (0=light … 100=deep) and energy (0=soft … 100=vibrant)
   * to per-slice S/L after hue is chosen.
   */
  function applyCharacter(hue, index, count, character) {
    const tonality = character.tonality ?? 50;
    const energy = character.energy ?? 60;
    const monochrome = character.monochrome === true;
    const t = tonality / 100;
    const e = energy / 100;

    const lMin = lerp(58, 32, t);
    const lMax = lerp(78, 48, t);
    const lStep = count > 1 ? (lMax - lMin) / (count - 1) : 0;
    const lightness = clamp(lMax - lStep * index, 15, 95);

    let saturation = 0;
    if (!monochrome) {
      const sMin = lerp(28, 45, e);
      const sMax = lerp(52, 82, e);
      const satT = count > 1 ? index / (count - 1) : 0;
      saturation = clamp(sMin + (sMax - sMin) * satT, 0, 100);
    }

    const hex = hslToHex(hue, saturation, lightness);
    return {
      hex,
      hsl: hexToHsl(hex),
      rank: lightness,
    };
  }

  function describeTonality(value) {
    if (value <= 20) return "Very light";
    if (value <= 40) return "Moderately light";
    if (value <= 60) return "Balanced";
    if (value <= 80) return "Moderately deep";
    return "Very deep";
  }

  function describeEnergy(value) {
    if (value <= 20) return "Very muted";
    if (value <= 40) return "Muted";
    if (value <= 60) return "Moderate";
    if (value <= 80) return "Saturated";
    return "Very vibrant";
  }

  function getHeatmapBounds(tonality, energy) {
    const t = tonality / 100;
    const e = energy / 100;
    const lightBound = lerp(94, 82, t);
    const darkBound = lerp(22, 12, t);
    const saturationScale = lerp(0.85, 1.15, e);
    return { lightBound, darkBound, saturationScale };
  }

  global.EABColor = global.EABColor || {};
  global.EABColor.character = {
    applyCharacter,
    describeTonality,
    describeEnergy,
    getHeatmapBounds,
  };
})(typeof window !== "undefined" ? window : globalThis);
