import { useEffect, useMemo, useState, useRef } from "react";
import { ActivityHeatmapMonth } from "react-activity-heatmap";
import type { HeatmapActivity } from "react-activity-heatmap";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";

interface ActivityHeatmapProps {
  weeks?: number;
}

/* ---------- LOCAL DATE NORMALIZATION (NO UTC) ---------- */
const normalizeDate = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

const ActivityHeatmap = ({ weeks = 20 }: ActivityHeatmapProps) => {
  const [workoutsByDate, setWorkoutsByDate] = useState<Record<string, number>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const currentYear = today.getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>("last6");

  const years = useMemo(() => {
    const arr: number[] = [];
    for (let y = currentYear; y >= currentYear - 4; y--) arr.push(y);
    return arr;
  }, [currentYear]);

  /* ---------- FETCH WORKOUTS ---------- */
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const res = await api.get("/workouts");
        const list = res.data || [];
        const map: Record<string, number> = {};

        list.forEach((w: { date: string }) => {
          const d = new Date(w.date);
          const normalized = normalizeDate(d);
          map[normalized] = (map[normalized] ?? 0) + 1;
        });

        setWorkoutsByDate(map);
      } catch {
        console.error("Failed to load workouts");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  /* ---------- CONVERT TO HEATMAP ACTIVITIES ---------- */
  const activities = useMemo((): HeatmapActivity[] => {
    const result: HeatmapActivity[] = [];

    Object.entries(workoutsByDate).forEach(([dateStr, count]) => {
      const date = new Date(dateStr);
      // Map workout count to level (0-4)
      let level = 0;
      if (count === 1) level = 1;
      else if (count === 2) level = 2;
      else if (count === 3) level = 3;
      else if (count >= 4) level = 4;

      result.push({
        date,
        count,
        level,
      });
    });

    return result;
  }, [workoutsByDate]);

  /* ---------- DETERMINE MONTHS TO DISPLAY ---------- */
  const monthsToDisplay = useMemo(() => {
    if (selectedYear === "last6") {
      const months: { month: number; year: number }[] = [];
      const end = new Date(today);
      const start = new Date(today);
      start.setMonth(start.getMonth() - 6);

      const current = new Date(start);
      while (current <= end) {
        months.push({
          month: current.getMonth() + 1, // 1-12
          year: current.getFullYear(),
        });
        current.setMonth(current.getMonth() + 1);
      }

      return months;
    } else {
      const year = parseInt(selectedYear);
      const isCurrentYear = year === today.getFullYear();
      const endMonth = isCurrentYear ? today.getMonth() + 1 : 12;

      return Array.from({ length: endMonth }, (_, i) => ({
        month: i + 1,
        year,
      }));
    }
  }, [selectedYear, today]);

  /* ---------- CALCULATE TOTAL WORKOUTS FOR SELECTED PERIOD ---------- */
  const totalWorkouts = useMemo(() => {
    if (selectedYear === "last6") {
      // Calculate for last 6 months
      const end = new Date(today);
      const start = new Date(today);
      start.setMonth(start.getMonth() - 6);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      return Object.entries(workoutsByDate).reduce((sum, [dateStr, count]) => {
        const date = new Date(dateStr);
        if (date >= start && date <= end) {
          return sum + count;
        }
        return sum;
      }, 0);
    } else {
      // Calculate for selected year
      const year = parseInt(selectedYear);
      return Object.entries(workoutsByDate).reduce((sum, [dateStr, count]) => {
        const date = new Date(dateStr);
        if (date.getFullYear() === year) {
          return sum + count;
        }
        return sum;
      }, 0);
    }
  }, [workoutsByDate, selectedYear, today]);

  const getYearLabel = () => {
    if (selectedYear === "last6") return "the last 6 months";
    return selectedYear;
  };

  // Custom colors matching your original design
  const customCellColors = {
    level0: "hsl(var(--muted-foreground) / 0.2)", // bg-muted-foreground/20
    level1: "hsl(var(--accent) / 0.3)", // bg-accent/30
    level2: "hsl(var(--accent) / 0.5)", // bg-accent/50
    level3: "hsl(var(--accent) / 0.75)", // bg-accent/75
    level4: "hsl(var(--accent))", // bg-accent
  };

  // Scroll functions
  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-card border rounded-xl p-6 flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-xl p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <svg
            className="w-5 h-5 text-accent"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Activity
        </h3>

        <div className="flex items-center gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[150px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last6">Last 6 months</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {totalWorkouts} workouts in {getYearLabel()}
          </span>
        </div>
      </div>

      {/* Day Labels and Heatmap Container */}
      <div className="flex items-start gap-4 mb-2 overflow-hidden">
        <div className="flex flex-col gap-[2px] text-[10px] text-muted-foreground mt-5 flex-shrink-0">
        <div style={{ lineHeight: "10px", transform: "translateY(-2px)" }}>
            Mon
          </div>
          <div style={{ height: "18px" }}></div>
          <div style={{ lineHeight: "12px", transform: "translateY(4px)" }}>
            Wed
          </div>
          <div style={{ height: "20px" }}></div>
          <div style={{ lineHeight: "12px", transform: "translateY(4px)" }}>
            Fri
          </div>
          <div style={{ height: "20px" }}></div>
        </div>

        {/* Heatmap Slider Container */}
        <div className="flex-1 relative group min-w-0">
          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 bg-background border rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent/10"
            aria-label="Scroll left"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-hide"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <div style={{ display: "flex", gap: "1rem", paddingRight: "1rem" }}>
              {monthsToDisplay.map(({ month, year }) => (
                <div key={`${month}-${year}`} style={{ flexShrink: 0 }}>
                  <ActivityHeatmapMonth
                    activities={activities}
                    month={month}
                    year={year}
                    cellStyle={{
                      borderRadius: "0.125rem",
                      width: "12px",
                      height: "12px",
                    }}
                    monthNameStyle={{
                      fontSize: "0.75rem",
                      color: "hsl(var(--muted-foreground))",
                      marginBottom: "0.25rem",
                      fontWeight: "normal",
                    }}
                    tooltipStyle={{
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.375rem",
                      backgroundColor: "hsl(var(--popover))",
                      color: "hsl(var(--popover-foreground))",
                      padding: "0.5rem",
                      fontSize: "0.75rem",
                    }}
                    customCellColors={customCellColors}
                    monthNameFormat="short"
                    customTooltipContent={(activity) => (
                      <div>
                        <p className="font-medium">
                          {activity.count === 0
                            ? "No workout"
                            : activity.count === 1
                            ? "1 workout"
                            : `${activity.count} workouts`}
                        </p>
                        <p className="text-muted-foreground">
                          {activity.date.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 bg-background border rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent/10"
            aria-label="Scroll right"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ActivityHeatmap;