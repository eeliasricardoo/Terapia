/**
 * Resilience Benchmarking Script
 *
 * This script simulates concurrent booking attempts for the same time slot
 * to validate the Soft Lock and Transactional logic under high pressure.
 *
 * Usage: ts-node scripts/benchmarking-resilience.ts
 */

import { prisma } from '../src/lib/prisma'
import { createStripeCheckoutSession } from '../src/lib/actions/stripe'
import { logger } from '../src/lib/utils/logger'

async function runBenchmark() {
  const PSY_ID = 'your-test-psych-id' // Replace with a valid ID from your DB
  const PATIENT_ID = 'your-test-patient-id'
  const SLOT = '2026-05-10T14:00:00Z'

  console.log('🚀 Starting Concurrent Booking Benchmark...')

  const attempts = 20
  const promises = []

  for (let i = 0; i < attempts; i++) {
    // We simulate multiple users trying to book at the exact same millisecond
    promises.push(
      createStripeCheckoutSession({
        psychologistId: PSY_ID,
        scheduledAt: SLOT,
        durationMinutes: 50,
        couponCode: '',
      })
    )
  }

  const results = await Promise.allSettled(promises)

  const succeeded = results.filter(
    (r) => r.status === 'fulfilled' && (r.value as any).success
  ).length
  const failed = results.filter((r) => r.status === 'rejected' || !(r.value as any).success).length

  console.log('------------------------------------')
  console.log(`Benchmark Finished for ${attempts} concurrent attempts:`)
  console.log(`✅ Succeeded (Should be 1): ${succeeded}`)
  console.log(`❌ Failed (Should be ${attempts - 1}): ${failed}`)
  console.log('------------------------------------')

  if (succeeded > 1) {
    console.error('🔴 CRITICAL FAILURE: DOUBLE BOOKING DETECTED!')
    process.exit(1)
  } else {
    console.log('🟢 SUCCESS: Soft locks prevented race conditions.')
  }
}

// runBenchmark().then(() => process.exit(0))
