import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { motion } from "motion/react";
import {
  IconArchive,
  IconCopy,
  IconDots,
  IconFolderCode,
  IconInbox,
  IconLayoutSidebar,
  IconMessage,
  IconMoon,
  IconPencil,
  IconPlus,
  IconSettings,
  IconSun,
  IconTrash,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback } from "@masmeert/ui/avatar";
import { Button, buttonVariants } from "@masmeert/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@masmeert/ui/dropdown-menu";
import { spring } from "@masmeert/ui/lib/springs";
import { surfaceClasses } from "@masmeert/ui/lib/surface";
import {
  MorphingPopover,
  MorphingPopoverContent,
  MorphingPopoverMenu,
  MorphingPopoverTrigger,
} from "@masmeert/ui/morphing-popover";
import { SharedLayoutBg } from "@masmeert/ui/shared-layout-bg";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@masmeert/ui/sidebar";
import { ToggleGroup, ToggleGroupItem } from "@masmeert/ui/toggle-group";
import { Tooltip } from "@masmeert/ui/tooltip";

const meta = {
  title: "Playground/Fluid Port",
  parameters: { layout: "fullscreen" },
  render: () => <Playground />,
} satisfies Meta;

export default meta;

export const AllChanges: StoryObj<typeof meta> = {};

function Playground() {
  const [variant, setVariant] = useState<"sidebar" | "floating" | "inset">("floating");
  const [collapsible, setCollapsible] = useState<"offcanvas" | "icon">("offcanvas");
  const [side, setSide] = useState<"left" | "right">("left");
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [activePage, setActivePage] = useState("Threads");
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);

  function toggleTheme() {
    document.documentElement.classList.toggle("dark", !isDark);
    setIsDark(!isDark);
  }

  return (
    // Re-keyed so switching variant or side starts from a clean layout.
    <SidebarProvider key={`${variant}-${side}-${collapsible}`}>
      <Sidebar variant={variant} collapsible={collapsible} side={side} ariaLabel="Workspace">
        <SidebarHeader>
          <div className="flex h-9 items-center gap-2.5 overflow-hidden px-1.5">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
              M
            </span>
            <span className="truncate text-sm font-medium text-foreground">masscode</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton icon={<IconPlus className="size-4" />}>
                    New thread
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {[
                  { label: "Threads", icon: IconMessage, badge: "4" },
                  { label: "Inbox", icon: IconInbox, badge: "2" },
                ].map(({ label, icon: Icon, badge }) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton
                      icon={<Icon className="size-4" />}
                      badge={badge}
                      isActive={activePage === label}
                      onSelect={() => setActivePage(label)}
                    >
                      {label}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    icon={<IconFolderCode className="size-4" />}
                    ariaExpanded={isProjectsOpen}
                    onSelect={() => setIsProjectsOpen(!isProjectsOpen)}
                  >
                    Projects
                  </SidebarMenuButton>
                  <SidebarMenuSub open={isProjectsOpen}>
                    {["masscode", "ui", "dotfiles"].map((project) => (
                      <SidebarMenuSubItem key={project}>
                        <SidebarMenuSubButton
                          isActive={activePage === project}
                          onSelect={() => setActivePage(project)}
                        >
                          {project}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Library</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {[
                  { label: "Archived", icon: IconArchive },
                  { label: "Settings", icon: IconSettings },
                ].map(({ label, icon: Icon }) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton
                      icon={<Icon className="size-4" />}
                      isActive={activePage === label}
                      onSelect={() => setActivePage(label)}
                    >
                      {label}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2.5 overflow-hidden px-1">
            <Avatar size="compact">
              <AvatarFallback>MM</AvatarFallback>
            </Avatar>
            <span className="truncate text-sm text-foreground">Massimo Meert</span>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="min-w-0">
        <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-3 py-2.5">
          <SidebarTrigger className="text-muted-foreground hover:bg-hover hover:text-foreground">
            <IconLayoutSidebar className="size-4" />
          </SidebarTrigger>
          <Segmented
            label="Variant"
            options={["sidebar", "floating", "inset"]}
            value={variant}
            onChange={setVariant}
          />
          <Segmented
            label="Collapse"
            options={["offcanvas", "icon"]}
            value={collapsible}
            onChange={setCollapsible}
          />
          <Segmented label="Side" options={["left", "right"]} value={side} onChange={setSide} />
          <Button
            variant="ghost"
            size="icon"
            aria-label={isDark ? "Light theme" : "Dark theme"}
            onClick={toggleTheme}
            className="ml-auto"
          >
            {isDark ? <IconSun className="size-4" /> : <IconMoon className="size-4" />}
          </Button>
        </header>
        <div className="grid gap-6 p-6 lg:grid-cols-2">
          <Section
            title="Sidebar"
            hint="⌘B or the sidebar button collapses it. Off-canvas: the column and the panel slide on one spring, so the content glides. Hover a project, then move up to Inbox: the highlight fades in on Inbox instead of sliding down from Threads."
          >
            <p className="text-sm text-muted-foreground">
              Floating: a lifted card in an 8px gutter, with a ring and short drops that the gutter
              never cuts off. Inset: the content is the raised card.
            </p>
          </Section>
          <Section
            title="Hover follows where rows land"
            hint="Rest the pointer on a row and press Shuffle. The rows glide; the highlight goes to where the row under the pointer settles instead of sticking where it started."
          >
            <GlidingList />
          </Section>
          <Section
            title="Surface ladder"
            hint="Each level lifts toward white in light and one step lighter in dark, with a hairline ring and drops that double per level."
          >
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((level) => (
                <div
                  key={level}
                  className={`flex h-16 items-end rounded-xl p-2 text-xs text-muted-foreground ${surfaceClasses(level)}`}
                >
                  {level}
                </div>
              ))}
            </div>
          </Section>
          <Section
            title="Popups"
            hint="No borders on box-shadowed surfaces; the morphing popover keeps its border and gets the short drops as a filter, since its clip would cut a box-shadow."
          >
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger className={buttonVariants({ variant: "outline" })}>
                  Dropdown
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuItem>
                    <IconPencil />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IconCopy />
                    Copy link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <IconTrash />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <ActionsPopover />
              <Tooltip content="Tooltip on the new surface">
                <Button variant="outline">Tooltip</Button>
              </Tooltip>
            </div>
          </Section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function Segmented<Option extends string>(props: {
  label: string;
  options: Array<Option>;
  value: Option;
  onChange: (option: Option) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{props.label}</span>
      <ToggleGroup
        aria-label={props.label}
        size="compact"
        value={[props.value]}
        // Single choice: clicking the selected option again would empty the group, so it's ignored.
        onValueChange={(values) => {
          const option = props.options.find((candidate) => candidate === values[0]);
          if (option) props.onChange(option);
        }}
      >
        {props.options.map((option) => (
          <ToggleGroupItem key={option} value={option} className="capitalize">
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

function Section(props: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl p-4 shadow-surface-1">
      <div>
        <h2 className="text-sm font-medium text-foreground">{props.title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{props.hint}</p>
      </div>
      {props.children}
    </section>
  );
}

function GlidingList() {
  const [files, setFiles] = useState([
    "src/api/routes/usage.ts",
    "src/workers/meter.ts",
    "package.json",
    "docs/billing.md",
    "src/billing/index.ts",
  ]);

  return (
    <div className="flex flex-col gap-3">
      <SharedLayoutBg inset={0} pillClassName="rounded-xl" className="gap-1">
        {files.map((file) => (
          <motion.div
            key={file}
            layout="position"
            transition={{ ...spring.slow, visualDuration: 0.6 }}
            className="flex h-9 cursor-default items-center rounded-xl px-3 font-mono text-xs text-foreground"
          >
            {file}
          </motion.div>
        ))}
      </SharedLayoutBg>
      <Button
        variant="secondary"
        size="compact"
        className="self-start"
        onClick={() => setFiles([...files.slice(1), files[0]])}
      >
        Shuffle
      </Button>
    </div>
  );
}

function ActionsPopover() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MorphingPopover open={isOpen} onOpenChange={setIsOpen}>
      <MorphingPopoverTrigger>
        <Button variant="outline" aria-label="Morphing popover">
          <IconDots className="size-4" />
          Morphing popover
        </Button>
      </MorphingPopoverTrigger>
      <MorphingPopoverContent side="bottom" align="start" sideOffset={8} className="p-1.5">
        <MorphingPopoverMenu className="w-48">
          {["Rename", "Copy link", "Archive", "Delete"].map((label) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex h-9 items-center rounded-lg px-3 text-sm text-foreground outline-none"
            >
              {label}
            </button>
          ))}
        </MorphingPopoverMenu>
      </MorphingPopoverContent>
    </MorphingPopover>
  );
}
