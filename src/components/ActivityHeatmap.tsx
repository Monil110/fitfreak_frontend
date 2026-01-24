import { useEffect, useMemo, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

const normalizeDate = (date: string) =>
  new Date(date).toISOString().split("T")[0];

const ActivityHeatmap = ({ weeks = 20 }: ActivityHeatmapProps) => {
  const [workoutsByDate, setWorkoutsByDate] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear; y >= currentYear - 4; y--) list.push(y);
    return list;
  }, [currentYear]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const res = await api.get("/workouts");
        const list = res.data || [];
        const byDate: Record<string, number> = {};
        list.forEach((w: { date: string }) => {
          const d = normalizeDate(w.date);
          byDate[d] = (byDate[d] ?? 0) + 1;
        });
        setWorkoutsByDate(byDate);
      } catch (err) {
        console.error("Failed to load workouts for activity heatmap");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkouts();
  }, []);

  // Build activity for selected year (Jan 1–Dec 31)
  const activityData = useMemo(() => {
    const data: ActivityDay[] = [];
    const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    const totalDays = isLeap(selectedYear) ? 366 : 365;

    for (let i = 0; i < totalDays; i++) {
      const date = new Date(selectedYear, 0, 1);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const workoutCount = workoutsByDate[dateStr] ?? 0;
      const count =
        workoutCount > 0 ? Math.min(4, Math.max(1, workoutCount)) : 0;

      data.push({ date: dateStr, count });
    }

    return data;
  }, [workoutsByDate, selectedYear]);

  // Group by weeks
  const weekData = useMemo(() => {
    const result: ActivityDay[][] = [];
    let currentWeek: ActivityDay[] = [];
    
    // Find what day of week the first day is
    const firstDate = new Date(activityData[0]?.date);
    const startDayOfWeek = firstDate.getDay();
    
    // Add empty cells for alignment
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push({ date: '', count: -1 });
    }
    
    activityData.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });
    
    if (currentWeek.length > 0) {
      // Fill remaining days with empty cells
      while (currentWeek.length < 7) {
        currentWeek.push({ date: '', count: -1 });
      }
      result.push(currentWeek);
    }
    
    return result;
  }, [activityData]);

  const getIntensityClass = (count: number) => {
    if (count === -1) return "bg-transparent";
    if (count === 0) return "bg-muted/50";
    if (count === 1) return "bg-accent/30";
    if (count === 2) return "bg-accent/50";
    if (count === 3) return "bg-accent/75";
    return "bg-accent";
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getActivityLabel = (count: number) => {
    if (count === 0) return "No workout";
    if (count === 1) return "1 workout";
    return `${count} workouts`;
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get month labels
  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    let currentMonth = '';
    
    weekData.forEach((week, weekIndex) => {
      const validDay = week.find(d => d.date);
      if (validDay) {
        const date = new Date(validDay.date);
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        if (month !== currentMonth) {
          labels.push({ month, weekIndex });
          currentMonth = month;
        }
      }
    });
    
    return labels;
  }, [weekData]);

  const totalWorkouts = activityData.filter((d) => d.count > 0).length;

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Activity
          </h3>
          <div className="flex items-center gap-3">
            <Select
              value={String(selectedYear)}
              onValueChange={(v) => setSelectedYear(Number(v))}
            >
              <SelectTrigger className="w-[120px] bg-secondary border-0">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border z-50">
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {totalWorkouts} workouts in {selectedYear}
            </span>
          </div>
        </div>

        {/* Month labels */}
        <div className="flex ml-8 mb-1">
          {monthLabels.map(({ month, weekIndex }, idx) => (
            <span 
              key={idx} 
              className="text-xs text-muted-foreground"
              style={{ 
                marginLeft: idx === 0 ? weekIndex * 14 : undefined,
                width: idx < monthLabels.length - 1 
                  ? (monthLabels[idx + 1].weekIndex - weekIndex) * 14 
                  : undefined
              }}
            >
              {month}
            </span>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] mr-1">
            {dayLabels.map((day, idx) => (
              <span 
                key={day} 
                className="text-[10px] text-muted-foreground h-[12px] leading-[12px]"
                style={{ visibility: idx % 2 === 1 ? 'visible' : 'hidden' }}
              >
                {day}
              </span>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex gap-[3px] overflow-x-auto pb-2">
            {weekData.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-[3px]">
                {week.map((day, dayIdx) => (
                  <Tooltip key={`${weekIdx}-${dayIdx}`}>
                    <TooltipTrigger asChild>
                      <div
                        className={`w-[12px] h-[12px] rounded-sm transition-colors ${getIntensityClass(day.count)} ${day.count >= 0 ? 'hover:ring-1 hover:ring-foreground/30 cursor-pointer' : ''}`}
                      />
                    </TooltipTrigger>
                    {day.count >= 0 && day.date && (
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-medium">{getActivityLabel(day.count)}</p>
                        <p className="text-muted-foreground">{formatDate(day.date)}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground mt-4">
          <span>Less</span>
          <div className="w-3 h-3 bg-muted/50 rounded-sm" />
          <div className="w-3 h-3 bg-accent/30 rounded-sm" />
          <div className="w-3 h-3 bg-accent/50 rounded-sm" />
          <div className="w-3 h-3 bg-accent/75 rounded-sm" />
          <div className="w-3 h-3 bg-accent rounded-sm" />
          <span>More</span>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ActivityHeatmap;