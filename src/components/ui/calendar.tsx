'use client'

import * as React from 'react'
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { DayPicker } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: 'ghost' | 'outline' | 'default' | 'link' | 'secondary' | 'destructive'
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,

  captionLayout = 'label' as any,
  buttonVariant = 'ghost',
  formatters,
  components,
  ...props
}: CalendarProps & { captionLayout?: string; buttonVariant?: string }) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        'bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout as any}
      formatters={formatters}
      classNames={{
        root: cn('w-fit'),
        months: cn('flex gap-4 flex-col md:flex-row relative'),
        month: cn('flex flex-col w-full gap-4'),
        nav: cn('flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between'),
        nav_button_previous: cn(
          buttonVariants({ variant: buttonVariant as 'ghost' }),
          'size-(--cell-size) aria-disabled:opacity-50 p-0 select-none'
        ),
        nav_button_next: cn(
          buttonVariants({ variant: buttonVariant as 'ghost' }),
          'size-(--cell-size) aria-disabled:opacity-50 p-0 select-none'
        ),
        caption: cn('flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)'),
        vhidden: cn('hidden'),
        caption_label: cn('select-none font-medium text-sm'),
        table: 'w-full border-collapse',
        head_row: cn('flex'),
        head_cell: cn(
          'text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none'
        ),
        row: cn('flex w-full mt-2'),
        cell: cn('relative w-full h-full p-0 text-center aspect-square select-none'),
        day: cn(buttonVariants({ variant: 'ghost' }), 'size-(--cell-size) p-0 font-normal'),
        day_selected: cn(
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground'
        ),
        day_today: cn('bg-accent text-accent-foreground'),
        day_outside: cn('text-muted-foreground opacity-50 aria-selected:text-muted-foreground'),
        day_disabled: cn('text-muted-foreground opacity-50'),
        day_range_middle: cn('aria-selected:bg-accent aria-selected:text-accent-foreground'),
        day_hidden: cn('invisible'),
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...iconProps }) => <ChevronLeftIcon className="size-4" {...iconProps} />,
        IconRight: ({ ...iconProps }) => <ChevronRightIcon className="size-4" {...iconProps} />,
        ...components,
      }}
      {...props}
    />
  )
}

export { Calendar }
