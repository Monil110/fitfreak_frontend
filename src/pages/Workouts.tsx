import { useState, useEffect } from "react";
import { 
  Dumbbell, 
  Flame, 
  Hash, 
  Repeat, 
  Scale, 
  Calendar, 
  Plus, 
  Edit2, 
  Trash2,
  Activity
} from "lucide-react";
import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { cn } from "@/lib/utils";
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

const normalizeDate = (date: string) =>
  new Date(date).toISOString().split("T")[0];

const Workouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [form, setForm] = useState({
    exercise: "",
    sets: "",
    reps: "",
    weight: "",
    calories: "",
    date: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const res = await api.get("/workouts");
        const sorted = (res.data || []).sort((a: Workout, b: Workout) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA; // Latest first
        });
        setWorkouts(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        exercise: form.exercise,
        sets: +form.sets,
        reps: +form.reps,
        weight: +form.weight || 0,
        calories: +form.calories || 0,
        date: form.date,
      };

      if (editingId) {
        const res = await api.put(`/workouts/${editingId}`, payload);
        const updated = workouts.map((w) => (w._id === editingId ? res.data : w));
        const sorted = updated.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
        });
        setWorkouts(sorted);
        setEditingId(null);
      } else {
        const res = await api.post("/workouts", payload);
        const updated = [res.data, ...workouts];
        const sorted = updated.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
        });
        setWorkouts(sorted);
      }

      setForm({
        exercise: "",
        sets: "",
        reps: "",
        weight: "",
        calories: "",
        date: "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (w: Workout) => {
    setEditingId(w._id);
    setForm({
      exercise: w.exercise,
      sets: w.sets.toString(),
      reps: w.reps.toString(),
      weight: w.weight.toString(),
      calories: w.calories.toString(),
      date: normalizeDate(w.date),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this workout?")) return;

    try {
      await api.delete(`/workouts/${id}`);
      setWorkouts((prev) => prev.filter((w) => w._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({
      exercise: "",
      sets: "",
      reps: "",
      weight: "",
      calories: "",
      date: "",
    });
  };

  const today = new Date().toISOString().split("T")[0];
  const todayWorkouts = workouts.filter(
    (w) => normalizeDate(w.date) === today
  );
  const todayStats = todayWorkouts.reduce(
    (acc, w) => ({
      exercises: acc.exercises + 1,
      sets: acc.sets + w.sets,
      reps: acc.reps + w.reps * w.sets,
      calories: acc.calories + w.calories,
    }),
    { exercises: 0, sets: 0, reps: 0, calories: 0 }
  );

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gradient-to-bl from-accent/20 via-accent/5 to-background relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/15 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 animate-pulse" />
          </div>
          <LoadingSpinner message="Loading workouts..." />
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-bl from-accent/20 via-accent/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/15 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 animate-pulse" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PageHeader
            title="Workout Tracker"
            description="Track your exercises and monitor progress"
            icon={Dumbbell}
          />

          {/* Today's Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Exercises" value={todayStats.exercises} icon={Dumbbell} variant="accent" />
            <StatCard label="Total Sets" value={todayStats.sets} icon={Hash} />
            <StatCard label="Total Reps" value={todayStats.reps} icon={Repeat} />
            <StatCard label="Calories Burned" value={todayStats.calories} icon={Flame} />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border overflow-hidden sticky top-24">
                <div className="bg-primary p-4">
                  <h2 className="text-lg font-semibold text-primary-foreground flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    {editingId ? "Edit Workout" : "Log Workout"}
                  </h2>
                </div>

                <div className="p-4 space-y-4">
                  <InputField
                    label="Exercise"
                    icon={<Dumbbell className="w-4 h-4" />}
                    type="text"
                    placeholder="e.g., Bench Press"
                    value={form.exercise}
                    onChange={(e) => setForm({ ...form, exercise: e.target.value })}
                    required
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="Sets"
                      icon={<Hash className="w-4 h-4" />}
                      type="number"
                      placeholder="3"
                      value={form.sets}
                      onChange={(e) => setForm({ ...form, sets: e.target.value })}
                      required
                    />
                    <InputField
                      label="Reps"
                      icon={<Repeat className="w-4 h-4" />}
                      type="number"
                      placeholder="12"
                      value={form.reps}
                      onChange={(e) => setForm({ ...form, reps: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="Weight (kg)"
                      icon={<Scale className="w-4 h-4" />}
                      type="number"
                      placeholder="50"
                      value={form.weight}
                      onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    />
                    <InputField
                      label="Calories"
                      icon={<Flame className="w-4 h-4" />}
                      type="number"
                      placeholder="200"
                      value={form.calories}
                      onChange={(e) => setForm({ ...form, calories: e.target.value })}
                    />
                  </div>

                  <InputField
                    label="Date"
                    icon={<Calendar className="w-4 h-4" />}
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />

                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !form.exercise || !form.sets || !form.reps || !form.date}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : editingId ? (
                      <Edit2 className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {editingId ? "Update Workout" : "Log Workout"}
                  </button>

                  {editingId && (
                    <button
                      onClick={handleCancel}
                      className="w-full bg-secondary text-foreground py-3 rounded-lg font-semibold hover:bg-secondary/80 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Workout List */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Activity className="w-5 h-5 text-accent" />
                  Workout History
                </h2>
                <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                  {workouts.length} workouts
                </span>
              </div>

              {workouts.length === 0 ? (
                <div className="bg-card rounded-xl border border-border p-12 text-center">
                  <Dumbbell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No workouts logged yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {workouts.map((w) => (
                    <WorkoutCard
                      key={w._id}
                      workout={w}
                      isToday={normalizeDate(w.date) === today}
                      onEdit={() => handleEdit(w)}
                      onDelete={() => handleDelete(w._id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const InputField = ({
  label,
  icon,
  ...props
}: {
  label: string;
  icon: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
      <input
        {...props}
        className="w-full pl-10 pr-3 py-2.5 bg-secondary border-0 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-accent/20 outline-none transition-all"
      />
    </div>
  </div>
);

const WorkoutCard = ({
  workout,
  isToday,
  onEdit,
  onDelete,
}: {
  workout: Workout;
  isToday: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <div
    className={cn(
      "bg-card rounded-xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10 cursor-pointer",
      isToday ? "border-accent/30 bg-accent/5" : "border-border"
    )}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-foreground">{workout.exercise}</h3>
          {isToday && (
            <span className="px-2 py-0.5 bg-accent text-accent-foreground text-xs font-medium rounded-full">
              Today
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>{workout.sets} sets × {workout.reps} reps</span>
          {workout.weight > 0 && <span>{workout.weight} kg</span>}
          {workout.calories > 0 && <span>{workout.calories} cal</span>}
          <span>{new Date(workout.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="p-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

export default Workouts;