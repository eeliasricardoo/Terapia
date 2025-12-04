"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label" as any,
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: any) {
  // const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout as any}
      formatters={{
        formatMonthDropdown: (date: Date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit"),
        months: cn(
          "flex gap-4 flex-col md:flex-row relative"
        ),
        month: cn("flex flex-col w-full gap-4"),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between"
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none"
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none"
        ),
        month_caption: cn(
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)"
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5"
        ),
        dropdown_root: cn(
          "relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md"
        ),
        dropdown: cn(
          "absolute bg-popover inset-0 opacity-0"
        ),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label"
            ? "text-sm"
            : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5"
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex"),
        weekday: cn(
          "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none"
        ),
        week: cn("flex w-full mt-2"),
        week_number_header: cn(
          "select-none w-(--cell-size)"
        ),
        week_number: cn(
          "text-[0.8rem] select-none text-muted-foreground"
        ),
        day: cn(
          "relative w-full h-full p-0 text-center [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-md"
            : "[&:first-child[data-selected=true]_button]:rounded-l-md"
        ),
        range_start: cn(
          "rounded-l-md bg-accent"
        ),
        range_middle: cn("rounded-none"),
        range_end: cn("rounded-r-md bg-accent"),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none"
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground"
        ),
        disabled: cn(
          "text-muted-foreground opacity-50"
        ),
        hidden: cn("invisible"),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }: any) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }: any) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        WeekNumber: ({ children, ...props }: React.ComponentPropsWithoutRef<"td"> & { children?: React.ReactNode }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...(props as any)}
    />
  )
}

export { Calendar }
