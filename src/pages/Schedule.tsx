import { useState, useEffect } from "react";
import { Calendar, Clock, Plus, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface ScheduleEntry {
  _id: string;
  task: string;
  date: string;
  time: string;
}

const normalizeDate = (date: string) =>
  new Date(date).toISOString().split("T")[0];

const toDateTime = (date: string, time: string) => {
  const d = normalizeDate(date); // always YYYY-MM-DD
  return new Date(`${d}T${time}`).getTime();
};

const Schedule = () => {
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [form, setForm] = useState({ task: "", date: "", time: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await api.get("/schedule");
        const sorted = (res.data || []).sort((a: ScheduleEntry, b: ScheduleEntry) =>
          toDateTime(b.date, b.time) - toDateTime(a.date, a.time)
        );
        setSchedules(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingId) {
        const res = await api.put(`/schedule/${editingId}`, form);
        const updated = schedules.map((s) => (s._id === editingId ? res.data : s));
        const sorted = updated.sort((a, b) =>
          toDateTime(b.date, b.time) - toDateTime(a.date, a.time)
        );
        setSchedules(sorted);
        setEditingId(null);
      } else {
        const res = await api.post("/schedule", form);
        const updated = [res.data, ...schedules];
        const sorted = updated.sort((a, b) =>
          toDateTime(b.date, b.time) - toDateTime(a.date, a.time)
        );
        setSchedules(sorted);
      }

      setForm({ task: "", date: "", time: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (s: ScheduleEntry) => {
    setEditingId(s._id);
    setForm({ task: s.task, date: normalizeDate(s.date), time: s.time });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this task?")) return;

    try {
      await api.delete(`/schedule/${id}`);
      setSchedules((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ task: "", date: "", time: "" });
  };

  const today = new Date().toISOString().split("T")[0];
  const upcoming = schedules
    .filter((s) => normalizeDate(s.date) >= today)
    .sort((a, b) =>
      toDateTime(b.date, b.time) - toDateTime(a.date, a.time)
    );
  const past = schedules
    .filter((s) => normalizeDate(s.date) < today)
    .sort((a, b) =>
      toDateTime(b.date, b.time) - toDateTime(a.date, a.time)
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
          <LoadingSpinner message="Loading schedule..." />
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
            title="My Schedule"
            description="Plan your workouts and stay on track"
            icon={Calendar}
          />

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard label="Total Tasks" value={schedules.length} icon={Calendar} variant="accent" />
            <StatCard label="Upcoming" value={upcoming.length} icon={CheckCircle2} />
            <StatCard label="Past" value={past.length} icon={Clock} />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border overflow-hidden sticky top-24">
                <div className="bg-primary p-4">
                  <h2 className="text-lg font-semibold text-primary-foreground flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    {editingId ? "Edit Task" : "Add Task"}
                  </h2>
                </div>

                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Task</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="e.g., Morning cardio"
                        value={form.task}
                        onChange={(e) => setForm({ ...form, task: e.target.value })}
                        required
                        className="w-full pl-10 pr-3 py-2.5 bg-secondary border-0 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="date"
                          value={form.date}
                          onChange={(e) => setForm({ ...form, date: e.target.value })}
                          required
                          className="w-full pl-10 pr-3 py-2.5 bg-secondary border-0 rounded-lg text-sm text-foreground focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Time</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="time"
                          value={form.time}
                          onChange={(e) => setForm({ ...form, time: e.target.value })}
                          required
                          className="w-full pl-10 pr-3 py-2.5 bg-secondary border-0 rounded-lg text-sm text-foreground focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !form.task || !form.date || !form.time}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : editingId ? (
                      <Edit2 className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {editingId ? "Update Task" : "Add Task"}
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

            {/* Schedule List */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upcoming */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  Upcoming Tasks
                  <span className="text-sm text-muted-foreground font-normal ml-auto">
                    {upcoming.length} tasks
                  </span>
                </h2>

                {upcoming.length === 0 ? (
                  <div className="bg-card rounded-xl border border-border p-12 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No upcoming tasks</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcoming.map((s) => (
                      <ScheduleCard
                        key={s._id}
                        schedule={s}
                        isToday={normalizeDate(s.date) === today}
                        isPast={false}
                        onEdit={() => handleEdit(s)}
                        onDelete={() => handleDelete(s._id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Past */}
              {past.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    Past Tasks
                    <span className="text-sm text-muted-foreground font-normal ml-auto">
                      {past.length} tasks
                    </span>
                  </h2>
                  <div className="space-y-3">
                    {past.slice(0, 5).map((s) => (
                      <ScheduleCard
                        key={s._id}
                        schedule={s}
                        isToday={false}
                        isPast={true}
                        onEdit={() => handleEdit(s)}
                        onDelete={() => handleDelete(s._id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const ScheduleCard = ({
  schedule,
  isToday,
  isPast,
  onEdit,
  onDelete,
}: {
  schedule: ScheduleEntry;
  isToday: boolean;
  isPast: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div
      className={cn(
        "bg-card rounded-xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10 cursor-pointer",
        isToday ? "border-accent/30 bg-accent/5" : isPast ? "border-border opacity-60" : "border-border"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-foreground">{schedule.task}</h3>
            {isToday && (
              <span className="px-2 py-0.5 bg-accent text-accent-foreground text-xs font-medium rounded-full">
                Today
              </span>
            )}
            {isPast && (
              <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                Past
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(schedule.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatTime(schedule.time)}
            </span>
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

export default Schedule;