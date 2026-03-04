import { getFinancialStats } from '../lib/actions/financial';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// Mocking the dependencies
jest.mock('@/lib/prisma', () => ({
    prisma: {
        psychologistProfile: {
            findUnique: jest.fn(),
        },
        appointment: {
            findMany: jest.fn(),
        },
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

describe('financial actions', () => {
    const mockUser = { id: 'user-1' };
    const mockPsychologist = { id: 'psych-1' };

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup default mocks
        (createClient as jest.Mock).mockResolvedValue({
            auth: {
                getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
            },
        });

        (prisma.psychologistProfile.findUnique as jest.Mock).mockResolvedValue(mockPsychologist);
    });

    describe('getFinancialStats', () => {
        it('should return 0 stats when user is not authenticated', async () => {
            (createClient as jest.Mock).mockResolvedValue({
                auth: {
                    getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
                },
            });

            const stats = await getFinancialStats();
            expect(stats.totalRevenue).toBe(0);
        });

        it('should calculate revenue correctly for current and last month', async () => {
            // Setup sequential returns for all calls in getFinancialStats
            const findManyMock = prisma.appointment.findMany as jest.Mock;

            findManyMock.mockReset();

            // 1. currentMonthAppts
            findManyMock.mockResolvedValueOnce([
                { id: '1', price: 100, status: 'COMPLETED', scheduledAt: new Date() },
                { id: '2', price: 150, status: 'COMPLETED', scheduledAt: new Date() },
            ]);

            // 2. lastMonthAppts
            findManyMock.mockResolvedValueOnce([
                { id: '3', price: 100, status: 'COMPLETED', scheduledAt: new Date() },
            ]);

            // 3. pendingAppts
            findManyMock.mockResolvedValueOnce([
                { id: '4', price: 200, status: 'SCHEDULED', scheduledAt: new Date() },
            ]);

            // 4-9. monthlyData (6 months loop)
            for (let i = 0; i < 6; i++) {
                findManyMock.mockResolvedValueOnce([
                    { id: `m-${i}`, price: 100, status: 'COMPLETED', scheduledAt: new Date() },
                ]);
            }

            // 10. recentTransactions
            findManyMock.mockResolvedValueOnce([
                {
                    id: 'r1',
                    price: 300,
                    status: 'COMPLETED',
                    scheduledAt: new Date(),
                    patient: { name: 'João Silva', profiles: null }
                }
            ]);

            const stats = await getFinancialStats();

            // Total revenue should be 100 + 150 = 250
            expect(stats.totalRevenue).toBe(250);
            expect(stats.pendingRevenue).toBe(200);
            expect(stats.averageTicket).toBe(125);
            expect(stats.revenueChange).toBe(150); // (250 - 100) / 100 * 100
            expect(stats.monthlyData.length).toBe(6);
            expect(stats.recentTransactions.length).toBe(1);
        });

        it('should handle zero last month revenue for change calculation', async () => {
            (prisma.appointment.findMany as jest.Mock)
                .mockResolvedValueOnce([{ id: '1', price: 100, status: 'COMPLETED' }]) // Current month
                .mockResolvedValueOnce([]) // Last month
                .mockResolvedValueOnce([]) // Pending
                .mockResolvedValue([]); // 6 months

            const stats = await getFinancialStats();
            expect(stats.revenueChange).toBe(0);
        });
    });
});
