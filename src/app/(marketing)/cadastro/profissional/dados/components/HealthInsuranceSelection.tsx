'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { getHealthInsurances } from '@/lib/actions/health-insurance'

interface HealthInsuranceSelectionProps {
  value?: string[] // IDs of health insurances
  onChange?: (ids: string[]) => void
}

export function HealthInsuranceSelection({ value = [], onChange }: HealthInsuranceSelectionProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [insurances, setInsurances] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInsurances() {
      const result = await getHealthInsurances()
      if (result.success && result.data) {
        setInsurances(result.data)
      }
      setLoading(false)
    }
    fetchInsurances()
  }, [])

  const handleSelect = (id: string) => {
    if (!value.includes(id)) {
      const newIds = [...value, id]
      onChange?.(newIds)
    }
  }

  const handleRemove = (idToRemove: string) => {
    const newIds = value.filter((id) => id !== idToRemove)
    onChange?.(newIds)
  }

  const selectedInsurances = insurances.filter((ins) => value.includes(ins.id))
  const availableInsurances = insurances.filter((ins) => !value.includes(ins.id))

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Planos de Saúde Aceitos</label>
      <div className="flex flex-wrap items-center gap-2 p-3 border rounded-md bg-muted/30 min-h-[44px]">
        {selectedInsurances.map((ins) => (
          <div
            key={ins.id}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-pink-100 text-pink-700 rounded-full text-sm"
          >
            <span>{ins.name}</span>
            <button
              type="button"
              className="ml-1 hover:opacity-70 transition-opacity"
              onClick={() => handleRemove(ins.id)}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar plano
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[300px] p-0"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Command>
              <CommandInput
                placeholder="Buscar plano de saúde..."
                value={inputValue}
                onValueChange={setInputValue}
              />
              <CommandList>
                <CommandEmpty>Nenhum plano encontrado.</CommandEmpty>
                <CommandGroup>
                  {availableInsurances
                    .filter((ins) => ins.name.toLowerCase().includes(inputValue.toLowerCase()))
                    .map((ins) => (
                      <CommandItem
                        key={ins.id}
                        onSelect={() => {
                          handleSelect(ins.id)
                          setInputValue('')
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            value.includes(ins.id) ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {ins.name}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <p className="text-xs text-muted-foreground">
        Selecione os planos de saúde que você aceita em seus atendimentos.
      </p>
    </div>
  )
}
