import React from 'react'
import { BRAND_NAME } from '@/lib/constants/branding'

interface LogoProps {
  className?: string
  showText?: boolean
  iconOnly?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  showText = true,
  iconOnly = false,
  size = 'md',
}) => {
  const sizeMap = {
    sm: { icon: 32, text: 'text-lg', subtitle: 'text-[8px]' },
    md: { icon: 48, text: 'text-2xl', subtitle: 'text-[10px]' },
    lg: { icon: 64, text: 'text-4xl', subtitle: 'text-[12px]' },
    xl: { icon: 96, text: 'text-5xl', subtitle: 'text-[14px]' },
  }

  const { icon: iconSize, text: textSize, subtitle: subtitleSize } = sizeMap[size]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex-shrink-0" style={{ width: iconSize, height: iconSize }}>
        <img
          src="/llogo-removebg-preview.png"
          alt={BRAND_NAME}
          className="w-full h-full object-contain transition-transform duration-500 hover:rotate-6"
        />
      </div>

      {showText && !iconOnly && (
        <div className="flex flex-col -space-y-0.5">
          <span className={`font-heading font-black tracking-tight text-[#3b6b6b] ${textSize}`}>
            {BRAND_NAME}
          </span>
          <span
            className={`font-sans font-medium text-[#3b6b6b]/80 tracking-tight ${subtitleSize} opacity-90`}
          >
            Plataforma de terapia online
          </span>
        </div>
      )}
    </div>
  )
}
