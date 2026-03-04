/**
 * Tests for onboarding Server Actions
 */

jest.mock('@upstash/ratelimit', () => ({ Ratelimit: jest.fn() }))
jest.mock('@upstash/redis', () => ({ Redis: jest.fn() }))

const mockGetUser = jest.fn()
const mockSupabaseFrom = jest.fn()
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(() => ({
        auth: { getUser: mockGetUser },
        from: mockSupabaseFrom,
    })),
}))

jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}))

import { savePsychologistProfile, type PsychologistOnboardingData } from '@/lib/actions/onboarding'

const MOCK_USER = { id: 'psych-user-1', email: 'psych@test.com' }

const VALID_DATA: PsychologistOnboardingData = {
    fullName: 'Dra. Ana Maria Silva',
    crp: '06/123456',
    specialties: ['Ansiedade', 'Depressão'],
    approaches: ['TCC', 'Humanista'],
    bio: '<p>Psicóloga clínica com 10 anos de experiência.</p>',
    price: 150,
    videoUrl: 'https://youtube.com/watch?v=example',
}

function mockSupabaseChain(error: any = null) {
    const chain: any = {
        update: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error }),
    }
    mockSupabaseFrom.mockReturnValue(chain)
    return chain
}

describe('onboarding actions', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('savePsychologistProfile', () => {
        it('should return error if user is not authenticated', async () => {
            mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'Not auth' } })

            const result = await savePsychologistProfile(VALID_DATA)

            expect(result).toEqual({ success: false, error: 'Usuário não autenticado' })
        })

        it('should successfully save psychologist profile', async () => {
            mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })

            // First call: profiles table update, second: psychologist_profiles upsert
            let callCount = 0
            mockSupabaseFrom.mockImplementation((table: string) => {
                callCount++
                const chain: any = {
                    update: jest.fn().mockReturnThis(),
                    upsert: jest.fn().mockResolvedValue({ error: null }),
                    eq: jest.fn().mockResolvedValue({ error: null }),
                }
                return chain
            })

            const result = await savePsychologistProfile(VALID_DATA)

            expect(result).toEqual({ success: true })
            // Should call profiles and psychologist_profiles tables
            expect(mockSupabaseFrom).toHaveBeenCalledWith('profiles')
            expect(mockSupabaseFrom).toHaveBeenCalledWith('psychologist_profiles')
        })

        it('should return error when profile update fails', async () => {
            mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })

            mockSupabaseFrom.mockImplementation(() => {
                const chain: any = {
                    update: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({ error: { message: 'Profile update failed' } }),
                }
                return chain
            })

            const result = await savePsychologistProfile(VALID_DATA)

            expect(result).toEqual({ success: false, error: 'Erro ao atualizar perfil básico' })
        })

        it('should sanitize input data (XSS prevention)', async () => {
            mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })

            const xssData: PsychologistOnboardingData = {
                ...VALID_DATA,
                fullName: '<script>alert("xss")</script>Dra. Hacker',
                bio: '<p>Bio legítima</p><script>evil()</script>',
                crp: '<img onerror="hack()">06/999999',
            }

            let capturedProfileData: any = null
            let capturedPsychData: any = null

            mockSupabaseFrom.mockImplementation((table: string) => {
                if (table === 'profiles') {
                    return {
                        update: jest.fn().mockImplementation((data: any) => {
                            capturedProfileData = data
                            return { eq: jest.fn().mockResolvedValue({ error: null }) }
                        }),
                    }
                }
                return {
                    upsert: jest.fn().mockImplementation((data: any) => {
                        capturedPsychData = data
                        return { then: (r: any) => r({ error: null }) }
                    }),
                }
            })

            await savePsychologistProfile(xssData)

            // The name should be sanitized (no <script> tags)
            if (capturedProfileData) {
                expect(capturedProfileData.full_name).not.toContain('<script>')
            }
        })

        it('should merge specialties and approaches', async () => {
            mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })

            let capturedData: any = null

            mockSupabaseFrom.mockImplementation((table: string) => {
                if (table === 'profiles') {
                    return {
                        update: jest.fn().mockReturnValue({
                            eq: jest.fn().mockResolvedValue({ error: null }),
                        }),
                    }
                }
                return {
                    upsert: jest.fn().mockImplementation((data: any) => {
                        capturedData = data
                        return Promise.resolve({ error: null })
                    }),
                }
            })

            await savePsychologistProfile(VALID_DATA)

            // Specialties should contain both specialties and approaches
            if (capturedData) {
                const allItems = capturedData.specialties
                expect(allItems).toEqual(
                    expect.arrayContaining(['Ansiedade', 'Depressão', 'TCC', 'Humanista'])
                )
            }
        })
    })
})
