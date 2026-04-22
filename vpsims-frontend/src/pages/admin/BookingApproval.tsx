import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarCheck, Check, X, Clock, Loader2, User, Car, Wrench } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Booking {
  id: number;
  userId: number;
  customerName: string;
  customerPhone: string;
  vehicleInfo: string;
  serviceType: string;
  serviceDate: string;
  timeSlot: string;
  status: string;
  notes: string;
}

const BookingApproval = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/booking');
      setBookings(data);
    } catch (err) {
      toast.error("Failed to synchronize booking registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/booking/${id}/status`, { status });
      toast.success(`Booking ${id} status optimized to ${status}.`);
      fetchBookings();
    } catch (err) {
      toast.error("Status transition protocol failed.");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      Approved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      Rejected: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      Completed: "bg-primary/10 text-primary border-primary/20",
    };
    return <Badge variant="outline" className={cn("font-black text-[9px] uppercase px-2 py-0.5", styles[status])}>{status}</Badge>;
  };

  const renderTable = (filtered: Booking[]) => (
    <Table>
      <TableHeader className="bg-muted/50 border-b-2 border-border">
        <TableRow>
          <TableHead className="pl-6 text-[10px] font-black uppercase tracking-widest text-foreground">Registry ID</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-widest text-foreground">Entity Persona</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-widest text-foreground">Service Protocol</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-widest text-foreground">Temporal Data</TableHead>
          <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-foreground">State</TableHead>
          <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest text-foreground">Command</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((b) => (
          <TableRow key={b.id} className="border-b border-border hover:bg-muted/30 transition-colors h-16">
            <TableCell className="pl-6 font-mono text-xs font-bold text-primary">#BOK-{b.id.toString().padStart(4, '0')}</TableCell>
            <TableCell>
              <div className="flex flex-col">
                 <span className="text-sm font-black uppercase tracking-tight">{b.customerName}</span>
                 <span className="text-[10px] font-bold text-muted-foreground">{b.vehicleInfo || "No Asset Linked"}</span>
              </div>
            </TableCell>
            <TableCell>
               <div className="flex items-center gap-2">
                  <Wrench className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-black uppercase">{b.serviceType}</span>
               </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                 <span className="text-xs font-bold">{new Date(b.serviceDate).toLocaleDateString()}</span>
                 <span className="text-[10px] font-black text-muted-foreground uppercase">{b.timeSlot}</span>
              </div>
            </TableCell>
            <TableCell className="text-center">{getStatusBadge(b.status)}</TableCell>
            <TableCell className="text-right pr-6 space-x-2">
              {b.status === "Pending" && (
                <>
                  <Button size="sm" variant="outline" className="h-8 text-[9px] font-black uppercase tracking-tighter border-emerald-500/50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all rounded-lg" onClick={() => updateStatus(b.id, "Approved")}>
                    Authorize
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-[9px] font-black uppercase tracking-tighter border-rose-500/50 text-rose-600 hover:bg-rose-500 hover:text-white transition-all rounded-lg" onClick={() => updateStatus(b.id, "Rejected")}>
                    Veto
                  </Button>
                </>
              )}
              {b.status === "Approved" && (
                <Button size="sm" variant="outline" className="h-8 text-[9px] font-black uppercase tracking-tighter border-primary/50 text-primary hover:bg-primary hover:text-white transition-all rounded-lg" onClick={() => updateStatus(b.id, "Completed")}>
                  Finalize Execution
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
        {filtered.length === 0 && (
          <TableRow><TableCell colSpan={6} className="h-40 text-center text-muted-foreground font-bold uppercase text-[10px]">Registry Empty</TableCell></TableRow>
        )}
      </TableBody>
    </Table>
  );

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 bg-background min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">Service Logistics Hub</h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Global Appointment Approval & Deployment Registry</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 p-3 bg-muted border-2 border-border rounded-xl">
              <CalendarCheck className="w-5 h-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest">Active Requests: {bookings.filter(b => b.status === "Pending").length}</span>
           </div>
        </div>
      </div>

      <Card className="border-2 border-border rounded-2xl bg-card shadow-xl overflow-hidden">
        <Tabs defaultValue="Pending" className="w-full">
          <div className="bg-muted p-2 border-b-2 border-border">
            <TabsList className="bg-background/50 border-2 border-border h-12 p-1 rounded-xl w-full">
              {["Pending", "Approved", "Completed", "Rejected", "All"].map(tab => (
                <TabsTrigger key={tab} value={tab} className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {["Pending", "Approved", "Completed", "Rejected"].map(tab => (
            <TabsContent key={tab} value={tab} className="animate-in fade-in duration-300 m-0">
              {renderTable(bookings.filter(b => b.status === tab))}
            </TabsContent>
          ))}
          <TabsContent value="All" className="animate-in fade-in duration-300 m-0">
            {renderTable(bookings)}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default BookingApproval;
