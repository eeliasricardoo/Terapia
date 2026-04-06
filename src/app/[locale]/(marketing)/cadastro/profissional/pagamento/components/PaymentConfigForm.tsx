'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { savePaymentConfig } from '@/lib/actions/professional-onboarding'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock } from 'lucide-react'

const BANKS = [
  'Bancolombia',
  'Banco de Bogotá',
  'Davivienda',
  'BBVA',
  'Banco Popular',
  'Banco Caja Social',
  'Banco de Occidente',
  'Banco AV Villas',
  'Colpatria',
  'Itaú',
  'Scotiabank Colpatria',
  'Banco Agrario',
  'Banco Falabella',
  'Banco Pichincha',
  'Banco Cooperativo Coopcentral',
]

const ACCOUNT_TYPES = [
  { value: 'savings', label: 'Ahorros' },
  { value: 'checking', label: 'Corriente' },
]

const ID_TYPES = [
  { value: 'nit', label: 'NIT' },
  { value: 'cc', label: 'Cédula de Ciudadanía' },
  { value: 'ce', label: 'Cédula de Extranjería' },
]

export function PaymentConfigForm() {
  const t = useTranslations('Onboarding.professional.payment')
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    bank: '',
    accountNumber: '',
    accountType: '',
    taxIdType: '',
    taxIdNumber: '',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await savePaymentConfig({
        bank: formData.bank,
        accountNumber: formData.accountNumber,
        accountType: formData.accountType,
        taxIdType: formData.taxIdType,
        taxIdNumber: formData.taxIdNumber,
      })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success(t('success'))
      router.push('/cadastro/profissional/sucesso')
    } catch (error) {
      console.error('Error saving payment config:', error)
      toast.error(t('error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  const isFormValid =
    formData.bank &&
    formData.accountNumber &&
    formData.accountType &&
    formData.taxIdType &&
    formData.taxIdNumber

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banking Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('bankHeader')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Bank */}
            <div className="space-y-2">
              <Label htmlFor="bank">
                {t('bank')} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.bank}
                onValueChange={(value) => handleInputChange('bank', value)}
              >
                <SelectTrigger id="bank">
                  <SelectValue placeholder={t('bankPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {BANKS.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Account Number and Type */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">
                  {t('accountNumber')} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="accountNumber"
                    type="text"
                    placeholder="000-0000000-00"
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                    maxLength={20}
                  />
                  <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountType">
                  {t('accountType')} <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.accountType}
                  onValueChange={(value) => handleInputChange('accountType', value)}
                >
                  <SelectTrigger id="accountType">
                    <SelectValue placeholder={t('accountPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('taxHeader')}</CardTitle>
            <CardDescription>{t('taxDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="taxIdType">
                  {t('idType')} <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.taxIdType}
                  onValueChange={(value) => handleInputChange('taxIdType', value)}
                >
                  <SelectTrigger id="taxIdType">
                    <SelectValue placeholder={t('idPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {ID_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxIdNumber">
                  {t('taxId')} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="taxIdNumber"
                    type="text"
                    placeholder={t('taxIdPlaceholder')}
                    value={formData.taxIdNumber}
                    onChange={(e) => handleInputChange('taxIdNumber', e.target.value)}
                    maxLength={15}
                  />
                  <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={!isFormValid || isSubmitting}>
            {isSubmitting ? t('saving') : t('save')}
          </Button>
        </div>
      </form>
    </div>
  )
}
