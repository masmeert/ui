# Design

The systems every component in `@masmeert/ui` shares, with exact values and the reasons
behind them. If the source and this file disagree, the source wins, and this file should be fixed.

## Motion: `lib/springs.ts`

- There are three tiers and nothing else:
  - `spring.fast`: 0.1s visual, no bounce. Use it for hover highlights, fades, tooltips, focus rings, press feedback and icon swaps.
  - `spring.moderate`: 0.18s, no bounce. It is critically damped, so it lands exactly. Use it for dropdowns, tabs, indicators, short travel, and panels that must settle precisely.
  - `spring.slow`: 0.26s, bounce 0.12. Use it for dialogs, drawers, sheets and large surfaces.
- The bigger the thing that moves, the slower the tier. Never hand-write a duration.
- Exits use `springExit.<tier>`: an ease-in tween with no bounce, shorter than the enter. A dismissal should feel crisp. It should not look like the entrance played backwards.
- `clip-path` and `filter` strings, which a spring can't settle cleanly, use `tierTween.<tier>`: the same timing as an ease-out tween.
- CSS uses the same tiers through `--duration-fast|moderate|slow`, `--duration-exit-*` and `--ease-exit`. Write `duration-(--duration-fast)`, not `duration-150`.
- Reduced motion means fewer animations, not zero. `reducedTransition(t, reduce)` snaps travel, scale and layout, but opacity and colour still fade on `fast`. The global stylesheet does the same for tw-animate-css enter and exit keyframes. Do not write `reduce ? { duration: 0 } : …` for a whole transition: that also kills the fade.
- Animate `transform` and `opacity`. Height is allowed only for folds (`FOLD` in `lib/ease.ts`). A bouncy spring overshoots past zero height, so folds use a tween.
- Never stack two measured-height collapses. When a wrapper's measured height changes because a child collapsed, the wrapper snaps (`INSTANT`) instead of springing.
- `SPRING_GLIDE` (`lib/ease.ts`) is a physics config for `useSpring` followers that track a dragged handle. It is not a tier.

## Fluid hover: `hooks/use-fluid-hover.ts` + `components/fluid-hover-highlight.tsx`

- Each list has one highlight, positioned with a transform on `spring.fast`. It never blinks in the gaps between items.
- How the lit item is picked: an item under the pointer always wins. Otherwise the item with the nearest centre wins, so the padding, the gaps and the space past the last row all still pick an item. The `axis` option is `y` for lists, `x` for strips and `xy` for grids.
- Each pointer entry re-keys the highlight, so it fades in where the pointer is instead of sliding over from its last position. `from` sets where that fade-in starts. A dropdown passes its checked row.
- Gap click: a click between items goes to the lit item, so what is lit is what a click hits. Controls between rows, such as a menu's search field, are left alone.
- The highlight waits for `isMeasured`. It never slides in from a rect that a later measurement corrects.
- Only click targets register. One list per group of alternatives: a divider between different kinds of rows means a new container and a new hook.
- The hook reacts to the mouse only, so a tap never flashes a highlight. Keyboard handlers call `setActiveIndex`. The hook never moves focus.
- Skip fluid hover when a wrong click would hurt, when only some items are clickable, when there is a lot of empty space around the items, or when rows move as you scroll.
- After a transform-driven move (a settled `layout` animation), call `refresh()`: it re-measures without hiding the highlight. `remeasure()` hides it until measured, which is right for a popup that just opened.
- Compound parts that don't know their index (tab triggers, sidebar buttons) register through `useFluidHoverDomItems`, which queries the container in DOM order.
- `SharedLayoutBg` wraps arbitrary children in fluid hover.

## Surfaces: `lib/surface.tsx`

- There are eight levels, each paired with a shadow (`bg-surface-N`, `shadow-surface-N`). The page is level 1.
- A floating surface sits `offset` levels above whatever it opens on: `SURFACE_OFFSET.popover` (2) for dropdowns, popovers and select menus, and `SURFACE_OFFSET.dialog` (4) for dialogs and sheets. The level flows through context, which crosses portals. So a menu inside a dialog lands above the dialog instead of blending into it.
- When you don't own the element, call `useElevation(offset, { shadowLevel })` and wrap the popup's children in `<SurfaceProvider value={level}>`. When you do own it, use `<Elevated offset>`. A fixed `shadowLevel` keeps a dropdown reading as a dropdown however deep it nests.
- In light mode the colour stays the same from level 2 up and the shadow carries the depth. In dark mode each level adds a little white (`--surface-step`).
- Hover and selected states use `bg-hover` and `bg-selected`. These are tints of whatever surface they sit on, so they work at any level. Don't use `bg-muted` or `bg-accent` for hover.
- A surface whose shadow is clipped or drawn elsewhere takes `surfaceBg(level)` alone.
- Stacking uses one z-index scale: `z-(--z-sticky)` 50 for page chrome, `z-(--z-overlay)` 100 for dialogs, sheets, drawers and palettes, `z-(--z-popup)` 200 for menus, popovers and select lists, and `z-(--z-tooltip)` 300. A popup always opens above the dialog it came from.
- For nested rounded corners, `nestedRadius(outer, inset, border)` returns `max(0, outer − inset − border)`.

## Sizes: `lib/size.tsx`

- There are three steps, shared by every control and row:

  | step    | height | text     | icon | gap |
  | ------- | ------ | -------- | ---- | --- |
  | compact | 32px   | caption  | 14px | 4px |
  | default | 36px   | body     | 16px | 8px |
  | large   | 44px   | subtitle | 18px | 8px |

- Every row is padding plus leading: 8+16+8, 8+20+8 and 10+24+10. Rows and triggers share a height, so a popup row lines up with the trigger that opened it.
- Density is decided per region, not per control: wrap the region in `<SizeProvider size="compact">`.
- The size resolves in this order: the component's `size` prop, then the nearest provider, then `"default"`.
- Components read `useSize(props.size)` and use `control`, `row`, `text`, `field`, `icon`, `gap`, `segmentPad` and `segmentItem`. They never hard-code `h-9` or `text-sm` for a control.

## Typography: `lib/type-scale.ts`

- There are six roles. Pick a role by its purpose, then use its size and leading:

  | role     | default | compact |
  | -------- | ------- | ------- |
  | display  | 28/34   | 24/30   |
  | title    | 18/26   | 16/24   |
  | subtitle | 16/24   | 14/20   |
  | body     | 14/20   | 13/18   |
  | caption  | 12/16   | 11/14   |
  | micro    | 10/12   | 10/12   |

  `micro` is only for key caps, counters and tiny badges.

- Use `typeClass(role, variant)` or `useSize().type.role`. Never write `text-[13px]`. To override the leading, put `leading-*` after the role class inside `cn()`.
- Editable fields use `useSize().field` (or add `fieldTouchClass`). iOS zooms into any focused field smaller than 16px.
- Text has two colours: `text-foreground` and `text-muted-foreground` (`text-background` on a dark fill). Red is for errors only. Never use an opacity step such as `text-muted-foreground/60`, including for placeholders.
- No uppercase, no letter-spacing, and no eyebrow labels above titles. Hierarchy comes from size and weight.
- There are three weights: normal, semibold for headings and selected items, and bold for `display` only. A label whose weight changes when it is selected sits in `<StableLabel>`, so its width stays the same.
- `.typeset` styles rendered markdown and chat replies. Space only goes above elements and lines wrap plainly, so text streamed in at the end never moves what is already on screen. `.typeset-compact` steps everything down; `.not-typeset` opts a subtree out.

## Reveal: `styles.css`

- `reveal-landing` is for a page read once. The hero's children rise in on load; later sections rise in with the scroll.
- `reveal-product` is for an app people come back to. Children fade in on load, a step apart, and nothing moves on scroll.
- `reveal-scroll`, `reveal-items` and `reveal-swap` (which hands a skeleton over to its data) handle single blocks. Add `-subtle` to the landing or product class for a quieter version.
- Clip the ancestors of a revealed element with `overflow: clip`, never `hidden`.

## Lint: `@masmeert/ui/eslint-plugin`

One plugin, written against the ESLint API, so it loads in both ESLint and oxlint.

- `masmeert-ui/no-raw-classes` checks every string for raw text sizes, raw durations, alpha text colours, dimmed icons, uppercase or letter-spacing, and `hover:bg-muted`/`accent`.
- `masmeert-ui/no-raw-motion` flags hand-written motion durations (`duration: 0.3`). Loops with `repeat` are exempt.
- A deliberate exception gets `// eslint-disable-next-line masmeert-ui/<rule> -- <reason>`.

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
