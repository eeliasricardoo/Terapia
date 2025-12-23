"use client"

import * as React from "react"
import PhoneInputWithCountry, { type Country } from "react-phone-number-input"
import "react-phone-number-input/style.css"
import { cn } from "@/lib/utils"

interface PhoneInputProps {
  value?: string
  onChange?: (value: string | undefined) => void
  defaultCountry?: Country
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
      <PhoneInputWithCountry
        international
        defaultCountry={defaultCountry}
        value={value as any}
        onChange={onChange as any}
        disabled={disabled}
        className={cn(
          "PhoneInput",
          "flex h-9 w-full rounded-md border border-input bg-transparent shadow-xs transition-colors",
          "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "overflow-hidden"
        )}
        numberInputProps={{
          className: cn(
            "PhoneInputInput",
            "flex-1 h-full rounded-md border-0 bg-transparent px-3 py-1 text-sm",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50"
          ),
          placeholder,
        }}
        countrySelectProps={{
          className: cn(
            "PhoneInputCountrySelect",
            "flex h-full items-center justify-center border-0 bg-transparent px-3 text-sm shrink-0",
            "focus-visible:outline-none"
          ),
        }}
        {...props}
      />
    </div>
  )
}
