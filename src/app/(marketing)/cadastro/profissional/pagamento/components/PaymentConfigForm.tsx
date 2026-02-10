'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

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
];

const ACCOUNT_TYPES = [
  { value: 'savings', label: 'Ahorros' },
  { value: 'checking', label: 'Corriente' },
];

const ID_TYPES = [
  { value: 'nit', label: 'NIT' },
  { value: 'cc', label: 'Cédula de Ciudadanía' },
  { value: 'ce', label: 'Cédula de Extranjería' },
];

export function PaymentConfigForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    bank: '',
    accountNumber: '',
    accountType: '',
    taxIdType: '',
    taxIdNumber: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement API call to save payment configuration

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to success page
      router.push('/cadastro/profissional/sucesso');
    } catch (error) {
      console.error('Error saving payment config:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const isFormValid =
    formData.bank &&
    formData.accountNumber &&
    formData.accountType &&
    formData.taxIdType &&
    formData.taxIdNumber;

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Configuración de Pago</h1>
        <p className="text-muted-foreground">
          Ingresa tus datos bancarios y tributarios de forma segura para recibir los pagos de tus
          consultas. Tu información está protegida con encriptación de punta a punta.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banking Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Bancaria para Pagos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Bank */}
            <div className="space-y-2">
              <Label htmlFor="bank">
                Banco <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.bank} onValueChange={(value) => handleInputChange('bank', value)}>
                <SelectTrigger id="bank">
                  <SelectValue placeholder="Selecciona tu banco" />
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
                  Número de Cuenta <span className="text-destructive">*</span>
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
                  Tipo de Cuenta <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.accountType}
                  onValueChange={(value) => handleInputChange('accountType', value)}
                >
                  <SelectTrigger id="accountType">
                    <SelectValue placeholder="Selecciona un tipo" />
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
            <CardTitle>Información Tributaria</CardTitle>
            <CardDescription>
              Este número es necesario para la facturación y relaciones.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="taxIdType">
                  Tipo de Identificación <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.taxIdType}
                  onValueChange={(value) => handleInputChange('taxIdType', value)}
                >
                  <SelectTrigger id="taxIdType">
                    <SelectValue placeholder="Selecciona un tipo" />
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
                  Número de Identificación Tributaria (NIT / Cédula){' '}
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="taxIdNumber"
                    type="text"
                    placeholder="Ingresa tu número"
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
            Cancelar
          </Button>
          <Button type="submit" disabled={!isFormValid || isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
}

