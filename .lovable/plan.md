

## Plan: Polish Light Mode Theme

The current light mode uses plain white backgrounds with minimal visual depth, making it feel flat and unfinished compared to dark mode. The fix is to add subtle warmth, texture, and depth to the light theme through CSS variable adjustments and a few utility class updates.

### Changes

**1. `src/index.css` — Light mode CSS variables**
- Change `--background` from near-white (`210 20% 98%`) to a warm off-white with a slight cream/warm gray tint (`40 20% 97%`)
- Change `--card` from pure white to a slightly warmer white (`40 10% 99%`)
- Change `--muted` to a warmer tone (`40 15% 93%`)
- Add a subtle warm tint to `--border` (`40 10% 88%`) so borders feel softer
- Adjust `--popover` similarly to match card warmth
- Add a subtle body background pattern or gradient using a new utility

**2. `src/index.css` — Add light mode background texture**
- Add a very subtle radial gradient or dot pattern to the `body` in light mode only, giving it visual depth without being distracting (e.g., a faint warm gradient from top-left)

**3. `src/index.css` — Improve `glass-card` for light mode**
- Update the `.glass-card` utility to have a slightly more visible frosted effect in light mode: stronger `backdrop-blur`, a subtle warm `box-shadow`, and a faint border highlight

**4. `src/pages/StudentFeed.tsx` — Header refinement**
- Add a subtle bottom shadow to the sticky header in light mode for better visual separation (via a class tweak on the header element)

### Summary
All changes are CSS-level. No structural or logic changes. The goal is to make light mode feel warm, layered, and polished — matching the civic/professional design language already established in dark mode.

