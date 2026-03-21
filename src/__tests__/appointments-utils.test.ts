/**
 * Tests for checkAppointmentConflict (appointments-utils.ts)
 *
 * Business Rule: A psychologist and a patient can NEVER have two appointments
 * at the same time. This suite exhaustively tests the overlap detection logic.
 */

jest.mock('@/lib/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}))

const mockPrismaFindMany = jest.fn()
jest.mock('@/lib/prisma', () => ({
  prisma: {
    appointment: {
      findMany: (...args: any[]) => mockPrismaFindMany(...args),
    },
  },
}))

import { checkAppointmentConflict } from '@/lib/actions/appointments-utils'

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Build a DB appointment fixture. startISO is the scheduled_at time. */
function makeAppt(
  id: string,
  psychologistId: string,
  patientId: string,
  startISO: string,
  durationMinutes = 50
) {
  return {
    id,
    psychologistId,
    patientId,
    scheduledAt: new Date(startISO),
    durationMinutes,
    status: 'SCHEDULED',
  }
}

const PSYCH_ID = 'psych-profile-1'
const PATIENT_ID = 'patient-user-1'

// ─── tests ───────────────────────────────────────────────────────────────────

describe('checkAppointmentConflict', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ── No conflict ──────────────────────────────────────────────────────────

  it('should return no conflict when there are no existing appointments', async () => {
    mockPrismaFindMany.mockResolvedValue([])

    const result = await checkAppointmentConflict({
      psychologistProfileId: PSYCH_ID,
      patientId: PATIENT_ID,
      scheduledAt: new Date('2024-06-01T10:00:00Z'),
      durationMinutes: 50,
    })

    expect(result.hasConflict).toBe(false)
  })

  it('should return no conflict for adjacent sessions (end of one = start of next)', async () => {
    // Existing: 10:00 – 10:50. New request: 10:50 – 11:40.  No overlap.
    mockPrismaFindMany.mockResolvedValue([
      makeAppt('appt-1', PSYCH_ID, 'other-patient', '2024-06-01T10:00:00Z', 50),
    ])

    const result = await checkAppointmentConflict({
      psychologistProfileId: PSYCH_ID,
      patientId: PATIENT_ID,
      scheduledAt: new Date('2024-06-01T10:50:00Z'), // starts exactly when previous ends
      durationMinutes: 50,
    })

    expect(result.hasConflict).toBe(false)
  })

  it('should return no conflict when new session ends exactly when existing one starts', async () => {
    // Existing: 11:00 – 11:50. New request: 10:10 – 11:00.  Adjacent, no overlap.
    mockPrismaFindMany.mockResolvedValue([
      makeAppt('appt-1', PSYCH_ID, 'other-patient', '2024-06-01T11:00:00Z', 50),
    ])

    const result = await checkAppointmentConflict({
      psychologistProfileId: PSYCH_ID,
      patientId: PATIENT_ID,
      scheduledAt: new Date('2024-06-01T10:10:00Z'),
      durationMinutes: 50, // ends at 11:00 exactly
    })

    expect(result.hasConflict).toBe(false)
  })

  // ── Psychologist conflicts ───────────────────────────────────────────────

  it('should detect conflict when new session starts at the exact same time as existing (psychologist)', async () => {
    mockPrismaFindMany.mockResolvedValue([
      makeAppt('appt-1', PSYCH_ID, 'other-patient', '2024-06-01T10:00:00Z', 50),
    ])

    const result = await checkAppointmentConflict({
      psychologistProfileId: PSYCH_ID,
      patientId: PATIENT_ID,
      scheduledAt: new Date('2024-06-01T10:00:00Z'),
      durationMinutes: 50,
    })

    expect(result.hasConflict).toBe(true)
    expect(result.type).toBe('psychologist')
    expect(result.conflictingWith).toBe('appt-1')
  })

  it('should detect conflict when new session starts during existing session (psychologist)', async () => {
    // Existing: 10:00 – 10:50. New: 10:25 – 11:15.  Overlaps.
    mockPrismaFindMany.mockResolvedValue([
      makeAppt('appt-1', PSYCH_ID, 'other-patient', '2024-06-01T10:00:00Z', 50),
    ])

    const result = await checkAppointmentConflict({
      psychologistProfileId: PSYCH_ID,
      patientId: PATIENT_ID,
      scheduledAt: new Date('2024-06-01T10:25:00Z'),
      durationMinutes: 50,
    })

    expect(result.hasConflict).toBe(true)
    expect(result.type).toBe('psychologist')
  })

  it('should detect conflict when new session ends during existing session (psychologist)', async () => {
    // Existing: 10:00 – 10:50. New: 09:20 – 10:10. Overlaps by 10 min.
    mockPrismaFindMany.mockResolvedValue([
      makeAppt('appt-1', PSYCH_ID, 'other-patient', '2024-06-01T10:00:00Z', 50),
    ])

    const result = await checkAppointmentConflict({
      psychologistProfileId: PSYCH_ID,
      patientId: PATIENT_ID,
      scheduledAt: new Date('2024-06-01T09:20:00Z'),
      durationMinutes: 50,
    })

    expect(result.hasConflict).toBe(true)
    expect(result.type).toBe('psychologist')
  })

  it('should detect conflict when new session completely spans over existing session (psychologist)', async () => {
    // Existing: 10:00 – 10:50. New: 09:00 – 12:00. Contains existing.
    mockPrismaFindMany.mockResolvedValue([
      makeAppt('appt-1', PSYCH_ID, 'other-patient', '2024-06-01T10:00:00Z', 50),
    ])

    const result = await checkAppointmentConflict({
      psychologistProfileId: PSYCH_ID,
      patientId: PATIENT_ID,
      scheduledAt: new Date('2024-06-01T09:00:00Z'),
      durationMinutes: 180,
    })

    expect(result.hasConflict).toBe(true)
    expect(result.type).toBe('psychologist')
  })

  // ── Patient conflicts ────────────────────────────────────────────────────

  it('should detect conflict when patient already has a session at the same time', async () => {
    // Patient booked with a different psychologist at 10:00
    mockPrismaFindMany.mockResolvedValue([
      makeAppt('appt-1', 'other-psych-profile', PATIENT_ID, '2024-06-01T10:00:00Z', 50),
    ])

    const result = await checkAppointmentConflict({
      psychologistProfileId: PSYCH_ID,
      patientId: PATIENT_ID,
      scheduledAt: new Date('2024-06-01T10:00:00Z'),
      durationMinutes: 50,
    })

    expect(result.hasConflict).toBe(true)
    expect(result.type).toBe('patient')
    expect(result.conflictingWith).toBe('appt-1')
  })

  it('should detect patient conflict when sessions partially overlap', async () => {
    // Patient existing: 10:00 – 10:50. New request: 10:30 – 11:20. Overlaps.
    mockPrismaFindMany.mockResolvedValue([
      makeAppt('appt-1', 'other-psych-profile', PATIENT_ID, '2024-06-01T10:00:00Z', 50),
    ])

    const result = await checkAppointmentConflict({
      psychologistProfileId: PSYCH_ID,
      patientId: PATIENT_ID,
      scheduledAt: new Date('2024-06-01T10:30:00Z'),
      durationMinutes: 50,
    })

    expect(result.hasConflict).toBe(true)
    expect(result.type).toBe('patient')
  })

  // ── Canceled appointments must be ignored ────────────────────────────────

  it('should NOT flag a conflict for a CANCELED appointment', async () => {
    // CANCELED appointments should never block new bookings
    mockPrismaFindMany.mockResolvedValue([]) // DB already filters CANCELED via status != CANCELED

    const result = await checkAppointmentConflict({
      psychologistProfileId: PSYCH_ID,
      patientId: PATIENT_ID,
      scheduledAt: new Date('2024-06-01T10:00:00Z'),
      durationMinutes: 50,
    })

    expect(result.hasConflict).toBe(false)
    // Verify that the Prisma query excludes CANCELED status
    expect(mockPrismaFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { not: 'CANCELED' },
        }),
      })
    )
  })

  // ── excludeAppointmentId (rescheduling) ──────────────────────────────────

  it('should not conflict with the appointment being rescheduled (excludeAppointmentId)', async () => {
    // Session appt-1 is being rescheduled. It should not conflict with itself.
    mockPrismaFindMany.mockResolvedValue([]) // DB excludes the appointment being rescheduled

    const result = await checkAppointmentConflict({
      psychologistProfileId: PSYCH_ID,
      patientId: PATIENT_ID,
      scheduledAt: new Date('2024-06-01T10:00:00Z'),
      durationMinutes: 50,
      excludeAppointmentId: 'appt-1',
    })

    expect(result.hasConflict).toBe(false)
    // Verify the exclusion is passed to Prisma
    expect(mockPrismaFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { not: 'appt-1' },
        }),
      })
    )
  })

  it('should still detect OTHER conflicts even when excludeAppointmentId is set', async () => {
    // Rescheduling appt-1, but appt-2 (different) conflicts with the new slot
    mockPrismaFindMany.mockResolvedValue([
      makeAppt('appt-2', PSYCH_ID, 'other-patient', '2024-06-01T10:00:00Z', 50),
    ])

    const result = await checkAppointmentConflict({
      psychologistProfileId: PSYCH_ID,
      patientId: PATIENT_ID,
      scheduledAt: new Date('2024-06-01T10:00:00Z'),
      durationMinutes: 50,
      excludeAppointmentId: 'appt-1',
    })

    expect(result.hasConflict).toBe(true)
    expect(result.conflictingWith).toBe('appt-2')
  })

  // ── No patientId (only psychologist checked) ─────────────────────────────

  it('should only check psychologist when patientId is not provided', async () => {
    mockPrismaFindMany.mockResolvedValue([])

    await checkAppointmentConflict({
      psychologistProfileId: PSYCH_ID,
      scheduledAt: new Date('2024-06-01T10:00:00Z'),
      durationMinutes: 50,
    })

    const callArgs = mockPrismaFindMany.mock.calls[0][0]
    // OR should only contain the psychologist condition (patient condition omitted)
    const orConditions = callArgs.where.OR
    expect(orConditions).toHaveLength(1)
    expect(orConditions[0]).toEqual({ psychologistId: PSYCH_ID })
  })

  // ── PENDING_PAYMENT is treated as active (blocks new bookings) ───────────

  it('should detect conflict with a PENDING_PAYMENT appointment', async () => {
    // A slot held during payment checkout must block new bookings
    mockPrismaFindMany.mockResolvedValue([
      {
        ...makeAppt('appt-pending', PSYCH_ID, 'paying-patient', '2024-06-01T10:00:00Z', 50),
        status: 'PENDING_PAYMENT',
      },
    ])

    const result = await checkAppointmentConflict({
      psychologistProfileId: PSYCH_ID,
      patientId: PATIENT_ID,
      scheduledAt: new Date('2024-06-01T10:00:00Z'),
      durationMinutes: 50,
    })

    expect(result.hasConflict).toBe(true)
  })

  // ── DB errors are re-thrown (fail-safe) ──────────────────────────────────

  it('should re-throw database errors so callers can fail safely', async () => {
    mockPrismaFindMany.mockRejectedValue(new Error('Connection lost'))

    await expect(
      checkAppointmentConflict({
        psychologistProfileId: PSYCH_ID,
        patientId: PATIENT_ID,
        scheduledAt: new Date('2024-06-01T10:00:00Z'),
        durationMinutes: 50,
      })
    ).rejects.toThrow('Connection lost')
  })

  // ── Prisma query window ──────────────────────────────────────────────────

  it('should query appointments within a ±6 hour window around the requested slot', async () => {
    mockPrismaFindMany.mockResolvedValue([])
    const requestedAt = new Date('2024-06-01T10:00:00Z')

    await checkAppointmentConflict({
      psychologistProfileId: PSYCH_ID,
      patientId: PATIENT_ID,
      scheduledAt: requestedAt,
      durationMinutes: 50,
    })

    const callArgs = mockPrismaFindMany.mock.calls[0][0]
    const windowStart = callArgs.where.scheduledAt.gte
    const windowEnd = callArgs.where.scheduledAt.lte

    const expectedWindowStart = new Date(requestedAt.getTime() - 6 * 60 * 60 * 1000)
    const expectedWindowEnd = new Date(requestedAt.getTime() + 6 * 60 * 60 * 1000)

    expect(windowStart.getTime()).toBe(expectedWindowStart.getTime())
    expect(windowEnd.getTime()).toBe(expectedWindowEnd.getTime())
  })
})
