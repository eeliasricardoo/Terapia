import { test as base, expect } from '@playwright/test'
import path from 'path'

export const PATIENT_AUTH_FILE = path.join(__dirname, 'patient-auth.json')
export const PSYCHOLOGIST_AUTH_FILE = path.join(__dirname, 'psychologist-auth.json')

/**
 * Use this in tests that require a logged-in PATIENT:
 *   import { patientTest as test, expect } from '../fixtures/auth'
 */
export const patientTest = base.extend({
  storageState: PATIENT_AUTH_FILE,
})

/**
 * Use this in tests that require a logged-in PSYCHOLOGIST:
 *   import { psychologistTest as test, expect } from '../fixtures/auth'
 */
export const psychologistTest = base.extend({
  storageState: PSYCHOLOGIST_AUTH_FILE,
})

export { expect }
