import { useState } from "react";
import { Calendar, TrendingUp, Flame, Activity, Beef, Wheat, Droplet } from "lucide-react";
import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import api from "@/lib/api";

const Reports = () => {
  const [date, setDate] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [month, setMonth] = useState("");

  const [daily, setDaily] = useState<any>(null);
  const [weekly, setWeekly] = useState<any>(null);
  const [monthly, setMonthly] = useState<any>(null);

  const [loadingDaily, setLoadingDaily] = useState(false);
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  const fetchDaily = async () => {
    setLoadingDaily(true);
    try {
      const res = await api.get("/reports/daily", {
        params: { date },
      });
      setDaily(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDaily(false);
    }
  };

  const fetchWeekly = async () => {
    setLoadingWeekly(true);
    try {
      const res = await api.get("/reports/weekly", {
        params: { start: weekStart },
      });
      setWeekly(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWeekly(false);
    }
  };

  const fetchMonthly = async () => {
    setLoadingMonthly(true);
    try {
      const res = await api.get("/reports/monthly", {
        params: { month },
      });
      setMonthly(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMonthly(false);
    }
  };

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
            title="Fitness Reports"
            description="Track your progress with detailed insights"
            icon={TrendingUp}
          />

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Daily Report */}
            <ReportCard
              title="Daily Report"
              description="View your daily nutrition"
              icon={<Calendar className="w-5 h-5" />}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Select Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-secondary border-0 rounded-lg text-sm text-foreground focus:ring-2 focus:ring-accent/20 outline-none"
                  />
                </div>

                <button
                  onClick={fetchDaily}
                  disabled={!date || loadingDaily}
                  className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingDaily ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <Activity className="w-4 h-4" />
                  )}
                  Get Report
                </button>

                {daily && (
                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="bg-accent/10 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium text-foreground">Calories</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Eaten:</span>
                          <span className="font-bold text-foreground ml-1">{daily.calories.eaten}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Burned:</span>
                          <span className="font-bold text-foreground ml-1">{daily.calories.burned}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-secondary rounded-lg p-3 space-y-2">
                      <MacroRow icon={<Beef className="w-4 h-4" />} label="Protein" value={`${daily.macros.protein}g`} />
                      <MacroRow icon={<Wheat className="w-4 h-4" />} label="Carbs" value={`${daily.macros.carbs}g`} />
                      <MacroRow icon={<Droplet className="w-4 h-4" />} label="Fats" value={`${daily.macros.fats}g`} />
                    </div>
                  </div>
                )}
              </div>
            </ReportCard>

            {/* Weekly Report */}
            <ReportCard
              title="Weekly Report"
              description="Track your weekly progress"
              icon={<TrendingUp className="w-5 h-5" />}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Week Start</label>
                  <input
                    type="date"
                    value={weekStart}
                    onChange={(e) => setWeekStart(e.target.value)}
                    className="w-full px-3 py-2.5 bg-secondary border-0 rounded-lg text-sm text-foreground focus:ring-2 focus:ring-accent/20 outline-none"
                  />
                </div>

                <button
                  onClick={fetchWeekly}
                  disabled={!weekStart || loadingWeekly}
                  className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingWeekly ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  Get Report
                </button>

                {weekly && (
                  <div className="space-y-2 pt-4 border-t border-border">
                    <StatRow label="Calories Eaten" value={weekly.totals.eaten} unit="kcal" accent />
                    <StatRow label="Calories Burned" value={weekly.totals.burned} unit="kcal" />
                    <StatRow label="Protein" value={weekly.totals.protein} unit="g" />
                    <StatRow label="Carbs" value={weekly.totals.carbs} unit="g" />
                    <StatRow label="Fats" value={weekly.totals.fats} unit="g" />
                  </div>
                )}
              </div>
            </ReportCard>

            {/* Monthly Report */}
            <ReportCard
              title="Monthly Report"
              description="Review monthly achievements"
              icon={<Activity className="w-5 h-5" />}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Select Month</label>
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-3 py-2.5 bg-secondary border-0 rounded-lg text-sm text-foreground focus:ring-2 focus:ring-accent/20 outline-none"
                  />
                </div>

                <button
                  onClick={fetchMonthly}
                  disabled={!month || loadingMonthly}
                  className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingMonthly ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <Activity className="w-4 h-4" />
                  )}
                  Get Report
                </button>

                {monthly && (
                  <div className="space-y-2 pt-4 border-t border-border">
                    <StatRow label="Calories Eaten" value={monthly.totals.eaten} unit="kcal" accent />
                    <StatRow label="Calories Burned" value={monthly.totals.burned} unit="kcal" />
                    <StatRow label="Protein" value={monthly.totals.protein} unit="g" />
                    <StatRow label="Carbs" value={monthly.totals.carbs} unit="g" />
                    <StatRow label="Fats" value={monthly.totals.fats} unit="g" />
                  </div>
                )}
              </div>
            </ReportCard>
          </div>
        </div>
      </div>
    </>
  );
};

const ReportCard = ({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10">
    <div className="bg-primary p-4">
      <div className="flex items-center gap-2 text-primary-foreground mb-1">
        {icon}
        <h2 className="font-semibold">{title}</h2>
      </div>
      <p className="text-sm text-primary-foreground/70">{description}</p>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const MacroRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center justify-between text-sm">
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span>{label}</span>
    </div>
    <span className="font-bold text-foreground">{value}</span>
  </div>
);

const StatRow = ({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: number;
  unit: string;
  accent?: boolean;
}) => (
  <div className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10 cursor-pointer ${accent ? "bg-accent/10" : "bg-secondary"}`}>
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className={`font-bold ${accent ? "text-accent" : "text-foreground"}`}>
      {value.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
    </span>
  </div>
);

export default Reports;