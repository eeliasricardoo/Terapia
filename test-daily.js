// Test script to check Daily.co version and available methods
const DailyIframe = require('@daily-co/daily-js')
console.log('Daily.co version:', DailyIframe.version)
const call = DailyIframe.createCallObject()
console.log(
  'Available methods:',
  Object.getOwnPropertyNames(Object.getPrototypeOf(call))
    .filter((m) => typeof call[m] === 'function')
    .sort()
)
call.destroy()
