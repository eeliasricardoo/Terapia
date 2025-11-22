import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // 1. Create Specialties
    const specialties = [
        { name: "Ansiedad", slug: "ansiedad" },
        { name: "Depresión", slug: "depresion" },
        { name: "Terapia de Pareja", slug: "terapia-de-pareja" },
        { name: "Autoestima", slug: "autoestima" },
        { name: "Estrés Laboral", slug: "estres-laboral" },
    ];

    for (const s of specialties) {
        await prisma.specialty.upsert({
            where: { slug: s.slug },
            update: {},
            create: s,
        });
    }

    // 2. Create Therapists
    const password = await bcrypt.hash("password123", 10);

    const therapists = [
        {
            name: "Dra. Ana García",
            email: "ana@terapia.com",
            bio: "Especialista en ansiedad y trastornos del estado de ánimo con más de 10 años de experiencia. Enfoque cognitivo-conductual.",
            title: "Psicóloga Clínica",
            licenseNumber: "CRP 06/12345",
            hourlyRate: 150.00,
            specialties: ["ansiedad", "depresion"],
        },
        {
            name: "Dr. Carlos Rodriguez",
            email: "carlos@terapia.com",
            bio: "Ayudo a parejas a reencontrarse y mejorar su comunicación. Terapia sistémica y humanista.",
            title: "Terapeuta de Pareja",
            licenseNumber: "CRP 06/67890",
            hourlyRate: 200.00,
            specialties: ["terapia-de-pareja", "autoestima"],
        },
        {
            name: "Lic. Sofia Martinez",
            email: "sofia@terapia.com",
            bio: "Enfoque en desarrollo personal y manejo del estrés en entornos corporativos.",
            title: "Psicóloga Organizacional",
            licenseNumber: "CRP 06/54321",
            hourlyRate: 120.00,
            specialties: ["estres-laboral", "autoestima"],
        },
    ];

    for (const t of therapists) {
        const user = await prisma.user.upsert({
            where: { email: t.email },
            update: {},
            create: {
                name: t.name,
                email: t.email,
                password,
                role: "THERAPIST",
            },
        });

        await prisma.therapistProfile.upsert({
            where: { userId: user.id },
            update: {},
            create: {
                userId: user.id,
                bio: t.bio,
                title: t.title,
                licenseNumber: t.licenseNumber,
                hourlyRate: t.hourlyRate,
                specialties: {
                    connect: t.specialties.map((slug) => ({ slug })),
                },
            },
        });
    }

    console.log("✅ Seeding finished.");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
