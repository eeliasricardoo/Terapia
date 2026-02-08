"use client"

import * as React from "react"
import { cn } from "@/lib/utils"


import PhoneInput2 from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"

interface PhoneInputProps {
  value?: string
  onChange?: (value: string | undefined) => void
  defaultCountry?: string
  className?: string
  placeholder?: string
  disabled?: boolean
}

export function PhoneInput({
  value,
  onChange,
  defaultCountry = "BR",
  className,
  placeholder,
  disabled,
  ...props
}: PhoneInputProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <PhoneInput2
        country={defaultCountry.toLowerCase()}
        value={value}
        onChange={(phone: string) => {
          if (phone) {
            onChange?.(`+${phone}`)
          } else {
            onChange?.(undefined)
          }
        }}
        disabled={disabled}
        placeholder={placeholder}
        enableSearch
        disableSearchIcon
        searchPlaceholder="Buscar país..."
        containerClass="!w-full !h-full"
        inputClass="!w-full !h-full !text-sm !bg-transparent !border-input !rounded-md placeholder:!text-muted-foreground focus:!ring-2 focus:!ring-ring focus:!ring-offset-2 focus:!border-transparent"
        buttonClass="!bg-transparent !border-r !border-input !rounded-l-md hover:!bg-accent/50 !px-1"
        dropdownClass="!bg-popover !text-popover-foreground !border !border-border !rounded-md !shadow-md !mt-1 !z-50"
        inputStyle={{
          width: '100%',
          height: '100%',
          fontSize: '14px',
          paddingLeft: '48px',
          backgroundColor: 'transparent',
          borderColor: 'hsl(var(--input))',
          borderRadius: 'calc(var(--radius) - 2px)',
        }}
        buttonStyle={{
          backgroundColor: 'transparent',
          borderColor: 'hsl(var(--input))',
          borderRight: '1px solid hsl(var(--input))',
          borderTopLeftRadius: 'calc(var(--radius) - 2px)',
          borderBottomLeftRadius: 'calc(var(--radius) - 2px)',
        }}
        dropdownStyle={{
          backgroundColor: 'hsl(var(--popover))',
          color: 'hsl(var(--popover-foreground))',
          borderColor: 'hsl(var(--border))',
        }}
        {...props}
      />
    </div>
  )
}
