import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Calendar } from "@masmeert/ui/calendar";

const meta = {
  title: "Inputs/Calendar",
  component: Calendar,
  args: {
    defaultMonth: new Date(2026, 9, 1),
    captionLayout: "label",
    buttonVariant: "ghost",
    showOutsideDays: true,
    showWeekNumber: false,
    numberOfMonths: 1,
  },
  argTypes: {
    captionLayout: {
      control: "inline-radio",
      options: ["label", "dropdown", "dropdown-months", "dropdown-years"],
    },
    buttonVariant: {
      control: "inline-radio",
      options: ["primary", "secondary", "outline", "ghost"],
    },
    showOutsideDays: { control: "boolean" },
    showWeekNumber: { control: "boolean" },
    numberOfMonths: { control: { type: "number", min: 1, max: 3 } },
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

function ReleaseDatePicker(props: Story["args"]) {
  const [releaseDate, setReleaseDate] = useState<Date | undefined>(new Date(2026, 9, 27));
  return (
    <Calendar
      {...props}
      mode="single"
      selected={releaseDate}
      onSelect={setReleaseDate}
      disabled={{ dayOfWeek: [0, 6] }}
    />
  );
}

export const Single: Story = {
  render: (args) => <ReleaseDatePicker {...args} />,
};

function FreezeWindowPicker(props: Story["args"]) {
  const [freezeWindow, setFreezeWindow] = useState<
    { from: Date | undefined; to?: Date | undefined } | undefined
  >({ from: new Date(2026, 11, 21), to: new Date(2027, 0, 4) });
  return <Calendar {...props} mode="range" selected={freezeWindow} onSelect={setFreezeWindow} />;
}

export const Range: Story = {
  args: { defaultMonth: new Date(2026, 11, 1), numberOfMonths: 2 },
  render: (args) => <FreezeWindowPicker {...args} />,
};

export const DropdownCaption: Story = {
  args: {
    captionLayout: "dropdown",
    startMonth: new Date(2024, 0),
    endMonth: new Date(2027, 11),
  },
  render: (args) => <ReleaseDatePicker {...args} />,
};

export const WithWeekNumbers: Story = {
  args: { showWeekNumber: true },
  render: (args) => <ReleaseDatePicker {...args} />,
};
