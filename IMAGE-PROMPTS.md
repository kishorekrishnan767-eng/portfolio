# Image prompts — SIGNAL

Seven optional artwork slots. Generate an image with any tool (Midjourney, DALL·E, Firefly, Figma AI, …), save it in **`public/images/`** under the exact file name below, and rebuild (`npm run build` or restart `npm run dev`). The site finds it automatically. If a file is missing, nothing renders in production; in `npm run dev` you'll see a dashed placeholder showing where it goes.

**How the images are used:** each one is blended with `mix-blend-mode: screen` at low opacity and its edges fade into the background. So **pure black stays invisible and only the glowing parts show.** Prompts that are mostly black, with a few luminous details, work best.

**Format:** `.webp` (preferred) or `.jpg`, about 2400px on the long edge, under 500 KB. Next.js resizes and serves AVIF/WebP automatically.

**Palette to mention if your tool accepts colours:** abyss `#04070D`, navy `#0A1322`, cyan `#3DF5D6`, violet `#8B5CFF`, amber `#FFB547`, leaf `#52F2A0`.

**Every prompt should end with:**
> no text, no letters, no logos, no watermark, no people, deep black background

---

### 1. `hero-abyss.webp`: Hero background (16:9, 2560×1440)
> Cinematic deep-ocean abyss at night, near-total darkness, thousands of tiny bioluminescent plankton particles drifting in soft depth of field, glowing teal-cyan (#3DF5D6) with rare violet (#8B5CFF) sparks, faint light shafts fading from above, volumetric haze, ultra-minimal, lots of negative space on the left third, photographic, 35mm, high dynamic range, no text, no letters, no logos, no watermark, no people, deep black background

### 2. `curiosity-pcb.webp`: "Wired to wonder" background (16:9, 2560×1440)
> Extreme macro photograph of a dark matte-black printed circuit board, shallow depth of field, thin copper traces catching faint teal-cyan (#3DF5D6) edge light, a few tiny surface-mount components and vias glowing softly, most of the frame falling off into pure black, moody, technical, elegant, no text, no letters, no logos, no watermark, no people, deep black background

### 3. `project-sparksense.webp`: SparkSense scene (16:9, 2560×1440)
> Dark industrial interior at night, floating amber (#FFB547) sparks and embers drifting through black space, faint heat shimmer, a single small sensor module silhouette with a tiny glowing amber status LED, cinematic, ominous calm before danger, heavy negative space, photographic, no text, no letters, no logos, no watermark, no people, deep black background

### 4. `project-women-safety-band.webp`: Women Safety Band scene (16:9, 2560×1440)
> Macro shot of a sleek wearable wristband on a dark surface, almost entirely in shadow, soft violet (#8B5CFF) rim light along its edges, a faint cyan (#3DF5D6) ECG-like light trail glowing across the background, calm and protective mood, shallow depth of field, premium product photography, no text, no letters, no logos, no watermark, no people, deep black background

### 5. `project-green-atm.webp`: Green ATM scene (16:9, 2560×1440)
> Clear plastic bottle silhouette dissolving into glowing leaf-green (#52F2A0) particles that form the shape of a leaf, floating in black space, subtle cyan (#3DF5D6) highlights, recycling and renewal concept, elegant, minimal, photographic lighting, heavy negative space, no text, no letters, no logos, no watermark, no people, deep black background

### 6. `now-board.webp`: "The Now" panel texture (16:9, 2400×1350)
> Top-down macro of a small development board (ESP32-style microcontroller) on a black workbench, very low key lighting, a single tiny cyan (#3DF5D6) LED glowing, faint traces and header pins catching soft light, a hint of solder-fume haze, mostly black frame, technical, calm, no text, no letters, no logos, no watermark, no people, deep black background

### 7. `connect-globe.webp`: "Let's connect" background (16:9, 2560×1440)
> Dark Earth seen from orbit at night, only the right side of the globe visible, glowing teal-cyan (#3DF5D6) network arcs linking amber (#FFB547) city lights, India softly lit, floating particles and bokeh, heavy negative space on the left half, cinematic, no text, no letters, no logos, no watermark, no people, deep black background

---

**Tips:**
- If an image comes out too bright, darken it (levels or curves) until the background is true black. Grey backgrounds show up as a haze.
- Keep the subject off-centre and away from where the text sits: the left side in the hero, the right side in the project scenes.
