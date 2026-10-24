import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { spring } from "@/lib/springs";
import { cn } from "cn";

const DEFAULT_GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&@$?/";

export interface TextScrambleProps {
  text: string;
  /** Milliseconds. Defaults to 32ms per character, clamped to 420–760. */
  duration?: number;
  /** Characters sampled for unresolved positions. */
  glyphs?: string;
  className?: string;
  style?: CSSProperties;
}

export function TextScramble({
  text,
  duration,
  glyphs = DEFAULT_GLYPHS,
  className,
  style,
}: TextScrambleProps) {
  const reduce = useReducedMotion() ?? false;
  const [display, setDisplay] = useState(text);
  // Not a "mounted" flag: StrictMode replays the mount effect and would scramble in dev.
  const previousText = useRef(text);
  // Counted during render: an effect would paint the new text at full opacity before the fade.
  const [revision, setRevision] = useState({ text, count: 0 });
  if (revision.text !== text) setRevision({ text, count: revision.count + 1 });

  useEffect(() => {
    const textChanged = previousText.current !== text;
    previousText.current = text;
    if (!textChanged || reduce || !glyphs) {
      setDisplay(text);
      return;
    }

    const characters = text.split("");
    const startedAt = performance.now();
    // Content-driven length, so not a tier.
    const animationDuration = duration ?? Math.min(760, Math.max(420, characters.length * 32));
    let frame = 0;
    let lastUpdate = 0;

    const animate = (now: number) => {
      if (now - lastUpdate >= 40) {
        lastUpdate = now;
        const progress = Math.min((now - startedAt) / animationDuration, 1);
        const settled = Math.floor(progress * characters.length);
        setDisplay(
          characters
            .map((character, index) => {
              if (index < settled || character === " ") return character;
              return glyphs[Math.floor(Math.random() * glyphs.length)];
            })
            .join(""),
        );
      }

      if (now - startedAt < animationDuration) {
        frame = requestAnimationFrame(animate);
      } else {
        setDisplay(text);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [duration, glyphs, reduce, text]);

  return (
    <>
      {/* Outside the root: `background-clip: text` paints even sr-only glyphs. */}
      <span className="sr-only">{text}</span>
      {/* One grid cell for both layers: absolute text falls outside `background-clip: text`. */}
      <span
        aria-hidden="true"
        className={cn("relative inline-grid whitespace-pre", className)}
        style={style}
      >
        {/* Holds the final width; zero height so its glyphs stay out of the clip. */}
        <span className="invisible col-start-1 row-start-1 h-0 overflow-hidden">{text}</span>
        {reduce ? (
          <motion.span
            key={revision.count}
            // Contained, so wide random glyphs can't widen the cell.
            className="col-start-1 row-start-1 contain-inline-size"
            initial={revision.count > 0 ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={spring.fast}
          >
            {text}
          </motion.span>
        ) : (
          <span className="col-start-1 row-start-1 contain-inline-size">{display}</span>
        )}
      </span>
    </>
  );
}
