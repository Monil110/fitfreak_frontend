import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Dumbbell, TrendingUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";

interface Workout {
  _id: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  calories: number;
  date: string;
}

interface ChartPoint {
  date: string;
  dateLabel: string;
  weight: number;
  volume: number;
}

const normalizeDate = (date: string) =>
  new Date(date).toISOString().split("T")[0];

const formatDateLabel = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const ExerciseProgressChart = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<string>("");

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const res = await api.get("/workouts");
        setWorkouts(res.data || []);
      } catch (err) {
        console.error("Failed to load workouts for exercise progress:", err);
        setWorkouts([]);
      } finally {
        setLoadingWorkouts(false);
      }
    };
    fetchWorkouts();
  }, []);

  const exercises = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    workouts.forEach((w) => {
      const ex = w.exercise?.trim();
      if (ex && !seen.has(ex)) {
        seen.add(ex);
        list.push(ex);
      }
    });
    return list.sort((a, b) => a.localeCompare(b));
  }, [workouts]);

  const chartData = useMemo(() => {
    if (!selectedExercise) return [];

    const filtered = workouts.filter(
      (w) => w.exercise?.trim() === selectedExercise
    );
    if (filtered.length === 0) return [];

    const byDate: Record<
      string,
      { maxWeight: number; totalVolume: number }
    > = {};

    filtered.forEach((w) => {
      const d = normalizeDate(w.date);
      const vol = w.sets * w.reps;
      if (!byDate[d]) {
        byDate[d] = { maxWeight: w.weight || 0, totalVolume: 0 };
      }
      byDate[d].maxWeight = Math.max(byDate[d].maxWeight, w.weight || 0);
      byDate[d].totalVolume += vol;
    });

    const points: ChartPoint[] = Object.entries(byDate).map(
      ([date, { maxWeight, totalVolume }]) => ({
        date,
        dateLabel: formatDateLabel(date),
        weight: maxWeight,
        volume: totalVolume,
      })
    );

    points.sort((a, b) => a.date.localeCompare(b.date));
    return points;
  }, [workouts, selectedExercise]);

  const hasWeight = chartData.some((d) => d.weight > 0);
  const hasVolume = chartData.some((d) => d.volume > 0);
  const showCharts = chartData.length > 0 && (hasWeight || hasVolume);

  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="bg-primary p-4">
        <div className="flex items-center gap-2 text-primary-foreground mb-1">
          <TrendingUp className="w-5 h-5" />
          <h2 className="font-semibold">Exercise Progress</h2>
        </div>
        <p className="text-sm text-primary-foreground/70">
          Track strength and volume from your logged workouts
        </p>
      </div>

      <div className="p-4 space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Select Exercise
          </label>
          <Select
            value={selectedExercise}
            onValueChange={setSelectedExercise}
            disabled={loadingWorkouts}
          >
            <SelectTrigger className="w-full bg-secondary border-0">
              <SelectValue
                placeholder={
                  loadingWorkouts
                    ? "Loading workouts..."
                    : exercises.length === 0
                      ? "Log workouts to see exercises"
                      : "Choose an exercise"
                }
              />
            </SelectTrigger>
            <SelectContent className="bg-card border border-border z-50">
              {exercises.map((ex) => (
                <SelectItem key={ex} value={ex}>
                  {ex}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!selectedExercise ? (
          <div className="text-center py-8">
            <Dumbbell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Select an exercise to view progress
            </p>
          </div>
        ) : !showCharts ? (
          <div className="text-center py-8">
            <Dumbbell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No workout data for this exercise yet
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {hasWeight && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-accent" />
                  <h3 className="text-sm font-medium text-foreground">
                    Weight (kg) — heaviest per day
                  </h3>
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                      />
                      <XAxis
                        dataKey="dateLabel"
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                        formatter={(value: number) => [`${value} kg`, "Weight"]}
                        labelFormatter={(_, payload) =>
                          payload?.[0]?.payload?.dateLabel ?? ""
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="hsl(var(--accent))"
                        strokeWidth={2}
                        dot={{
                          fill: "hsl(var(--accent))",
                          strokeWidth: 0,
                          r: 4,
                        }}
                        activeDot={{ r: 6, fill: "hsl(var(--accent))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {hasVolume && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-medium text-foreground">
                    Volume (sets × reps) per day
                  </h3>
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                      />
                      <XAxis
                        dataKey="dateLabel"
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                        formatter={(value: number) => [
                          `${value} reps`,
                          "Volume",
                        ]}
                        labelFormatter={(_, payload) =>
                          payload?.[0]?.payload?.dateLabel ?? ""
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="volume"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{
                          fill: "hsl(var(--primary))",
                          strokeWidth: 0,
                          r: 4,
                        }}
                        activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseProgressChart;
