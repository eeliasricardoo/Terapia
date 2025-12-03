import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./textarea";

const meta: Meta<typeof Textarea> = {
    title: "UI/Textarea",
    component: Textarea,
    tags: ["autodocs"],
    argTypes: {
        disabled: {
            control: "boolean",
        },
    },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
    args: {
        placeholder: "Type your message here.",
    },
};

export const Disabled: Story = {
    args: {
        placeholder: "Disabled textarea",
        disabled: true,
    },
};

export const WithLabel: Story = {
    render: (args) => (
        <div className="grid w-full gap-1.5">
            <label htmlFor="message">Your message</label>
            <Textarea {...args} id="message" />
        </div>
    ),
    args: {
        placeholder: "Type your message here.",
    },
};
