import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Archive, FolderGit2, Inbox, MessageSquare, PanelLeft, Plus, Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@masmeert/ui/avatar";
import { SizeProvider } from "@masmeert/ui/lib/size";
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
  type SidebarProps,
} from "@masmeert/ui/sidebar";

const meta = {
  title: "Navigation/Sidebar",
  component: Sidebar,
  args: { side: "left", variant: "sidebar", collapsible: "icon", ariaLabel: "Workspace" },
  argTypes: {
    side: { control: "inline-radio", options: ["left", "right"] },
    variant: { control: "inline-radio", options: ["sidebar", "floating", "inset"] },
    collapsible: { control: "inline-radio", options: ["icon", "offcanvas", "none"] },
  },
  parameters: { layout: "fullscreen" },
  render: (args) => <WorkspaceShell {...args} />,
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

function WorkspaceShell(props: SidebarProps) {
  const [activePage, setActivePage] = useState("Threads");
  const [projectsOpen, setProjectsOpen] = useState(true);

  return (
    <SidebarProvider>
      <Sidebar {...props}>
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
                  <SidebarMenuButton
                    icon={<Plus className="size-4" />}
                    onSelect={() => setActivePage("Threads")}
                  >
                    New thread
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    icon={<MessageSquare className="size-4" />}
                    badge="4"
                    onSelect={() => setActivePage("Threads")}
                    isActive={activePage === "Threads"}
                  >
                    Threads
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    icon={<Inbox className="size-4" />}
                    badge="2"
                    onSelect={() => setActivePage("Inbox")}
                    isActive={activePage === "Inbox"}
                  >
                    Inbox
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    icon={<FolderGit2 className="size-4" />}
                    ariaExpanded={projectsOpen}
                    onSelect={() => setProjectsOpen(!projectsOpen)}
                  >
                    Projects
                  </SidebarMenuButton>
                  <SidebarMenuSub open={projectsOpen}>
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
                <SidebarMenuItem>
                  <SidebarMenuButton
                    icon={<Archive className="size-4" />}
                    onSelect={() => setActivePage("Archived")}
                    isActive={activePage === "Archived"}
                  >
                    Archived
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    icon={<Settings className="size-4" />}
                    onSelect={() => setActivePage("Settings")}
                    isActive={activePage === "Settings"}
                  >
                    Settings
                  </SidebarMenuButton>
                </SidebarMenuItem>
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
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b border-border px-3">
          <SidebarTrigger className="text-muted-foreground hover:bg-hover hover:text-foreground">
            <PanelLeft className="size-4" />
          </SidebarTrigger>
          <h1 className="text-sm font-medium text-foreground">{activePage}</h1>
          <span className="ml-auto text-xs text-muted-foreground">⌘B toggles the sidebar</span>
        </header>
        <div className="flex flex-1 flex-col gap-3 p-6">
          {["Fix flaky auth test", "Add keep-awake countdown", "Bump motion to 13.4"].map(
            (thread) => (
              <div key={thread} className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-medium text-foreground">{thread}</p>
                <p className="text-xs text-muted-foreground">masscode · Claude</p>
              </div>
            ),
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export const Default: Story = {};

export const Floating: Story = { args: { variant: "floating" } };

export const Inset: Story = { args: { variant: "inset" } };

export const Offcanvas: Story = { args: { collapsible: "offcanvas" } };

export const Right: Story = { args: { side: "right" } };

/** Density is a region decision: one provider steps every row, label and the submenu down. */
export const Compact: Story = {
  render: (args) => (
    <SizeProvider size="compact">
      <WorkspaceShell {...args} />
    </SizeProvider>
  ),
};
