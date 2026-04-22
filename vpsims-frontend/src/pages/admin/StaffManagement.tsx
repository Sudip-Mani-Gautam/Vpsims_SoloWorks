import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Edit, Ban, Mail, Phone, Search, Users, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

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

const StaffManagement = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen]   = useState(false);
  const [form, setForm]       = useState(defaultForm);
  const [errors, setErrors]   = useState<Partial<typeof defaultForm>>({});
  const [search, setSearch]   = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { data: staff = [], isLoading } = useQuery<Staff[]>({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data } = await api.get('/user/role/Staff');
      return data;
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

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/user/${id}/status`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success("Staff status updated.");
    }
  });

  const validate = () => {
    const e: Partial<typeof defaultForm> = {};
    if (!form.name)     e.name     = "Full name is required";
    if (!form.email)    e.email    = "Email is required";
    if (!form.phone)    e.phone    = "Phone is required";
    if (!form.role)     e.role     = "Please select a role";
    if (!form.branch)   e.branch   = "Please select a branch";
    if (!form.password || form.password.length < 6) e.password = "Minimum 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;
    registerMutation.mutate(form);
  };

  const handleDeactivate = (id: string) => {
    deactivateMutation.mutate(id);
  };

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase())
  );

  const Field = ({ label, name, type = "text", placeholder = "" }: { label: string; name: keyof typeof defaultForm; type?: string; placeholder?: string }) => {
    const isPassword = type === "password";
    return (
      <div className="space-y-1.5">
        <Label className="text-label">{label}</Label>
        <div className="relative">
          <Input
            type={isPassword ? (showPassword ? "text" : "password") : type}
            placeholder={placeholder}
            value={form[name]}
            onChange={e => { setForm(f => ({ ...f, [name]: e.target.value })); setErrors(er => ({ ...er, [name]: undefined })); }}
            className={cn(
              errors[name] && "border-destructive focus-visible:ring-destructive",
              isPassword && "pr-10"
            )}
          />
          {isPassword && (
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Staff Management</h1>
          <p className="page-subtitle">Manage all registered staff members and their access</p>
        </div>
        <Button className="bg-primary text-white hover:bg-primary/90 gap-2" onClick={() => setIsOpen(true)}>
          <UserPlus className="w-4 h-4" /> Add Staff Member
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Staff",  value: staff.length,                           color: "text-blue-600",   bg: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800" },
          { label: "Active",       value: staff.filter(s => s.status === "Active").length,   color: "text-emerald-600",bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800" },
          { label: "Inactive",     value: staff.filter(s => s.status === "Inactive").length, color: "text-red-600",    bg: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800" },
          { label: "Branches",     value: new Set(staff.map(s => s.branch)).size,            color: "text-violet-600", bg: "bg-violet-50 border-violet-200 dark:bg-violet-950 dark:border-violet-800" },
        ].map(({ label, value, color, bg }) => (
          <Card key={label} className="card-standard">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-overline">{label}</p>
                <p className="text-2xl font-bold text-foreground mt-1" style={{ fontFamily: "var(--font-heading)" }}>{value}</p>
              </div>
              <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center", bg, color)}>
                <Users className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Table */}
      <Card className="card-standard overflow-hidden">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <CardTitle className="text-subheading">Staff Directory</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9 h-9" placeholder="Search by name, email, role…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-overline pl-5">Name</TableHead>
                <TableHead className="text-overline">Contact</TableHead>
                <TableHead className="text-overline">Role</TableHead>
                <TableHead className="text-overline">Branch</TableHead>
                <TableHead className="text-overline">Joined</TableHead>
                <TableHead className="text-overline">Status</TableHead>
                <TableHead className="text-overline text-right pr-5">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary opacity-50" /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-caption">No staff members found.</TableCell></TableRow>
              ) : filtered.map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="pl-5 font-semibold text-foreground">{s.name}</TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-sm text-foreground"><Mail className="w-3 h-3 text-muted-foreground" />{s.email}</div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="w-3 h-3" />{s.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-800">{s.role}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.branch}</TableCell>
                  <TableCell className="text-caption">{s.joinDate}</TableCell>
                  <TableCell>
                    <span className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold border",
                      s.status === "Active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                        : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                    )}>{s.status}</span>
                  </TableCell>
                  <TableCell className="text-right pr-5">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10"><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeactivate(s.id)}>
                        <Ban className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Staff Dialog */}
      <Dialog open={isOpen} onOpenChange={v => { setIsOpen(v); if (!v) { setForm(defaultForm); setErrors({}); } }}>
        <DialogContent className="max-w-xl">
          <DialogHeader className="pb-4 border-b border-border">
            <DialogTitle className="text-subheading flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <UserPlus className="w-4 h-4" />
              </div>
              Register New Staff Member
            </DialogTitle>
            <p className="text-caption mt-1">Fill in all the details below to create a staff account</p>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Row 1 */}
            <Field label="Full Name" name="name" placeholder="e.g. Ram Sharma" />

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email Address" name="email" type="email" placeholder="staff@vpsims.com" />
              <Field label="Phone Number" name="phone" placeholder="98XXXXXXXX" />
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

            {/* Password */}
            <Field label="Temporary Password" name="password" type="password" placeholder="Minimum 6 characters" />
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={() => { setIsOpen(false); setForm(defaultForm); setErrors({}); }}>
              Cancel
            </Button>
            <Button className="flex-1 bg-primary text-white hover:bg-primary/90" onClick={handleAdd} disabled={registerMutation.isPending}>
              {registerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Register Staff
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffManagement;
