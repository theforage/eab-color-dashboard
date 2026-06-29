(function (global) {
  "use strict";

  const { hslToHex } = global.EABColor.convert;
  const { getWheelAnchorHues, getHarmonyMeta } = global.EABColor.harmonies;

  function hueToPoint(cx, cy, radius, hue) {
    const rad = ((hue - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  }

  function buildSpectrumRing(cx, cy, outerR, innerR) {
    let paths = "";
    for (let h = 0; h < 360; h += 6) {
      const start = hueToPoint(cx, cy, outerR, h);
      const end = hueToPoint(cx, cy, outerR, h + 6);
      const innerStart = hueToPoint(cx, cy, innerR, h);
      const innerEnd = hueToPoint(cx, cy, innerR, h + 6);
      const fill = hslToHex(h, 85, 52);
      paths +=
        '<path d="M' + start.x + " " + start.y +
        " A" + outerR + " " + outerR + " 0 0 1 " + end.x + " " + end.y +
        " L" + innerEnd.x + " " + innerEnd.y +
        " A" + innerR + " " + innerR + " 0 0 0 " + innerStart.x + " " + innerStart.y +
        ' Z" fill="' + fill + '"/>';
    }
    return paths;
  }

  function buildConnectorLines(cx, cy, radius, anchorHues) {
    if (anchorHues.length < 2) return "";
    const points = anchorHues.map(function (h) {
      return hueToPoint(cx, cy, radius, h);
    });
    let d = "M" + points[0].x + " " + points[0].y;
    for (let i = 1; i < points.length; i++) {
      d += " L" + points[i].x + " " + points[i].y;
    }
    if (anchorHues.length > 2) {
      d += " Z";
    }
    return '<path d="' + d + '" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linejoin="round"/>';
  }

  function buildDots(cx, cy, radius, hues, className, size) {
    const r = size || 7;
    return hues
      .map(function (h) {
        const p = hueToPoint(cx, cy, radius, h);
        const fill = hslToHex(h, 75, 48);
        return (
          '<circle class="' + className + '" cx="' + p.x + '" cy="' + p.y +
          '" r="' + r + '" fill="' + fill + '" stroke="#fff" stroke-width="2"/>'
        );
      })
      .join("");
  }

  function render(container, options) {
    if (!container) return;

    const harmonyType = options.harmonyType || "triadic";
    const meta = getHarmonyMeta(harmonyType);
    const baseH = options.baseHsl ? options.baseHsl.h : 212;
    const size = 200;
    const cx = size / 2;
    const cy = size / 2;
    const outerR = 88;
    const innerR = 58;
    const dotR = 72;

    let wheelSvg = "";
    let ariaLabel = meta.label + ". " + meta.short;

    if (meta.wheelMode === "none") {
      container.innerHTML =
        '<div class="color-wheel-panel color-wheel-panel--text-only">' +
        '<h3 class="color-wheel-panel__title">' + meta.label + "</h3>" +
        '<p class="color-wheel-panel__copy">' + meta.short + "</p>" +
        "</div>";
      return;
    }

    const anchorHues =
      meta.wheelMode === "mono"
        ? [baseH]
        : getWheelAnchorHues(harmonyType, baseH);

    wheelSvg =
      '<svg class="color-wheel-panel__svg" viewBox="0 0 ' + size + " " + size +
      '" role="img" aria-label="' + ariaLabel.replace(/"/g, "'") + '">' +
      buildSpectrumRing(cx, cy, outerR, innerR) +
      buildConnectorLines(cx, cy, dotR, anchorHues) +
      buildDots(cx, cy, dotR, anchorHues, "color-wheel-panel__anchor", 8) +
      buildDots(cx, cy, dotR - 18, [baseH], "color-wheel-panel__base", 5) +
      "</svg>";

    container.innerHTML =
      '<div class="color-wheel-panel">' +
      '<div class="color-wheel-panel__wheel">' + wheelSvg + "</div>" +
      '<div class="color-wheel-panel__copy-block">' +
      '<h3 class="color-wheel-panel__title">' + meta.label + "</h3>" +
      '<p class="color-wheel-panel__copy">' + meta.short + "</p>" +
      '<p class="color-wheel-panel__meta">' +
      anchorHues.length + " anchor hue" + (anchorHues.length === 1 ? "" : "s") +
      " · base " + Math.round(baseH) + "°" +
      "</p>" +
      "</div></div>";
  }

  global.EABColorWheel = { render };
})(typeof window !== "undefined" ? window : globalThis);
