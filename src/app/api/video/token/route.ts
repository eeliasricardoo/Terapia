
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { createDailyRoom, createDailyToken } from "@/lib/daily"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
        }

        const body = await req.json()
        const { appointmentId } = body

        if (!appointmentId) {
            return NextResponse.json({ error: "ID do agendamento ausente" }, { status: 400 })
        }

        // 1. Fetch appointment details including strict relations
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                psychologist: true,
                patient: true,
            },
        })

        if (!appointment) {
            return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 })
        }

        // 2. verify user permissions
        const isPatient = appointment.patientId === user.id
        // Check via userId relation on psychologist profile
        const isPsychologist = appointment.psychologist.userId === user.id

        if (!isPatient && !isPsychologist) {
            return NextResponse.json({ error: "Acesso negado - Você não faz parte deste agendamento" }, { status: 403 })
        }

        // Check appointment time window (15 mins before scheduledAt)
        const now = new Date()
        const scheduledAt = new Date(appointment.scheduledAt)

        // Allowed 15 minutes before the appointment
        const startTime = new Date(scheduledAt.getTime() - 15 * 60 * 1000)

        // Allowed up to the end of the appointment + 20 min buffer
        const endTime = new Date(scheduledAt.getTime() + (appointment.durationMinutes + 20) * 60 * 1000)

        // Only enforce time check for patients, psychologists can prepare earlier if needed (optional, but let's enforce both for now or just follow spec)
        if (now < startTime || now > endTime) {
            return NextResponse.json(
                { error: "Sessão indisponível no momento. Você pode entrar 15 minutos antes do horário agendado." },
                { status: 403 }
            )
        }

        let roomUrl = appointment.meetingUrl
        let roomName = ""

        // 3. Create or Retrieve Room
        if (roomUrl) {
            // Extract room name from URL
            // Example: https://my-domain.daily.co/RoomName
            const urlParts = roomUrl.split("/")
            roomName = urlParts[urlParts.length - 1]
        } else {
            // Create new room
            // Format: terapia-[id]-[random]
            const uniqueSuffix = Math.random().toString(36).substring(2, 7)
            const newRoomName = `terapia-${appointmentId}-${uniqueSuffix}`

            try {
                const roomData = await createDailyRoom(newRoomName)
                roomUrl = roomData.url
                roomName = roomData.name

                // Save meeting URL to appointment
                await prisma.appointment.update({
                    where: { id: appointmentId },
                    data: { meetingUrl: roomUrl },
                })
            } catch (error) {
                console.error("Error creating Daily room:", error)
                return NextResponse.json({ error: "Falha ao criar sala de reunião" }, { status: 500 })
            }
        }

        // 4. Generate Token
        // Patient: attendee, Psych: owner
        const isOwner = isPsychologist
        const userName = isPsychologist
            ? (appointment.psychologist.userId === user.id ? "Dr(a). " + (user.user_metadata?.full_name || "Psicólogo") : "Psicólogo")
            : (appointment.patient.name || "Paciente")

        try {
            // Security: Set token duration to Appointment Duration + 20 minutes buffer
            // This ensures the call automatically cuts off preventing billing overages
            const durationBuffer = 20; // 20 minutes
            const durationInSeconds = ((appointment.durationMinutes || 50) + durationBuffer) * 60;

            const token = await createDailyToken(roomName, userName, isOwner, durationInSeconds)
            return NextResponse.json({
                token,
                url: roomUrl,
                scheduledAt: appointment.scheduledAt,
                durationMinutes: appointment.durationMinutes,
                isPsychologist
            })
        } catch (error) {
            console.error("Error creating Daily token:", error)
            return NextResponse.json({ error: "Falha ao criar token da sala" }, { status: 500 })
        }

    } catch (error) {
        console.error("[VIDEO_TOKEN_ERROR]", error)
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
    }
}
