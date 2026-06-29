(function (global) {
  "use strict";

  const { hexToHsl, isAchromatic } = global.EABColor.convert;
  const { generateBrandArray } = global.EABColor.brandArray;
  const { generateCategorical } = global.EABColor.sequences;
  const { generateHeatmapRamp } = global.EABColor.heatmap;

  const DEFAULT_CHARACTER = { tonality: 35, energy: 60 };

  function buildPalette(options) {
    const {
      baseHex,
      harmonyType = "double-triadic",
      count = 7,
      tonality = DEFAULT_CHARACTER.tonality,
      energy = DEFAULT_CHARACTER.energy,
      monochrome = false,
    } = options;

    const character = { tonality, energy, monochrome };
    let sliceCharacter =
      harmonyType === "monochromatic"
        ? Object.assign({}, character, { monochrome: false })
        : character;
    const hsl = hexToHsl(baseHex);
    if (!hsl) {
      return { error: "Invalid base color." };
    }

    const adjusted = {
      h: hsl.h,
      s: hsl.s,
      l: hsl.l,
      hex: baseHex,
    };
    const achromatic = isAchromatic(adjusted);

    if (harmonyType === "brand-array") {
      const result = generateBrandArray(baseHex);
      if (result.error) return result;
      return {
        categorical: result.colors,
        heatmap: generateHeatmapRamp(adjusted, count, character),
        adjusted,
        character,
        achromatic,
      };
    }

    const categorical = generateCategorical(adjusted, count, harmonyType, sliceCharacter);

    return {
      categorical,
      heatmap: generateHeatmapRamp(adjusted, count, sliceCharacter),
      adjusted,
      character: sliceCharacter,
      achromatic,
    };
  }

  global.EABColor = global.EABColor || {};
  global.EABColor.engine = { buildPalette, DEFAULT_CHARACTER };
})(typeof window !== "undefined" ? window : globalThis);
