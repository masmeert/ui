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
    <span className={cn("relative inline-block whitespace-pre", className)} style={style}>
      <span className="sr-only">{text}</span>
      {/* Holds the final width so random glyphs can't jitter the layout. */}
      <span aria-hidden="true" className="invisible">
        {text}
      </span>
      {reduce ? (
        <motion.span
          key={revision.count}
          aria-hidden="true"
          className="absolute top-0 left-0"
          initial={revision.count > 0 ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={spring.fast}
        >
          {text}
        </motion.span>
      ) : (
        <span aria-hidden="true" className="absolute top-0 left-0">
          {display}
        </span>
      )}
    </span>
  );
}
