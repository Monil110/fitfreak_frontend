import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 pointer-events-auto bg-card rounded-xl border border-accent/30 shadow-lg shadow-accent/10", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center mb-2",
        caption_label: "text-base font-semibold text-accent",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-accent/10 p-0 hover:bg-accent hover:text-accent-foreground transition-colors duration-200 border-accent/30 text-accent",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-accent/70 rounded-md w-10 font-medium text-[0.75rem] uppercase tracking-wide",
        row: "flex w-full mt-2",
        cell: cn(
          "relative h-10 w-10 text-center text-sm p-0",
          "focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-accent/20 [&:has([aria-selected])]:rounded-lg",
          "[&:has([aria-selected].day-range-end)]:rounded-r-lg",
          "[&:has([aria-selected].day-outside)]:bg-accent/10",
          "first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal rounded-lg transition-all duration-200",
          "hover:bg-accent/20 hover:text-accent hover:scale-105",
          "aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected: cn(
          "bg-accent text-accent-foreground font-semibold",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:bg-accent focus:text-accent-foreground",
          "shadow-md shadow-accent/40"
        ),
        day_today: cn(
          "bg-accent/20 text-accent font-semibold",
          "ring-2 ring-accent ring-offset-1 ring-offset-background"
        ),
        day_outside: cn(
          "day-outside text-muted-foreground/40",
          "aria-selected:bg-accent/30 aria-selected:text-muted-foreground aria-selected:opacity-50"
        ),
        day_disabled: "text-muted-foreground/30 cursor-not-allowed",
        day_range_middle: "aria-selected:bg-accent/20 aria-selected:text-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
