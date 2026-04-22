import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, ArrowLeft, Save, Users, PackageOpen, LayoutDashboard, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const mockBranches = [
  { id: 1, name: "Kathmandu Central Auto Hub", address: "Kantipath, Kathmandu", phone: "+977-1-4234567", email: "ktm.central@vpsims.com", status: "Active", stockLevel: "Healthy", budget: 1500000 },
  { id: 2, name: "Pokhara Regional Branch", address: "Lakeside, Pokhara", phone: "+977-61-456789", email: "pokhara@vpsims.com", status: "Active", stockLevel: "Low Stock", budget: 850000 },
  { id: 3, name: "Biratnagar Distribution", address: "Traffic Chowk, Biratnagar", phone: "+977-21-567890", email: "biratnagar@vpsims.com", status: "Maintenance", stockLevel: "Critical", budget: 450000 },
  { id: 4, name: "Lalitpur Service Center", address: "Jawalakhel, Lalitpur", phone: "+977-1-5534567", email: "jawalakhel@vpsims.com", status: "Active", stockLevel: "Healthy", budget: 1200000 },
];

const BranchConfiguration = () => {
  const { id } = useParams();
  const isNew = id === "new";
  const branchId = isNew ? "new" : parseInt(id || "1", 10);
  
  const branch = isNew ? { 
    id: "new", name: "", address: "", phone: "", email: "", status: "Draft", stockLevel: "N/A", budget: 0 
  } : (mockBranches.find(b => b.id === branchId) || mockBranches[0]);

  const handleSave = () => {
    toast.success(isNew ? "New branch successfully established in the network." : "Hub configuration successfully synchronized.");
  };

  return (
    <div className="space-y-6 animate-fade-in relative max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-3 text-muted-foreground hover:text-foreground">
            <Link to="/admin/branches"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Branches</Link>
          </Button>
          <h1 className="text-3xl font-heading font-black tracking-tight flex items-center gap-2">
            {isNew ? <Plus className="w-8 h-8 text-primary" /> : <LayoutDashboard className="w-8 h-8 text-primary" />} 
            {isNew ? "Establish New Hub" : "Hub Configuration"}
          </h1>
          <p className="text-muted-foreground font-medium text-lg mt-1">
            {isNew ? "Define initial parameters for the new distribution center." : `Granular control settings for ${branch.name}`}
          </p>
        </div>
        <div className="flex gap-2">
           <Badge variant="outline" className={`text-xs uppercase font-bold px-3 py-1 ${branch.status === 'Active' ? 'border-success text-success bg-success/5' : 'border-warning text-warning bg-warning/5'}`}>
             {branch.status} Status
           </Badge>
           <Button onClick={handleSave} className="bg-primary text-white hover:bg-primary/90 font-bold shadow-md">
             <Save className="w-4 h-4 mr-2" /> {isNew ? "Establish Branch" : "Commit Changes"}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="glass-card shadow-lg border-border/40">
            <CardHeader className="pb-4 border-b border-border/40 bg-muted/20">
              <CardTitle className="font-heading flex items-center gap-2"><MapPin className="text-primary w-5 h-5"/> Hub Profile</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Hub Identity</Label>
                <Input defaultValue={branch.name} className="font-bold border-border/50 bg-card/50" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Geographic Coordinates (Address)</Label>
                <div className="relative relative-group">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input defaultValue={branch.address} className="pl-9 border-border/50 bg-card/50" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Direct Telemetry Line (Phone)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input defaultValue={branch.phone} className="pl-9 border-border/50 bg-card/50" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Network Dispatch (Email)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input defaultValue={branch.email} className="pl-9 border-border/50 bg-card/50" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="glass-card shadow-lg border-border/40 overflow-hidden min-h-[500px]">
            <Tabs defaultValue="inventory" className="w-full">
              <div className="bg-muted/30 border-b border-border/40 px-6 py-2">
                <TabsList className="bg-transparent space-x-2">
                  <TabsTrigger value="inventory" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold"><PackageOpen className="w-4 h-4 mr-2" /> Stock Policies</TabsTrigger>
                  <TabsTrigger value="personnel" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold"><Users className="w-4 h-4 mr-2" /> Local Personnel</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="inventory" className="p-6 m-0 space-y-6">
                <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 flex items-center justify-between">
                  <div>
                     <h4 className="font-bold text-foreground flex items-center gap-2">Emergency Core Restocking</h4>
                     <p className="text-sm text-muted-foreground mt-1">If this hub hits critical stock, automatically trigger network restock protocol.</p>
                  </div>
                  <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive hover:text-white">Enable Auto-Restock</Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Allocated Operational Budget (NPR)</Label>
                    <Input defaultValue={branch.budget.toLocaleString()} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Minimum Safety Stock Level (%)</Label>
                    <Input defaultValue="25" type="number" />
                  </div>
                </div>
                
                <div>
                   <h4 className="font-bold border-b border-border/40 pb-2 mb-4 mt-6">Supply Chain Routing</h4>
                   <p className="text-sm text-muted-foreground">Select priority distribution networks for automated replenishment.</p>
                   {/* Placeholder for complex routing ui */}
                   <div className="mt-4 p-8 border border-dashed rounded-xl border-border flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
                      <LayoutDashboard className="w-8 h-8 opacity-50 mb-2" />
                      <span className="font-medium">Supply routing graph rendered here.</span>
                   </div>
                </div>
              </TabsContent>

              <TabsContent value="personnel" className="p-6 m-0">
                <div className="text-center py-16 text-muted-foreground">
                  <Users className="w-12 h-12 opacity-20 mx-auto mb-4" />
                  <h3 className="font-heading font-bold text-lg text-foreground">Personnel Configuration Loading...</h3>
                  <p className="text-sm">Connect to external HCM module to view staff assigned to {branch.name}.</p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BranchConfiguration;
