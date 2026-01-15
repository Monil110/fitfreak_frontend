import { Link } from "react-router-dom";
import {
  Dumbbell,
  Flame,
  Calendar,
  ChevronRight,
  Activity,
  Target,
  Zap,
  TrendingUp,
} from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

const AnimatedStat = ({
  end,
  suffix,
  label,
  duration,
  decimals = 0,
  isAccent = false,
}: {
  end: number;
  suffix: string;
  label: string;
  duration: number;
  decimals?: number;
  isAccent?: boolean;
}) => {
  const { ref, value } = useCountUp({ end, duration, suffix, decimals });
  return (
    <div ref={ref}>
      <p
        className={`text-3xl font-display italic ${
          isAccent ? "text-accent" : "text-foreground"
        }`}
      >
        {value}
      </p>
      <p className="text-sm text-muted-foreground tracking-wide uppercase">
        {label}
      </p>
    </div>
  );
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-bl from-accent/20 via-accent/5 to-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 animate-float-slow" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/15 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 animate-float-slow-reverse" />
      </div>

      {/* Navbar */}
      <nav className="relative flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <h1 className="text-xl font-bold text-foreground">
          Fit<span className="text-accent">Freak</span>
        </h1>

        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="px-4 py-2 text-muted-foreground font-medium hover:text-accent transition-colors"
          >
            Login
          </Link>
          <Link
            to="/auth"
            className="px-5 py-2.5 bg-accent text-accent-foreground font-semibold rounded-xl hover:shadow-lg hover:shadow-accent/30 transition-all"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 text-accent text-sm font-medium rounded-full mb-6">
              <Activity className="w-4 h-4" />
              Your Fitness Journey Starts Here
            </div>

            <h1 className="text-4xl md:text-6xl font-display italic mb-6 text-foreground">
              Track. Train. <span className="text-accent">Transform.</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-md">
              Track workouts, monitor nutrition, and reach your goals with ease.
            </p>

            <div className="flex gap-4">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-accent-foreground font-semibold rounded-xl hover:shadow-xl transition-all"
              >
                Start Free
                <ChevronRight className="w-5 h-5" />
              </Link>

              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-8 py-4 bg-card border border-border text-foreground font-semibold rounded-xl hover:border-accent transition-all"
              >
                View Demo
              </Link>
            </div>

            <div className="flex gap-8 mt-12 pt-8 border-t border-border/50">
              <AnimatedStat end={10} suffix="k+" label="Users" duration={1500} />
              <AnimatedStat end={500} suffix="k+" label="Workouts" duration={2000} />
              <AnimatedStat
                end={4.9}
                suffix="★"
                label="Rating"
                duration={1200}
                decimals={1}
                isAccent
              />
            </div>
          </div>

          {/* Right visual (unchanged UI) */}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto flex justify-between">
          <h1 className="text-xl font-bold text-foreground">
            Fit<span className="text-accent">Freak</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            © 2024 FitFreak
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
