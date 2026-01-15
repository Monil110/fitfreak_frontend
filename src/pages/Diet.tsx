import { useState, useEffect } from "react";
import {
  Salad,
  Flame,
  Beef,
  Wheat,
  Droplet,
  Clock,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface DietEntry {
  _id: string;
  food: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  time: string;
  date: string;
}

const normalizeDate = (date: string) =>
  new Date(date).toISOString().split("T")[0];

const Diet = () => {
  const [dietList, setDietList] = useState<DietEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    food: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    time: "",
    date: "",
  });

  // ================= FETCH =================
  useEffect(() => {
    const fetchDiet = async () => {
      try {
        const res = await api.get("/diet");
        const sorted = (res.data || []).sort((a: DietEntry, b: DietEntry) => {
          const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
          const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
          return dateTimeB - dateTimeA; // Latest first
        });
        setDietList(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiet();
  }, []);

  // ================= SUBMIT =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      food: form.food,
      calories: Number(form.calories),
      protein: Number(form.protein || 0),
      carbs: Number(form.carbs || 0),
      fats: Number(form.fats || 0),
      time: form.time,
      date: form.date,
    };

    try {
      if (editingId) {
        const res = await api.put(`/diet/${editingId}`, payload);
        const updated = dietList.map((d) => (d._id === editingId ? res.data : d));
        const sorted = updated.sort((a, b) => {
          const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
          const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
          return dateTimeB - dateTimeA;
        });
        setDietList(sorted);
        setEditingId(null);
      } else {
        const res = await api.post("/diet", payload);
        const updated = [res.data, ...dietList];
        const sorted = updated.sort((a, b) => {
          const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
          const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
          return dateTimeB - dateTimeA;
        });
        setDietList(sorted);
      }

      setForm({
        food: "",
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
        time: "",
        date: "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ================= EDIT =================
  const handleEdit = (d: DietEntry) => {
    setEditingId(d._id);
    setForm({
      food: d.food,
      calories: d.calories.toString(),
      protein: d.protein.toString(),
      carbs: d.carbs.toString(),
      fats: d.fats.toString(),
      time: d.time,
      date: normalizeDate(d.date),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ================= DELETE =================
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;

    try {
      await api.delete(`/diet/${id}`);
      setDietList((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({
      food: "",
      calories: "",
      protein: "",
      carbs: "",
      fats: "",
      time: "",
      date: "",
    });
  };

  // ================= STATS =================
  const today = new Date().toISOString().split("T")[0];
  const todayEntries = dietList.filter(
    (d) => normalizeDate(d.date) === today
  );

  const todayTotals = todayEntries.reduce(
    (acc, d) => ({
      calories: acc.calories + d.calories,
      protein: acc.protein + d.protein,
      carbs: acc.carbs + d.carbs,
      fats: acc.fats + d.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
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
          <LoadingSpinner message="Loading diet entries..." />
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
            title="Diet Tracking"
            description="Monitor your nutrition and reach your goals"
            icon={Salad}
          />

          {/* Today's Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Calories" value={todayTotals.calories} icon={Flame} variant="accent" />
            <StatCard label="Protein" value={todayTotals.protein} unit="g" icon={Beef} />
            <StatCard label="Carbs" value={todayTotals.carbs} unit="g" icon={Wheat} />
            <StatCard label="Fats" value={todayTotals.fats} unit="g" icon={Droplet} />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border overflow-hidden sticky top-24">
                <div className="bg-primary p-4">
                  <h2 className="text-lg font-semibold text-primary-foreground flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    {editingId ? "Edit Entry" : "Add Entry"}
                  </h2>
                </div>

                <div className="p-4 space-y-4">
                  <InputField
                    label="Food"
                    icon={<UtensilsCrossed className="w-4 h-4" />}
                    type="text"
                    placeholder="e.g., Grilled Chicken"
                    value={form.food}
                    onChange={(e) => setForm({ ...form, food: e.target.value })}
                    required
                  />

                  <InputField
                    label="Calories"
                    icon={<Flame className="w-4 h-4" />}
                    type="number"
                    placeholder="350"
                    value={form.calories}
                    onChange={(e) => setForm({ ...form, calories: e.target.value })}
                    required
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <InputField
                      label="Protein"
                      type="number"
                      placeholder="30"
                      value={form.protein}
                      onChange={(e) => setForm({ ...form, protein: e.target.value })}
                    />
                    <InputField
                      label="Carbs"
                      type="number"
                      placeholder="45"
                      value={form.carbs}
                      onChange={(e) => setForm({ ...form, carbs: e.target.value })}
                    />
                    <InputField
                      label="Fats"
                      type="number"
                      placeholder="15"
                      value={form.fats}
                      onChange={(e) => setForm({ ...form, fats: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="Date"
                      icon={<Calendar className="w-4 h-4" />}
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      required
                    />
                    <InputField
                      label="Time"
                      icon={<Clock className="w-4 h-4" />}
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      required
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !form.food || !form.calories || !form.date || !form.time}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : editingId ? (
                      <Edit2 className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {editingId ? "Update Entry" : "Add Entry"}
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

            {/* Diet List */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Salad className="w-5 h-5 text-accent" />
                  Diet Entries
                </h2>
                <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                  {dietList.length} entries
                </span>
              </div>

              {dietList.length === 0 ? (
                <div className="bg-card rounded-xl border border-border p-12 text-center">
                  <Salad className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No diet entries yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dietList
                    .sort((a, b) => {
                      const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
                      const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
                      return dateTimeB - dateTimeA;
                    })
                    .map((d) => (
                      <DietCard
                        key={d._id}
                        entry={d}
                        isToday={normalizeDate(d.date) === today}
                        onEdit={() => handleEdit(d)}
                        onDelete={() => handleDelete(d._id)}
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
  icon?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
      <input
        {...props}
        className={cn(
          "w-full pr-3 py-2.5 bg-secondary border-0 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-accent/20 outline-none transition-all",
          icon ? "pl-10" : "pl-3"
        )}
      />
    </div>
  </div>
);

const DietCard = ({
  entry,
  isToday,
  onEdit,
  onDelete,
}: {
  entry: DietEntry;
  isToday: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const formatTime = (time: string) => {
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div
      className={cn(
        "bg-card rounded-xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10 cursor-pointer",
        isToday ? "border-accent/30 bg-accent/5" : "border-border"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-foreground">{entry.food}</h3>
            {isToday && (
              <span className="px-2 py-0.5 bg-accent text-accent-foreground text-xs font-medium rounded-full">
                Today
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{entry.calories} cal</span>
            <span>P: {entry.protein}g</span>
            <span>C: {entry.carbs}g</span>
            <span>F: {entry.fats}g</span>
            <span>{formatTime(entry.time)}</span>
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
};

export default Diet;