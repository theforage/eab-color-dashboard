(function (global) {
  "use strict";

  function normalizeHex(hex) {
    if (!hex) return null;
    let value = hex.trim();
    if (!value.startsWith("#")) value = "#" + value;
    if (/^#[0-9a-fA-F]{3}$/.test(value)) {
      const r = value[1];
      const g = value[2];
      const b = value[3];
      value = "#" + r + r + g + g + b + b;
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(value)) return null;
    return value.toUpperCase();
  }

  function hexToRgb(hex) {
    const normalized = normalizeHex(hex);
    if (!normalized) return null;
    const bigint = parseInt(normalized.slice(1), 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  }

  function hexToHsl(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    const { r, g, b } = rgb;
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h;
    let s;
    const l = (max + min) / 2;

    if (max === min) {
      h = 0;
      s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm:
          h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
          break;
        case gNorm:
          h = (bNorm - rNorm) / d + 2;
          break;
        default:
          h = (rNorm - gNorm) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  function hslToHex(h, s, l) {
    const lightness = Math.max(0, Math.min(100, l)) / 100;
    const saturation = Math.max(0, Math.min(100, s)) / 100;
    const hue = ((h % 360) + 360) % 360;
    const a = saturation * Math.min(lightness, 1 - lightness);
    const f = (n) => {
      const k = (n + hue / 30) % 12;
      const color = lightness - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return ("#" + f(0) + f(8) + f(4)).toUpperCase();
  }

  function clampLightness(l, min, max) {
    return Math.max(min, Math.min(max, l));
  }

  function isValidBrandInput(hex) {
    const hsl = hexToHsl(hex);
    if (!hsl) return false;
    return hsl.l >= 15 && hsl.l <= 85;
  }

  function isAchromatic(hsl) {
    if (!hsl) return false;
    return hsl.s < 5;
  }

  function formatHsl(hsl) {
    return "hsl(" + hsl.h + ", " + hsl.s + "%, " + hsl.l + "%)";
  }

  global.EABColor = global.EABColor || {};
  global.EABColor.convert = {
    normalizeHex,
    hexToRgb,
    hexToHsl,
    hslToHex,
    clampLightness,
    isValidBrandInput,
    isAchromatic,
    formatHsl,
  };
})(typeof window !== "undefined" ? window : globalThis);
