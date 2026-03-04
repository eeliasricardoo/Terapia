import { getPsychologistPatients, getAnamnesis, saveEvolution } from '../lib/actions/patients';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { encryptData, decryptData } from '@/lib/security';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
    prisma: {
        psychologistProfile: {
            findUnique: jest.fn(),
        },
        appointment: {
            findMany: jest.fn(),
        },
        patientPsychologistLink: {
            findMany: jest.fn(),
        },
        anamnesis: {
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        evolution: {
            findMany: jest.fn(),
            create: jest.fn(),
        },
        profile: {
            findUnique: jest.fn(),
        }
    },
}));

jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(),
}));

jest.mock('@/lib/utils/logger', () => ({
    logger: {
        error: jest.fn(),
    },
}));

jest.mock('@/lib/security', () => ({
    encryptData: jest.fn((data) => `encrypted-${data}`),
    decryptData: jest.fn((data) => data.replace('encrypted-', '')),
}));

describe('patients actions', () => {
    const mockUser = { id: 'user-1' };
    const mockPsychologist = { id: 'psych-1' };

    beforeEach(() => {
        jest.clearAllMocks();
        (createClient as jest.Mock).mockResolvedValue({
            auth: {
                getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
            },
        });
        (prisma.psychologistProfile.findUnique as jest.Mock).mockResolvedValue(mockPsychologist);
    });

    describe('getPsychologistPatients', () => {
        it('should return empty list if psychologist profile not found', async () => {
            (prisma.psychologistProfile.findUnique as jest.Mock).mockResolvedValue(null);
            const patients = await getPsychologistPatients();
            expect(patients).toEqual([]);
        });

        it('should combine patients from appointments and explicit links', async () => {
            (prisma.appointment.findMany as jest.Mock).mockResolvedValue([
                {
                    patientId: 'p1',
                    scheduledAt: new Date(),
                    price: 100,
                    status: 'COMPLETED',
                    patient: {
                        id: 'p1',
                        email: 'p1@test.com',
                        profiles: { id: 'prof-1', fullName: 'Patient One', phone: '123' }
                    }
                }
            ]);

            (prisma.patientPsychologistLink.findMany as jest.Mock).mockResolvedValue([
                {
                    id: 'link-1',
                    status: 'active',
                    patient: {
                        user_id: 'p1',
                        users: { id: 'p1', email: 'p1@test.com' }
                    }
                }
            ]);

            const patients = await getPsychologistPatients();
            expect(patients.length).toBe(1);
            expect(patients[0].name).toBe('Patient One');
        });
    });

    describe('getAnamnesis', () => {
        it('should decrypt anamnesis data correctly', async () => {
            (prisma.anamnesis.findFirst as jest.Mock).mockResolvedValue({
                id: 'ana-1',
                mainComplaint: 'encrypted-complaint',
                familyHistory: 'encrypted-history',
            });

            const anamnesis = await getAnamnesis('prof-1');

            expect(anamnesis?.mainComplaint).toBe('complaint');
            expect(decryptData).toHaveBeenCalledWith('encrypted-complaint');
        });
    });

    describe('saveEvolution', () => {
        it('should encrypt notes before saving', async () => {
            const mockEvolution = { id: 'evo-1' };
            (prisma.evolution.create as jest.Mock).mockResolvedValue(mockEvolution);

            const result = await saveEvolution('prof-1', {
                publicSummary: 'public notes',
                privateNotes: 'private notes'
            });

            expect(result.success).toBe(true);
            expect(encryptData).toHaveBeenCalledWith('public notes');
            expect(encryptData).toHaveBeenCalledWith('private notes');
            expect(prisma.evolution.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    publicSummary: 'encrypted-public notes',
                    privateNotes: 'encrypted-private notes'
                })
            }));
        });
    });
});
