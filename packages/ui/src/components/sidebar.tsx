import { IconChevronRight } from "@tabler/icons-react";
import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { FluidHoverHighlight } from "@/components/fluid-hover-highlight";
import { useFluidHover } from "@/hooks/use-fluid-hover";
import { useFluidHoverDomItems } from "@/hooks/use-fluid-hover-dom-items";
import { type Size, useSize } from "@/lib/size";
import { INSTANT, reducedTransition, spring, springExit } from "@/lib/springs";
import { SURFACE_OFFSET, SurfaceProvider, useElevation } from "@/lib/surface";
import { cn } from "cn";

type SidebarState = "expanded" | "collapsed";
type SidebarSide = "left" | "right";
type SidebarVariant = "sidebar" | "floating" | "inset";
type SidebarCollapsible = "offcanvas" | "icon" | "none";

const MOBILE_QUERY = "(max-width: 767px)";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

const PANEL_ENTER_TRANSITION = spring.slow;
const PANEL_EXIT_TRANSITION = springExit.slow;

// Must not bounce: the rail settles against a hard boundary and would snap back on the last frame.
const SIDEBAR_MORPH_TRANSITION = spring.moderate;

const LABEL_ENTER_TRANSITION = { ...spring.moderate, delay: 0.08 };

const LABEL_EXIT_TRANSITION = springExit.fast;

const SUBMENU_VARIANTS: Variants = {
  closed: {
    opacity: 0,
    clipPath: "inset(0 0 100% 0 round 8px)",
    transition: {
      ...springExit.moderate,
      staggerChildren: 0.025,
      staggerDirection: -1,
    },
  },
  open: {
    opacity: 1,
    clipPath: "inset(0 0 0% 0 round 8px)",
    transition: {
      ...spring.moderate,
      delayChildren: 0.035,
      staggerChildren: 0.045,
    },
  },
};

const SUBMENU_ITEM_VARIANTS: Variants = {
  closed: {
    opacity: 0,
    y: -6,
    filter: "blur(3px)",
    transition: springExit.fast,
  },
  open: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: spring.moderate,
  },
};

const STEP_DOWN: Record<Size, Size> = {
  compact: "compact",
  default: "compact",
  large: "default",
};

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function subscribeToMobileQuery(callback: () => void) {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getServerMobileSnapshot() {
  return false;
}

function useIsMobile() {
  return useSyncExternalStore(subscribeToMobileQuery, getMobileSnapshot, getServerMobileSnapshot);
}

interface SidebarToggleOptions {
  instant?: boolean;
}

interface SidebarContextValue {
  instant: boolean;
  isMobile: boolean;
  layoutId: string;
  open: boolean;
  openMobile: boolean;
  reduce: boolean;
  setOpen: (open: boolean, options?: SidebarToggleOptions) => void;
  setOpenMobile: (open: boolean) => void;
  state: SidebarState;
  toggleSidebar: (options?: SidebarToggleOptions) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

interface SidebarPanelContextValue {
  collapsed: boolean;
  collapsible: SidebarCollapsible;
  side: SidebarSide;
  variant: SidebarVariant;
}

const SidebarPanelContext = createContext<SidebarPanelContextValue | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used inside SidebarProvider.");
  }
  return context;
}

function useSidebarPanel() {
  const context = useContext(SidebarPanelContext);
  if (!context) {
    throw new Error("Animated Sidebar parts must be used inside Sidebar.");
  }
  return context;
}

type SidebarProviderStyle = CSSProperties & {
  "--sidebar-width"?: string;
  "--sidebar-width-icon"?: string;
  "--sidebar-width-mobile"?: string;
};

export interface SidebarProviderProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openMobile?: boolean;
  defaultOpenMobile?: boolean;
  onOpenMobileChange?: (open: boolean) => void;
  style?: SidebarProviderStyle;
}

export function SidebarProvider({
  children,
  open,
  defaultOpen = true,
  onOpenChange,
  openMobile,
  defaultOpenMobile = false,
  onOpenMobileChange,
  className,
  style,
  ...props
}: SidebarProviderProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalOpenMobile, setInternalOpenMobile] = useState(defaultOpenMobile);
  const [instant, setInstant] = useState(false);
  const isMobile = useIsMobile();
  const reduce = useReducedMotion() ?? false;
  const generatedId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const desktopOpen = open ?? internalOpen;
  const mobileOpen = openMobile ?? internalOpenMobile;

  const setOpen = useCallback(
    (nextOpen: boolean, options?: SidebarToggleOptions) => {
      setInstant(options?.instant ?? false);
      if (open === undefined) setInternalOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [onOpenChange, open],
  );

  const setOpenMobile = useCallback(
    (nextOpen: boolean) => {
      if (openMobile === undefined) setInternalOpenMobile(nextOpen);
      onOpenMobileChange?.(nextOpen);
    },
    [onOpenMobileChange, openMobile],
  );

  const toggleSidebar = useCallback(
    (options?: SidebarToggleOptions) => {
      if (isMobile) setOpenMobile(!mobileOpen);
      else setOpen(!desktopOpen, options);
    },
    [desktopOpen, isMobile, mobileOpen, setOpen, setOpenMobile],
  );

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar({ instant: true });
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [toggleSidebar]);

  return (
    <SidebarContext.Provider
      value={{
        instant,
        isMobile,
        layoutId: `${generatedId}-active`,
        open: desktopOpen,
        openMobile: mobileOpen,
        reduce,
        setOpen,
        setOpenMobile,
        state: desktopOpen ? "expanded" : "collapsed",
        toggleSidebar,
        triggerRef,
      }}
    >
      <div
        {...props}
        data-slot="sidebar-wrapper"
        data-state={desktopOpen ? "expanded" : "collapsed"}
        style={{
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "4.25rem",
          "--sidebar-width-mobile": "18rem",
          ...style,
        }}
        className={cn("group/sidebar-wrapper flex min-h-svh w-full min-w-0", className)}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

function MobileSidebar({
  ariaLabel,
  children,
  className,
  side,
}: {
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  side: SidebarSide;
}) {
  const context = useSidebar();
  const surface = useElevation(SURFACE_OFFSET.dialog);
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  // Show in the same commit as the slide starts: focus() on a still-hidden panel is ignored.
  // Hide only when the panel's exit completes.
  const [hidden, setHidden] = useState(!context.openMobile);
  // The completion callback also fires for the open slide; a ref gives it current state.
  const openMobileRef = useRef(context.openMobile);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    openMobileRef.current = context.openMobile;
    if (context.openMobile) setHidden(false);
  }, [context.openMobile]);

  useEffect(() => {
    if (!context.openMobile) return;

    const body = document.body;
    const scrollY = window.scrollY;
    const previousBodyStyles = {
      left: body.style.left,
      overflow: body.style.overflow,
      position: body.style.position,
      right: body.style.right,
      top: body.style.top,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.overflow = "hidden";

    const trigger = context.triggerRef.current;
    const focusFrame = requestAnimationFrame(() => {
      const firstFocusable = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (firstFocusable ?? panelRef.current)?.focus({ preventScroll: true });
    });

    return () => {
      cancelAnimationFrame(focusFrame);
      body.style.position = previousBodyStyles.position;
      body.style.top = previousBodyStyles.top;
      body.style.left = previousBodyStyles.left;
      body.style.right = previousBodyStyles.right;
      body.style.overflow = previousBodyStyles.overflow;
      window.scrollTo(0, scrollY);
      trigger?.focus({ preventScroll: true });
    };
  }, [context.openMobile, context.triggerRef]);

  if (!mounted) return null;

  // Zero-size wrapper so no transparent fixed layer spans the viewport edges.
  return createPortal(
    <div
      className={cn(
        "pointer-events-none fixed top-0 left-0 z-(--z-overlay) size-0 md:hidden",
        hidden && !context.openMobile ? "invisible" : "visible",
      )}
    >
      <motion.button
        type="button"
        aria-label="Close sidebar"
        tabIndex={context.openMobile ? 0 : -1}
        initial={false}
        animate={{ opacity: context.openMobile ? 1 : 0 }}
        transition={reducedTransition(
          context.openMobile ? PANEL_ENTER_TRANSITION : PANEL_EXIT_TRANSITION,
          context.reduce,
        )}
        onClick={() => context.setOpenMobile(false)}
        className={cn(
          "fixed inset-0 bg-black/40",
          context.openMobile ? "pointer-events-auto" : "pointer-events-none",
        )}
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-hidden={!context.openMobile}
        inert={!context.openMobile}
        tabIndex={-1}
        data-mobile="true"
        data-state={context.openMobile ? "expanded" : "collapsed"}
        data-side={side}
        initial={false}
        animate={{
          opacity: context.reduce ? (context.openMobile ? 1 : 0) : 1,
          x: context.reduce ? 0 : context.openMobile ? "0%" : side === "left" ? "-100%" : "100%",
        }}
        transition={reducedTransition(
          context.openMobile ? PANEL_ENTER_TRANSITION : PANEL_EXIT_TRANSITION,
          context.reduce,
        )}
        onAnimationComplete={() => {
          if (!openMobileRef.current) setHidden(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            context.setOpenMobile(false);
            return;
          }

          if (event.key !== "Tab") return;
          const focusable = panelRef.current
            ? Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
            : [];

          if (focusable.length === 0) {
            event.preventDefault();
            panelRef.current?.focus();
            return;
          }

          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}
        className={cn(
          "pointer-events-auto fixed inset-y-0 flex h-dvh w-(--sidebar-width-mobile) max-w-[88vw] flex-col overflow-hidden",
          "will-change-transform",
          surface.className,
          side === "left" ? "left-0" : "right-0",
          !context.openMobile && "pointer-events-none",
          className,
        )}
      >
        <SurfaceProvider value={surface.level}>
          <SidebarPanelContext.Provider
            value={{ collapsed: false, collapsible: "none", side, variant: "sidebar" }}
          >
            {children}
          </SidebarPanelContext.Provider>
        </SurfaceProvider>
      </motion.div>
    </div>,
    document.body,
  );
}

export interface SidebarProps extends Omit<HTMLMotionProps<"aside">, "children"> {
  children?: ReactNode;
  side?: SidebarSide;
  variant?: SidebarVariant;
  collapsible?: SidebarCollapsible;
  ariaLabel?: string;
  panelClassName?: string;
}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  {
    side = "left",
    variant = "sidebar",
    collapsible = "icon",
    ariaLabel = "Sidebar",
    children,
    className,
    panelClassName,
    style,
    ...props
  },
  forwardedRef,
) {
  const context = useSidebar();
  const floating = useElevation(1, { shadowLevel: 3 });
  const collapsed = collapsible !== "none" && !context.open;
  const offcanvas = collapsed && collapsible === "offcanvas";
  const width = offcanvas
    ? "0px"
    : collapsed
      ? // The floating card's gutter comes on top, so the icon column stays centred.
        variant === "floating"
        ? "calc(var(--sidebar-width-icon) + 1rem)"
        : "var(--sidebar-width-icon)"
      : "var(--sidebar-width)";

  if (context.isMobile) {
    return (
      <MobileSidebar ariaLabel={ariaLabel} className={className} side={side}>
        {children}
      </MobileSidebar>
    );
  }

  // Off-canvas, the column's width and the panel's slide share one spring, so the panel's edge
  // stays on the column's edge and the content beside it glides instead of jumping.
  const slideTransition =
    context.reduce || context.instant ? INSTANT : context.open ? spring.slow : springExit.slow;

  return (
    <motion.aside
      {...props}
      ref={forwardedRef}
      initial={false}
      aria-label={ariaLabel}
      data-slot="sidebar"
      data-state={collapsed ? "collapsed" : "expanded"}
      data-collapsible={collapsible}
      data-variant={variant}
      data-side={side}
      animate={{ width }}
      transition={
        collapsible === "offcanvas"
          ? slideTransition
          : context.reduce || context.instant
            ? INSTANT
            : SIDEBAR_MORPH_TRANSITION
      }
      style={style}
      className={cn(
        "group/sidebar relative hidden h-auto shrink-0 items-start md:flex",
        "peer",
        // The off-canvas panel keeps its width while the column narrows; it overflows the column's
        // outer side (flex-end overflows the start), and `clip` hides it without breaking sticky.
        side === "right" && "order-last justify-end",
        collapsible === "offcanvas" && "overflow-x-clip",
        className,
      )}
    >
      <motion.div
        initial={false}
        inert={offcanvas}
        animate={{ x: offcanvas ? (side === "left" ? "-100%" : "100%") : "0%" }}
        transition={slideTransition}
        className={cn(
          "sticky top-0 z-10 flex h-svh w-full flex-col overflow-hidden",
          // Inset's card abuts the panel, and its ring sits 1px outside it: a filled panel would
          // paint over the card's left edge.
          variant !== "inset" && "bg-background",
          collapsible === "offcanvas" && "w-[var(--sidebar-width)] shrink-0",
          variant === "sidebar" &&
            (side === "left" ? "border-r border-border" : "border-l border-border"),
          // Floating lifts a card inside a full gutter; inset only needs the vertical gutter, since
          // the content beside it is the card.
          variant === "floating" && "p-2",
          variant === "inset" && "py-2",
          panelClassName,
        )}
      >
        <SidebarPanelContext.Provider value={{ collapsed, collapsible, side, variant }}>
          {variant === "floating" ? (
            <div
              className={cn(
                "flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl",
                floating.className,
              )}
            >
              <SurfaceProvider value={floating.level}>{children}</SurfaceProvider>
            </div>
          ) : (
            children
          )}
        </SidebarPanelContext.Provider>
      </motion.div>
    </motion.aside>
  );
});

export interface SidebarTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const SidebarTrigger = forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  function SidebarTrigger({ className, onClick, type = "button", ...props }, forwardedRef) {
    const context = useSidebar();
    const size = useSize();
    const expanded = context.isMobile ? context.openMobile : context.open;

    return (
      <button
        {...props}
        ref={(node) => {
          context.triggerRef.current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        type={type}
        aria-label={props["aria-label"] ?? "Toggle sidebar"}
        aria-expanded={expanded}
        data-slot="sidebar-trigger"
        data-state={expanded ? "expanded" : "collapsed"}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) context.toggleSidebar({ instant: event.detail === 0 });
        }}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-xl outline-none",
          size.square,
          "focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
      />
    );
  },
);

export interface SidebarCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const SidebarClose = forwardRef<HTMLButtonElement, SidebarCloseProps>(function SidebarClose(
  { className, onClick, type = "button", ...props },
  forwardedRef,
) {
  const context = useSidebar();
  const size = useSize();

  return (
    <button
      {...props}
      ref={forwardedRef}
      type={type}
      aria-label={props["aria-label"] ?? "Close sidebar"}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (context.isMobile) context.setOpenMobile(false);
        else context.setOpen(false);
      }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl outline-none",
        size.square,
        "focus-visible:ring-4 focus-visible:ring-ring",
        className,
      )}
    />
  );
});

export interface SidebarRailProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const SidebarRail = forwardRef<HTMLButtonElement, SidebarRailProps>(function SidebarRail(
  { className, onClick, type = "button", ...props },
  forwardedRef,
) {
  const context = useSidebar();
  const panel = useSidebarPanel();

  return (
    <button
      {...props}
      ref={forwardedRef}
      type={type}
      data-side={panel.side}
      aria-label={props["aria-label"] ?? "Toggle sidebar"}
      title="Toggle sidebar"
      tabIndex={-1}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.toggleSidebar();
      }}
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 outline-none md:block",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-px after:bg-transparent after:transition-colors after:duration-(--duration-fast) hover:after:bg-border",
        "data-[side=left]:left-full data-[side=right]:right-0 data-[side=right]:translate-x-1/2",
        // The floating card sits inside the panel's gutter, so the rail straddles the card's edge.
        panel.variant === "floating" &&
          "data-[side=left]:left-[calc(100%-0.5rem)] data-[side=right]:right-2",
        // Beside a rounded card the hairline runs its straight edge only, fading out at the corners.
        panel.variant !== "sidebar" &&
          "after:inset-y-2 after:[mask-image:linear-gradient(to_bottom,transparent_16px,black_40px,black_calc(100%-40px),transparent_calc(100%-16px))]",
        className,
      )}
    />
  );
});

export interface SidebarInsetProps extends HTMLMotionProps<"main"> {}

export const SidebarInset = forwardRef<HTMLElement, SidebarInsetProps>(function SidebarInset(
  { className, ...props },
  forwardedRef,
) {
  return (
    <motion.main
      {...props}
      ref={forwardedRef}
      data-slot="sidebar-inset"
      className={cn(
        "relative flex min-h-svh min-w-0 flex-1 flex-col bg-background",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:min-h-[calc(100svh-1rem)] md:peer-data-[variant=inset]:rounded-2xl",
        "md:peer-data-[variant=inset]:bg-surface-2 md:peer-data-[variant=inset]:shadow-surface-2",
        "md:peer-data-[variant=inset]:peer-data-[side=left]:ml-0 md:peer-data-[variant=inset]:peer-data-[side=right]:mr-0",
        // With the sidebar gone off-canvas, the card gets its gutter back on that side too.
        "md:peer-data-[variant=inset]:peer-data-[collapsible=offcanvas]:peer-data-[state=collapsed]:peer-data-[side=left]:ml-2",
        "md:peer-data-[variant=inset]:peer-data-[collapsible=offcanvas]:peer-data-[state=collapsed]:peer-data-[side=right]:mr-2",
        "transition-[margin] duration-(--duration-fast)",
        className,
      )}
    />
  );
});

export const SidebarHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SidebarHeader({ className, ...props }, forwardedRef) {
    return (
      <div
        {...props}
        ref={forwardedRef}
        data-slot="sidebar-header"
        className={cn("flex shrink-0 flex-col gap-2 p-3", className)}
      />
    );
  },
);

export const SidebarContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SidebarContent({ className, ...props }, forwardedRef) {
    return (
      <div
        {...props}
        ref={forwardedRef}
        data-slot="sidebar-content"
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-2 overflow-x-hidden overflow-y-auto overscroll-contain px-2 py-2",
          className,
        )}
      />
    );
  },
);

export const SidebarFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SidebarFooter({ className, ...props }, forwardedRef) {
    return (
      <div
        {...props}
        ref={forwardedRef}
        data-slot="sidebar-footer"
        className={cn(
          "flex shrink-0 flex-col gap-2 border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
          className,
        )}
      />
    );
  },
);

export const SidebarGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SidebarGroup({ className, ...props }, forwardedRef) {
    return (
      <div
        {...props}
        ref={forwardedRef}
        data-slot="sidebar-group"
        className={cn("flex w-full min-w-0 flex-col px-1 py-1.5", className)}
      />
    );
  },
);

export const SidebarGroupLabel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SidebarGroupLabel({ children, className, ...props }, forwardedRef) {
    const { collapsed } = useSidebarPanel();
    const size = useSize();

    return (
      <div
        {...props}
        ref={forwardedRef}
        aria-hidden={collapsed}
        data-slot="sidebar-group-label"
        className={cn(
          "mb-1 flex h-7 items-center overflow-hidden px-2 text-muted-foreground transition-opacity duration-(--duration-fast)",
          size.type.caption,
          collapsed ? "opacity-0" : "opacity-100",
          className,
        )}
      >
        {children}
      </div>
    );
  },
);

export const SidebarGroupContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SidebarGroupContent({ className, ...props }, forwardedRef) {
    return (
      <div
        {...props}
        ref={forwardedRef}
        data-slot="sidebar-group-content"
        className={cn("w-full min-w-0", className)}
      />
    );
  },
);

interface SidebarMenuHoverContextValue {
  /** Call once a row's layout animation settles; transforms don't trigger a resize. */
  refresh: () => void;
}

const SidebarMenuHoverContext = createContext<SidebarMenuHoverContextValue | null>(null);

const SUB_MENU_SELECTOR = '[data-slot="sidebar-menu-sub"]';

function isInSubMenu(target: EventTarget | null) {
  return target instanceof Element && target.closest(SUB_MENU_SELECTOR) !== null;
}

/** A nested `SidebarMenuSub` has its own highlight, so this list releases its own while over one. */
export const SidebarMenu = forwardRef<HTMLUListElement, HTMLAttributes<HTMLUListElement>>(
  function SidebarMenu(
    { children, className, onPointerEnter, onPointerMove, onPointerLeave, onClick, ...props },
    forwardedRef,
  ) {
    const listRef = useRef<HTMLUListElement>(null);
    useImperativeHandle(forwardedRef, () => listRef.current as HTMLUListElement);
    const hover = useFluidHover(listRef);
    const items = useFluidHoverDomItems(
      hover,
      listRef,
      ':scope > li > [data-slot="sidebar-menu-button"]',
    );
    const inSubMenu = useRef(false);

    return (
      <SidebarMenuHoverContext.Provider value={{ refresh: items.refresh }}>
        <ul
          {...props}
          ref={listRef}
          data-slot="sidebar-menu"
          className={cn("relative flex w-full min-w-0 list-none flex-col gap-0.5", className)}
          onPointerEnter={(event) => {
            onPointerEnter?.(event);
            inSubMenu.current = isInSubMenu(event.target);
            if (!inSubMenu.current) hover.handlers.onPointerEnter(event);
          }}
          onPointerMove={(event) => {
            onPointerMove?.(event);
            const inSub = isInSubMenu(event.target);
            if (inSub) {
              if (!inSubMenu.current) hover.setActiveIndex(null);
              inSubMenu.current = true;
              return;
            }
            if (inSubMenu.current) {
              // Back from a submenu: treat as a fresh entry so it fades in instead of sliding.
              inSubMenu.current = false;
              hover.handlers.onPointerEnter(event);
              return;
            }
            hover.handlers.onPointerMove(event);
          }}
          onPointerLeave={(event) => {
            onPointerLeave?.(event);
            inSubMenu.current = false;
            hover.handlers.onPointerLeave(event);
          }}
          onClick={(event) => {
            onClick?.(event);
            // A submenu's gaps belong to the submenu's own list.
            if (!isInSubMenu(event.target)) hover.handlers.onClick(event);
          }}
        >
          {/* No `from`: a fresh entry fades in on the row it lands on, never slides in from the current
              page's row (coming back up from a submenu included). */}
          <FluidHoverHighlight hover={hover} className="rounded-xl" />
          {children}
        </ul>
      </SidebarMenuHoverContext.Provider>
    );
  },
);

export const SidebarMenuItem = forwardRef<HTMLLIElement, HTMLMotionProps<"li">>(
  function SidebarMenuItem({ className, onLayoutAnimationComplete, ...props }, forwardedRef) {
    const menu = useContext(SidebarMenuHoverContext);
    return (
      <motion.li
        {...props}
        ref={forwardedRef}
        layout="position"
        transition={spring.moderate}
        onLayoutAnimationComplete={() => {
          onLayoutAnimationComplete?.();
          menu?.refresh();
        }}
        data-slot="sidebar-menu-item"
        className={cn("relative", className)}
      />
    );
  },
);

export interface SidebarMenuSubProps extends Omit<HTMLMotionProps<"ul">, "children"> {
  open: boolean;
  children?: ReactNode;
}

export const SidebarMenuSub = forwardRef<HTMLUListElement, SidebarMenuSubProps>(
  function SidebarMenuSub({ open, ...props }, forwardedRef) {
    const panel = useSidebarPanel();

    return (
      <AnimatePresence initial={false} mode="popLayout">
        {open && !panel.collapsed ? (
          <SidebarMenuSubList key="sidebar-submenu" {...props} ref={forwardedRef} />
        ) : null}
      </AnimatePresence>
    );
  },
);

// Separate component so the fluid hover hook mounts with the list it observes.
const SidebarMenuSubList = forwardRef<HTMLUListElement, Omit<SidebarMenuSubProps, "open">>(
  function SidebarMenuSubList(
    {
      children,
      className,
      onAnimationComplete,
      onPointerEnter,
      onPointerMove,
      onPointerLeave,
      onClick,
      ...props
    },
    forwardedRef,
  ) {
    const context = useSidebar();
    const listRef = useRef<HTMLUListElement>(null);
    useImperativeHandle(forwardedRef, () => listRef.current as HTMLUListElement);
    const hover = useFluidHover(listRef);
    const items = useFluidHoverDomItems(
      hover,
      listRef,
      ':scope > li > [data-slot="sidebar-menu-sub-button"]',
    );

    return (
      <motion.ul
        {...props}
        ref={listRef}
        variants={context.reduce ? undefined : SUBMENU_VARIANTS}
        initial={context.reduce ? false : "closed"}
        animate={context.reduce ? { opacity: 1 } : "open"}
        exit={context.reduce ? { opacity: 0 } : "closed"}
        transition={context.reduce ? spring.fast : undefined}
        // Rows rise in on a transform ResizeObserver can't see.
        onAnimationComplete={(definition) => {
          onAnimationComplete?.(definition);
          items.refresh();
        }}
        onPointerEnter={(event) => {
          onPointerEnter?.(event);
          hover.handlers.onPointerEnter(event);
        }}
        onPointerMove={(event) => {
          onPointerMove?.(event);
          hover.handlers.onPointerMove(event);
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
          hover.handlers.onPointerLeave(event);
        }}
        onClick={(event) => {
          onClick?.(event);
          hover.handlers.onClick(event);
        }}
        data-slot="sidebar-menu-sub"
        className={cn(
          "relative mt-1 ml-5 flex min-w-0 flex-col gap-0.5 border-l border-border pl-3",
          className,
        )}
      >
        <FluidHoverHighlight hover={hover} className="rounded-lg" />
        {children}
      </motion.ul>
    );
  },
);

export const SidebarMenuSubItem = forwardRef<HTMLLIElement, HTMLMotionProps<"li">>(
  function SidebarMenuSubItem({ className, ...props }, forwardedRef) {
    return (
      <motion.li
        {...props}
        ref={forwardedRef}
        variants={SUBMENU_ITEM_VARIANTS}
        data-slot="sidebar-menu-sub-item"
        className={cn("relative min-w-0", className)}
      />
    );
  },
);

export interface SidebarMenuSubButtonProps {
  children: ReactNode;
  icon?: ReactNode;
  href?: string;
  isActive?: boolean;
  disabled?: boolean;
  closeOnSelect?: boolean;
  target?: "_blank" | "_self" | "_parent" | "_top";
  rel?: string;
  onSelect?: () => void;
  className?: string;
  /** Defaults to one step below the surrounding `SizeProvider`. */
  size?: Size;
}

export function SidebarMenuSubButton({
  children,
  icon,
  href,
  isActive = false,
  disabled = false,
  closeOnSelect = true,
  target,
  rel,
  onSelect,
  className,
  size: sizeProp,
}: SidebarMenuSubButtonProps) {
  const context = useSidebar();
  const surrounding = useSize();
  const size = useSize(sizeProp ?? STEP_DOWN[surrounding.size]);

  const select = (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onSelect?.();
    if (context.isMobile && closeOnSelect) context.setOpenMobile(false);
  };

  const content = (
    <>
      <span aria-hidden="true" className="grid size-4 shrink-0 place-items-center">
        {icon ?? <span className="size-1 rounded-full bg-current" />}
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </>
  );

  const interactiveClassName = cn(
    "flex w-full min-w-0 items-center gap-2 rounded-lg text-left outline-none",
    size.row,
    "px-2 py-0",
    size.text,
    "text-muted-foreground transition-colors duration-(--duration-fast) hover:text-foreground",
    "focus-visible:bg-hover focus-visible:ring-4 focus-visible:ring-ring",
    isActive && "bg-selected text-foreground",
    disabled && "cursor-not-allowed opacity-40",
    className,
  );

  return href ? (
    <motion.a
      href={href}
      target={target}
      rel={rel ?? (target === "_blank" ? "noreferrer noopener" : undefined)}
      aria-current={isActive ? "page" : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      onClick={select}
      whileTap={context.reduce || disabled ? undefined : { scale: 0.98 }}
      transition={spring.fast}
      data-slot="sidebar-menu-sub-button"
      className={interactiveClassName}
    >
      {content}
    </motion.a>
  ) : (
    <motion.button
      type="button"
      disabled={disabled}
      aria-current={isActive ? "page" : undefined}
      data-slot="sidebar-menu-sub-button"
      onClick={select}
      whileTap={context.reduce || disabled ? undefined : { scale: 0.98 }}
      transition={spring.fast}
      className={interactiveClassName}
    >
      {content}
    </motion.button>
  );
}

export interface SidebarMenuButtonProps {
  children: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  href?: string;
  isActive?: boolean;
  ariaExpanded?: boolean;
  disabled?: boolean;
  closeOnSelect?: boolean;
  target?: "_blank" | "_self" | "_parent" | "_top";
  rel?: string;
  onSelect?: () => void;
  className?: string;
  size?: Size;
}

export function SidebarMenuButton({
  children,
  icon,
  badge,
  href,
  isActive = false,
  ariaExpanded,
  disabled = false,
  closeOnSelect,
  target,
  rel,
  onSelect,
  className,
  size: sizeProp,
}: SidebarMenuButtonProps) {
  const context = useSidebar();
  const panel = useSidebarPanel();
  const size = useSize(sizeProp);
  const textLabel = typeof children === "string" ? children : undefined;

  const select = (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onSelect?.();
    const shouldCloseOnSelect = closeOnSelect ?? ariaExpanded === undefined;
    if (context.isMobile && shouldCloseOnSelect) {
      context.setOpenMobile(false);
    }
    // A submenu can't render in the icon rail, so opening one there unfolds the panel.
    if (ariaExpanded !== undefined && panel.collapsed && !context.isMobile) {
      context.setOpen(true);
    }
  };

  const content = (
    <>
      {isActive ? (
        <motion.span
          layoutId={context.layoutId}
          transition={reducedTransition(spring.moderate, context.reduce)}
          className="absolute inset-0 rounded-xl bg-selected"
        />
      ) : null}
      {icon ? (
        <span aria-hidden="true" className="relative z-10 grid size-5 shrink-0 place-items-center">
          {icon}
        </span>
      ) : null}
      <motion.span
        initial={false}
        animate={{
          opacity: panel.collapsed ? 0 : 1,
          x: panel.collapsed ? -4 : 0,
        }}
        transition={
          context.instant
            ? INSTANT
            : reducedTransition(
                panel.collapsed ? LABEL_EXIT_TRANSITION : LABEL_ENTER_TRANSITION,
                context.reduce,
              )
        }
        aria-hidden={panel.collapsed}
        className={cn(
          "relative z-10 min-w-0 flex-1 truncate",
          panel.collapsed && "pointer-events-none",
        )}
      >
        {children}
      </motion.span>
      {badge && !panel.collapsed ? (
        <span className={cn("relative z-10 shrink-0 text-muted-foreground", size.type.caption)}>
          {badge}
        </span>
      ) : null}
      {ariaExpanded !== undefined ? (
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={{
            opacity: panel.collapsed ? 0 : 1,
            rotate: ariaExpanded ? 90 : 0,
            x: panel.collapsed ? 4 : 0,
          }}
          transition={reducedTransition(spring.moderate, context.reduce)}
          className="relative z-10 grid size-4 shrink-0 place-items-center text-muted-foreground"
        >
          <IconChevronRight className="size-3.5" />
        </motion.span>
      ) : null}
    </>
  );

  const interactiveClassName = cn(
    "relative flex w-full min-w-0 items-center gap-2.5 overflow-hidden rounded-xl text-left font-medium outline-none",
    size.row,
    // Centres the 20px icon in the 44px collapsed rail.
    "px-3 py-0",
    size.text,
    "text-muted-foreground transition-colors duration-(--duration-fast) hover:text-foreground",
    "focus-visible:bg-hover focus-visible:ring-4 focus-visible:ring-ring",
    isActive && "text-foreground",
    disabled && "cursor-not-allowed opacity-40",
    className,
  );

  return href ? (
    <motion.a
      href={href}
      target={target}
      rel={rel ?? (target === "_blank" ? "noreferrer noopener" : undefined)}
      aria-current={isActive ? "page" : undefined}
      aria-expanded={ariaExpanded}
      aria-disabled={disabled || undefined}
      aria-label={panel.collapsed ? textLabel : undefined}
      title={panel.collapsed ? textLabel : undefined}
      tabIndex={disabled ? -1 : undefined}
      onClick={select}
      whileTap={context.reduce || disabled ? undefined : { scale: 0.98 }}
      transition={spring.fast}
      data-slot="sidebar-menu-button"
      className={interactiveClassName}
    >
      {content}
    </motion.a>
  ) : (
    <motion.button
      type="button"
      disabled={disabled}
      aria-current={isActive ? "page" : undefined}
      aria-expanded={ariaExpanded}
      data-slot="sidebar-menu-button"
      aria-label={panel.collapsed ? textLabel : undefined}
      title={panel.collapsed ? textLabel : undefined}
      onClick={select}
      whileTap={context.reduce || disabled ? undefined : { scale: 0.98 }}
      transition={spring.fast}
      className={interactiveClassName}
    >
      {content}
    </motion.button>
  );
}
