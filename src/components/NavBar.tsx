import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Dumbbell, 
  Salad, 
  Calendar, 
  BarChart3, 
  User,
  Menu,
  X,
  Search
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/workouts", label: "Workouts", icon: Dumbbell },
  { path: "/diet", label: "Diet", icon: Salad },
  { path: "/schedule", label: "Schedule", icon: Calendar },
  { path: "/reports", label: "Reports", icon: BarChart3 },
  { path: "/profile", label: "Profile", icon: User },
];

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const token = localStorage.getItem("token");

  const handleLogoClick = () => {
    if (token) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("dashboardWelcomeShown");
    navigate("/auth");
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2"
          >
            <span className="text-xl font-bold text-foreground">
              Fit<span className="text-accent">Freak</span>
            </span>
          </button>

          {/* Search */}
          <div className="hidden sm:flex items-center gap-2 bg-secondary/50 border border-border rounded-lg px-3 py-1.5">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search Friends..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-32 lg:w-48"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm"
              >
                {item.label}
              </Link>
            ))}

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm text-destructive"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
