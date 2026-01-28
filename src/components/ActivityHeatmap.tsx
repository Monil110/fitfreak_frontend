import { useEffect, useMemo, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";

interface ActivityDay {
  date: string;
  count: number;
}

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

  /* ---------- GENERATE DAILY DATA ---------- */
  const activityData = useMemo(() => {
    const data: ActivityDay[] = [];
    let startDate: Date;
    let endDate: Date;

    if (selectedYear === "last6") {
      endDate = new Date(today);
      startDate = new Date(today);
      startDate.setMonth(startDate.getMonth() - 6);
      startDate.setDate(startDate.getDate() + 1);
    } else {
      const year = parseInt(selectedYear);
      startDate = new Date(year, 0, 1);
      endDate =
        year === today.getFullYear()
          ? new Date(today)
          : new Date(year, 11, 31);
    }

    const d = new Date(startDate);
    while (d <= endDate) {
      const dateStr = normalizeDate(d);
      const workouts = workoutsByDate[dateStr] ?? 0;

      data.push({
        date: dateStr,
        count: workouts > 0 ? Math.min(4, workouts) : 0,
      });

      d.setDate(d.getDate() + 1);
    }

    return data;
  }, [workoutsByDate, selectedYear, today]);

  /* ---------- GROUP INTO SUNDAY-ALIGNED WEEKS (ALWAYS PAD) ---------- */
  const weekData = useMemo(() => {
    const result: ActivityDay[][] = [];
    let currentWeek: ActivityDay[] = [];

    if (activityData.length === 0) return result;

    // ALWAYS pad to Sunday, regardless of year selection
    const firstDate = new Date(activityData[0].date);
    const startDayOfWeek = firstDate.getDay();

    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push({ date: "", count: -1 });
    }

    activityData.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      result.push(currentWeek);
    }

    return result;
  }, [activityData]);

  /* ---------- COMPUTE MONTH LABELS (ONLY SHOW AT MONTH BOUNDARIES) ---------- */
  const monthLabels = useMemo(() => {
    const labels: string[] = [];
    let currentMonth = -1;

    weekData.forEach((week) => {
      const validDay = week.find((d) => d.date);
      if (validDay) {
        const date = new Date(validDay.date);
        const month = date.getMonth();
        
        // Only show label at the first week of each month
        if (month !== currentMonth) {
          currentMonth = month;
          labels.push(date.toLocaleDateString("en-US", { month: "short" }));
        } else {
          labels.push("");
        }
      } else {
        labels.push("");
      }
    });

    return labels;
  }, [weekData]);

  /* ---------- HELPERS ---------- */
  const getIntensityClass = (count: number) => {
    if (count === -1) return "bg-transparent";
    if (count === 0) return "bg-muted-foreground/20";
    if (count === 1) return "bg-accent/30";
    if (count === 2) return "bg-accent/50";
    if (count === 3) return "bg-accent/75";
    return "bg-accent";
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getLabel = (c: number) =>
    c === 0 ? "No workout" : `${c} workout${c > 1 ? "s" : ""}`;

  const totalWorkouts = activityData.filter((d) => d.count > 0).length;

  const getYearLabel = () => {
    if (selectedYear === "last6") return "the last 6 months";
    return selectedYear;
  };

  if (loading) {
    return (
      <div className="bg-card border rounded-xl p-6 flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <TooltipProvider>
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

        <div className="flex gap-1">
          {/* Day labels - Mon/Wed/Fri only (Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6) */}
          <div className="flex flex-col gap-[3px] mr-1">
            <span className="text-[10px] text-muted-foreground h-[12px] leading-[12px] invisible">Sun</span>
            <span className="text-[10px] text-muted-foreground h-[12px] leading-[12px]">Mon</span>
            <span className="text-[10px] text-muted-foreground h-[12px] leading-[12px] invisible">Tue</span>
            <span className="text-[10px] text-muted-foreground h-[12px] leading-[12px]">Wed</span>
            <span className="text-[10px] text-muted-foreground h-[12px] leading-[12px] invisible">Thu</span>
            <span className="text-[10px] text-muted-foreground h-[12px] leading-[12px]">Fri</span>
            <span className="text-[10px] text-muted-foreground h-[12px] leading-[12px] invisible">Sat</span>
          </div>

          {/* Heatmap grid */}
          <div className="flex flex-col overflow-x-auto">
            {/* Month labels - only at month boundaries */}
            <div className="flex gap-[3px] mb-1 overflow-visible">
              {monthLabels.map((label, idx) => (
                <span
                  key={idx}
                  className="text-xs text-muted-foreground min-w-[12px] text-left"
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Grid - flat row of weeks */}
            <div className="flex gap-[3px]">
              {weekData.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-[3px]">
                  {week.map((day, dayIdx) => (
                    <Tooltip key={`${weekIdx}-${dayIdx}`}>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-[12px] h-[12px] rounded-sm transition-colors ${getIntensityClass(
                            day.count
                          )} ${
                            day.count >= 0
                              ? "hover:ring-1 hover:ring-foreground/30 cursor-pointer"
                              : ""
                          }`}
                        />
                      </TooltipTrigger>
                      {day.count >= 0 && (
                        <TooltipContent side="top" className="text-xs">
                          <p className="font-medium">{getLabel(day.count)}</p>
                          <p className="text-muted-foreground">
                            {formatDate(day.date)}
                          </p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ActivityHeatmap;