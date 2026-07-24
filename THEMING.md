# Theming

How to rebrand the hub with your own colors and fonts.

## The one file to edit

**[`src/styles/theme.css`](./src/styles/theme.css)** is the single source of truth
for the site's brand: page colors, the accent color, fonts, and the dark-mode
overrides. Edit it to rebrand.

It defines two blocks:

- `:root` - the light (default) theme.
- `:root[data-theme='dark']` - overrides the same tokens for dark mode.

Change a token in `:root` to rebrand light mode; mirror the change in the dark
block if you want dark mode to follow. Structural tokens (spacing, radius,
shadows, transitions) live in [`src/styles/global.css`](./src/styles/global.css)
and rarely need changing.

## What's in `theme.css`

| Token group | Tokens | What they control |
|--------------|--------|-------------------|
| Page surfaces | `--color-bg`, `--color-bg-alt`, `--color-surface`, `--color-border`, `--color-border-light` | Page background, alt sections, cards, borders |
| Dark surfaces | `--color-bg-dark`, `--color-on-dark` | Code blocks, primary buttons, the CTA box (intentionally dark in **both** themes); `--color-on-dark` is the light text on them |
| Text | `--color-text`, `--color-text-secondary`, `--color-text-muted` | Body, secondary, and muted text |
| Accent | `--color-accent`, `--color-accent-hover`, `--color-accent-2`, `--color-accent-3`, `--color-accent-subtle` | The brand color; `accent-2`/`accent-3` are the gradient stops |
| Fonts | `--font-sans`, `--font-mono` | Body and code fonts |

## Common rebrands

**Change the brand color.** Edit `--color-accent` (light) and `--color-accent`
(dark block). Update `--color-accent-hover`, `--color-accent-subtle`, and the
gradient stops `--color-accent-2` / `--color-accent-3` to match.

**Change the page palette.** Edit the `--color-bg*` / `--color-surface` /
`--color-border*` tokens, and the corresponding `--color-text*` so contrast is
preserved.

**Change the fonts.** Edit `--font-sans` / `--font-mono`. The font `<link>` tags
are in [`src/components/Layout.astro`](./src/components/Layout.astro) (`<head>`)
- swap the Google Fonts there too.

**Keep dark mode working.** The dark block must override the **same token names**
as the light block. The toggle (`ThemeToggle.astro`) and the no-FOUC script (in
`Layout.astro` `<head>`) only flip `data-theme` on `<html>` - they don't need to
know your values.

## A note on dark surfaces

`--color-bg-dark` and `--color-on-dark` are for elements that are **dark in both
themes** (code blocks, primary buttons, the CTA box). They are deliberately not
overridden in the dark block - a code block is dark whether you're in light or
dark mode. If you rebrand to a light-on-dark identity, you may not need
`--color-bg-dark` at all; if you keep it, ensure `--color-on-dark` stays
readable against it.

## Beyond tokens

- **Markdown typography** is the single `.prose` class in `global.css`. It uses
  the tokens above, so rebranding tokens cascades into rendered Markdown.
- **Site name, UI strings, and landing copy** are in
  [`src/lib/i18n.ts`](./src/lib/i18n.ts) - replace the sample copy with yours.
- Components already use `var(--color-*)`, so they pick up your token changes
  automatically - no component edits needed.
