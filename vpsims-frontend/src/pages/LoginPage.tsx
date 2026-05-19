import { useState, useEffect } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, Shield, Mail, Lock, User, Users, Eye, EyeOff, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const LoginPage = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("customer");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [regStep, setRegStep] = useState(1);

  const [strength, setStrength] = useState(0);
  useEffect(() => {
    if (!password) { setStrength(0); return; }
    let s = 0;
    if (password.length > 6) s += 1;
    if (password.match(/[A-Z]/)) s += 1;
    if (password.match(/[0-9]/)) s += 1;
    if (password.match(/[^A-Za-z0-9]/)) s += 1;
    setStrength(s);
  }, [password]);

  const strengthMeta = [null,
    { label: "Weak", color: "#ef4444" },
    { label: "Fair", color: "#f97316" },
    { label: "Good", color: "#3b82f6" },
    { label: "Strong", color: "#22c55e" },
  ][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && password !== confirmPassword) { toast.error("Passwords do not match"); return; }
    if (!isLogin && !agreedToTerms) { toast.error("Please agree to the terms"); return; }
    setLoading(true);
    try {
      if (isLogin) {
        const { data } = await api.post('/auth/login', { email, password });
        login({ id: data.userId, name: data.name, email: data.email, role: data.role }, data.token);
        toast.success("Welcome back, " + data.name);
        navigate('/');
      } else {
        const backendRole = selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1);
        const { data } = await api.post('/auth/register', { name, email, password, role: backendRole });
        login({ id: data.userId, name: data.name, email: data.email, role: data.role }, data.token);
        toast.success("Account created!");
        navigate('/');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-root">
      <motion.div
        className="lp-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="lp-card-top" />

        <div className="lp-card-body">
          {/* Logo & Theme Toggle */}
          <div className="lp-header">
            <div className="lp-logo">
              <div className="lp-logo-mark overflow-hidden bg-white">
                <img src="/icon.png" alt="VPSIMS" className="w-full h-full object-contain" />
              </div>
              <span className="lp-logo-name">VPSIMS</span>
            </div>

            <button
              onClick={toggleTheme}
              className="lp-theme-toggle"
              type="button"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>

          {/* Tabs */}
          <div className="lp-tabs">
            <button
              type="button"
              className={`lp-tab ${isLogin ? "lp-tab-active" : ""}`}
              onClick={() => { setIsLogin(true); setRegStep(1); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`lp-tab ${!isLogin ? "lp-tab-active" : ""}`}
              onClick={() => { setIsLogin(false); setRegStep(1); }}
            >
              Create Account
            </button>

          </div>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.form
                key="login"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="lp-form"
              >
                <div className="lp-form-head">
                  <h1 className="lp-form-title">Welcome back</h1>
                  <p className="lp-form-desc">Enter your credentials to continue</p>
                </div>

                <div className="lp-field">
                  <label className="lp-label">Email</label>
                  <div className="lp-inp-wrap">
                    <Mail size={14} className="lp-inp-icon" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@company.com" className="lp-inp" required />
                  </div>
                </div>

                <div className="lp-field">
                  <div className="lp-label-row">
                    <label className="lp-label">Password</label>
                    <button type="button" className="lp-forgot">Forgot password?</button>
                  </div>
                  <div className="lp-inp-wrap">
                    <Lock size={14} className="lp-inp-icon" />
                    <input type={showPassword ? "text" : "password"} value={password}
                      onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                      className="lp-inp lp-inp-r" required />
                    <button type="button" className="lp-eye" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                <label className="lp-check-row">
                  <input type="checkbox" className="lp-checkbox" />
                  <span className="lp-check-text">Keep me signed in</span>
                </label>

                <button type="submit" className="lp-submit" disabled={loading}>
                  {loading
                    ? <Loader2 size={16} className="animate-spin" />
                    : <><span>Sign In</span><ArrowRight size={14} /></>}
                </button>

                <p className="lp-switch">
                  No account?{" "}
                  <button
                    type="button"
                    onClick={() => { setIsLogin(false); setRegStep(1); }}
                    className="lp-link-btn lp-link-primary"
                  >
                    Create one
                  </button>
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="lp-form"
              >
                <div className="lp-form-head">
                  <h1 className="lp-form-title">Create account</h1>
                  <p className="lp-form-desc">
                    {regStep === 1 ? "Step 1: Account credentials" : "Step 2: Role & permissions"}
                  </p>

                  {/* Step Indicator */}
                  <div className="lp-steps">
                    <div className={`lp-step-dot ${regStep >= 1 ? 'lp-step-active' : ''}`} />
                    <div className="lp-step-line" />
                    <div className={`lp-step-dot ${regStep >= 2 ? 'lp-step-active' : ''}`} />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {regStep === 1 ? (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="lp-form-group"
                    >
                      <div className="lp-field">
                        <label className="lp-label">Full Name</label>
                        <div className="lp-inp-wrap">
                          <User size={14} className="lp-inp-icon" />
                          <input value={name} onChange={e => setName(e.target.value)}
                            placeholder="Enter Your Name" className="lp-inp" required />
                        </div>
                      </div>

                      <div className="lp-field">
                        <label className="lp-label">Email</label>
                        <div className="lp-inp-wrap">
                          <Mail size={14} className="lp-inp-icon" />
                          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="you@company.com" className="lp-inp" required />
                        </div>
                      </div>

                      <div className="lp-field">
                        <label className="lp-label">Password</label>
                        <div className="lp-inp-wrap">
                          <Lock size={14} className="lp-inp-icon" />
                          <input type={showPassword ? "text" : "password"} value={password}
                            onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters"
                            className="lp-inp lp-inp-r" required />
                          <button type="button" className="lp-eye" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                        {password && (
                          <div className="lp-strength">
                            <div className="lp-strength-track">
                              {[1, 2, 3, 4].map(i => (
                                <div key={i} className="lp-strength-seg"
                                  style={{ backgroundColor: i <= strength && strengthMeta ? strengthMeta.color : undefined }} />
                              ))}
                            </div>
                            {strengthMeta && <span className="lp-strength-txt" style={{ color: strengthMeta.color }}>{strengthMeta.label}</span>}
                          </div>
                        )}
                      </div>

                      <div className="lp-field">
                        <label className="lp-label">Confirm Password</label>
                        <div className="lp-inp-wrap">
                          <Lock size={14} className="lp-inp-icon" />
                          <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password"
                            className="lp-inp lp-inp-r" required />
                          <button type="button" className="lp-eye" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="lp-submit"
                        disabled={!name || !email || !password || password !== confirmPassword}
                        onClick={() => setRegStep(2)}
                      >
                        <span>Continue</span><ArrowRight size={14} />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="lp-form-group"
                    >
                      <div className="lp-field">
                        <label className="lp-label">Account Role</label>
                        <div className="lp-roles">
                          {[
                            { id: "customer", label: "Client", desc: "Self-service portal", Icon: User },
                            { id: "staff", label: "Staff", desc: "Day-to-day operations", Icon: Users },
                            { id: "admin", label: "Admin", desc: "Full system access", Icon: Shield },
                          ].map(r => (
                            <button key={r.id} type="button"
                              onClick={() => setSelectedRole(r.id as UserRole)}
                              className={`lp-role ${selectedRole === r.id ? "lp-role-on" : ""}`}
                            >
                              <r.Icon size={14} />
                              <div className="lp-role-text">
                                <span className="lp-role-name">{r.label}</span>
                                <span className="lp-role-desc">{r.desc}</span>
                              </div>
                              {selectedRole === r.id && <CheckCircle2 size={13} className="lp-role-chk" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      <label className="lp-check-row">
                        <input type="checkbox" className="lp-checkbox"
                          checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} />
                        <span className="lp-check-text">
                          I agree to the{" "}
                          <button
                            type="button"
                            onClick={() => navigate('/legal/procedures')}
                            className="lp-link-btn lp-link-primary"
                          >
                            Operating Procedures
                          </button>
                          {" "}and{" "}
                          <button
                            type="button"
                            onClick={() => navigate('/legal/security')}
                            className="lp-link-btn lp-link-primary"
                          >
                            Security Protocols
                          </button>
                        </span>
                      </label>

                      <div className="lp-btn-row">
                        <button
                          type="button"
                          className="lp-btn-ghost"
                          onClick={() => setRegStep(1)}
                        >
                          Back
                        </button>
                        <button type="submit" className="lp-submit" disabled={loading || !agreedToTerms}>
                          {loading
                            ? <Loader2 size={16} className="animate-spin" />
                            : <><span>Create Account</span><ArrowRight size={14} /></>}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <div className="lp-card-footer">
          © 2026 VPSIMS · Vehicle Parts &amp; Service Information Management System
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
