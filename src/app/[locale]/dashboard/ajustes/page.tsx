import { SettingsManager } from '@/components/dashboard/psychologist/settings/SettingsManager'
import { getNotificationSettings } from '@/lib/actions/settings'

export default async function AjustesPage() {
  const res = await getNotificationSettings()
  const initialSettings = res.success ? res.data : null

  return (
    <div className="container py-8">
      <SettingsManager initialSettings={initialSettings} />
    </div>
  )
}
