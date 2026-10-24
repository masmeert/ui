import {
  IconCheck,
  IconCopy,
  IconFile,
  IconFileCode,
  IconFileMusic,
  IconFileSpreadsheet,
  IconFileText,
  IconFileZip,
  IconMovie,
  IconPhoto,
  IconRotate,
  IconX,
} from "@tabler/icons-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type ComponentType,
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "cn";
import { Button } from "@/components/button";
import { type Size, useSize } from "@/lib/size";
import { reducedTransition, spring, springExit } from "@/lib/springs";

export type ChatRole = "user" | "assistant";

export interface ChatAttachment {
  /** Stable key; falls back to the name. */
  id?: string;
  name: string;
  /** Size in bytes, shown as `12 KB`. */
  size?: number;
  /** MIME type, used with the extension to pick the icon. */
  type?: string;
  /** Makes the chip a link (opens in a new tab). */
  href?: string;
  /** Replaces the file-type icon, e.g. with an image thumbnail. */
  icon?: ReactNode;
}

const ICON_BY_KIND: Record<string, ComponentType<{ size?: number; "aria-hidden"?: boolean }>> = {
  image: IconPhoto,
  video: IconMovie,
  audio: IconFileMusic,
  text: IconFileText,
  code: IconFileCode,
  sheet: IconFileSpreadsheet,
  archive: IconFileZip,
  file: IconFile,
};

const EXTENSION_KIND: Record<string, string> = {
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  webp: "image",
  svg: "image",
  mp4: "video",
  mov: "video",
  webm: "video",
  mp3: "audio",
  wav: "audio",
  m4a: "audio",
  pdf: "text",
  md: "text",
  txt: "text",
  doc: "text",
  docx: "text",
  csv: "sheet",
  xls: "sheet",
  xlsx: "sheet",
  zip: "archive",
  tar: "archive",
  gz: "archive",
  rar: "archive",
  "7z": "archive",
  js: "code",
  jsx: "code",
  ts: "code",
  tsx: "code",
  json: "code",
  py: "code",
  rs: "code",
  go: "code",
  css: "code",
  html: "code",
  sh: "code",
  yml: "code",
  yaml: "code",
};

function attachmentKind({ name, type }: Pick<ChatAttachment, "name" | "type">): string {
  const major = type?.split("/")[0];
  if (major === "image" || major === "video" || major === "audio") return major;
  const extension = name.includes(".") ? name.split(".").pop()!.toLowerCase() : "";
  return EXTENSION_KIND[extension] ?? (major === "text" ? "text" : "file");
}

/** `1536` → `1.5 KB`. One decimal under 10 of a unit, whole numbers above. */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  const rounded = unit === 0 || value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${units[unit]}`;
}

export interface AttachmentChipProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  attachment: ChatAttachment;
  /** Shows a remove button, for a composer's pending attachments. */
  onRemove?: () => void;
  size?: Size;
}

export function AttachmentChip({
  attachment,
  onRemove,
  size,
  className,
  ...props
}: AttachmentChipProps) {
  const tokens = useSize(size);
  const Icon = ICON_BY_KIND[attachmentKind(attachment)] ?? IconFile;
  const meta = attachment.size !== undefined ? formatFileSize(attachment.size) : undefined;

  const body = (
    <>
      <span
        aria-hidden
        className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-md bg-hover text-muted-foreground"
      >
        {attachment.icon ?? <Icon size={tokens.icon} aria-hidden />}
      </span>
      <span className="flex min-w-0 flex-col text-left">
        <span className={cn(tokens.type.caption, "truncate text-foreground")}>
          {attachment.name}
        </span>
        {meta ? (
          <span className={cn(tokens.type.caption, "text-muted-foreground")}>{meta}</span>
        ) : null}
      </span>
    </>
  );

  const chipClass = cn(
    "flex max-w-60 min-w-0 items-center gap-2 rounded-lg border border-border p-1 pr-3",
    tokens.size === "compact" && "pr-2",
  );

  return (
    <div
      data-slot="attachment-chip"
      className={cn("group/chip relative flex min-w-0", className)}
      {...props}
    >
      {attachment.href ? (
        <a
          href={attachment.href}
          target="_blank"
          rel="noreferrer"
          className={cn(
            chipClass,
            "transition-colors duration-(--duration-fast) outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          {body}
        </a>
      ) : (
        <div className={chipClass}>{body}</div>
      )}
      {onRemove ? (
        <button
          type="button"
          aria-label={`Remove ${attachment.name}`}
          onClick={onRemove}
          className={cn(
            "absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full border border-border bg-background text-muted-foreground",
            "transition-colors duration-(--duration-fast) outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <IconX className="size-3" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

export interface ChatMessageProps extends Omit<HTMLAttributes<HTMLDivElement>, "role"> {
  /** `user` sits right in a filled bubble; `assistant` sits left on the page, no bubble. */
  role: ChatRole;
  /** Rendered inside `.typeset`. */
  children?: ReactNode;
  attachments?: ChatAttachment[];
  /** Show a copy button. Defaults to true when the message has a body. */
  copyable?: boolean;
  /** What copy puts on the clipboard. Defaults to the body's rendered text. */
  copyText?: string;
  onCopied?: (text: string) => void;
  onRetry?: () => void;
  /** Extra buttons appended to the actions row. */
  actions?: ReactNode;
  /** Show the actions row without hover/focus. Touch devices always show it. */
  persistentActions?: boolean;
  size?: Size;
}

const COPIED_DWELL_MS = 1500;

// The actions row always takes its space and only fades in, so it never shifts the transcript.
export const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(function ChatMessage(
  {
    role,
    children,
    attachments,
    copyable,
    copyText,
    onCopied,
    onRetry,
    actions,
    persistentActions = false,
    size,
    className,
    ...props
  },
  ref,
) {
  const tokens = useSize(size);
  const isUser = role === "user";
  const bodyRef = useRef<HTMLDivElement>(null);
  const hasBody = children !== undefined && children !== null && children !== false;
  const showCopy = copyable ?? hasBody;
  const hasActions = showCopy || onRetry !== undefined || actions !== undefined;

  return (
    <div
      ref={ref}
      data-slot="chat-message"
      data-role={role}
      className={cn(
        "group/message flex w-full flex-col",
        tokens.gap,
        isUser ? "items-end" : "items-start",
        className,
      )}
      {...props}
    >
      {attachments?.length ? (
        <ul
          aria-label="Attachments"
          className={cn("flex max-w-full flex-wrap gap-2", isUser && "justify-end")}
        >
          {attachments.map((attachment) => (
            <li key={attachment.id ?? attachment.name} className="flex min-w-0">
              <AttachmentChip attachment={attachment} size={size} />
            </li>
          ))}
        </ul>
      ) : null}

      {hasBody ? (
        <div
          ref={bodyRef}
          data-slot="chat-message-body"
          className={cn(
            "typeset min-w-0 break-words",
            tokens.typeVariant === "compact" && "typeset-compact",
            // After `typeset` so the role's size and leading win over the body default.
            tokens.type.subtitle,
            isUser
              ? "max-w-[min(80%,36rem)] rounded-xl bg-selected px-4 py-2 text-foreground"
              : "w-full",
          )}
        >
          {children}
        </div>
      ) : null}

      {hasActions ? (
        <div
          data-slot="chat-message-actions"
          className={cn(
            "-mx-1 flex items-center gap-0.5",
            !persistentActions &&
              "opacity-0 transition-opacity duration-(--duration-fast) group-focus-within/message:opacity-100 group-hover/message:opacity-100 [@media(hover:none)]:opacity-100",
          )}
        >
          {showCopy ? (
            <CopyAction
              size={size}
              getText={() => copyText ?? bodyRef.current?.innerText ?? ""}
              onCopied={onCopied}
            />
          ) : null}
          {onRetry ? (
            <ChatMessageAction size={size} label="Retry" onClick={onRetry}>
              <IconRotate size={tokens.icon} aria-hidden />
            </ChatMessageAction>
          ) : null}
          {actions}
        </div>
      ) : null}
    </div>
  );
});

export interface ChatMessageActionProps {
  label: string;
  onClick?: () => void;
  children: ReactNode;
  size?: Size;
}

/** Square icon button for the actions row, one step under the size ladder. */
export function ChatMessageAction({ label, onClick, children, size }: ChatMessageActionProps) {
  const tokens = useSize(size);
  return (
    <Button
      variant="ghost"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        tokens.size === "large" ? "size-9" : tokens.size === "compact" ? "size-7" : "size-8",
        "gap-0 rounded-lg p-0 text-muted-foreground hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
      )}
    >
      {children}
    </Button>
  );
}

function CopyAction({
  getText,
  onCopied,
  size,
}: {
  getText: () => string;
  onCopied?: (text: string) => void;
  size?: Size;
}) {
  const tokens = useSize(size);
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), COPIED_DWELL_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    const text = getText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopied?.(text);
    } catch {
      // Clipboard denied (insecure context, permissions): leave the icon alone.
    }
  };

  const swap = reducedTransition(spring.fast, reduce);
  return (
    <>
      <ChatMessageAction size={size} label={copied ? "Copied" : "Copy"} onClick={copy}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={copied ? "check" : "copy"}
            className="grid place-items-center"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6, transition: springExit.fast }}
            transition={swap}
          >
            {copied ? (
              <IconCheck size={tokens.icon} aria-hidden />
            ) : (
              <IconCopy size={tokens.icon} aria-hidden />
            )}
          </motion.span>
        </AnimatePresence>
      </ChatMessageAction>
      {/* The label swap above isn't announced; this is. */}
      <span role="status" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </>
  );
}
