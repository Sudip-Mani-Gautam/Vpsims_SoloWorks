import { useState } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Shield, Users, User as UserIcon, Loader2, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("customer");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");

  const roles: { role: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
    { role: "admin", label: "Admin", icon: <Shield className="w-5 h-5" />, desc: "Full system control" },
    { role: "staff", label: "Staff", icon: <Users className="w-5 h-5" />, desc: "Sales & inventory" },
    { role: "customer", label: "Customer", icon: <UserIcon className="w-5 h-5" />, desc: "Parts & bookings" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        const { data } = await api.post('/auth/login', { email, password });
        login({ 
          id: data.userId, 
          name: data.name, 
          email: data.email, 
          role: data.role 
        }, data.token);
        toast.success("Welcome back, " + data.name);
        navigate('/');
      } else {
        // Validation for customers
        if (selectedRole === "customer" && (!vehicleMake || !vehicleModel)) {
          toast.error("Vehicle details are mandatory for customer registration.");
          setLoading(false);
          return;
        }

        // Backend expects TitleCase roles
        const backendRole = selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1);
        const { data } = await api.post('/auth/register', { 
          name, 
          email, 
          password, 
          role: backendRole,
          vehicleMake,
          vehicleModel
        });
        login({ 
          id: data.userId, 
          name: data.name, 
          email: data.email, 
          role: data.role 
        }, data.token);
        toast.success("Account created successfully!");
        navigate('/');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Authentication failed. Please check your credentials.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary opacity-5" />
      
      {/* Dynamic Background Circles */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-primary/10 overflow-hidden border border-border">
              <img src="/icon.png" alt="VPSIMS Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight">VPSIMS</h1>
          </div>
          <p className="text-muted-foreground font-medium">Professional Vehicle Parts Management</p>
        </div>

        <Card className="glass-card shadow-2xl border-white/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-heading font-bold">{isLogin ? "Sign In" : "Create Account"}</CardTitle>
            <CardDescription className="text-sm">
              {isLogin ? "Enter your credentials to access the portal" : "Join the professional inventory network"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">


              <div className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="John Doe" 
                      className="bg-background/50"
                      autoFocus
                      required 
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="name@company.com" 
                    className="bg-background/50"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="••••••••" 
                      className="bg-background/50 pr-10"
                      required 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {!isLogin && selectedRole === "customer" && (
                  <div className="grid grid-cols-2 gap-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                      <Label htmlFor="make">Vehicle Brand</Label>
                      <Input 
                        id="make" 
                        value={vehicleMake} 
                        onChange={(e) => setVehicleMake(e.target.value)} 
                        placeholder="e.g. Toyota" 
                        className="bg-background/50 border-primary/20"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model Name</Label>
                      <Input 
                        id="model" 
                        value={vehicleModel} 
                        onChange={(e) => setVehicleModel(e.target.value)} 
                        placeholder="e.g. Corolla" 
                        className="bg-background/50 border-primary/20"
                        required 
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-primary text-white hover:bg-primary/90 font-bold shadow-lg shadow-primary/20 hover:opacity-95 transition-all"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  isLogin ? "Access Portal" : "Complete Registration"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border/50 text-center">
              <p className="text-sm text-muted-foreground font-medium">
                {isLogin ? "New to the system?" : "Already have an account?"}{" "}
                <button 
                  onClick={() => setIsLogin(!isLogin)} 
                  className="text-primary font-bold hover:underline underline-offset-4 transition-colors"
                >
                  {isLogin ? "Request Enrollment" : "Sign In Here"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
