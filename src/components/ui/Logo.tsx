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
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="relative flex-shrink-0" style={{ width: iconSize, height: iconSize }}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transition-transform duration-500 hover:rotate-12"
        >
          {/* Butterfly Wing - Top Left (Teal) */}
          <path
            d="M50 45 C25 45, 25 15, 50 15"
            stroke="hsl(var(--sentirz-teal))"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.8"
          />
          {/* Butterfly Wing - Bottom Left (Orange) */}
          <path
            d="M50 55 C25 55, 25 85, 50 85"
            stroke="hsl(var(--sentirz-orange))"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.8"
          />
          {/* Butterfly Wing - Top Right (Green) */}
          <path
            d="M50 45 C75 45, 75 15, 50 15"
            stroke="hsl(var(--sentirz-green))"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.8"
          />
          {/* Butterfly Wing - Bottom Right (Green) */}
          <path
            d="M50 55 C75 55, 75 85, 50 85"
            stroke="hsl(var(--sentirz-green))"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Stylized 'S' in center */}
          {/* Top curve of S - Orange */}
          <path
            d="M60 30 C60 22, 40 22, 40 38 C40 45, 60 48, 60 55"
            stroke="hsl(var(--sentirz-orange))"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Bottom curve of S - Teal */}
          <path
            d="M60 55 C60 62, 40 65, 40 70 C40 78, 60 78, 60 70"
            stroke="hsl(var(--sentirz-teal))"
            strokeWidth="10"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && !iconOnly && (
        <div className="flex flex-col leading-tight">
          <span className={`font-extrabold tracking-tight text-primary ${textSize}`}>Sentirz</span>
          <span className={`font-semibold text-primary/90 tracking-wide uppercase ${subtitleSize}`}>
            Terapia Online
          </span>
        </div>
      )}
    </div>
  )
}
