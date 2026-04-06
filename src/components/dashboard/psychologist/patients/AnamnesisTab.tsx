'use client'

import { useState, useEffect, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Stethoscope, Save, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { getAnamnesis, updateAnamnesis, type AnamnesisData } from '@/lib/actions/patients'
import { useTranslations } from 'next-intl'

interface AnamnesisTabProps {
  patientId: string
}

export function AnamnesisTab({ patientId }: AnamnesisTabProps) {
  const t = useTranslations('PatientsManager.sheet.anamnesisTab')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [form, setForm] = useState<AnamnesisData>({
    mainComplaint: '',
    familyHistory: '',
    medication: '',
    diagnosticHypothesis: '',
  })

  // Load anamnesis when patient changes
  useEffect(() => {
    if (!patientId) return

    setIsLoading(true)
    setIsSaved(false)

    getAnamnesis(patientId)
      .then((res) => {
        if (res.success && res.data) {
          const data = res.data
          setForm({
            mainComplaint: data.mainComplaint || '',
            familyHistory: data.familyHistory || '',
            medication: data.medication || '',
            diagnosticHypothesis: data.diagnosticHypothesis || '',
          })
        } else {
          // No anamnesis yet or error, reset form
          setForm({
            mainComplaint: '',
            familyHistory: '',
            medication: '',
            diagnosticHypothesis: '',
          })
        }
      })
      .finally(() => setIsLoading(false))
  }, [patientId])

  const handleChange = (field: keyof AnamnesisData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setIsSaved(false)
  }

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateAnamnesis({ patientProfileId: patientId, data: form })
      if (result.success) {
        setIsSaved(true)
        toast.success(t('success'))
      } else {
        toast.error(result.error || t('error'))
      }
    })
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-blue-600" />
          {t('title')}
        </CardTitle>
        <CardDescription>{isLoading ? t('loadingSubtitle') : t('subtitle')}</CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">{t('loadingState')}</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">{t('mainComplaint')}</label>
              <Textarea
                className="bg-slate-50 border-slate-200 focus:bg-white min-h-[80px] resize-none"
                placeholder={t('mainComplaintPlaceholder')}
                value={form.mainComplaint}
                onChange={(e) => handleChange('mainComplaint', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">{t('familyHistory')}</label>
                <Textarea
                  className="bg-slate-50 border-slate-200 focus:bg-white min-h-[100px] resize-none"
                  placeholder={t('familyHistoryPlaceholder')}
                  value={form.familyHistory}
                  onChange={(e) => handleChange('familyHistory', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">{t('medication')}</label>
                <Textarea
                  className="bg-slate-50 border-slate-200 focus:bg-white min-h-[100px] resize-none"
                  placeholder={t('medicationPlaceholder')}
                  value={form.medication}
                  onChange={(e) => handleChange('medication', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {t('diagnosticHypothesis')}
              </label>
              <Input
                className="bg-slate-50 border-slate-200 focus:bg-white"
                placeholder={t('diagnosticHypothesisPlaceholder')}
                value={form.diagnosticHypothesis}
                onChange={(e) => handleChange('diagnosticHypothesis', e.target.value)}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSave}
                disabled={isPending}
                className={`gap-2 transition-all ${
                  isSaved
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('saving')}
                  </>
                ) : isSaved ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    {t('saved')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {t('save')}
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
