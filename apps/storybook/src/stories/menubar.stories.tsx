import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@masmeert/ui/menubar";

const meta = {
  title: "Navigation/Menubar",
  component: Menubar,
  args: { modal: true, loopFocus: true, disabled: false },
} satisfies Meta<typeof Menubar>;

export default meta;
type Story = StoryObj<typeof meta>;

function AppMenubar(props: ComponentProps<typeof Menubar>) {
  const [showSidebar, setShowSidebar] = useState(true);
  const [showTerminal, setShowTerminal] = useState(false);
  const [diffLayout, setDiffLayout] = useState("unified");

  return (
    <Menubar {...props}>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent className="w-56">
          <MenubarItem>
            New thread
            <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Open project…
            <MenubarShortcut>⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>Open recent</MenubarSubTrigger>
            <MenubarSubContent className="w-44">
              <MenubarItem>masscode</MenubarItem>
              <MenubarItem>ui</MenubarItem>
              <MenubarItem>dotfiles</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>
            Close window
            <MenubarShortcut>⌘W</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent className="w-52">
          <MenubarItem>
            Undo
            <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Redo
            <MenubarShortcut>⌘⇧Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Find in thread
            <MenubarShortcut>⌘F</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent className="w-52">
          <MenubarCheckboxItem checked={showSidebar} onCheckedChange={setShowSidebar}>
            Sidebar
          </MenubarCheckboxItem>
          <MenubarCheckboxItem checked={showTerminal} onCheckedChange={setShowTerminal}>
            Terminal
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarGroup>
            <MenubarLabel>Diff layout</MenubarLabel>
            <MenubarRadioGroup value={diffLayout} onValueChange={setDiffLayout}>
              <MenubarRadioItem value="unified">Unified</MenubarRadioItem>
              <MenubarRadioItem value="split">Split</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarGroup>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Help</MenubarTrigger>
        <MenubarContent className="w-48">
          <MenubarItem>Documentation</MenubarItem>
          <MenubarItem>Keyboard shortcuts</MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled>Check for updates</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

export const Default: Story = {
  render: (args) => <AppMenubar {...args} />,
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <AppMenubar {...args} />,
};
