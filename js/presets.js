(function (global) {
  "use strict";

  const PRESETS = {
    "brand-array": {
      id: "brand-array",
      label: "Safe brand array",
      tagline: "10-step partner-safe ramp",
      description:
        "Fixed lightness ladder per Forage Color Generator 4000 — input at position 5, 90% lightest, 15% darkest (input lightness 15%–85%).",
      harmonyType: "brand-array",
      lockHarmony: true,
      tonality: 40,
      energy: 50,
    },
    friendly: {
      id: "friendly",
      label: "Friendly",
      tagline: "Balanced lightness and saturation",
      description: "Approachable defaults — moderate lightness and saturation from your base hue.",
      tonality: 40,
      energy: 50,
    },
    cool: {
      id: "cool",
      label: "Cool",
      tagline: "Slightly restrained saturation",
      description: "Muted saturation with balanced lightness — same hue as your base.",
      tonality: 40,
      energy: 42,
    },
    neutral: {
      id: "neutral",
      label: "Neutral",
      tagline: "Even-handed S and L",
      description: "Balanced lightness and saturation interpretations of your base hue.",
      tonality: 40,
      energy: 50,
    },
    monochrome: {
      id: "monochrome",
      label: "Grayscale",
      tagline: "Zero chroma on any harmony",
      description:
        "Removes saturation across the palette — lightness steps only. Use the Mono harmony tab for same-hue tints instead.",
      tonality: 50,
      energy: 30,
      monochrome: true,
    },
    apple: {
      id: "apple",
      label: "Apple",
      tagline: "Cool, light, restrained",
      description:
        "What would Apple do? Airy surfaces, quiet saturation, and hierarchy through lightness — never rainbow noise.",
      tonality: 22,
      energy: 42,
    },
    "jonny-ive": {
      id: "jonny-ive",
      label: "Jonny Ive",
      tagline: "Radical restraint",
      description:
        "What would Ive do? Even softer than Apple — aluminum clarity, whispers of chroma, obsession with light over hue.",
      tonality: 12,
      energy: 30,
    },
    material: {
      id: "material",
      label: "Material",
      tagline: "Neutral systematic variety",
      description:
        "What would Material do? Balanced lightness, moderate saturation — tokens and roles before personality.",
      tonality: 40,
      energy: 55,
    },
    "shiny-and-happy": {
      id: "shiny-and-happy",
      label: "Shiny and happy",
      tagline: "Warm, bright, energetic",
      description:
        "Friendly product UI — optimistic lightness, enough saturation to feel alive.",
      tonality: 18,
      energy: 82,
    },
    "paul-rand": {
      id: "paul-rand",
      label: "Paul Rand",
      tagline: "Bold primaries, playful discipline",
      description:
        "What would Rand do? Punchy, graphic primaries with confident contrast — color as idea, not decoration.",
      tonality: 42,
      energy: 74,
    },
    "saul-bass": {
      id: "saul-bass",
      label: "Saul Bass",
      tagline: "Poster-cut contrast",
      description:
        "What would Bass do? Saturated blocks and sharp value jumps — title-sequence drama in a data palette.",
      tonality: 52,
      energy: 78,
    },
    cinematic: {
      id: "cinematic",
      label: "Cinematic",
      tagline: "Deep, restrained mids",
      description:
        "Film-grade grading — deep lightness, muted saturation, colors that recede so story leads.",
      tonality: 74,
      energy: 36,
    },
    "wall-street": {
      id: "wall-street",
      label: "Wall Street",
      tagline: "Deep, authoritative",
      description:
        "Boardroom dashboards — grounded darkness, low saturation, trust through restraint.",
      tonality: 78,
      energy: 32,
    },
    "orson-welles": {
      id: "orson-welles",
      label: "Orson Welles",
      tagline: "Noir black brand ramp",
      description:
        "What would Welles do? Noir brand ramp — darkest valid anchor (15% lightness) on the Forage 10-step array.",
      harmonyType: "brand-array",
      lockHarmony: true,
      baseHex: "#262626",
      tonality: 88,
      energy: 22,
    },
    swiftie: {
      id: "swiftie",
      label: "Swiftie",
      tagline: "Pop warmth and sparkle",
      description:
        "Arena-energy warmth, high saturation, playful contrast — glitter without chaos.",
      tonality: 28,
      energy: 88,
    },
  };

  const PRESET_ORDER = [
    "brand-array",
    "friendly",
    "cool",
    "neutral",
    "monochrome",
    "apple",
    "jonny-ive",
    "material",
    "shiny-and-happy",
    "paul-rand",
    "saul-bass",
    "cinematic",
    "wall-street",
    "orson-welles",
    "swiftie",
  ];

  const DEFAULT_PRESET_ID = "friendly";

  function get(id) {
    return PRESETS[id] || PRESETS[DEFAULT_PRESET_ID];
  }

  function list() {
    return PRESET_ORDER.map(function (id) {
      return PRESETS[id];
    });
  }

  global.EABPresets = {
    get,
    list,
    PRESETS,
    DEFAULT_PRESET_ID,
  };
})(typeof window !== "undefined" ? window : globalThis);
