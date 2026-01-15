import { useEffect, useState } from "react";
import {
  Flame,
  Activity,
  Dumbbell,
  Salad,
  Calendar,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import NavBar from "@/components/NavBar";
import StatCard from "@/components/StatCard";
import avatarMale from "@/assets/avatar-male.png";
import avatarFemale from "@/assets/avatar-female.png";
import api from "@/lib/api";

const normalizeDate = (date) =>
  new Date(date).toISOString().split("T")[0];

const Dashboard = () => {
  const [profile, setProfile] = useState({ firstName: "User", gender: "other" });
  const [workouts, setWorkouts] = useState([]);
  const [dietEntries, setDietEntries] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMotivation, setShowMotivation] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);

  useEffect(() => {
    let motivationTimer;
    let welcomeTimer;
  
    const fetchDashboard = async () => {
      try {
        const profileRes = await api.get("/profile");
        if (profileRes.data) {
          setProfile({
            firstName: profileRes.data.firstName || "User",
            gender: profileRes.data.gender || "other",
          });
        }
  
        setWorkouts((await api.get("/workouts")).data || []);
        setDietEntries((await api.get("/diet")).data || []);
        setSchedules((await api.get("/schedule")).data || []);
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      } finally {
        const hasSeenWelcome = sessionStorage.getItem("dashboardWelcomeShown");
  
        if (!hasSeenWelcome) {
          setShowWelcomeScreen(true);
  
          motivationTimer = setTimeout(() => {
            setShowMotivation(true);
          }, 1000);
  
          welcomeTimer = setTimeout(() => {
            setShowWelcomeScreen(false);
            setLoading(false);
            sessionStorage.setItem("dashboardWelcomeShown", "true");
          }, 3000);
        } else {
          setLoading(false);
        }
      }
    };
  
    fetchDashboard();
  
    return () => {
      clearTimeout(motivationTimer);
      clearTimeout(welcomeTimer);
    };
  }, []);
  

  const getGenderAvatar = () => {
    if (profile.gender === "male") {
      return <img src={avatarMale} alt="Avatar" className="inline-block w-12 h-12 md:w-16 md:h-16 object-contain align-middle -mt-2" />;
    } else if (profile.gender === "female") {
      return <img src={avatarFemale} alt="Avatar" className="inline-block w-12 h-12 md:w-16 md:h-16 object-contain align-middle -mt-2" />;
    }
    return "👋";
  };

  // Calculate today's stats
  const today = new Date().toISOString().split("T")[0];
  
  const todayWorkouts = workouts.filter((w) => normalizeDate(w.date) === today);
  const todayDiet = dietEntries.filter((d) => normalizeDate(d.date) === today);

  const todayCaloriesEaten = todayDiet.reduce((sum, d) => sum + d.calories, 0);
  const todayCaloriesBurned = todayWorkouts.reduce((sum, w) => sum + w.calories, 0);
  
  const macros = todayDiet.reduce(
    (acc, d) => ({
      protein: acc.protein + (d.protein || 0),
      carbs: acc.carbs + (d.carbs || 0),
      fats: acc.fats + (d.fats || 0),
    }),
    { protein: 0, carbs: 0, fats: 0 }
  );

  // Get recent workouts (last 5)
  const recentWorkouts = workouts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Get recent diet (last 5)
  const recentDiet = dietEntries
    .sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
      const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
      return dateTimeB - dateTimeA;
    })
    .slice(0, 5);

  // Get upcoming schedule (next 6 tasks)
  const upcomingSchedule = schedules
    .filter((s) => normalizeDate(s.date) >= today)
    .sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
      const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
      return dateTimeA - dateTimeB;
    })
    .slice(0, 6);

  // Show welcome screen only on first login
  if (showWelcomeScreen) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gradient-to-bl from-accent/20 via-accent/5 to-background relative overflow-hidden">
          {/* Slower floating gradient backgrounds */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 animate-float-slow" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/15 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 animate-float-slow-reverse" />
          </div>
          
          <div className="relative flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground animate-fade-in flex items-center gap-2">
              Welcome Back, {profile.firstName} {getGenderAvatar()}
            </h1>
            <p 
              className={`text-xl md:text-2xl text-accent font-medium mt-4 transition-all duration-500 ${
                showMotivation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Let's grind 💪
            </p>
          </div>
        </div>
      </>
    );
  }

  // Show loading spinner while fetching data (not first time)
  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gradient-to-bl from-accent/20 via-accent/5 to-background relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 animate-float-slow" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/15 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 animate-float-slow-reverse" />
          </div>
          
          <div className="relative flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
              <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const calorieGoal = 2000;
  const calorieProgress = (todayCaloriesEaten / calorieGoal) * 100;
  const netCalories = todayCaloriesEaten - todayCaloriesBurned;

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-bl from-accent/20 via-accent/5 to-background relative overflow-hidden">
        {/* Slower floating gradient backgrounds */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 animate-float-slow" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/15 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 animate-float-slow-reverse" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-2">
              Welcome back, {profile.firstName} {getGenderAvatar()}
            </h1>
            <p className="text-muted-foreground mt-2">Here's your fitness summary for today</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Calories Eaten"
              value={todayCaloriesEaten}
              icon={Flame}
              variant="accent"
            />
            <StatCard
              label="Calories Burned"
              value={todayCaloriesBurned}
              icon={Activity}
            />
            <StatCard
              label="Net Calories"
              value={netCalories > 0 ? `+${netCalories}` : netCalories}
              icon={Target}
            />
            <div className="rounded-xl p-4 border border-border bg-card transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10 hover:border-accent/30">
              <p className="text-sm text-muted-foreground mb-2">Daily Goal</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${Math.min(calorieProgress, 100)}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {Math.round(calorieProgress)}%
                </span>
              </div>
            </div>
          </div>

          {/* Macros */}
          <div className="bg-card rounded-xl border border-border p-6 mb-8">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Salad className="w-5 h-5 text-accent" />
              Today's Macros
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <MacroItem label="Protein" value={macros.protein} unit="g" />
              <MacroItem label="Carbs" value={macros.carbs} unit="g" />
              <MacroItem label="Fats" value={macros.fats} unit="g" />
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Recent Workouts */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-accent" />
                  Recent Workouts
                </h3>
                <Link to="/workouts" className="text-sm text-accent hover:underline">
                  View all
                </Link>
              </div>
              <div className="p-4">
                {recentWorkouts.length === 0 ? (
                  <EmptyState icon={Dumbbell} message="No workouts logged yet" />
                ) : (
                  <div className="space-y-3">
                    {recentWorkouts.map((w) => (
                      <ListItem key={w._id} title={w.exercise} subtitle={`${w.calories} cal`} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Meals */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Salad className="w-5 h-5 text-accent" />
                  Recent Meals
                </h3>
                <Link to="/diet" className="text-sm text-accent hover:underline">
                  View all
                </Link>
              </div>
              <div className="p-4">
                {recentDiet.length === 0 ? (
                  <EmptyState icon={Salad} message="No meals logged yet" />
                ) : (
                  <div className="space-y-3">
                    {recentDiet.map((d) => (
                      <ListItem key={d._id} title={d.food} subtitle={`${d.calories} cal`} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Schedule */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent" />
                Upcoming Schedule
              </h3>
              <Link to="/schedule" className="text-sm text-accent hover:underline">
                View all
              </Link>
            </div>
            <div className="p-4">
              {upcomingSchedule.length === 0 ? (
                <EmptyState icon={Calendar} message="No upcoming tasks" />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {upcomingSchedule.map((s) => (
                    <div key={s._id} className="bg-secondary rounded-lg p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10 cursor-pointer">
                      <p className="font-medium text-foreground mb-2">{s.task}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span>{s.time}</span>
                      </div>
                    </div>
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

const MacroItem = ({ label, value, unit }) => (
  <div className="text-center">
    <p className="text-2xl font-bold text-foreground">{value}<span className="text-sm text-muted-foreground">{unit}</span></p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

const ListItem = ({ title, subtitle }) => (
  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10 cursor-pointer">
    <span className="font-medium text-foreground">{title}</span>
    <span className="text-sm text-muted-foreground">{subtitle}</span>
  </div>
);

const EmptyState = ({ icon: Icon, message }) => (
  <div className="text-center py-8">
    <Icon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);

export default Dashboard;