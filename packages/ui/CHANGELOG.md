# Changelog

## [0.3.5](https://github.com/masmeert/ui/compare/ui-v0.3.4...ui-v0.3.5) (2026-10-25)


### Fixed

* **ui:** register SharedLayoutBg rows in DOM order, not through refs ([4976a87](https://github.com/masmeert/ui/commit/4976a878d2bc59f93b0f4933bf92558e425602fb))

## [0.3.4](https://github.com/masmeert/ui/compare/ui-v0.3.3...ui-v0.3.4) (2026-10-25)


### Added

* **sidebar:** Fluid-style floating and inset variants, gliding off-canvas ([f5973e9](https://github.com/masmeert/ui/commit/f5973e9fe97fd2bbcfba664edb52672521b2e5d8))
* **ui:** Fluid-style surface ladder ([c2dbf46](https://github.com/masmeert/ui/commit/c2dbf46727ac638dda7448303753eedf55d39a7d))


### Fixed

* **ui:** measure fluid hover items by layout, not on-screen position ([fec2185](https://github.com/masmeert/ui/commit/fec218542e6ed9314cb4879db4abb9e2cfbc3c98))

## [0.3.3](https://github.com/masmeert/ui/compare/ui-v0.3.2...ui-v0.3.3) (2026-10-24)


### Fixed

* **ui:** keep theme toggle in sync when clicked mid-transition ([8fa8555](https://github.com/masmeert/ui/commit/8fa8555792402f28ec2b77a6ee34cfa7c11288f7))

## [0.3.2](https://github.com/masmeert/ui/compare/ui-v0.3.1...ui-v0.3.2) (2026-10-24)


### Fixed

* **ui:** re-measure fluid hover when rows moved since the last measure ([b0480cf](https://github.com/masmeert/ui/commit/b0480cf79cd202abdf3786f90a39fa47ff4b0b6f))

## [0.3.1](https://github.com/masmeert/ui/compare/ui-v0.3.0...ui-v0.3.1) (2026-10-24)


### Fixed

* **ui:** keep fluid hover out of portaled children ([a863008](https://github.com/masmeert/ui/commit/a863008eb38f917fa29dfa89f7687dc5d936f137))

## [0.3.0](https://github.com/masmeert/ui/compare/ui-v0.2.2...ui-v0.3.0) (2026-10-24)


### ⚠ BREAKING CHANGES

* **ui:** the icon peer dependency is now @tabler/icons-react (>=3.0.0) instead of lucide-react, and CommandItem's `icon` prop expects a Tabler icon component.

### Added

* **ui:** replace lucide-react with Tabler icons ([0d618fd](https://github.com/masmeert/ui/commit/0d618fd56dcd4bd902b2c376aa88ac40bef25aee))

## [0.2.2](https://github.com/masmeert/ui/compare/ui-v0.2.1...ui-v0.2.2) (2026-10-24)


### Fixed

* **ui:** ship a README and the changelog with the package ([621f0df](https://github.com/masmeert/ui/commit/621f0dff731f3b8a2c093ba303a077cc0dc195ec))

## [0.2.1](https://github.com/masmeert/ui/compare/ui-v0.2.0...ui-v0.2.1) (2026-10-24)


### Fixed

* **ui:** keep TextScramble visible under background-clip text ([61d8dad](https://github.com/masmeert/ui/commit/61d8dadbc1e8e6da9da7615b2a75f1a5e8f05188))

## [0.2.0](https://github.com/masmeert/ui/compare/ui-v0.1.1...ui-v0.2.0) (2026-10-24)


### ⚠ BREAKING CHANGES

* **ui:** sizes are compact|default|large everywhere (sm/md/lg removed); default control height is 36px; Input's native size attribute is htmlSize; InputGroupButton sizes are inset|icon-inset; removed DigitSwap duration, ScrollReveal durationSeconds, SharedLayoutBg pillContainerClassName, DirectionProvider dir, the SPRING_* aliases, SPRING_MOUSE, EASE_DRAWER and the shadow-panel token.

### Added

* **ui:** export an eslint/oxlint plugin for the design system ([208d86d](https://github.com/masmeert/ui/commit/208d86dac6fa7bf00be66a05e05c8ff79623b1e7))
* **ui:** shared motion, size, surface and type systems ([b1dfb63](https://github.com/masmeert/ui/commit/b1dfb63b48350d29a7c4bb294c84fcef544f0c28))

## [0.1.1](https://github.com/masmeert/ui/compare/ui-v0.1.0...ui-v0.1.1) (2026-10-23)


### Added

* **ui:** export popover geometry primitives ([f987069](https://github.com/masmeert/ui/commit/f987069abcde9eebed271149f1a50d684b12eaab))

## 0.1.0 (2026-10-23)


### Added

* **ui:** add storybook and fix component gaps ([7848a9f](https://github.com/masmeert/ui/commit/7848a9fd817337ce2b553d27bbe8bdd6180b8c50))
* **ui:** build the component kit ([743dfe8](https://github.com/masmeert/ui/commit/743dfe88547bf1f9982270e8c3d1746ebd9b3415))
