import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Edit, Ban, Mail, Phone, Search, Users, Loader2, Eye, EyeOff, KeyRound, ShieldAlert, CheckCircle2, X, Filter, BarChart3, Clock, ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, 
  PieChart, Pie, Cell, AreaChart, Area 
} from "recharts";

interface Staff {
  id: string; name: string; email: string; phone: string;
  role: string; branch: string; joinDate: string; status: "Active" | "Inactive";
}

const initialStaff: Staff[] = [
  { id: "1", name: "Ram Sharma",   email: "ram@vpsims.com",  phone: "9801234567", role: "Sales Associate",    branch: "Kathmandu",  joinDate: "2024-01-15", status: "Active" },
  { id: "2", name: "Sita Thapa",   email: "sita@vpsims.com", phone: "9807654321", role: "Inventory Manager",  branch: "Kathmandu",  joinDate: "2024-03-20", status: "Active" },
  { id: "3", name: "Hari Basnet",  email: "hari@vpsims.com", phone: "9812345678", role: "Senior Sales",       branch: "Pokhara",    joinDate: "2023-11-10", status: "Active" },
];

const ROLES   = ["Sales Associate", "Senior Sales", "Inventory Manager", "Customer Service", "Mechanic", "Accountant"];
const BRANCHES = ["Kathmandu", "Pokhara", "Lalitpur", "Bhaktapur", "Biratnagar"];

const defaultForm = { name: "", email: "", phone: "", role: "", branch: "", password: "" };

const Field = ({ 
  label, name, form, setForm, errors, setErrors, showPassword, setShowPassword, type = "text", placeholder = "" 
}: { 
  label: string; 
  name: keyof typeof defaultForm; 
  form: typeof defaultForm;
  setForm: React.Dispatch<React.SetStateAction<typeof defaultForm>>;
  errors: Partial<typeof defaultForm>;
  setErrors: React.Dispatch<React.SetStateAction<Partial<typeof defaultForm>>>;
  showPassword?: boolean;
  setShowPassword?: (v: boolean) => void;
  type?: string; 
  placeholder?: string 
}) => {
  const isPassword = type === "password";
  return (
    <div className="space-y-1.5">
      <Label className="text-label">{label}</Label>
      <div className="relative">
        <Input
          type={isPassword ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          value={form[name]}
          onChange={e => { 
            setForm(f => ({ ...f, [name]: e.target.value })); 
            setErrors(er => ({ ...er, [name]: undefined })); 
          }}
          className={cn(
            errors[name] && "border-destructive focus-visible:ring-destructive",
            isPassword && "pr-10"
          )}
        />
        {isPassword && setShowPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {errors[name] && <p className="text-xs text-destructive font-medium">{errors[name]}</p>}
    </div>
  );
};

const StaffManagement = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen]   = useState(false);
  const [isEdit, setIsEdit]   = useState(false);
  const [form, setForm]       = useState(defaultForm);
  const [errors, setErrors]   = useState<Partial<typeof defaultForm>>({});
  const [search, setSearch]   = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"main" | "rankings">("main");
  const [staffToToggle, setStaffToToggle] = useState<Staff | null>(null);

  const { data: staff = [], isLoading } = useQuery<Staff[]>({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data } = await api.get('/user/role/Staff');
      return data.map((u: any) => ({
        ...u,
        status: u.isActive ? "Active" : "Inactive",
        joinDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"
      }));
    }
  });

  const registerMutation = useMutation({
    mutationFn: (data: typeof defaultForm) => api.post('/auth/register', { 
      name: data.name, 
      email: data.email, 
      password: data.password, 
      role: "Staff" 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success(`${form.name} has been registered successfully.`);
      setIsOpen(false);
      setForm(defaultForm);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: typeof defaultForm & { id: string }) => api.put(`/user/${data.id}`, {
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      branch: data.branch
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success("Staff profile updated successfully.");
      setIsOpen(false);
      setForm(defaultForm);
      setIsEdit(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Update failed");
    }
  });

  const deactivateMutation = useMutation({
    mutationFn: (staff: Staff) => api.patch(`/user/${staff.id}/status`),
    onSuccess: (_, staff) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      const newStatus = staff.status === "Active" ? "Inactive" : "Active";
      toast.success(`${staff.name} is now ${newStatus}.`, {
        description: newStatus === "Inactive" ? "They will no longer have access to the system." : "Access has been restored successfully.",
        icon: newStatus === "Inactive" ? <ShieldAlert className="w-4 h-4 text-destructive" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      });
      setIsConfirmOpen(false);
      setStaffToToggle(null);
    }
  });

  const passwordMutation = useMutation({
    mutationFn: ({ id, password }: { id: string, password: string }) => api.patch(`/user/${id}/password`, { password }),
    onSuccess: () => {
      toast.success("Password changed successfully", {
        description: `Login credentials for ${selectedStaff?.name} have been updated.`
      });
      setIsPasswordOpen(false);
      setNewPassword("");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update password");
    }
  });

  const validate = () => {
    const e: Partial<typeof defaultForm> = {};
    if (!form.name)     e.name     = "Full name is required";
    if (!form.email)    e.email    = "Email is required";
    if (!form.phone)    e.phone    = "Phone is required";
    if (!form.role)     e.role     = "Please select a role";
    if (!form.branch)   e.branch   = "Please select a branch";
    if (!isEdit && (!form.password || form.password.length < 6)) e.password = "Minimum 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (isEdit && selectedStaff) {
      updateMutation.mutate({ ...form, id: selectedStaff.id });
    } else {
      registerMutation.mutate(form);
    }
  };

  const handleDeactivate = (staff: Staff) => {
    setStaffToToggle(staff);
    setIsConfirmOpen(true);
  };

  const confirmToggle = () => {
    if (staffToToggle) {
      deactivateMutation.mutate(staffToToggle);
    }
  };

  const handleEdit = (staff: Staff) => {
    setSelectedStaff(staff);
    setForm({
      name: staff.name,
      email: staff.email,
      phone: staff.phone || "",
      role: staff.role || "",
      branch: staff.branch || "",
      password: "" // Don't pre-fill password in edit mode
    });
    setIsEdit(true);
    setIsOpen(true);
  };

  const handleChangePassword = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsPasswordOpen(true);
  };

  const submitPasswordChange = () => {
    if (!selectedStaff || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    passwordMutation.mutate({ id: selectedStaff.id, password: newPassword });
  };

   const filtered = staff.filter(s => {
    const matchesSearch = (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
                          (s.email || "").toLowerCase().includes(search.toLowerCase()) ||
                          (s.role || "").toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "All" || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

   if (currentView === "rankings") {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 w-9 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-all border-border" 
              onClick={() => setCurrentView("main")}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-xl font-bold text-foreground">Staff Performance Rankings</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Real-time productivity leaderboard across all departments</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-3">
              {staff.slice(0, 5).map((s, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                  {s.name?.[0]}
                </div>
              ))}
            </div>
            <span className="text-[11px] font-bold text-muted-foreground ml-2">Active Workforce</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff
            .map(s => ({ ...s, score: 75 + (parseInt(s.id) % 25 || 0) }))
            .sort((a, b) => b.score - a.score)
            .map((s, i) => (
              <Card key={s.id} className="card-standard p-5 hover:border-primary/40 group transition-all relative overflow-hidden">
                {i < 3 && (
                  <div className={cn(
                    "absolute -top-1 -right-1 w-12 h-12 rotate-12 flex items-center justify-center opacity-10 group-hover:scale-125 transition-transform",
                    i === 0 ? "text-amber-500" : i === 1 ? "text-slate-400" : "text-orange-600"
                  )}>
                    <ShieldAlert className="w-10 h-10" />
                  </div>
                )}
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-base font-black group-hover:scale-110 transition-transform">
                      {s.name?.[0]}
                    </div>
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-6 h-6 rounded-lg border-2 border-background flex items-center justify-center text-[10px] font-black text-white shadow-md",
                      i === 0 ? "bg-amber-400" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-orange-600" : "bg-muted text-muted-foreground"
                    )}>
                      #{i + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-foreground truncate">{s.name}</h4>
                    <p className="text-[11px] text-muted-foreground truncate">{s.role}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Productivity Score</span>
                    <span className={cn("text-sm font-black", s.score > 90 ? "text-emerald-500" : "text-primary")}>{s.score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-1000", s.score > 90 ? "bg-emerald-500" : "bg-primary")} 
                      style={{ width: `${s.score}%` }} 
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> 1.2h avg resp</span>
                    <span className="text-emerald-500 font-bold">Excellent</span>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Staff Management</h1>
          <p className="text-xs text-muted-foreground">Manage all registered staff members and their access</p>
        </div>
        <Button size="sm" className="bg-primary text-white hover:bg-primary/90 gap-1.5 h-8 text-xs" onClick={() => setIsOpen(true)}>
          <UserPlus className="w-3.5 h-3.5" /> Add Staff Member
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Staff",  value: staff.length,                                      color: "text-blue-600",   bg: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800" },
          { label: "Active",       value: staff.filter(s => s.status === "Active").length,   color: "text-emerald-600",bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800" },
          { label: "Inactive",     value: staff.filter(s => s.status === "Inactive").length, color: "text-red-600",    bg: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800" },
          { label: "Branches",     value: new Set(staff.map(s => s.branch)).size,            color: "text-violet-600", bg: "bg-violet-50 border-violet-200 dark:bg-violet-950 dark:border-violet-800" },
        ].map(({ label, value, color, bg }) => (
          <Card key={label} className="card-standard">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{value}</p>
              </div>
              <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center", bg, color)}>
                <Users className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>       {/* Tabs & Content */}
      <Tabs defaultValue="directory" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted/50 border border-border h-9 p-1">
            <TabsTrigger value="directory" className="text-xs px-4 h-7 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Staff Directory
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-xs px-4 h-7 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Performance Analytics
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-muted/30 border border-border rounded-lg px-2 py-1 overflow-x-auto no-scrollbar max-w-[400px]">
              <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              {["All", ...ROLES.slice(0, 3)].map(r => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={cn(
                    "px-2.5 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all",
                    roleFilter === r 
                      ? "bg-primary text-white shadow-sm" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="relative w-64 group">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input 
                className="pl-8 pr-8 h-8 text-xs focus-visible:ring-1 focus-visible:ring-primary bg-background" 
                placeholder="Search staff…" 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        <TabsContent value="directory" className="m-0 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Card className="card-standard overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 h-9">
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-4 py-0">Name</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-0">Contact</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-0">Role</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-0">Branch</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-0">Joined</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-0">Status</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right pr-4 py-0">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="h-12">
                        <TableCell className="pl-4"><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32 mb-1" /><Skeleton className="h-3 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20 rounded" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-3 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16 rounded" /></TableCell>
                        <TableCell className="text-right pr-4"><div className="flex justify-end gap-1"><Skeleton className="w-7 h-7 rounded-md" /><Skeleton className="w-7 h-7 rounded-md" /><Skeleton className="w-7 h-7 rounded-md" /></div></TableCell>
                      </TableRow>
                    ))
                  ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground/40">
                        <Search className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">No staff members found</p>
                        <p className="text-xs text-muted-foreground">
                          {search ? `Try adjusting your search for "${search}"` : "Add your first staff member to get started"}
                        </p>
                      </div>
                      {search && (
                        <Button variant="outline" size="sm" className="h-7 text-xs mt-1" onClick={() => setSearch("")}>
                          Clear Search
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/30 transition-colors h-11">
                  <TableCell className="pl-4 py-0 font-semibold text-sm text-foreground">{s.name}</TableCell>
                  <TableCell className="py-0">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-xs text-foreground"><Mail className="w-2.5 h-2.5 text-muted-foreground" />{s.email}</div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground"><Phone className="w-2.5 h-2.5" />{s.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell className="py-0">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[11px] font-semibold border border-blue-200 dark:border-blue-800">{s.role || "Staff"}</span>
                  </TableCell>
                  <TableCell className="py-0 text-xs text-muted-foreground">{s.branch || "—"}</TableCell>
                  <TableCell className="py-0 text-[11px] text-muted-foreground">{s.joinDate || "—"}</TableCell>
                  <TableCell className="py-0">
                    <span className={cn("px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors",
                      s.status === "Active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
                        : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900"
                    )}>{s.status}</span>
                  </TableCell>
                  <TableCell className="py-0 text-right pr-4">
                    <div className="flex justify-end gap-0.5">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-primary hover:bg-primary/10"
                        title="Edit Details"
                        onClick={() => handleEdit(s)}
                        disabled={s.status === "Inactive"}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-primary hover:bg-primary/10 transition-colors"
                        title="Change Password"
                        onClick={() => handleChangePassword(s)}
                        disabled={s.status === "Inactive"}
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                          "h-7 w-7 transition-all duration-300",
                          s.status === "Active" 
                            ? "text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40" 
                            : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40"
                        )}
                        title={s.status === "Active" ? "Deactivate Account" : "Activate Account"}
                        onClick={() => handleDeactivate(s)}
                      >
                        {s.status === "Active" ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                 ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Charts & Metrics */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="card-standard p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Avg. Response Time</span>
                    <Clock className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-foreground">1.4h</span>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 rounded">-12%</span>
                  </div>
                </Card>
                <Card className="card-standard p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Service Completion</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-foreground">94.2%</span>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 rounded">+2.4%</span>
                  </div>
                </Card>
              </div>

              <Card className="card-standard p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Productivity Trend</h3>
                    <p className="text-[11px] text-muted-foreground">Monthly service completion across all staff</p>
                  </div>
                  <Select defaultValue="30d">
                    <SelectTrigger className="w-24 h-7 text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7d</SelectItem>
                      <SelectItem value="30d">Last 30d</SelectItem>
                      <SelectItem value="90d">Last 90d</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { day: 'Mon', val: 45 }, { day: 'Tue', val: 52 }, { day: 'Wed', val: 48 }, 
                      { day: 'Thu', val: 70 }, { day: 'Fri', val: 61 }, { day: 'Sat', val: 38 }, { day: 'Sun', val: 42 }
                    ]}>
                      <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'hsl(var(--muted-foreground))'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'hsl(var(--muted-foreground))'}} />
                      <ReTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }}
                      />
                      <Area type="monotone" dataKey="val" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Right: Distribution & Rankings */}
            <div className="space-y-4">
              <Card className="card-standard p-6">
                <h3 className="text-sm font-bold text-foreground mb-4">Role Distribution</h3>
                <div className="h-[200px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Sales', value: 40 },
                          { name: 'Mech', value: 30 },
                          { name: 'Admin', value: 20 },
                          { name: 'Inv', value: 10 },
                        ]}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {['hsl(var(--primary))', '#10b981', '#f59e0b', '#ef4444'].map((color, i) => (
                          <Cell key={i} fill={color} />
                        ))}
                      </Pie>
                      <ReTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-black text-foreground">{staff.length}</span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Total Staff</span>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  {[
                    { label: 'Sales Associate', color: 'bg-primary' },
                    { label: 'Mechanic', color: 'bg-emerald-500' },
                    { label: 'Administrator', color: 'bg-amber-500' },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", r.color)} />
                        <span className="text-muted-foreground">{r.label}</span>
                      </div>
                      <span className="font-bold text-foreground">
                        {Math.round((staff.filter(s => s.role === r.label).length / staff.length) * 100) || 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="card-standard overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/20">
                  <h3 className="text-sm font-bold text-foreground">Top Performers</h3>
                </div>
                <div className="divide-y divide-border">
                  {staff.slice(0, 3).map((s, i) => (
                    <div key={s.id} className="p-3 flex items-center gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                          {s.name?.[0]}
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-background flex items-center justify-center text-[8px] font-black text-white">
                          {i + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{s.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{s.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-emerald-500">98%</p>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold">Score</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full h-9 text-[11px] font-bold text-primary hover:bg-primary/5 rounded-none"
                  onClick={() => setCurrentView("rankings")}
                >
                  View Full Rankings
                </Button>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Staff Dialog */}
      <Dialog open={isOpen} onOpenChange={v => { setIsOpen(v); if (!v) { setForm(defaultForm); setErrors({}); setIsEdit(false); setSelectedStaff(null); } }}>
        <DialogContent className="max-w-xl">
          <DialogHeader className="pb-4 border-b border-border">
            <DialogTitle className="text-subheading flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                {isEdit ? <Edit className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              </div>
              {isEdit ? "Update Staff Profile" : "Register New Staff Member"}
            </DialogTitle>
            <p className="text-caption mt-1">{isEdit ? `Modifying details for ${selectedStaff?.name}` : "Fill in all the details below to create a staff account"}</p>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Row 1 */}
            <Field label="Full Name" name="name" placeholder="e.g. Ram Sharma" form={form} setForm={setForm} errors={errors} setErrors={setErrors} />

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email Address" name="email" type="email" placeholder="staff@vpsims.com" form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
              <Field label="Phone Number" name="phone" placeholder="98XXXXXXXX" form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-label">Role</Label>
                <Select value={form.role} onValueChange={v => { setForm(f => ({ ...f, role: v })); setErrors(e => ({ ...e, role: undefined })); }}>
                  <SelectTrigger className={cn(errors.role && "border-destructive")}><SelectValue placeholder="Select role…" /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-xs text-destructive font-medium">{errors.role}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-label">Branch</Label>
                <Select value={form.branch} onValueChange={v => { setForm(f => ({ ...f, branch: v })); setErrors(e => ({ ...e, branch: undefined })); }}>
                  <SelectTrigger className={cn(errors.branch && "border-destructive")}><SelectValue placeholder="Select branch…" /></SelectTrigger>
                  <SelectContent>
                    {BRANCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.branch && <p className="text-xs text-destructive font-medium">{errors.branch}</p>}
              </div>
            </div>

            {!isEdit && (
              <Field 
                label="Temporary Password" 
                name="password" 
                type="password" 
                placeholder="Minimum 6 characters" 
                form={form} 
                setForm={setForm} 
                errors={errors} 
                setErrors={setErrors}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={() => { setIsOpen(false); setForm(defaultForm); setErrors({}); setIsEdit(false); }}>
              Cancel
            </Button>
            <Button className="flex-1 bg-primary text-white hover:bg-primary/90" onClick={handleSubmit} disabled={registerMutation.isPending || updateMutation.isPending}>
              {registerMutation.isPending || updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (isEdit ? <Edit className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />)}
              {isEdit ? "Save Changes" : "Register Staff"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Change Password Dialog */}
      <Dialog open={isPasswordOpen} onOpenChange={v => { setIsPasswordOpen(v); if (!v) { setNewPassword(""); setSelectedStaff(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader className="pb-4 border-b border-border">
            <DialogTitle className="text-subheading flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600">
                <KeyRound className="w-4 h-4" />
              </div>
              Change Password
            </DialogTitle>
            <p className="text-caption mt-1">Update login credentials for <span className="font-bold text-foreground">{selectedStaff?.name}</span></p>
          </DialogHeader>

          <div className="space-y-4 py-6">
            <div className="space-y-1.5">
              <Label className="text-label">New Password</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter at least 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">Changing the password will take effect immediately upon the staff member's next login attempt.</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={() => setIsPasswordOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-primary text-white" 
              onClick={submitPasswordChange}
              disabled={passwordMutation.isPending || newPassword.length < 6}
            >
              {passwordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <KeyRound className="w-4 h-4 mr-2" />}
              Update Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={v => { setIsConfirmOpen(v); if (!v) setStaffToToggle(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-subheading flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-lg border flex items-center justify-center",
                staffToToggle?.status === "Active" ? "bg-red-50 border-red-200 text-red-600" : "bg-emerald-50 border-emerald-200 text-emerald-600"
              )}>
                {staffToToggle?.status === "Active" ? <Ban className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
              </div>
              {staffToToggle?.status === "Active" ? "Confirm Deactivation" : "Confirm Activation"}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-foreground">Are you sure you want to {staffToToggle?.status === "Active" ? "deactivate" : "activate"} <strong>{staffToToggle?.name}</strong>'s account?</p>
            <p className="text-xs text-muted-foreground mt-2">
              {staffToToggle?.status === "Active" 
                ? "This staff member will lose all access to the system immediately." 
                : "This will restore the staff member's access to the portal."}
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button 
              className={cn(
                "flex-1 text-white transition-all",
                staffToToggle?.status === "Active" ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
              )} 
              onClick={confirmToggle}
              disabled={deactivateMutation.isPending}
            >
              {deactivateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {staffToToggle?.status === "Active" ? "Deactivate Now" : "Activate Now"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffManagement;
