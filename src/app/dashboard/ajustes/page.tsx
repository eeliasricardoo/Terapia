import { SettingsManager } from '@/components/dashboard/psychologist/settings/SettingsManager'
import { getNotificationSettings } from '@/lib/actions/settings'

export default async function AjustesPage() {
  const initialSettings = await getNotificationSettings()

  return (
    <div className="container py-8">
      <SettingsManager initialSettings={initialSettings} />
    </div>
  )
}
