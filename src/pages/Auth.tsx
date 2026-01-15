import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isLogin ? "/auth/login" : "/auth/register";
      const res = await api.post(url, form);

      if (isLogin) {
        const token = res.data.access_token;

        if (!token) {
          throw new Error("Token not received");
        }

        localStorage.setItem("token", token);

        // 🔥 RESET DASHBOARD WELCOME FLAG - Show animation on new login
        sessionStorage.removeItem("dashboardWelcomeShown");

        navigate("/dashboard");
      } else {
        // Successfully registered, switch to login
        setIsLogin(true);
        // Clear form after registration
        setForm({ email: "", password: "" });
        alert("Account created successfully! Please login.");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || (isLogin ? "Login failed" : "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-accent/20 via-accent/5 to-background relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 animate-float-slow" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/15 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 animate-float-slow-reverse" />
      </div>

      <div className="relative w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Login to continue your fitness journey" : "Start your fitness journey today"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-secondary border-0 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-secondary border-0 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Please wait...
              </>
            ) : (
              isLogin ? "Login" : "Sign Up"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setForm({ email: "", password: "" }); // Clear form when switching
              }}
              className="text-accent hover:underline font-medium"
            >
              {isLogin ? "Sign up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;