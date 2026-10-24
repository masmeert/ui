# @masmeert/ui

React UI kit on Tailwind v4, Base UI and motion/react. Every component shares one motion system, one size ladder, one elevation ladder and one type scale. The rules are in [DESIGN.md](https://github.com/masmeert/ui/blob/main/DESIGN.md).

Changes per version: [CHANGELOG.md](https://github.com/masmeert/ui/blob/main/packages/ui/CHANGELOG.md) · [Releases](https://github.com/masmeert/ui/releases)

## Install

The package is on GitHub Packages, so point the scope at it in `.npmrc`:

```ini
@masmeert:registry=https://npm.pkg.github.com
```

```sh
pnpm add @masmeert/ui motion @tabler/icons-react
```

## Styles

```css
@import "tailwindcss";
@import "@masmeert/ui/styles.css";
@source "../node_modules/@masmeert/ui/dist";
```

The kit reads your theme's colour tokens (`--background`, `--foreground`, `--popover`, `--muted-foreground`, `--border`, `--primary` and so on) and ships defaults for its own: surfaces, hover tints, motion durations, the type scale and the z-index scale.

## Use

Components import from the package root; hooks and lib keep their folder:

```tsx
import { Button } from "@masmeert/ui/button";
import { SizeProvider } from "@masmeert/ui/lib/size";

<SizeProvider size="compact">
  <Button>Deploy</Button>
</SizeProvider>;
```

## Lint

`@masmeert/ui/eslint-plugin` flags raw text sizes, raw durations, alpha text colours, dimmed icons, uppercase and letter-spacing, and hand-written motion durations. It loads in ESLint and oxlint:

```js
// eslint.config.js
import ui from "@masmeert/ui/eslint-plugin";
export default [ui.configs.recommended];
```

```json
// .oxlintrc.json
{
  "jsPlugins": ["@masmeert/ui/eslint-plugin"],
  "rules": { "masmeert-ui/no-raw-classes": "error", "masmeert-ui/no-raw-motion": "error" }
}
```
