# EAB Color Dashboard

A vanilla HTML/CSS/JS tool for generating systematic color palettes from a base color — built for Nav360 and Edify data visualization standards.

## Features

- **Lightness & saturation sliders** — decoupled from the base hex; harmony picks hues first
- **Color harmonies** — Monochromatic, analogous, complementary, split-complementary, triadic, tetradic, double triadic (6), double tetradic (8) (each assigns hues via round-robin anchors on the wheel)
- **Color wheel panel** — Live SVG diagram showing anchor geometry and a short explanation per harmony
- **Presets** — Safe brand array first, then **Friendly** (default), Cool, Mono, Apple, and more
- **Brand safe array** — 10-color ramp with 15%–95% lightness floor/ceiling (from the [Forage Color Generator](https://codepen.io/dennis-best/pen/xbxYXMR))
- **Chart previews** — Pie, doughnut, horizontal bars, stacked/grouped bars, and heatmap fixtures (one per type)
- **Copy-paste output** — JSON, HEX list, HSL list, or CSS custom properties

## Color model

Palettes are **computed**, not hand-picked from legacy dashboard screenshots.

1. **Base hex** — your brand or key color (default `#0069BF`)
2. **Harmony** — standard wheel math; slices round-robin across anchor hues (analogous ≈ ±30°, triadic ±120°, etc.)
3. **Lightness slider** — sets the lightness range for each categorical slice
4. **Saturation slider** — sets the saturation range for each categorical slice
5. **Heatmap** — separate monochromatic ramp; bounds follow lightness, saturation follows the saturation slider
6. **Presets** — named slider combos; some also nudge hue (Cool/Warm) or force grayscale (Mono, Orson Welles)

Harmony tabs now produce **visibly different** hue sets. Previously a global +154° hue step masked the geometry — that is fixed.

**Brand array** mode uses the fixed CodePen lightness ramp; character sliders are disabled for that harmony.

## Run locally

Open `index.html` in your browser (double-click or drag into a browser window). No install or dev server required.

**Prototype gate:** Enter an email containing `eab.com` to dismiss the access modal for the session.

**Figma capture:** Append `?figma=1` to skip the banner and gate.

## GitHub Pages

Push to `main` to trigger the deploy workflow. Enable Pages with **Source: GitHub Actions** in repository settings.

## Stack

- Vanilla HTML, CSS, JavaScript
- [Gembox](https://www.figma.com/design/IgohaddARKIJHihXX0OE4Z/Gembox-Components) design tokens and layout (Split page)
- DM Sans typography
