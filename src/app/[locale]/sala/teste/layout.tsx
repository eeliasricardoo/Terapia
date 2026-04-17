import { notFound } from 'next/navigation'

export default function TestRoomLayout({ children }: { children: React.ReactNode }) {
  // Test-only route: disabled in production
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }
  return children
}
