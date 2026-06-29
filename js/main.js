(function () {
  "use strict";

  const GATE_KEY = "eab-color-dashboard-gate";
  const GATE_SUBSTRING = "eab.com";
  const DEBOUNCE_MS = 150;
  const DEFAULT_BASE_HEX = "#0069BF";
  const DEFAULT_HARMONY_TYPE = "double-triadic";

  const state = {
    baseHex: DEFAULT_BASE_HEX,
    harmonyType: DEFAULT_HARMONY_TYPE,
    tonality: 40,
    energy: 50,
    monochrome: false,
    count: 4,
    outputFormat: "json",
    presetId: "friendly",
    includeBaseColor: false,
  };

  let debounceTimer = null;
  let applyingPreset = false;

  function getControls() {
    return {
      hexInput: document.getElementById("base-hex"),
      colorPicker: document.getElementById("base-color"),
      clearBaseHex: document.getElementById("clear-base-hex"),
      presetPicker: document.getElementById("preset-picker"),
      tonalitySlider: document.getElementById("tonality-slider"),
      energySlider: document.getElementById("energy-slider"),
      tonalityReadout: document.getElementById("tonality-value"),
      energyReadout: document.getElementById("energy-value"),
      characterFields: document.getElementById("character-fields"),
      characterDisabledHint: document.getElementById("character-disabled-hint"),
      colorWheelPanel: document.getElementById("color-wheel-panel"),
      countSelect: document.getElementById("slice-count"),
      includeBaseColor: document.getElementById("include-base-color"),
      formatSelect: document.getElementById("output-format"),
      outputArea: document.getElementById("palette-output"),
      swatchGrid: document.getElementById("swatch-grid"),
      copyBtn: document.getElementById("copy-palette-btn"),
      copyStatus: document.getElementById("copy-status"),
    };
  }

  function readTabs(groupName) {
    const group = document.querySelector('[data-tab-group="' + groupName + '"]');
    if (!group) return null;
    const active = group.querySelector('[aria-selected="true"]');
    return active ? active.dataset.value : null;
  }

  function setTabs(groupName, value) {
    const group = document.querySelector('[data-tab-group="' + groupName + '"]');
    if (!group) return;
    group.querySelectorAll('[role="tab"]').forEach(function (tab) {
      const selected = tab.dataset.value === value;
      tab.setAttribute("aria-selected", selected ? "true" : "false");
      tab.classList.toggle("tabs__tab--active", selected);
    });
  }

  function updateSliderReadouts() {
    const controls = getControls();
    if (controls.tonalityReadout) {
      controls.tonalityReadout.textContent = EABColor.character.describeTonality(state.tonality);
      controls.tonalitySlider.setAttribute("aria-valuetext", controls.tonalityReadout.textContent);
    }
    if (controls.energyReadout) {
      controls.energyReadout.textContent = EABColor.character.describeEnergy(state.energy);
      controls.energySlider.setAttribute("aria-valuetext", controls.energyReadout.textContent);
    }
  }

  function syncPresetSelection(id) {
    const controls = getControls();
    if (!controls.presetPicker) return;
    controls.presetPicker.querySelectorAll(".preset-option").forEach(function (option) {
      const input = option.querySelector('input[type="radio"]');
      const selected = option.dataset.presetId === id;
      if (input) input.checked = selected;
      option.classList.toggle("preset-option--selected", selected);
    });
  }

  function setCharacterControlsEnabled(enabled) {
    const controls = getControls();
    if (controls.tonalitySlider) controls.tonalitySlider.disabled = !enabled;
    if (controls.energySlider) controls.energySlider.disabled = !enabled;
    if (controls.characterFields) {
      controls.characterFields.classList.toggle("field--disabled", !enabled);
    }
    if (controls.characterDisabledHint) {
      controls.characterDisabledHint.hidden = enabled;
    }
  }

  function isHarmonyLocked() {
    const preset = EABPresets.get(state.presetId);
    return preset && preset.lockHarmony === true;
  }

  function setHarmonyControlsEnabled(enabled) {
    const harmonyField = document.getElementById("harmony-field");
    const group = document.querySelector('[data-tab-group="harmony"]');
    if (!group) return;
    group.querySelectorAll('[role="tab"]').forEach(function (tab) {
      tab.disabled = !enabled;
    });
    if (harmonyField) harmonyField.classList.toggle("field--disabled", !enabled);
  }

  function syncHarmonyTabs(harmonyType) {
    const tab = document.querySelector(
      '[data-tab-group="harmony"] [data-value="' + harmonyType + '"]'
    );
    if (tab) setTabs("harmony", harmonyType);
  }

  function clearHarmonyTabs() {
    const group = document.querySelector('[data-tab-group="harmony"]');
    if (!group) return;
    group.querySelectorAll('[role="tab"]').forEach(function (tab) {
      tab.setAttribute("aria-selected", "false");
      tab.classList.remove("tabs__tab--active");
    });
  }

  function applyPreset(id) {
    const preset = EABPresets.get(id);
    if (!preset) return;

    const prevPreset = EABPresets.get(state.presetId);
    applyingPreset = true;
    state.presetId = id;
    state.monochrome = preset.monochrome === true;
    syncPresetSelection(id);

    const controls = getControls();

    if (preset.harmonyType) {
      state.harmonyType = preset.harmonyType;
    } else {
      state.harmonyType = DEFAULT_HARMONY_TYPE;
    }
    if (preset.baseHex) {
      syncHexFromPicker(preset.baseHex);
    } else if (prevPreset && prevPreset.baseHex) {
      syncHexFromPicker(DEFAULT_BASE_HEX);
    }
    if (state.harmonyType === "brand-array") {
      clearHarmonyTabs();
    } else {
      syncHarmonyTabs(state.harmonyType);
    }

    if (typeof preset.tonality === "number" && controls.tonalitySlider) {
      controls.tonalitySlider.value = preset.tonality;
      state.tonality = preset.tonality;
    }
    if (typeof preset.energy === "number" && controls.energySlider) {
      controls.energySlider.value = preset.energy;
      state.energy = preset.energy;
    }

    updateUI();
    applyingPreset = false;
  }

  function resetBaseHex() {
    syncHexFromPicker(DEFAULT_BASE_HEX);
    scheduleUpdate();
  }

  function syncHexFromPicker(hex) {
    const normalized = EABColor.convert.normalizeHex(hex);
    if (!normalized) return;
    state.baseHex = normalized;
    const controls = getControls();
    controls.hexInput.value = normalized;
    controls.colorPicker.value = normalized;
  }

  function readStateFromUI() {
    const controls = getControls();
    if (!isHarmonyLocked()) {
      state.harmonyType = readTabs("harmony") || state.harmonyType;
    }
    state.count = parseInt(controls.countSelect.value, 10) || 4;
    state.outputFormat = controls.formatSelect.value || "json";
    state.tonality = parseInt(controls.tonalitySlider.value, 10);
    state.energy = parseInt(controls.energySlider.value, 10);
    if (controls.includeBaseColor) {
      state.includeBaseColor = controls.includeBaseColor.checked;
    }

    const hex = EABColor.convert.normalizeHex(controls.hexInput.value);
    if (hex) {
      state.baseHex = hex;
      controls.colorPicker.value = hex;
    }

    updateSliderReadouts();
  }

  function buildPaletteFromState(countOverride) {
    const isBrand = state.harmonyType === "brand-array";
    const count =
      typeof countOverride === "number"
        ? countOverride
        : isBrand
          ? 10
          : state.count;
    return EABColor.engine.buildPalette({
      baseHex: state.baseHex,
      harmonyType: state.harmonyType,
      count: count,
      tonality: state.tonality,
      energy: state.energy,
      monochrome: state.monochrome,
    });
  }

  function applyBaseColorOption(palette, includeBase, targetCount, harmonyType) {
    if (!palette.categorical || !palette.adjusted) return palette.categorical;

    const baseHex = palette.adjusted.hex.toLowerCase();
    const buildCount = palette.categorical.length;
    let colors = palette.categorical.slice();
    const isBrand = harmonyType === "brand-array";

    if (includeBase) {
      if (isBrand) {
        colors = colors.filter(function (c) {
          return c.hex.toLowerCase() !== baseHex;
        });
        colors.unshift({
          hex: palette.adjusted.hex,
          hsl: { h: palette.adjusted.h, s: palette.adjusted.s, l: palette.adjusted.l },
          rank: palette.adjusted.l,
          index: 0,
          isBase: true,
        });
      } else if (colors.length > 0) {
        colors[0] = {
          hex: palette.adjusted.hex,
          hsl: { h: palette.adjusted.h, s: palette.adjusted.s, l: palette.adjusted.l },
          rank: palette.adjusted.l,
          index: colors[0].index ?? 0,
          isBase: true,
        };
        colors = colors.filter(function (c, i) {
          if (i === 0) return true;
          return c.hex.toLowerCase() !== baseHex;
        });
      }
    } else if (isBrand) {
      colors = colors.filter(function (c) {
        return c.hex.toLowerCase() !== baseHex;
      });
    } else if (colors.length > 0) {
      const character = palette.character || {};
      const compHue = EABColor.harmonies.normalizeHue(palette.adjusted.h + 180);
      const lead = colors[0];
      const charIndex =
        typeof lead.characterIndex === "number"
          ? lead.characterIndex
          : EABColor.sequences.characterIndexForSlice(
              lead.index ?? 0,
              buildCount,
              EABColor.harmonies.getPatternColorCount(harmonyType),
              harmonyType
            );
      const compSlice = EABColor.character.applyCharacter(
        compHue,
        charIndex,
        buildCount,
        character
      );

      colors[0] = {
        hex: compSlice.hex,
        hsl: compSlice.hsl,
        rank: compSlice.rank,
        index: lead.index ?? 0,
        characterIndex: charIndex,
        isComplement: true,
      };

      colors = colors.filter(function (c, i) {
        if (i === 0) return true;
        return c.hex.toLowerCase() !== baseHex;
      });
    }

    return colors.slice(0, targetCount);
  }

  function updateUI() {
    readStateFromUI();

    const isBrand = state.harmonyType === "brand-array";
    const controls = getControls();
    controls.countSelect.disabled = isBrand;
    const sliceCountField = document.getElementById("slice-count-field");
    if (sliceCountField) sliceCountField.classList.toggle("field--disabled", isBrand);
    setCharacterControlsEnabled(!isBrand);
    setHarmonyControlsEnabled(!isHarmonyLocked());

    const palette = buildPaletteFromState();

    if (palette.error) {
      EABRender.showAlert(palette.error, true);
      return;
    }

    EABRender.showAlert(null, false);

    const isWelles = state.presetId === "orson-welles";
    const includeBaseField = document.querySelector(".field--include-base");
    if (controls.includeBaseColor) {
      controls.includeBaseColor.disabled = isWelles;
      if (isWelles) {
        controls.includeBaseColor.checked = false;
        state.includeBaseColor = false;
      }
    }
    if (includeBaseField) {
      includeBaseField.classList.toggle("field--disabled", isWelles);
    }

    const patternCount = EABColor.harmonies.getPatternColorCount(state.harmonyType);
    const outputPalette = buildPaletteFromState(patternCount);

    const chartCount = isBrand ? 10 : state.count;
    const chartColors = isWelles
      ? palette.categorical.slice(0, chartCount)
      : applyBaseColorOption(
          palette,
          state.includeBaseColor,
          chartCount,
          state.harmonyType
        );
    const outputColors = outputPalette.categorical.slice(0, patternCount);
    const chartPalette = Object.assign({}, palette, { categorical: chartColors });
    if (isWelles) {
      chartPalette.heatmap = chartColors.map(function (c) {
        return { hex: c.hex, hsl: c.hsl };
      });
    }

    EABColorWheel.render(controls.colorWheelPanel, {
      baseHsl: palette.adjusted,
      harmonyType: state.harmonyType,
    });

    EABRender.renderSwatches(controls.swatchGrid, outputColors, function (hex) {
      EABRender.copyText(hex).then(function () {
        EABRender.showCopyFeedback(controls.copyStatus);
      });
    });

    controls.outputArea.value = EABRender.formatPaletteOutput(outputColors, state.outputFormat);

    const charts = EABCharts.renderAllCharts(chartPalette);
    EABRender.renderChartGrid(charts);
  }

  function scheduleUpdate() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(updateUI, DEBOUNCE_MS);
  }

  function initTabs() {
    document.querySelectorAll("[data-tab-group]").forEach(function (group) {
      group.querySelectorAll('[role="tab"]').forEach(function (tab) {
        tab.addEventListener("click", function () {
          if (tab.disabled) return;
          const groupName = group.dataset.tabGroup;
          setTabs(groupName, tab.dataset.value);
          scheduleUpdate();
        });
      });
    });
  }

  function initPresetPicker() {
    const container = document.getElementById("preset-picker");
    if (!container || !globalThis.EABPresets) return;

    EABPresets.list().forEach(function (preset) {
      const option = document.createElement("label");
      option.className = "preset-option";
      option.dataset.presetId = preset.id;

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "palette-preset";
      input.value = preset.id;
      input.checked = preset.id === state.presetId;

      const body = document.createElement("span");
      body.className = "preset-option__body";

      const title = document.createElement("span");
      title.className = "preset-option__title";
      title.textContent = preset.label;

      const tagline = document.createElement("span");
      tagline.className = "preset-option__tagline";
      tagline.textContent = preset.tagline || preset.description || "";

      body.appendChild(title);
      if (tagline.textContent) body.appendChild(tagline);

      option.appendChild(input);
      option.appendChild(body);

      if (preset.description) {
        option.title = preset.description;
      }

      option.classList.toggle("preset-option--selected", preset.id === state.presetId);

      option.addEventListener("click", function () {
        applyPreset(preset.id);
      });

      container.appendChild(option);
    });
  }

  function initControls() {
    const controls = getControls();
    syncHexFromPicker(state.baseHex);
    updateSliderReadouts();

    controls.hexInput.addEventListener("input", scheduleUpdate);
    controls.colorPicker.addEventListener("input", function (e) {
      syncHexFromPicker(e.target.value);
      scheduleUpdate();
    });

    if (controls.clearBaseHex) {
      controls.clearBaseHex.addEventListener("click", resetBaseHex);
    }

    controls.tonalitySlider.addEventListener("input", scheduleUpdate);
    controls.energySlider.addEventListener("input", scheduleUpdate);
    controls.countSelect.addEventListener("change", scheduleUpdate);
    if (controls.includeBaseColor) {
      controls.includeBaseColor.addEventListener("change", scheduleUpdate);
    }
    controls.formatSelect.addEventListener("change", function () {
      readStateFromUI();
      const patternCount = EABColor.harmonies.getPatternColorCount(state.harmonyType);
      const outputPalette = buildPaletteFromState(patternCount);
      if (!outputPalette.error) {
        const outputColors = outputPalette.categorical.slice(
          0,
          patternCount
        );
        controls.outputArea.value = EABRender.formatPaletteOutput(
          outputColors,
          state.outputFormat
        );
      }
    });

    controls.copyBtn.addEventListener("click", function () {
      EABRender.copyText(controls.outputArea.value).then(function () {
        EABRender.showCopyFeedback(controls.copyStatus);
      });
    });
  }

  let gatePassed = false;

  function readGatePassed() {
    if (gatePassed) return true;
    try {
      return sessionStorage.getItem(GATE_KEY) === "1";
    } catch (err) {
      return gatePassed;
    }
  }

  function persistGatePassed() {
    gatePassed = true;
    try {
      sessionStorage.setItem(GATE_KEY, "1");
    } catch (err) {
      /* file:// and some embedded previews block sessionStorage */
    }
  }

  function dismissGate(modal) {
    if (modal) modal.hidden = true;
  }

  function initPrototypeGate() {
    const modal = document.getElementById("prototype-gate");
    const form = document.getElementById("gate-form");
    const emailInput = document.getElementById("gate-email");
    const gateError = document.getElementById("gate-error");
    const params = new URLSearchParams(window.location.search);

    if (params.get("figma") === "1") {
      dismissGate(modal);
      return;
    }

    if (readGatePassed()) {
      dismissGate(modal);
      return;
    }

    if (modal) modal.hidden = false;

    if (form && emailInput) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        const email = (emailInput.value || "").trim().toLowerCase();
        if (email.indexOf(GATE_SUBSTRING) !== -1) {
          emailInput.removeAttribute("aria-invalid");
          if (gateError) gateError.hidden = true;
          persistGatePassed();
          dismissGate(modal);
        } else {
          emailInput.setAttribute("aria-invalid", "true");
          if (gateError) gateError.hidden = false;
          emailInput.focus();
        }
      });
    }
  }

  function init() {
    initPrototypeGate();
    initPresetPicker();
    initTabs();
    initControls();
    const controls = getControls();
    if (controls.countSelect) controls.countSelect.value = String(state.count);
    applyPreset("friendly");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
