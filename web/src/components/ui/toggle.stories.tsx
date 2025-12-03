import type { Meta, StoryObj } from "@storybook/react";
import { Toggle } from "./toggle";
import { Bold } from "lucide-react";

const meta: Meta<typeof Toggle> = {
    title: "UI/Toggle",
    component: Toggle,
    tags: ["autodocs"],
    parameters: {
        layout: "centered",
    },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
    render: () => (
        <Toggle aria-label="Toggle bold">
            <Bold className="h-4 w-4" />
        </Toggle>
    ),
};
