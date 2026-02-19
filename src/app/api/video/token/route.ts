
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
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { appointmentId } = body

        if (!appointmentId) {
            return new NextResponse("Missing appointmentId", { status: 400 })
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
            return new NextResponse("Appointment not found", { status: 404 })
        }

        // 2. verify user permissions
        const isPatient = appointment.patientId === user.id
        // Check via userId relation on psychologist profile
        const isPsychologist = appointment.psychologist.userId === user.id

        if (!isPatient && !isPsychologist) {
            return new NextResponse("Forbidden", { status: 403 })
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
                return new NextResponse("Failed to create meeting room", { status: 500 })
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
            return NextResponse.json({ token, url: roomUrl })
        } catch (error) {
            console.error("Error creating Daily token:", error)
            return new NextResponse("Failed to create meeting token", { status: 500 })
        }

    } catch (error) {
        console.error("[VIDEO_TOKEN_ERROR]", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
