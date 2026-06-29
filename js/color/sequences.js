(function (global) {
  "use strict";

  const { getAnchorHues, normalizeHue } = global.EABColor.harmonies;
  const { applyCharacter } = global.EABColor.character;

  const TIER_JITTER = 12;

  function characterIndexForSlice(sliceIndex, count, anchorCount, harmonyType) {
    if (harmonyType === "monochromatic" || anchorCount < 1) {
      return sliceIndex;
    }
    const tier = Math.floor(sliceIndex / anchorCount);
    const heroIndex = count > 1 ? count - 1 : 0;
    if (tier === 0) {
      return heroIndex;
    }
    return Math.min(tier - 1, Math.max(heroIndex - 1, 0));
  }

  function hueForSlice(anchors, index) {
    const anchorIndex = index % anchors.length;
    const tier = Math.floor(index / anchors.length);
    const jitter = tier * TIER_JITTER * (tier % 2 === 0 ? 1 : -1);
    return normalizeHue(anchors[anchorIndex] + jitter);
  }

  function generateSequence(baseHsl, count, harmonyType, character) {
    const anchors = getAnchorHues(harmonyType, baseHsl.h);
    const colors = [];

    for (let i = 0; i < count; i++) {
      const hue = hueForSlice(anchors, i);
      const characterIndex = characterIndexForSlice(i, count, anchors.length, harmonyType);
      const slice = applyCharacter(hue, characterIndex, count, character);
      colors.push({
        index: i,
        characterIndex: characterIndex,
        hex: slice.hex,
        hsl: slice.hsl,
        rank: slice.rank,
        tier: Math.floor(i / anchors.length),
      });
    }

    return colors;
  }

  function generateMonochromatic(baseHsl, count, character) {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const slice = applyCharacter(baseHsl.h, i, count, character);
      colors.push({
        index: i,
        characterIndex: i,
        hex: slice.hex,
        hsl: slice.hsl,
        rank: slice.rank,
      });
    }
    return colors;
  }

  function generateCategorical(baseHsl, count, harmonyType, character) {
    if (harmonyType === "monochromatic") {
      return generateMonochromatic(baseHsl, count, character);
    }
    return generateSequence(baseHsl, count, harmonyType, character);
  }

  function sortByRank(colors) {
    return [...colors].sort((a, b) => (b.rank ?? b.hsl.l) - (a.rank ?? a.hsl.l));
  }

  global.EABColor = global.EABColor || {};
  global.EABColor.sequences = {
    generateCategorical,
    sortByRank,
    hueForSlice,
    characterIndexForSlice,
  };
})(typeof window !== "undefined" ? window : globalThis);
