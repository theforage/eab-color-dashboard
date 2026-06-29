(function (global) {
  "use strict";

  const { formatHsl } = global.EABColor.convert;

  function formatPaletteOutput(colors, format) {
    const hexList = colors.map((c) => c.hex);

    switch (format) {
      case "hex":
        return hexList.join(", ");
      case "hsl":
        return colors.map((c) => formatHsl(c.hsl)).join(",\n");
      case "css":
        return colors
          .map((c, i) => "  --palette-" + i + ": " + c.hex + ";")
          .join("\n");
      case "json":
      default:
        return JSON.stringify(
          colors.map((c) => ({ hex: c.hex, hsl: c.hsl })),
          null,
          2
        );
    }
  }

  function renderSwatches(container, colors, onCopy) {
    container.innerHTML = "";
    colors.forEach((color, index) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "swatch-chip";
      chip.style.backgroundColor = color.hex;
      chip.setAttribute("aria-label", "Color " + (index + 1) + ": " + color.hex);
      chip.dataset.hex = color.hex;

      const tooltip = document.createElement("span");
      tooltip.className = "swatch-tooltip";
      tooltip.textContent = color.hex + " · " + formatHsl(color.hsl);
      chip.appendChild(tooltip);

      chip.addEventListener("click", function () {
        if (onCopy) onCopy(color.hex);
      });

      container.appendChild(chip);
    });
  }

  function renderChartGrid(charts) {
    const slots = {
      "chart-pie": charts.pie,
      "chart-doughnut": charts.doughnut,
      "chart-horizontal": charts.horizontal,
      "chart-stacked": charts.stacked,
      "chart-grouped": charts.grouped,
      "chart-heatmap-grid": charts.heatmapGrid,
      "chart-heatmap-ramp": charts.heatmapRamp,
    };

    Object.keys(slots).forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.innerHTML = slots[id];
    });
  }

  function showAlert(message, visible) {
    const alert = document.getElementById("palette-alert");
    if (!alert) return;
    if (visible && message) {
      alert.textContent = message;
      alert.hidden = false;
    } else {
      alert.hidden = true;
      alert.textContent = "";
    }
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  function showCopyFeedback(el) {
    if (!el) return;
    const original = el.textContent;
    el.textContent = "Copied!";
    setTimeout(function () {
      el.textContent = original;
    }, 1500);
  }

  global.EABRender = {
    formatPaletteOutput,
    renderSwatches,
    renderChartGrid,
    showAlert,
    copyText,
    showCopyFeedback,
  };
})(typeof window !== "undefined" ? window : globalThis);
