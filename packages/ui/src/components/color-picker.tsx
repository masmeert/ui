import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { motion, useReducedMotion } from "motion/react";
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "cn";
import { FluidHoverHighlight } from "@/components/fluid-hover-highlight";
import { StableLabel } from "@/components/stable-label";
import { useFluidHover, useRegisterFluidHoverItem } from "@/hooks/use-fluid-hover";
import {
  type ColorFormat,
  COLOR_FORMATS,
  clamp,
  colorsEqual,
  formatColor,
  type Hsva,
  hsvToRgb,
  parseColor,
  type Rgba,
  rgbToHsv,
} from "@/lib/color";
import { type Size, useSize } from "@/lib/size";
import { reducedTransition, spring } from "@/lib/springs";
import { SURFACE_OFFSET, SurfaceProvider, useElevation } from "@/lib/surface";
import { capturePointer, releasePointer } from "@/lib/touch";

export type { ColorFormat } from "@/lib/color";

export interface ColorChangeDetails {
  rgba: Rgba;
  hsva: Hsva;
  format: ColorFormat;
}

export interface ColorPickerProps {
  /** Any format `parseColor` reads. */
  value?: string;
  /** Default "#3b82f6". */
  defaultValue?: string;
  /** Called with the colour in the active format. */
  onValueChange?: (value: string, details: ColorChangeDetails) => void;
  format?: ColorFormat;
  /** Default "hex". */
  defaultFormat?: ColorFormat;
  onFormatChange?: (format: ColorFormat) => void;
  /** Show the alpha slider and keep alpha in the value. Default true. */
  alpha?: boolean;
  swatches?: readonly string[];
  disabled?: boolean;
  size?: Size;
  className?: string;
}

const DEFAULT_COLOR = "#3b82f6";

const FORMAT_LABEL: Record<ColorFormat, string> = {
  hex: "Hex",
  rgb: "RGB",
  hsl: "HSL",
  oklch: "OKLCH",
};

// Literal classes so Tailwind's scanner sees them.
const WIDTH: Record<Size, string> = { compact: "w-56", default: "w-64", large: "w-72" };
const AREA_HEIGHT: Record<Size, string> = { compact: "h-32", default: "h-36", large: "h-44" };

const HUE_GRADIENT =
  "linear-gradient(to right in srgb, #f00 0%, #ff0 16.667%, #0f0 33.333%, #0ff 50%, #00f 66.667%, #f0f 83.333%, #f00 100%)";

export const CHECKERBOARD: CSSProperties = {
  backgroundImage: "repeating-conic-gradient(#d9d9d9 0% 25%, #ffffff 0% 50%)",
  backgroundSize: "8px 8px",
};

const THUMB = 16;

function cssRgb({ r, g, b, a }: Rgba, withAlpha = true) {
  return `rgb(${r} ${g} ${b}${withAlpha ? ` / ${a}` : ""})`;
}

function toHsva(input: string | undefined, fallbackHue: number): Hsva | null {
  const rgba = input === undefined ? null : parseColor(input);
  return rgba ? rgbToHsv(rgba, fallbackHue) : null;
}

// State is HSVA so hue survives grey and the thumb doesn't jump on a rounded echo. A controlled
// `value` is re-read only when it differs from the last string emitted.
function useColorState({
  value,
  defaultValue = DEFAULT_COLOR,
  onValueChange,
  format: formatProp,
  defaultFormat = "hex",
  onFormatChange,
  alpha,
}: Pick<
  ColorPickerProps,
  | "value"
  | "defaultValue"
  | "onValueChange"
  | "format"
  | "defaultFormat"
  | "onFormatChange"
  | "alpha"
>) {
  const [hsva, setHsva] = useState<Hsva>(
    () => toHsva(value ?? defaultValue, 0) ?? toHsva(DEFAULT_COLOR, 0)!,
  );
  const [synced, setSynced] = useState(value);
  const [internalFormat, setInternalFormat] = useState<ColorFormat>(defaultFormat);
  const format = formatProp ?? internalFormat;

  let current = hsva;
  if (value !== undefined && value !== synced) {
    const parsed = toHsva(value, hsva.h);
    setSynced(value);
    if (parsed) {
      current = parsed;
      setHsva(parsed);
    }
  }

  const emit = useCallback(
    (next: Hsva, nextFormat: ColorFormat = format) => {
      const clamped: Hsva = {
        h: clamp(next.h, 0, 360),
        s: clamp(next.s),
        v: clamp(next.v),
        a: alpha ? clamp(next.a) : 1,
      };
      const rgba = hsvToRgb(clamped);
      const text = formatColor(rgba, nextFormat, clamped.h);
      setHsva(clamped);
      setSynced(text);
      onValueChange?.(text, { rgba, hsva: clamped, format: nextFormat });
    },
    [alpha, format, onValueChange],
  );

  const setFormat = useCallback(
    (next: ColorFormat) => {
      if (formatProp === undefined) setInternalFormat(next);
      onFormatChange?.(next);
      emit(current, next);
    },
    [current, emit, formatProp, onFormatChange],
  );

  return { hsva: current, rgba: hsvToRgb(current), format, emit, setFormat };
}

export function ColorPicker({
  swatches,
  disabled = false,
  size: sizeProp,
  className,
  alpha = true,
  ...options
}: ColorPickerProps) {
  const size = useSize(sizeProp);
  const state = useColorState({ ...options, alpha });
  const { hsva, rgba, format, emit, setFormat } = state;

  return (
    <div
      data-slot="color-picker"
      data-disabled={disabled ? "" : undefined}
      className={cn(
        "flex flex-col",
        size.size === "compact" ? "gap-2" : "gap-3",
        WIDTH[size.size],
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <ColorArea
        hsva={hsva}
        onChange={emit}
        disabled={disabled}
        className={AREA_HEIGHT[size.size]}
      />
      <div className={cn("flex items-center", size.gap)}>
        <span
          aria-hidden
          className="relative size-8 shrink-0 overflow-clip rounded-full shadow-[inset_0_0_0_1px_var(--border)]"
          style={CHECKERBOARD}
        >
          <span className="absolute inset-0" style={{ background: cssRgb(rgba) }} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <ChannelSlider
            label="Hue"
            value={hsva.h}
            max={360}
            disabled={disabled}
            valueText={`${Math.round(hsva.h)} degrees`}
            track={{ background: HUE_GRADIENT }}
            thumbColor={`hsl(${hsva.h} 100% 50%)`}
            onChange={(h) => emit({ ...hsva, h })}
          />
          {alpha ? (
            <ChannelSlider
              label="Alpha"
              value={Math.round(hsva.a * 100)}
              max={100}
              disabled={disabled}
              valueText={`${Math.round(hsva.a * 100)}%`}
              track={{
                ...CHECKERBOARD,
                backgroundImage: `linear-gradient(to right, ${cssRgb({ ...rgba, a: 0 })}, ${cssRgb(rgba, false)}), ${CHECKERBOARD.backgroundImage}`,
                backgroundSize: `100% 100%, ${CHECKERBOARD.backgroundSize}`,
              }}
              thumbColor={cssRgb(rgba)}
              onChange={(a) => emit({ ...hsva, a: a / 100 })}
            />
          ) : null}
        </div>
      </div>
      <FormatSwitch value={format} onChange={setFormat} disabled={disabled} size={size.size} />
      <ColorField
        hsva={hsva}
        rgba={rgba}
        format={format}
        disabled={disabled}
        size={size.size}
        onChange={emit}
      />
      {swatches && swatches.length > 0 ? (
        <Swatches
          swatches={swatches}
          current={rgba}
          disabled={disabled}
          onSelect={(swatch) => {
            const parsed = parseColor(swatch);
            if (parsed) emit(rgbToHsv(parsed, hsva.h));
          }}
        />
      ) : null}
    </div>
  );
}

function keyStep(
  event: KeyboardEvent,
): { dx: number; dy: number; home?: boolean; end?: boolean } | null {
  const big = event.shiftKey ? 10 : 1;
  switch (event.key) {
    case "ArrowLeft":
      return { dx: -big, dy: 0 };
    case "ArrowRight":
      return { dx: big, dy: 0 };
    case "ArrowUp":
      return { dx: 0, dy: big };
    case "ArrowDown":
      return { dx: 0, dy: -big };
    case "PageUp":
      return { dx: 0, dy: 10 };
    case "PageDown":
      return { dx: 0, dy: -10 };
    case "Home":
      return { dx: 0, dy: 0, home: true };
    case "End":
      return { dx: 0, dy: 0, end: true };
    default:
      return null;
  }
}

/** Reports the pointer as 0–1 fractions of the element, minus `inset` px per side. */
function useDrag(onMove: (x: number, y: number) => void, inset: { x: number; y: number }) {
  const dragging = useRef(false);
  const report = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left - inset.x) / Math.max(1, rect.width - inset.x * 2);
    const y = (event.clientY - rect.top - inset.y) / Math.max(1, rect.height - inset.y * 2);
    onMove(clamp(x), clamp(y));
  };
  return {
    onPointerDown(event: PointerEvent<HTMLElement>) {
      if (event.button !== 0) return;
      // preventDefault stops text selection but also focus, so focus the thumb manually.
      event.preventDefault();
      dragging.current = true;
      capturePointer(event.currentTarget, event.pointerId);
      event.currentTarget
        .querySelector<HTMLElement>("[role=slider]")
        ?.focus({ preventScroll: true });
      report(event);
    },
    onPointerMove(event: PointerEvent<HTMLElement>) {
      if (dragging.current) report(event);
    },
    onPointerUp(event: PointerEvent<HTMLElement>) {
      dragging.current = false;
      releasePointer(event.currentTarget, event.pointerId);
    },
    onPointerCancel() {
      dragging.current = false;
    },
  };
}

const THUMB_CLASS =
  "pointer-events-none absolute size-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.25),0_1px_3px_rgb(0_0_0/0.3)] outline-none transition-[box-shadow] duration-(--duration-fast) focus-visible:shadow-[0_0_0_1px_rgb(0_0_0/0.25),0_0_0_4px_var(--ring)]";

function ColorArea({
  hsva,
  onChange,
  disabled,
  className,
}: {
  hsva: Hsva;
  onChange: (next: Hsva) => void;
  disabled: boolean;
  className?: string;
}) {
  const drag = useDrag((x, y) => onChange({ ...hsva, s: x, v: 1 - y }), { x: 0, y: 0 });

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = keyStep(event);
    if (!step) return;
    event.preventDefault();
    if (step.home) return onChange({ ...hsva, s: 0 });
    if (step.end) return onChange({ ...hsva, s: 1 });
    onChange({ ...hsva, s: clamp(hsva.s + step.dx / 100), v: clamp(hsva.v + step.dy / 100) });
  };

  const s = Math.round(hsva.s * 100);
  const v = Math.round(hsva.v * 100);

  return (
    <div
      data-slot="color-picker-area"
      className={cn("relative w-full touch-none rounded-lg select-none", className)}
      style={{
        background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsva.h} 100% 50%))`,
      }}
      {...drag}
    >
      <div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label="Saturation and brightness"
        aria-roledescription="2D slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={s}
        aria-valuetext={`Saturation ${s}%, brightness ${v}%`}
        aria-disabled={disabled || undefined}
        onKeyDown={handleKeyDown}
        className={cn(THUMB_CLASS, "-translate-x-1/2 -translate-y-1/2")}
        style={{
          left: `${hsva.s * 100}%`,
          top: `${(1 - hsva.v) * 100}%`,
          background: cssRgb(hsvToRgb({ ...hsva, a: 1 })),
        }}
      />
    </div>
  );
}

function ChannelSlider({
  label,
  value,
  max,
  valueText,
  track,
  thumbColor,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  valueText: string;
  track: CSSProperties;
  thumbColor: string;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  const drag = useDrag((x) => onChange(Math.round(x * max)), { x: THUMB / 2, y: 0 });

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = keyStep(event);
    if (!step) return;
    event.preventDefault();
    if (step.home) return onChange(0);
    if (step.end) return onChange(max);
    onChange(clamp(Math.round(value) + step.dx + step.dy, 0, max));
  };

  return (
    <div
      data-slot="color-picker-slider"
      className="relative h-3 w-full touch-none rounded-full select-none"
      style={track}
      {...drag}
    >
      <div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.round(value)}
        aria-valuetext={valueText}
        aria-orientation="horizontal"
        aria-disabled={disabled || undefined}
        onKeyDown={handleKeyDown}
        className={cn(THUMB_CLASS, "top-1/2 -translate-y-1/2")}
        style={{ left: `calc(${value / max} * (100% - ${THUMB}px))`, background: thumbColor }}
      />
    </div>
  );
}

function FormatSwitch({
  value,
  onChange,
  disabled,
  size: step,
}: {
  value: ColorFormat;
  onChange: (format: ColorFormat) => void;
  disabled: boolean;
  size: Size;
}) {
  const size = useSize(step);
  const reduce = useReducedMotion();
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = COLOR_FORMATS.indexOf(value);
    const last = COLOR_FORMATS.length - 1;
    const next =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? index === last
          ? 0
          : index + 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? index === 0
            ? last
            : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    onChange(COLOR_FORMATS[next]!);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="Color format"
      onKeyDown={handleKeyDown}
      className={cn("grid grid-cols-4 rounded-lg bg-hover", size.segmentPad)}
    >
      {COLOR_FORMATS.map((format, index) => {
        const checked = format === value;
        return (
          <button
            key={format}
            ref={(element) => {
              refs.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(format)}
            className={cn(
              "relative grid place-items-center rounded-md outline-none",
              "transition-colors duration-(--duration-fast) focus-visible:ring-2 focus-visible:ring-ring",
              size.segmentItem,
              size.type.caption,
              checked ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {checked ? (
              <motion.span
                layoutId={`${id}-format`}
                aria-hidden
                className="absolute inset-0 rounded-md bg-surface-2 shadow-surface-2"
                transition={reducedTransition(spring.moderate, reduce)}
              />
            ) : null}
            <StableLabel className={cn("relative", checked && "font-semibold")}>
              {FORMAT_LABEL[format]}
            </StableLabel>
          </button>
        );
      })}
    </div>
  );
}

function ColorField({
  hsva,
  rgba,
  format,
  disabled,
  size: step,
  onChange,
}: {
  hsva: Hsva;
  rgba: Rgba;
  format: ColorFormat;
  disabled: boolean;
  size: Size;
  onChange: (next: Hsva) => void;
}) {
  const size = useSize(step);
  const formatted = formatColor(rgba, format, hsva.h);
  // `null` when not editing. While editing, show raw text so applying parses doesn't move the caret.
  const [draft, setDraft] = useState<string | null>(null);
  const atFocus = useRef<Hsva>(hsva);
  const invalid = draft !== null && parseColor(draft) === null;

  return (
    <input
      type="text"
      spellCheck={false}
      autoComplete="off"
      aria-label={`Color value, ${FORMAT_LABEL[format]}`}
      aria-invalid={invalid || undefined}
      disabled={disabled}
      value={draft ?? formatted}
      onFocus={(event) => {
        atFocus.current = hsva;
        event.currentTarget.select();
      }}
      onChange={(event) => {
        const text = event.currentTarget.value;
        setDraft(text);
        const parsed = parseColor(text);
        if (parsed) onChange(rgbToHsv(parsed, hsva.h));
      }}
      onBlur={() => setDraft(null)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          setDraft(null);
        } else if (event.key === "Escape" && draft !== null) {
          // First Escape reverts the edit without closing a surrounding popover.
          event.stopPropagation();
          onChange(atFocus.current);
          setDraft(null);
        }
      }}
      className={cn(
        "w-full min-w-0 rounded-lg border border-input bg-transparent font-mono text-foreground tabular-nums outline-none",
        "transition-colors duration-(--duration-fast) focus:border-ring",
        "aria-invalid:border-destructive",
        size.control,
        size.controlPx,
        size.field,
      )}
    />
  );
}

function Swatches({
  swatches,
  current,
  disabled,
  onSelect,
}: {
  swatches: readonly string[];
  current: Rgba;
  disabled: boolean;
  onSelect: (swatch: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hover = useFluidHover(containerRef, { axis: "xy" });

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label="Swatches"
      className="relative -m-1 flex flex-wrap"
      {...hover.handlers}
    >
      <FluidHoverHighlight hover={hover} className="rounded-md" />
      {swatches.map((swatch, index) => (
        <Swatch
          key={`${swatch}-${index}`}
          index={index}
          swatch={swatch}
          selected={(() => {
            const parsed = parseColor(swatch);
            return parsed !== null && colorsEqual(parsed, current);
          })()}
          disabled={disabled}
          registerItem={hover.registerItem}
          setActiveIndex={hover.setActiveIndex}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function Swatch({
  index,
  swatch,
  selected,
  disabled,
  registerItem,
  setActiveIndex,
  onSelect,
}: {
  index: number;
  swatch: string;
  selected: boolean;
  disabled: boolean;
  registerItem: ReturnType<typeof useFluidHover>["registerItem"];
  setActiveIndex: ReturnType<typeof useFluidHover>["setActiveIndex"];
  onSelect: (swatch: string) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  useRegisterFluidHoverItem(registerItem, index, ref);
  return (
    <button
      ref={ref}
      type="button"
      aria-label={swatch}
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onSelect(swatch)}
      onFocus={(event) => {
        if (event.currentTarget.matches(":focus-visible")) setActiveIndex(index);
      }}
      onBlur={() => setActiveIndex((active) => (active === index ? null : active))}
      className="relative z-10 grid size-7 place-items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        aria-hidden
        className={cn(
          "relative size-5 overflow-clip rounded-full shadow-[inset_0_0_0_1px_var(--border)]",
          selected && "outline-2 outline-offset-1 outline-foreground",
        )}
        style={CHECKERBOARD}
      >
        <span className="absolute inset-0" style={{ background: swatch }} />
      </span>
    </button>
  );
}

export interface ColorPickerPopoverProps extends ColorPickerProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  /** In px. Default 8. */
  sideOffset?: number;
  /** Default true. */
  showValue?: boolean;
  children?: ReactNode;
  /** Used only when the trigger shows no text. Default "Choose color". */
  "aria-label"?: string;
  triggerClassName?: string;
  popupClassName?: string;
}

export function ColorPickerPopover({
  open,
  defaultOpen,
  onOpenChange,
  side = "bottom",
  align = "start",
  sideOffset = 8,
  showValue = true,
  children,
  "aria-label": ariaLabel = "Choose color",
  triggerClassName,
  popupClassName,
  value: valueProp,
  defaultValue = DEFAULT_COLOR,
  onValueChange,
  format: formatProp,
  defaultFormat = "hex",
  onFormatChange,
  size: sizeProp,
  disabled,
  ...pickerProps
}: ColorPickerPopoverProps) {
  const size = useSize(sizeProp);
  const surface = useElevation(SURFACE_OFFSET.popover, { shadowLevel: 4 });
  // The trigger shows the colour too, so state lives here.
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalFormat, setInternalFormat] = useState<ColorFormat>(defaultFormat);
  const value = valueProp ?? internalValue;
  const format = formatProp ?? internalFormat;
  const rgba = parseColor(value);

  return (
    <PopoverPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => onOpenChange?.(next)}
    >
      <PopoverPrimitive.Trigger
        disabled={disabled}
        aria-label={showValue || children ? undefined : ariaLabel}
        data-slot="color-picker-trigger"
        className={cn(
          "inline-flex items-center rounded-lg border border-input bg-transparent text-foreground outline-none",
          "transition-colors duration-(--duration-fast) hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:pointer-events-none disabled:opacity-50 data-popup-open:bg-hover",
          size.control,
          size.gap,
          size.text,
          showValue || children ? "pr-3 pl-2" : cn(size.square, "justify-center"),
          triggerClassName,
        )}
      >
        <span
          aria-hidden
          className="relative shrink-0 overflow-clip rounded-full shadow-[inset_0_0_0_1px_var(--border)]"
          style={{ ...CHECKERBOARD, width: size.icon + 4, height: size.icon + 4 }}
        >
          <span
            className="absolute inset-0"
            style={{ background: rgba ? cssRgb(rgba) : "transparent" }}
          />
        </span>
        {children ?? (showValue ? <span className="font-mono tabular-nums">{value}</span> : null)}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner
          side={side}
          align={align}
          sideOffset={sideOffset}
          className="isolate z-(--z-popup)"
        >
          <PopoverPrimitive.Popup
            data-slot="color-picker-popup"
            className={cn(
              surface.className,
              "origin-(--transform-origin) rounded-xl p-3 outline-none",
              "transition-[opacity,scale] duration-(--duration-moderate) ease-out",
              "data-starting-style:scale-95 data-starting-style:opacity-0",
              "data-ending-style:scale-95 data-ending-style:opacity-0",
              "data-ending-style:duration-(--duration-exit-moderate) data-ending-style:ease-(--ease-exit)",
              "motion-reduce:data-ending-style:scale-100 motion-reduce:data-starting-style:scale-100",
              popupClassName,
            )}
          >
            <SurfaceProvider value={surface.level}>
              <ColorPicker
                {...pickerProps}
                size={size.size}
                disabled={disabled}
                value={value}
                format={format}
                onValueChange={(next, details) => {
                  if (valueProp === undefined) setInternalValue(next);
                  onValueChange?.(next, details);
                }}
                onFormatChange={(next) => {
                  if (formatProp === undefined) setInternalFormat(next);
                  onFormatChange?.(next);
                }}
              />
            </SurfaceProvider>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
