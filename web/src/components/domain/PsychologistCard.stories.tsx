import type { Meta, StoryObj } from "@storybook/react";
import { PsychologistCard } from "./PsychologistCard";

const meta: Meta<typeof PsychologistCard> = {
    title: "Domain/PsychologistCard",
    component: PsychologistCard,
    tags: ["autodocs"],
    parameters: {
        layout: "centered",
    },
};

export default meta;
type Story = StoryObj<typeof PsychologistCard>;

export const Default: Story = {
    args: {
        name: "Dra. Ana Silva",
        specialty: "Psicologia Clínica • TCC",
        rating: 4.9,
        reviewCount: 124,
        price: 150,
        nextAvailable: "Hoje, 14:00",
        imageUrl: "https://github.com/shadcn.png", // Placeholder
    },
};

export const HighRated: Story = {
    args: {
        name: "Dr. Carlos Santos",
        specialty: "Psicanálise",
        rating: 5.0,
        reviewCount: 312,
        price: 250,
        location: "São Paulo, SP",
        nextAvailable: "Amanhã, 09:00",
    },
};

export const Unavailable: Story = {
    args: {
        name: "Dra. Julia Lima",
        specialty: "Terapia de Casal",
        rating: 4.8,
        reviewCount: 89,
        price: 200,
        nextAvailable: undefined,
    },
};
