(function (global) {
  "use strict";

  /** Circular order for the color wheel diagram. */
  const HARMONY_ANCHORS = {
    monochromatic: [0],
    analogous: [0, -30, 30],
    complementary: [0, 180],
    "split-complementary": [0, 150, 210],
    triadic: [0, 120, 240],
    tetradic: [0, 90, 180, 270],
    "double-triadic": [0, 60, 120, 180, 240, 300],
    "double-tetradic": [0, 45, 90, 135, 180, 225, 270, 315],
  };

  /**
   * Chart slice order: primary harmony anchors before interleaved “double” offsets.
   */
  const CHART_ANCHOR_PRIORITY = {
    "double-triadic": [0, 120, 240, 60, 180, 300],
    "double-tetradic": [0, 90, 180, 270, 45, 135, 225, 315],
  };

  const HARMONY_META = {
    "brand-array": {
      label: "Brand safe array",
      short: "Ten lightness steps from your input color — Forage 4000 rules: position 0 at 90%, position 5 is input, position 9 at 15% (input lightness 15%–85%).",
      anchorCount: 1,
      wheelMode: "none",
    },
    monochromatic: {
      label: "Monochromatic",
      short: "One hue matching your base — lightness and saturation vary per slice. Not grayscale (use the Grayscale preset for that).",
      anchorCount: 1,
      wheelMode: "mono",
    },
    analogous: {
      label: "Analogous",
      short: "Three hues within about 60° on the wheel — neighbors that feel cohesive.",
      anchorCount: 3,
      wheelMode: "anchors",
    },
    complementary: {
      label: "Complementary",
      short: "Two hues directly opposite on the wheel (180°) — high contrast pairs.",
      anchorCount: 2,
      wheelMode: "anchors",
    },
    "split-complementary": {
      label: "Split complementary",
      short: "Base hue plus the two colors adjacent to its complement — contrast with less tension.",
      anchorCount: 3,
      wheelMode: "anchors",
    },
    triadic: {
      label: "Triadic",
      short: "Three hues equally spaced 120° apart — balanced variety for pie and doughnut charts.",
      anchorCount: 3,
      wheelMode: "anchors",
    },
    tetradic: {
      label: "Tetradic",
      short: "Four hues forming a rectangle on the wheel (90° steps) — rich, diverse palettes.",
      anchorCount: 4,
      wheelMode: "anchors",
    },
    "double-triadic": {
      label: "Double triadic",
      short:
        "Six hues — classic triad first, then the interleaved triad. Charts use primary triadic anchors before secondary offsets.",
      anchorCount: 6,
      wheelMode: "anchors",
    },
    "double-tetradic": {
      label: "Double tetradic",
      short:
        "Eight hues — square tetradic first, then 45° offsets. Charts favor the main tetradic anchors before doubled spacing.",
      anchorCount: 8,
      wheelMode: "anchors",
    },
  };

  function normalizeHue(h) {
    return ((h % 360) + 360) % 360;
  }

  function getAnchorOffsets(harmonyType, mode) {
    if (mode === "chart" && CHART_ANCHOR_PRIORITY[harmonyType]) {
      return CHART_ANCHOR_PRIORITY[harmonyType];
    }
    return HARMONY_ANCHORS[harmonyType] || HARMONY_ANCHORS.triadic;
  }

  function getAnchorHues(harmonyType, baseH) {
    const offsets = getAnchorOffsets(harmonyType, "chart");
    return offsets.map((offset) => normalizeHue(baseH + offset));
  }

  function getWheelAnchorHues(harmonyType, baseH) {
    const offsets = getAnchorOffsets(harmonyType, "wheel");
    return offsets.map((offset) => normalizeHue(baseH + offset));
  }

  function getHarmonyMeta(harmonyType) {
    return HARMONY_META[harmonyType] || HARMONY_META.triadic;
  }

  function getPatternColorCount(harmonyType) {
    if (harmonyType === "brand-array") return 10;
    return getHarmonyMeta(harmonyType).anchorCount;
  }

  global.EABColor = global.EABColor || {};
  global.EABColor.harmonies = {
    HARMONY_ANCHORS,
    CHART_ANCHOR_PRIORITY,
    HARMONY_META,
    getAnchorHues,
    getWheelAnchorHues,
    getHarmonyMeta,
    getPatternColorCount,
    normalizeHue,
  };
})(typeof window !== "undefined" ? window : globalThis);
