"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const bookSessionSchema = z.object({
    therapistId: z.string(),
    userId: z.string(), // In a real app, get this from session
    date: z.date(),
});

export async function bookSession(prevState: any, formData: FormData) {
    const therapistId = formData.get("therapistId") as string;
    const userId = "user-id-placeholder"; // TODO: Get from session
    const dateString = formData.get("date") as string;

    if (!dateString) {
        return { message: "Data inválida" };
    }

    const date = new Date(dateString);

    try {
        // In a real app, we would check for availability here

        // Find a user to link to (for demo purposes, pick the first one if no session)
        // In production, we use auth().
        const user = await db.user.findFirst({
            include: {
                memberships: true
            }
        });

        if (!user) return { message: "Usuário não encontrado" };

        // Check for corporate subsidy (credits)
        // For MVP, we just check if they have ANY membership with credits > 0
        const activeMembership = user.memberships.find(m => m.credits > 0);
        let paymentStatus = "PENDING";
        let status = "PENDING";

        if (activeMembership) {
            // Deduct credit
            await db.member.update({
                where: { id: activeMembership.id },
                data: { credits: { decrement: 1 } }
            });
            paymentStatus = "SUBSIDIZED";
            status = "CONFIRMED"; // Auto-confirm if subsidized
        } else {
            // Mock Payment Flow
            // In a real app, we would create a Stripe Checkout Session here
            // For MVP, we simulate a successful payment
            paymentStatus = "PAID";
            status = "CONFIRMED";
        }

        await db.appointment.create({
            data: {
                therapistId,
                userId: user.id,
                date,
                status,
                paymentStatus,
            },
        });

        revalidatePath(`/especialistas/${therapistId}`);

        if (paymentStatus === "SUBSIDIZED") {
            return { message: "Agendamento confirmado! (Coberto pela empresa)", success: true };
        } else {
            return { message: "Pagamento realizado e agendamento confirmado!", success: true };
        }

    } catch (e) {
        console.error(e);
        return { message: "Erro ao agendar sessão" };
    }
}
