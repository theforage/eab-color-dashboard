(function (global) {
  "use strict";

  const STACK_VALUES = [0.35, 0.25, 0.2, 0.12, 0.08];
  const BAR_VALUES = [0.92, 0.78, 0.64, 0.5, 0.38, 0.28, 0.18];
  const GROUP_A = [0.7, 0.55, 0.82, 0.45, 0.6];
  const GROUP_B = [0.5, 0.72, 0.38, 0.68, 0.42];

  function polarToCartesian(cx, cy, r, angleDeg) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(cx, cy, r, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
    return [
      "M", cx, cy,
      "L", start.x, start.y,
      "A", r, r, 0, largeArc, 0, end.x, end.y,
      "Z",
    ].join(" ");
  }

  function describeDonutSlice(cx, cy, outerR, innerR, startAngle, endAngle) {
    const outerStart = polarToCartesian(cx, cy, outerR, endAngle);
    const outerEnd = polarToCartesian(cx, cy, outerR, startAngle);
    const innerStart = polarToCartesian(cx, cy, innerR, startAngle);
    const innerEnd = polarToCartesian(cx, cy, innerR, endAngle);
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
    return [
      "M", outerStart.x, outerStart.y,
      "A", outerR, outerR, 0, largeArc, 0, outerEnd.x, outerEnd.y,
      "L", innerStart.x, innerStart.y,
      "A", innerR, innerR, 0, largeArc, 1, innerEnd.x, innerEnd.y,
      "Z",
    ].join(" ");
  }

  function svgOpen(width, height, label) {
    return (
      '<svg viewBox="0 0 ' + width + " " + height + '" class="chart-svg" role="img" aria-label="' + label + '">'
    );
  }

  function renderPieChart(colors, size, donut) {
    const cx = size / 2;
    const cy = size / 2;
    const outerR = size * 0.42;
    const innerR = donut ? outerR * 0.55 : 0;
    const sliceCount = colors.length;
    const anglePerSlice = 360 / sliceCount;
    let svg = svgOpen(size, size, donut ? "Doughnut chart preview" : "Pie chart preview");

    for (let i = 0; i < sliceCount; i++) {
      const start = i * anglePerSlice;
      const end = start + anglePerSlice;
      const d = donut
        ? describeDonutSlice(cx, cy, outerR, innerR, start, end)
        : describeArc(cx, cy, outerR, start, end);
      svg += '<path d="' + d + '" fill="' + colors[i].hex + '" stroke="#fff" stroke-width="1"/>';
    }

    svg += "</svg>";
    return svg;
  }

  function renderStackedBar(colors, width, height) {
    const barW = width * 0.35;
    const x = (width - barW) / 2;
    let y = height - 8;
    const values = STACK_VALUES.slice(0, Math.min(colors.length, STACK_VALUES.length));
    const total = values.reduce(function (a, b) {
      return a + b;
    }, 0);
    let svg = svgOpen(width, height, "Stacked bar preview");

    for (let i = 0; i < values.length; i++) {
      const h = (values[i] / total) * (height - 16);
      y -= h;
      svg += '<rect x="' + x + '" y="' + y + '" width="' + barW + '" height="' + h + '" fill="' + colors[i].hex + '"/>';
    }

    svg += "</svg>";
    return svg;
  }

  function renderHorizontalBars(colors, width, height) {
    const count = Math.min(colors.length, BAR_VALUES.length);
    const padX = 12;
    const padY = 10;
    const gap = 6;
    const barH = (height - padY * 2 - gap * (count - 1)) / count;
    const maxW = width - padX * 2;
    let svg = svgOpen(width, height, "Horizontal bar chart preview");

    for (let i = 0; i < count; i++) {
      const w = maxW * BAR_VALUES[i];
      const y = padY + i * (barH + gap);
      svg += '<rect x="' + padX + '" y="' + y + '" width="' + w + '" height="' + barH + '" fill="' + colors[i].hex + '"/>';
    }

    svg += "</svg>";
    return svg;
  }

  function renderGroupedBars(colors, width, height) {
    const categories = Math.min(5, colors.length);
    const pad = { x: 14, y: 12, bottom: 10 };
    const plotW = width - pad.x * 2;
    const plotH = height - pad.y - pad.bottom;
    const groupW = plotW / categories;
    const barW = groupW * 0.28;
    const gap = groupW * 0.08;
    let svg = svgOpen(width, height, "Grouped bar chart preview");

    for (let i = 0; i < categories; i++) {
      const gx = pad.x + i * groupW + groupW * 0.5;
      const aH = plotH * GROUP_A[i];
      const bH = plotH * GROUP_B[i];
      const ax = gx - barW - gap / 2;
      const bx = gx + gap / 2;
      const ay = pad.y + plotH - aH;
      const by = pad.y + plotH - bH;
      const colorA = colors[i % colors.length].hex;
      const colorB = colors[(i + 2) % colors.length].hex;
      svg += '<rect x="' + ax + '" y="' + ay + '" width="' + barW + '" height="' + aH + '" fill="' + colorA + '"/>';
      svg += '<rect x="' + bx + '" y="' + by + '" width="' + barW + '" height="' + bH + '" fill="' + colorB + '"/>';
    }

    svg += "</svg>";
    return svg;
  }

  function renderHeatmapBar(heatmapColors, width, height) {
    const gradId = "heatmap-" + Math.random().toString(36).slice(2, 8);
    const barH = height * 0.35;
    const y = (height - barH) / 2;
    const stops = heatmapColors
      .map(function (c, i) {
        const offset = heatmapColors.length > 1 ? (i / (heatmapColors.length - 1)) * 100 : 0;
        return '<stop offset="' + offset + '%" stop-color="' + c.hex + '"/>';
      })
      .join("");

    return (
      svgOpen(width, height, "Heatmap ramp preview") +
      "<defs><linearGradient id=\"" + gradId + "\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"0%\">" +
      stops +
      "</linearGradient></defs>" +
      '<rect x="8" y="' + y + '" width="' + (width - 16) + '" height="' + barH + '" fill="url(#' + gradId + ')" rx="4"/>' +
      "</svg>"
    );
  }

  function renderHeatmapGrid(heatmapColors, width, height) {
    const cols = 10;
    const rows = 4;
    const pad = 10;
    const cellW = (width - pad * 2) / cols;
    const cellH = (height - pad * 2) / rows;
    const ramp = heatmapColors.length ? heatmapColors : [{ hex: "#ccc" }];
    let svg = svgOpen(width, height, "Heatmap grid preview");

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const t = cols > 1 ? c / (cols - 1) : 0;
        const idx = Math.round(t * (ramp.length - 1));
        const x = pad + c * cellW + 1;
        const y = pad + r * cellH + 1;
        svg += '<rect x="' + x + '" y="' + y + '" width="' + (cellW - 2) + '" height="' + (cellH - 2) + '" fill="' + ramp[idx].hex + '" rx="2"/>';
      }
    }

    svg += "</svg>";
    return svg;
  }

  function renderAllCharts(palette) {
    const colors = palette.categorical || [];
    const heatmap = palette.heatmap || [];

    return {
      pie: renderPieChart(colors, 160, false),
      doughnut: renderPieChart(colors, 160, true),
      horizontal: renderHorizontalBars(colors, 160, 140),
      stacked: renderStackedBar(colors, 120, 140),
      grouped: renderGroupedBars(colors, 160, 140),
      heatmapRamp: renderHeatmapBar(heatmap, 280, 56),
      heatmapGrid: renderHeatmapGrid(heatmap, 160, 100),
    };
  }

  global.EABCharts = { renderAllCharts };
})(typeof window !== "undefined" ? window : globalThis);
