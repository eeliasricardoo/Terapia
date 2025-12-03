import type { Meta, StoryObj } from "@storybook/react";
import { AppointmentCard } from "./AppointmentCard";

const meta: Meta<typeof AppointmentCard> = {
    title: "Domain/AppointmentCard",
    component: AppointmentCard,
    tags: ["autodocs"],
    parameters: {
        layout: "centered",
    },
};

export default meta;
type Story = StoryObj<typeof AppointmentCard>;

export const Upcoming: Story = {
    args: {
        date: "15 de Outubro",
        time: "14:00",
        personName: "Dra. Ana Silva",
        personRole: "Psicólogo",
        status: "confirmed",
        videoLink: "https://meet.google.com",
        imageUrl: "https://github.com/shadcn.png",
    },
};

export const Pending: Story = {
    args: {
        date: "20 de Outubro",
        time: "10:00",
        personName: "João Souza",
        personRole: "Paciente",
        status: "pending",
    },
};

export const Completed: Story = {
    args: {
        date: "10 de Outubro",
        time: "16:00",
        personName: "Dra. Ana Silva",
        personRole: "Psicólogo",
        status: "completed",
    },
};

export const Canceled: Story = {
    args: {
        date: "05 de Outubro",
        time: "09:00",
        personName: "Maria Oliveira",
        personRole: "Paciente",
        status: "canceled",
    },
};
