import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import {
  User, Car, Save, Mail, Phone, MapPin, Trophy,
  Star, ShieldCheck, Plus, Loader2, Edit2, CheckCircle2, X,
  ChevronDown, Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import AvatarUploader from "@/components/AvatarUploader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface Vehicle {
  id: number;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  status: string;
}

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  Active:   { label: "Active",   bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/20" },
  Sold:     { label: "Sold",     bg: "bg-amber-500/10",   text: "text-amber-600",   border: "border-amber-500/20"   },
  Inactive: { label: "Inactive", bg: "bg-slate-400/10",   text: "text-slate-500",   border: "border-slate-400/20"   },
};

const tierConfig = (points: number = 0) => {
  if (points >= 1000) return { label: "Platinum", next: null,      progress: 100,                           color: "bg-slate-700",   ring: "ring-slate-400",   text: "text-slate-100", icon: <Trophy size={14} /> };
  if (points >= 500)  return { label: "Gold",     next: 1000,      progress: ((points - 500) / 500) * 100, color: "bg-amber-500",   ring: "ring-amber-400",   text: "text-amber-50",  icon: <Star size={14} /> };
  if (points >= 100)  return { label: "Silver",   next: 500,       progress: ((points - 100) / 400) * 100, color: "bg-slate-400",   ring: "ring-slate-300",   text: "text-slate-50",  icon: <Star size={14} /> };
  return              { label: "Bronze",           next: 100,       progress: (points / 100) * 100,         color: "bg-orange-700",  ring: "ring-orange-500",  text: "text-orange-50", icon: <Star size={14} /> };
};

const ProfilePage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });
  const [newVehicle, setNewVehicle] = useState({ licensePlate: "", make: "", model: "", year: "" });
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "9801234567",
        address: user.address || "Kathmandu, Nepal",
      });
    }
  }, [user]);

  const { data: vehicles = [], isLoading: loadingVehicles } = useQuery({
    queryKey: ["my-vehicles"],
    queryFn: async () => { const res = await api.get("/vehicle"); return res.data; },
  });

  const addMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/vehicle", { ...data, year: parseInt(data.year) || new Date().getFullYear() });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-vehicles"] });
      setNewVehicle({ licensePlate: "", make: "", model: "", year: "" });
      setShowAddVehicle(false);
      toast.success("Vehicle registered successfully!");
    },
    onError: () => toast.error("Failed to register vehicle."),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await api.patch(`/vehicle/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-vehicles"] });
      toast.success("Vehicle status updated.");
    },
    onError: () => toast.error("Failed to update vehicle status."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/vehicle/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-vehicles"] });
      toast.success("Vehicle deleted successfully.");
    },
    onError: () => toast.error("Failed to delete vehicle."),
  });

  const handleSave = () => {
    toast.success("Profile updated successfully!");
    setIsEditing(false);
  };

  const tier = tierConfig(user?.loyaltyPoints);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your personal information and registered vehicles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left Sidebar ── */}
        <div className="lg:col-span-4 space-y-5">
          {/* Profile Card */}
          <Card className="border-border overflow-hidden">
            {/* Cover Banner */}
            <div className="h-20 bg-gradient-to-br from-primary/80 via-primary to-indigo-600 relative">
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "18px 18px" }}
              />
            </div>

            <CardContent className="pt-0 pb-6 px-6">
              <div className="flex flex-col items-center -mt-10">
                <AvatarUploader 
                  initials={user?.name?.[0]?.toUpperCase() || "U"} 
                  size="xl" 
                  ringClass={tier.ring}
                />
                <h2 className="mt-3 text-lg font-bold text-foreground">{user?.name}</h2>
                <p className="text-xs text-muted-foreground font-medium">{user?.email}</p>

                <div className="flex items-center gap-2 mt-3">
                  <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold", tier.color, tier.text)}>
                    {tier.icon} {tier.label}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-muted text-foreground border border-border">
                    {user?.loyaltyPoints ?? 0} pts
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-6 space-y-2.5">
                {[
                  { icon: Mail, value: profile.email },
                  { icon: Phone, value: profile.phone },
                  { icon: MapPin, value: profile.address },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/40 border border-border/60">
                    <item.icon size={15} className="text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-foreground font-medium truncate">{item.value || "—"}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Loyalty Card */}
          <Card className="border-border overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <ShieldCheck size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Loyalty Program</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Earn points on every visit</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">Active</span>
              </div>

              <div className="space-y-1 mb-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-black text-foreground">{user?.loyaltyPoints ?? 0}</span>
                  {tier.next && <span className="text-xs text-muted-foreground font-medium">of {tier.next} to {
                    tier.label === "Bronze" ? "Silver" : tier.label === "Silver" ? "Gold" : "Platinum"
                  }</span>}
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${tier.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn("h-full rounded-full", tier.color)}
                  />
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground leading-relaxed bg-muted/40 rounded-lg p-3 border border-border/50">
                Earn <span className="text-foreground font-semibold">1 point</span> per NPR 100 spent. Members receive a{" "}
                <span className="text-foreground font-semibold">10% discount</span> on purchases over NPR 5,000.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right Column ── */}
        <div className="lg:col-span-8 space-y-5">
          {/* Edit Profile */}
          <Card className="border-border">
            <CardHeader className="border-b border-border py-4 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <User size={18} className="text-primary" />
                  <CardTitle className="text-sm font-bold">Personal Information</CardTitle>
                </div>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="h-8 text-xs font-semibold gap-1.5 border-border"
                  >
                    <Edit2 size={13} /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={() => setIsEditing(false)}>
                      <X size={13} className="mr-1" /> Cancel
                    </Button>
                    <Button size="sm" className="h-8 text-xs font-semibold gap-1.5" onClick={handleSave}>
                      <Save size={13} /> Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { label: "Full Name", key: "name", type: "text", icon: User },
                  { label: "Email Address", key: "email", type: "email", icon: Mail },
                  { label: "Phone Number", key: "phone", type: "text", icon: Phone },
                  { label: "Address", key: "address", type: "text", icon: MapPin },
                ].map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">{field.label}</Label>
                    <div className="relative">
                      <field.icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type={field.type}
                        value={profile[field.key as keyof typeof profile]}
                        onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
                        disabled={!isEditing}
                        className={cn(
                          "pl-9 h-10 text-sm transition-all",
                          isEditing
                            ? "border-primary/50 bg-background focus:border-primary"
                            : "border-border bg-muted/30 text-foreground cursor-default"
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {isEditing && (
                <p className="mt-4 text-[11px] text-muted-foreground flex items-center gap-1.5 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2">
                  <CheckCircle2 size={12} className="text-amber-500" />
                  Changes to your email may require re-verification.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Vehicle Registry */}
          <Card className="border-border">
            <CardHeader className="border-b border-border py-4 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Car size={18} className="text-primary" />
                  <div>
                    <CardTitle className="text-sm font-bold">My Vehicles</CardTitle>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{vehicles.length} registered</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddVehicle(!showAddVehicle)}
                  className="h-8 text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
                >
                  <Plus size={13} /> Add Vehicle
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {/* Add Vehicle Form */}
              <AnimatePresence>
                {showAddVehicle && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {[
                        { label: "License Plate", key: "licensePlate", placeholder: "BA-1-1234" },
                        { label: "Make", key: "make", placeholder: "Toyota" },
                        { label: "Model", key: "model", placeholder: "Hilux" },
                        { label: "Year", key: "year", placeholder: "2022" },
                      ].map((f) => (
                        <div key={f.key} className="space-y-1.5">
                          <Label className="text-[10px] font-semibold text-muted-foreground">{f.label}</Label>
                          <Input
                            value={newVehicle[f.key as keyof typeof newVehicle]}
                            onChange={(e) => setNewVehicle({ ...newVehicle, [f.key]: e.target.value })}
                            placeholder={f.placeholder}
                            className="h-9 text-xs bg-background border-border"
                          />
                        </div>
                      ))}
                      <div className="col-span-2 md:col-span-4 flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowAddVehicle(false)} className="text-xs h-8">Cancel</Button>
                        <Button size="sm" onClick={() => addMutation.mutate(newVehicle)} disabled={addMutation.isPending} className="text-xs h-8 font-semibold">
                          {addMutation.isPending ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Plus size={13} className="mr-1.5" />}
                          Register Vehicle
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Vehicle List */}
              {loadingVehicles ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Loader2 size={24} className="animate-spin text-muted-foreground/50" />
                  <p className="text-xs text-muted-foreground font-medium">Loading vehicles...</p>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-border text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3 opacity-50">
                    <Car size={22} className="text-muted-foreground" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">No vehicles registered</h4>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">Add your vehicle to enable full service tracking</p>
                  <Button size="sm" variant="outline" className="text-xs font-semibold" onClick={() => setShowAddVehicle(true)}>
                    <Plus size={13} className="mr-1.5" /> Add Your First Vehicle
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {vehicles.map((v: Vehicle) => {
                    const status = v.status || "Active";
                    const sc = statusConfig[status] ?? statusConfig["Active"];
                    return (
                      <div
                        key={v.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            status === "Active" ? "bg-primary/10 text-primary" :
                            status === "Sold" ? "bg-amber-500/10 text-amber-600" :
                            "bg-slate-400/10 text-slate-500"
                          )}>
                            <Car size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-foreground">{v.make} {v.model}</span>
                              <span className="text-xs text-muted-foreground font-medium">({v.year})</span>
                            </div>
                            <p className="font-mono text-xs font-bold text-primary tracking-wider mt-0.5">{v.licensePlate}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Status Badge + Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer transition-all hover:opacity-80",
                                sc.bg, sc.text, sc.border
                              )}>
                                <CheckCircle2 size={11} />
                                {sc.label}
                                <ChevronDown size={10} className="ml-0.5 opacity-60" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36 rounded-xl shadow-xl border-border">
                              <p className="px-3 py-1.5 text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Set Status</p>
                              {["Active", "Sold", "Inactive"].map((s) => (
                                <DropdownMenuItem
                                  key={s}
                                  onClick={() => updateStatusMutation.mutate({ id: v.id, status: s })}
                                  className={cn(
                                    "text-xs font-semibold cursor-pointer rounded-lg my-0.5",
                                    status === s && "font-black"
                                  )}
                                >
                                  <span className={cn(
                                    "w-2 h-2 rounded-full mr-2 flex-shrink-0",
                                    s === "Active" ? "bg-emerald-500" : s === "Sold" ? "bg-amber-500" : "bg-slate-400"
                                  )} />
                                  {s}
                                  {status === s && <CheckCircle2 size={11} className="ml-auto opacity-60" />}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              if (confirm("Delete this vehicle?")) {
                                deleteMutation.mutate(v.id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
