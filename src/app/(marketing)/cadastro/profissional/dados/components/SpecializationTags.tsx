"use client"

import { useState } from "react"
import { X, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface SpecializationTagsProps {
  value?: string[]
  onChange?: (tags: string[]) => void
}

const defaultSpecializations = [
  "Terapia Cognitivo-Comportamental",
  "Ansiedad",
  "Depresión",
  "Terapia de Pareja",
  "Terapia Familiar",
  "Psicología Infantil",
  "Neuropsicología",
  "Psicología Clínica",
]

export function SpecializationTags({ value = [], onChange }: SpecializationTagsProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const handleAddCustom = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      const newTags = [...value, inputValue.trim()]
      onChange?.(newTags)
      setInputValue("")
      setOpen(false)
    }
  }

  const handleSelect = (specialization: string) => {
    if (!value.includes(specialization)) {
      const newTags = [...value, specialization]
      onChange?.(newTags)
      setInputValue("")
      // Não fecha o popover para permitir múltiplas seleções
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = value.filter((tag) => tag !== tagToRemove)
    onChange?.(newTags)
  }

  const availableSpecializations = defaultSpecializations.filter(
    (spec) => !value.includes(spec)
  )

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Áreas de Especialización</label>
      <div className="flex flex-wrap items-center gap-2 p-3 border rounded-md bg-muted/30 min-h-[44px]">
        {value.map((tag) => (
          <div
            key={tag}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
          >
            <span>{tag}</span>
            <button
              type="button"
              className="ml-1 hover:opacity-70 transition-opacity"
              onClick={() => handleRemoveTag(tag)}
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
              Agregar especialización
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Buscar o agregar especialización..."
                value={inputValue}
                onValueChange={setInputValue}
              />
              <CommandList>
                <CommandEmpty>
                  {inputValue.trim() && (
                    <div className="py-2 px-2">
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={(e) => {
                          e.preventDefault()
                          handleAddCustom()
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar &quot;{inputValue}&quot;
                      </Button>
                    </div>
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {availableSpecializations
                    .filter((spec) =>
                      spec.toLowerCase().includes(inputValue.toLowerCase())
                    )
                    .map((spec) => (
                      <div
                        key={spec}
                        className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          handleSelect(spec)
                        }}
                        onClick={(e) => {
                          e.preventDefault()
                          handleSelect(spec)
                        }}
                      >
                        {spec}
                      </div>
                    ))}
                  {inputValue.trim() &&
                    !defaultSpecializations.some(
                      (spec) =>
                        spec.toLowerCase() === inputValue.toLowerCase()
                    ) &&
                    !value.includes(inputValue.trim()) && (
                      <div
                        className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          handleAddCustom()
                        }}
                        onClick={(e) => {
                          e.preventDefault()
                          handleAddCustom()
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar &quot;{inputValue}&quot;
                      </div>
                    )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
