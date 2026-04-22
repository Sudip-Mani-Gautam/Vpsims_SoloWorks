import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { User, Car, Save, Plus, Trash2, Mail, Phone, MapPin, Trophy, Star, ShieldCheck, ChevronRight, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import AvatarUploader from "@/components/AvatarUploader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

interface Vehicle {
  id: number;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  const [newVehicle, setNewVehicle] = useState({ licensePlate: "", make: "", model: "", year: "" });
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  // Sync profile state when user context changes
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

  // Fetch Vehicles from API
  const { data: vehicles = [], isLoading: loadingVehicles } = useQuery({
    queryKey: ["my-vehicles"],
    queryFn: async () => {
      const res = await api.get("/vehicle");
      return res.data;
    },
  });

  // Add Vehicle Mutation
  const addMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/vehicle", {
        ...data,
        year: parseInt(data.year) || new Date().getFullYear()
      });
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

  // Delete Vehicle Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/vehicle/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-vehicles"] });
      toast.success("Vehicle removed from registry.");
    },
  });

  const handleSaveProfile = () => {
    toast.success("Profile synchronization complete!");
  };

  const getLoyaltyTier = (points: number = 0) => {
    if (points >= 1000) return { label: "Platinum", color: "bg-slate-900 text-slate-100", icon: <Trophy className="w-4 h-4" /> };
    if (points >= 500) return { label: "Gold", color: "bg-amber-500 text-white", icon: <Star className="w-4 h-4" /> };
    if (points >= 100) return { label: "Silver", color: "bg-slate-400 text-white", icon: <Star className="w-4 h-4" /> };
    return { label: "Bronze", color: "bg-orange-700 text-white", icon: <Star className="w-4 h-4" /> };
  };

  const tier = getLoyaltyTier(user?.loyaltyPoints);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8 bg-background min-h-screen">
      {/* Balanced Professional Header */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg border border-primary/20">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">Identity Profile</h1>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Personal Asset & Security Registry</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Core Identity */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-2 border-border rounded-2xl bg-card overflow-hidden shadow-xl">
            <div className="bg-primary/5 p-8 flex flex-col items-center text-center border-b border-border">
              <AvatarUploader initials={user?.name?.[0]?.toUpperCase() || "U"} size="xl" />
              <h3 className="font-black text-lg uppercase mt-6 tracking-tight">{user?.name}</h3>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{user?.email}</p>
              <div className="flex gap-3 mt-5">
                <Badge className={cn("px-4 py-1 rounded-full border-none shadow-md flex items-center gap-2 text-[10px] font-black uppercase transition-transform hover:scale-105", tier.color)}>
                  {tier.icon} {tier.label}
                </Badge>
                <Badge variant="outline" className="text-[10px] font-black uppercase border-primary/30 text-primary px-4 py-1 rounded-full">{user?.loyaltyPoints || 0} POINTS</Badge>
              </div>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border transition-colors hover:bg-muted/50">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold truncate">{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border transition-colors hover:bg-muted/50">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold">{profile.phone}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border transition-colors hover:bg-muted/50">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold truncate">{profile.address}</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-500/5 border-2 border-emerald-500/10 rounded-2xl space-y-3">
                <p className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-2 tracking-widest">
                  <ShieldCheck className="w-4 h-4" /> Loyalty Logic Active
                </p>
                <div className="flex justify-between items-center border-b border-emerald-500/20 pb-2">
                  <span className="text-[10px] font-black uppercase text-emerald-700">Total Points:</span>
                  <span className="text-sm font-black text-emerald-600">{user?.loyaltyPoints || 0}</span>
                </div>
                <div className="flex justify-between items-center border-b border-emerald-500/20 pb-2">
                  <span className="text-[10px] font-black uppercase text-emerald-700">Status:</span>
                  <span className="text-sm font-black text-emerald-600">Active</span>
                </div>
                <p className="text-xs text-emerald-700 font-bold leading-relaxed uppercase italic opacity-80 pt-1">
                  Automatic 10% discount applied to single purchases exceeding $5000. Earning 1 point per $100 spent.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Edit & Vehicles */}
        <div className="lg:col-span-8 space-y-6">
          {/* Edit Info */}
          <Card className="border-2 border-border rounded-2xl bg-card shadow-xl overflow-hidden">
            <CardHeader className="bg-muted p-5 border-b border-border">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
                <Save className="w-4 h-4 text-primary" /> Synchronize Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Legal Designation</Label>
                  <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="bg-muted/30 border-2 border-border h-11 text-sm font-bold rounded-xl focus:border-primary transition-all" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Primary Link (Email)</Label>
                  <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="bg-muted/30 border-2 border-border h-11 text-sm font-bold rounded-xl focus:border-primary transition-all" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact Signal (Phone)</Label>
                  <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="bg-muted/30 border-2 border-border h-11 text-sm font-bold rounded-xl focus:border-primary transition-all" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Station Address</Label>
                  <Input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className="bg-muted/30 border-2 border-border h-11 text-sm font-bold rounded-xl focus:border-primary transition-all" />
                </div>
              </div>
              <Button onClick={handleSaveProfile} className="mt-6 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] h-12 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all px-10">
                Authorize Modifications
              </Button>
            </CardContent>
          </Card>

          {/* Vehicles */}
          <Card className="border-2 border-border rounded-2xl bg-card shadow-xl overflow-hidden">
            <CardHeader className="bg-muted p-5 border-b border-border flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
                <Car className="w-4 h-4 text-primary" /> Active Fleet Registry
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowAddVehicle(!showAddVehicle)} className="h-8 text-[10px] font-black uppercase tracking-widest rounded-lg border-primary/30 text-primary hover:bg-primary/5 px-4 transition-all">
                Add New Vechile
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {showAddVehicle && (
                <div className="p-6 border-b-2 border-border bg-primary/5 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest">Registry Plate</Label>
                    <Input value={newVehicle.licensePlate} onChange={(e) => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })} className="h-10 text-xs bg-background border-2 border-border rounded-lg" placeholder="BA-1-KHA-1234" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest">Manufacturer</Label>
                    <Input value={newVehicle.make} onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })} className="h-10 text-xs bg-background border-2 border-border rounded-lg" placeholder="Toyota" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest">Model & Year</Label>
                    <div className="flex gap-2">
                      <Input value={newVehicle.model} onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })} className="h-10 text-xs bg-background border-2 border-border rounded-lg flex-1" placeholder="Corolla" />
                      <Input value={newVehicle.year} onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })} className="h-10 text-xs bg-background border-2 border-border rounded-lg w-16" placeholder="2020" />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={() => addMutation.mutate(newVehicle)} disabled={addMutation.isPending} className="w-full h-10 text-[11px] font-black uppercase rounded-lg shadow-md transition-all">
                      {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Register"}
                    </Button>
                  </div>
                </div>
              )}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50 border-b-2 border-border">
                    <TableRow>
                      <TableHead className="text-[10px] font-black uppercase h-12 px-6 text-foreground">Registry Plate</TableHead>
                      <TableHead className="text-[10px] font-black uppercase h-12 text-foreground">Manufacturer Model</TableHead>
                      <TableHead className="text-[10px] font-black uppercase h-12 text-center text-foreground">State</TableHead>
                      <TableHead className="text-right px-6 text-[10px] font-black uppercase h-12 text-foreground">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingVehicles ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground font-bold uppercase text-[10px]">Synchronizing Fleet Data...</TableCell>
                      </TableRow>
                    ) : vehicles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground font-bold uppercase text-[10px]">No assets found in registry.</TableCell>
                      </TableRow>
                    ) : (
                      vehicles.map((v: any) => (
                        <TableRow key={v.id} className="border-b border-border hover:bg-muted/30 h-14 transition-colors">
                          <TableCell className="px-6 font-mono text-sm font-black text-primary uppercase tracking-tighter">{v.licensePlate}</TableCell>
                          <TableCell className="font-black text-sm uppercase">{v.make} {v.model} <span className="text-muted-foreground font-bold ml-1">({v.year})</span></TableCell>
                          <TableCell className="text-center">
                            <Badge className="text-[9px] font-black uppercase px-2 py-0.5 bg-emerald-500 text-white border-none shadow-sm rounded-sm">Verified</Badge>
                          </TableCell>
                          <TableCell className="text-right px-6">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMutation.mutate(v.id)}
                              disabled={deleteMutation.isPending}
                              className="text-muted-foreground/30 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
