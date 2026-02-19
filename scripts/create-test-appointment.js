
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestAppointment() {
    try {
        // 1. Get/Create Users
        const psychologistUser = await prisma.user.findFirst({
            where: { email: 'psicologo@test.com' }
        });

        if (!psychologistUser) {
            console.error('Psychologist user not found. Please ensure users exist.');
            return;
        }

        // Get Psychologist Profile
        const psychProfile = await prisma.psychologistProfile.findUnique({
            where: { userId: psychologistUser.id }
        });

        if (!psychProfile) {
            console.error('Psychologist profile not found.');
            return;
        }

        // Find a PATIENT (create if none)
        const patientUser = await prisma.user.findFirst({
            where: { role: 'PATIENT' } // or any other critera
        });

        let patientId = patientUser?.id;
        if (!patientId) {
            // Create dummy patient if needed or exit
            // For simplicity, let's just abort if no patient is found
            console.error('No patient user found. Please register a patient first.');
            // Or create one
            const newUser = await prisma.user.create({
                data: {
                    email: 'paciente.teste@test.com',
                    name: 'Paciente Teste',
                    role: 'PATIENT'
                }
            });
            patientId = newUser.id;
            console.log('Created dummy patient:', newUser.email);
        }


        // 2. Create Appointment
        const appointment = await prisma.appointment.create({
            data: {
                patientId: patientId,
                psychologistId: psychProfile.id,
                scheduledAt: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour from now
                durationMinutes: 50,
                status: 'SCHEDULED',
                price: 150.00,
                meetingUrl: null // Will be generated on first access
            }
        });

        console.log('\n--- SETUP COMPLETE ---');
        console.log('Test Appointment Created!');
        console.log('Appointment ID:', appointment.id);
        console.log('Test URL (Psychologist):', `http://localhost:3000/sala/${appointment.id}`);
        console.log('----------------------\n');

    } catch (error) {
        console.error('Error creating test appointment:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestAppointment();
