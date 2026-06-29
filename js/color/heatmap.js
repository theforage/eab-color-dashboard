(function (global) {
  "use strict";

  const { hslToHex, hexToHsl } = global.EABColor.convert;
  const { getHeatmapBounds } = global.EABColor.character;

  function generateHeatmapRamp(baseHsl, steps, character) {
    const count = steps || 10;
    const tonality = character?.tonality ?? 50;
    const energy = character?.energy ?? 60;
    const { lightBound, darkBound, saturationScale } = getHeatmapBounds(tonality, energy);
    const step = count > 1 ? (lightBound - darkBound) / (count - 1) : 0;
    const ramp = [];

    for (let i = 0; i < count; i++) {
      const lightness = lightBound - step * i;
      const saturation = Math.min(100, Math.round(baseHsl.s * saturationScale));
      const hex = hslToHex(baseHsl.h, saturation, lightness);
      ramp.push({
        index: i,
        hex,
        hsl: hexToHsl(hex),
      });
    }

    return ramp;
  }

  global.EABColor = global.EABColor || {};
  global.EABColor.heatmap = { generateHeatmapRamp };
})(typeof window !== "undefined" ? window : globalThis);
