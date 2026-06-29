(function (global) {
  "use strict";

  const { hexToHsl, hslToHex } = global.EABColor.convert;

  function nudgeHue(current, target, amount) {
    let delta = target - current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    return ((current + delta * amount) % 360 + 360) % 360;
  }

  function applyTemperature(baseHex, mode) {
    const hsl = hexToHsl(baseHex);
    if (!hsl) return null;

    let { h, s, l } = hsl;

    switch (mode) {
      case "cool":
        h = Math.round(nudgeHue(h, 200, 0.35));
        s = Math.max(20, Math.round(s * 0.92));
        break;
      case "warm":
        h = Math.round(nudgeHue(h, 35, 0.35));
        s = Math.min(100, Math.round(s * 1.08));
        break;
      case "neutral":
        /* No hue shift; character sliders own S/L */
        break;
      case "heritage":
        /* Legacy alias → neutral (no muddy L-clamp) */
        s = Math.min(100, Math.round(s * 1.05));
        break;
      case "monochrome":
        s = 0;
        break;
      default:
        break;
    }

    return { h, s, l, hex: hslToHex(h, s, l) };
  }

  global.EABColor = global.EABColor || {};
  global.EABColor.temperature = { applyTemperature };
})(typeof window !== "undefined" ? window : globalThis);
