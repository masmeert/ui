import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { BookOpen, Bot, GitPullRequest, Rocket, Terminal, Workflow } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@masmeert/ui/navigation-menu";

const meta = {
  title: "Navigation/Navigation Menu",
  component: NavigationMenu,
  args: { align: "start", delay: 50, closeDelay: 50 },
  argTypes: {
    align: { control: "inline-radio", options: ["start", "center", "end"] },
    delay: { control: { type: "number", min: 0, step: 50 } },
    closeDelay: { control: { type: "number", min: 0, step: 50 } },
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof NavigationMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

function SiteNavigation(props: ComponentProps<typeof NavigationMenu>) {
  return (
    <div className="flex min-h-96 justify-center">
      <NavigationMenu {...props}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Product</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[30rem] grid-cols-2 gap-1">
                {[
                  {
                    title: "Agents",
                    description: "Run Claude, Codex or Cursor side by side.",
                    icon: Bot,
                  },
                  {
                    title: "Threads",
                    description: "One branch and transcript per task.",
                    icon: Workflow,
                  },
                  {
                    title: "Review",
                    description: "Read diffs and open pull requests.",
                    icon: GitPullRequest,
                  },
                  { title: "Terminal", description: "A shell in every project.", icon: Terminal },
                ].map(({ title, description, icon: Icon }) => (
                  <li key={title}>
                    <NavigationMenuLink href="#">
                      <span className="flex items-center gap-2 font-medium text-foreground">
                        <Icon />
                        {title}
                      </span>
                      <span className="text-xs text-muted-foreground">{description}</span>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="flex w-64 flex-col gap-1">
                <li>
                  <NavigationMenuLink href="#">
                    <span className="flex items-center gap-2 font-medium text-foreground">
                      <Rocket />
                      Getting started
                    </span>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink href="#">
                    <span className="flex items-center gap-2 font-medium text-foreground">
                      <BookOpen />
                      Guides
                    </span>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>
              Changelog
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

export const Default: Story = {
  render: (args) => <SiteNavigation {...args} />,
};

export const AlignCenter: Story = {
  args: { align: "center" },
  render: (args) => <SiteNavigation {...args} />,
};
