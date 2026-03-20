import { formatInTimeZone, getTimeZoneLabel, DEFAULT_TIMEZONE } from '../lib/date-utils'

describe('date-utils', () => {
  describe('formatInTimeZone', () => {
    it('should format a date correctly for Sao Paulo by default', () => {
      // 2024-01-01 12:00:00 UTC
      const date = new Date('2024-01-01T12:00:00Z')
      const formatted = formatInTimeZone(date)

      // Sao Paulo is usually UTC-3 (09:00) during this period
      expect(formatted).toMatch(/01\/01\/2024, 09:00/)
    })

    it('should format a date correctly for a specific timezone', () => {
      const date = new Date('2024-01-01T12:00:00Z')
      const formatted = formatInTimeZone(date, 'UTC')

      expect(formatted).toMatch(/01\/01\/2024, 12:00/)
    })

    it('should fallback to toLocaleString on error', () => {
      const date = new Date('2024-01-01T12:00:00Z')
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()

      // Testing behavior with an invalid timezone
      const formatted = formatInTimeZone(date, 'Invalid/Timezone')

      // Logger may call console.error (in dev) or console.log (in prod/test)
      expect(
        consoleErrorSpy.mock.calls.length + consoleLogSpy.mock.calls.length
      ).toBeGreaterThanOrEqual(1)
      expect(formatted).toBeDefined()

      consoleErrorSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })
  })

  describe('getTimeZoneLabel', () => {
    it('should return a label for the default timezone', () => {
      const label = getTimeZoneLabel()
      expect(label).toMatch(/GMT-03:00|UTC-03:00|GMT-3|UTC-3/i)
    })

    it('should return a label for a specific timezone', () => {
      const label = getTimeZoneLabel('UTC')
      expect(label).toMatch(/GMT|UTC/i)
    })

    it('should return the timezone name if label lookup fails', () => {
      const label = getTimeZoneLabel('Invalid/Zone')
      expect(label).toBe('Invalid/Zone')
    })
  })
})
