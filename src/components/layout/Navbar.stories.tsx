import type { Meta, StoryObj } from "@storybook/react";
import { Navbar } from "./Navbar";

const meta: Meta<typeof Navbar> = {
    title: "Layout/Navbar",
    component: Navbar,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
    },
};

export default meta;
type Story = StoryObj<typeof Navbar>;

export const LoggedOut: Story = {
    args: {
        isLoggedIn: false,
    },
};

export const ClientLoggedIn: Story = {
    args: {
        isLoggedIn: true,
        userRole: "client",
    },
};

export const PsychologistLoggedIn: Story = {
    args: {
        isLoggedIn: true,
        userRole: "psychologist",
    },
};

export const CompanyLoggedIn: Story = {
    args: {
        isLoggedIn: true,
        userRole: "company",
    },
};
