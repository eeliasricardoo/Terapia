import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AppointmentList } from "@/features/dashboard/components/appointment-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Determine role and fetch data accordingly
    // Note: In a real app, we'd have a more robust role check. 
    // Here we check if they have a therapist profile.
    const therapistProfile = await db.therapistProfile.findUnique({
        where: { userId: session.user.id },
    });

    const isTherapist = !!therapistProfile;
    const role = isTherapist ? "THERAPIST" : "PATIENT";

    let appointments = [];

    if (isTherapist) {
        appointments = await db.appointment.findMany({
            where: { therapistId: therapistProfile.id },
            include: { user: true },
            orderBy: { date: 'asc' },
        });
    } else {
        appointments = await db.appointment.findMany({
            where: { userId: session.user.id },
            include: {
                therapist: {
                    include: { user: true }
                }
            },
            orderBy: { date: 'asc' },
        });
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    Olá, {session.user.name?.split(" ")[0]}
                </h1>
                <p className="text-muted-foreground">
                    {isTherapist
                        ? "Gerencie sua agenda e próximos atendimentos."
                        : "Acompanhe suas consultas e bem-estar."}
                </p>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                        {isTherapist ? "Próximas Sessões" : "Minhas Consultas"}
                    </h2>
                </div>

                <AppointmentList appointments={appointments} role={role} />
            </div>
        </div>
    );
}
