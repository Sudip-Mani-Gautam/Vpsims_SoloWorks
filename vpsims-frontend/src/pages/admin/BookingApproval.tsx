import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { CalendarCheck, Clock, CheckCircle2, XCircle, LayoutGrid, Search, Filter, Download, MoreVertical, Calendar as CalendarIcon, Wrench, CheckSquare, ArrowUpDown } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Booking {
  id: number;
  userId: number;
  customerName: string;
  vehicleDetails?: string;
  serviceDate: string;
  timeSlot: string;
  status: string;
  serviceNotes?: string;
}

const parseNotes = (serviceNotes?: string) => {
  if (!serviceNotes) return { type: "General Service", notes: "" };
  const lines = serviceNotes.split('\n');
  const type = lines[0]?.replace('Service: ', '') || "General Service";
  const notes = lines.slice(1).join('\n').replace('Notes: ', '') || "";
  return { type, notes };
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const Sparkline = ({ color }: { color: string }) => (
  <svg className={cn("w-16 h-8", color)} viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 25C20 25 25 10 45 15C65 20 75 5 100 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M0 25C20 25 25 10 45 15C65 20 75 5 100 5L100 30L0 30Z" fill="currentColor" fillOpacity="0.1" />
  </svg>
);

const BookingApproval = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

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

  const stats = [
    { label: "Pending", count: bookings.filter(b => b.status === "Pending").length, icon: Clock, color: "text-blue-600", bg: "bg-blue-600", lightBg: "bg-blue-100", stroke: "text-blue-500" },
    { label: "Approved", count: bookings.filter(b => b.status === "Approved").length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500", lightBg: "bg-emerald-100", stroke: "text-emerald-500" },
    { label: "Completed", count: bookings.filter(b => b.status === "Completed").length, icon: CheckSquare, color: "text-purple-600", bg: "bg-purple-500", lightBg: "bg-purple-100", stroke: "text-purple-500" },
    { label: "Rejected", count: bookings.filter(b => b.status === "Rejected").length, icon: XCircle, color: "text-rose-600", bg: "bg-rose-500", lightBg: "bg-rose-100", stroke: "text-rose-500" },
    { label: "All Requests", count: bookings.length, icon: LayoutGrid, color: "text-gray-600", bg: "bg-gray-200", lightBg: "bg-gray-100", stroke: "text-gray-400" },
  ];

  let filteredBookings = bookings;
  
  if (activeTab !== "All") {
    filteredBookings = filteredBookings.filter(b => b.status === activeTab);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredBookings = filteredBookings.filter(b => 
      b.customerName.toLowerCase().includes(q) ||
      b.id.toString().includes(q) ||
      parseNotes(b.serviceNotes).type.toLowerCase().includes(q)
    );
  }

  filteredBookings = [...filteredBookings].sort((a, b) => {
    let cmp = 0;
    if (sortField === "id") cmp = a.id - b.id;
    else if (sortField === "name") cmp = a.customerName.localeCompare(b.customerName);
    else if (sortField === "service") cmp = parseNotes(a.serviceNotes).type.localeCompare(parseNotes(b.serviceNotes).type);
    else if (sortField === "date") cmp = new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime();
    else if (sortField === "status") cmp = a.status.localeCompare(b.status);
    
    return sortDirection === "asc" ? cmp : -cmp;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleExport = () => {
    if (filteredBookings.length === 0) {
      toast.error("No data to export.");
      return;
    }
    const headers = ["Registry ID", "Customer Name", "Vehicle Details", "Service Protocol", "Notes", "Booking Date", "Time Slot", "Status"];
    const csvData = filteredBookings.map(b => [
      `#BOK-${b.id.toString().padStart(4, '0')}`,
      `"${b.customerName}"`,
      `"${b.vehicleDetails || 'No Asset Linked'}"`,
      `"${parseNotes(b.serviceNotes).type}"`,
      `"${parseNotes(b.serviceNotes).notes}"`,
      new Date(b.serviceDate).toLocaleDateString(),
      b.timeSlot,
      b.status
    ].join(","));
    
    const csvString = [headers.join(","), ...csvData].join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `booking_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Registry exported successfully.");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return <Badge variant="outline" className="bg-amber-100 text-amber-600 border-none font-bold text-[10px] uppercase px-3 py-1 gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" />PENDING</Badge>;
      case 'Approved': return <Badge variant="outline" className="bg-emerald-100 text-emerald-600 border-none font-bold text-[10px] uppercase px-3 py-1 gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />APPROVED</Badge>;
      case 'Completed': return <Badge variant="outline" className="bg-purple-100 text-purple-600 border-none font-bold text-[10px] uppercase px-3 py-1 gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-purple-500" />COMPLETED</Badge>;
      case 'Rejected': return <Badge variant="outline" className="bg-rose-100 text-rose-600 border-none font-bold text-[10px] uppercase px-3 py-1 gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" />REJECTED</Badge>;
      default: return null;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto py-8 px-6 lg:px-8 space-y-8 bg-background min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Service Logistics Hub</h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">Global Appointment Approval & Deployment Registry</p>
        </div>
        <div className="flex items-center">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-5 shadow-sm font-semibold flex items-center gap-3">
            <CalendarCheck className="w-5 h-5" />
            <span>Active Requests</span>
            <div className="bg-blue-500/50 text-white rounded-md px-2.5 py-1 text-xs font-bold ml-1">
              {stats[0].count}
            </div>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border/50 shadow-sm rounded-2xl bg-card overflow-hidden relative group">
            <CardContent className="p-5 flex flex-col gap-4">
               <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-sm", stat.bg, stat.color.includes('gray') ? 'text-gray-100 dark:text-gray-900' : 'text-white')}>
                     <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-0.5">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-foreground">{stat.count}</h3>
                  </div>
               </div>
               <div className="absolute bottom-0 right-0 opacity-60 group-hover:opacity-100 transition-opacity">
                 <Sparkline color={stat.stroke} />
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Table Card */}
      <Card className="border-border/50 shadow-sm rounded-2xl bg-card overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-border/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
           {/* Tabs */}
           <div className="flex items-center bg-muted/50 p-1 rounded-xl w-fit border border-border/30">
             {["All", "Pending", "Approved", "Completed", "Rejected"].map(tab => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={cn(
                   "px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                   activeTab === tab 
                     ? "bg-background text-blue-600 dark:text-blue-400 shadow-sm" 
                     : "text-muted-foreground hover:text-foreground hover:bg-muted"
                 )}
               >
                 {tab}
               </button>
             ))}
           </div>

           {/* Actions */}
           <div className="flex items-center gap-3">
             <div className="relative">
               <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
               <Input 
                  placeholder="Search by ID, customer or service..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[280px] bg-muted/30 border-border/50 rounded-xl h-10 text-sm focus-visible:ring-blue-500 transition-all focus:bg-background" 
               />
             </div>
             <Button variant="outline" className="h-10 rounded-xl border-border/50 text-foreground font-semibold gap-2 shadow-sm bg-background hover:bg-muted/50">
               <Filter className="w-4 h-4" /> Filter
             </Button>
             <Button variant="outline" className="h-10 rounded-xl border-border/50 text-foreground font-semibold gap-2 shadow-sm bg-background hover:bg-muted/50" onClick={handleExport}>
               <Download className="w-4 h-4" /> Export
             </Button>
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-transparent">
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                {[
                  { label: "REGISTRY ID", field: "id" }, 
                  { label: "CUSTOMER NAME", field: "name" }, 
                  { label: "SERVICE PROTOCOL", field: "service" }, 
                  { label: "BOOKING DATE", field: "date" }, 
                  { label: "STATUS", field: "status" }, 
                  { label: "ACTIONS", field: "" }
                ].map((col, i) => (
                  <TableHead 
                     key={col.label} 
                     onClick={() => col.field ? handleSort(col.field) : null}
                     className={cn(
                       "h-14 text-xs font-bold text-muted-foreground tracking-wider transition-colors",
                       col.field ? "cursor-pointer hover:text-foreground" : "",
                       i === 0 ? "pl-8" : "",
                       i === 5 ? "text-right pr-8" : ""
                     )}
                  >
                    <div className={cn("flex items-center gap-1.5", i === 5 ? "justify-end" : "")}>
                      {col.label}
                      {col.field && (
                         <ArrowUpDown className={cn(
                            "w-3 h-3 transition-colors", 
                            sortField === col.field ? "text-blue-500 opacity-100" : "opacity-30"
                         )} />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((b) => (
                <TableRow key={b.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors group">
                  {/* Registry ID */}
                  <TableCell className="pl-8 py-5">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">#BOK-{b.id.toString().padStart(4, '0')}</span>
                      <span className="text-xs text-muted-foreground font-medium">Registry ID</span>
                    </div>
                  </TableCell>

                  {/* Customer Name */}
                  <TableCell className="py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                        {getInitials(b.customerName)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">{b.customerName}</span>
                        <span className="text-xs text-muted-foreground font-medium">{b.vehicleDetails || "No Asset Linked"}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Service Protocol */}
                  <TableCell className="py-5">
                    <div className="flex flex-col items-start gap-1.5">
                      <Badge className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-none text-[10px] font-bold uppercase px-2.5 py-1 flex items-center gap-1.5 shadow-none">
                        <Wrench className="w-3 h-3" />
                        {parseNotes(b.serviceNotes).type}
                      </Badge>
                      {parseNotes(b.serviceNotes).notes && (
                        <span className="text-xs font-medium text-muted-foreground italic">
                          Note: {parseNotes(b.serviceNotes).notes}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Booking Date */}
                  <TableCell className="py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400 flex items-center justify-center">
                         <CalendarIcon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-foreground">{new Date(b.serviceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="text-xs font-medium text-muted-foreground">{b.timeSlot}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-5">
                     {getStatusBadge(b.status)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="pr-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      {b.status === "Pending" && (
                        <>
                          <Button size="sm" variant="outline" className="h-8 rounded-lg border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 font-bold text-xs gap-1.5 px-3" onClick={() => updateStatus(b.id, "Approved")}>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Authorize
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 rounded-lg border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 font-bold text-xs gap-1.5 px-3" onClick={() => updateStatus(b.id, "Rejected")}>
                            <XCircle className="w-3.5 h-3.5" /> Veto
                          </Button>
                        </>
                      )}
                      {b.status === "Approved" && (
                        <Button size="sm" variant="outline" className="h-8 rounded-lg border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 font-bold text-xs gap-1.5 px-3" onClick={() => updateStatus(b.id, "Completed")}>
                          <CheckSquare className="w-3.5 h-3.5" /> Complete
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                             <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(`#BOK-${b.id.toString().padStart(4, '0')}`); toast.success("Registry ID copied"); }}>
                            Copy Registry ID
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.info("Detailed view is currently under construction.")}>
                            View Full Details
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                             <a href={`mailto:?subject=Regarding Appointment #BOK-${b.id.toString().padStart(4, '0')}`}>Contact Customer</a>
                          </DropdownMenuItem>
                          {b.status !== "Rejected" && b.status !== "Completed" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-500/10 focus:text-rose-600 font-medium" onClick={() => updateStatus(b.id, "Rejected")}>
                                Force Reject
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredBookings.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                     <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
                       <LayoutGrid className="w-10 h-10 opacity-20" />
                       <span className="font-bold text-sm">No bookings found in this category.</span>
                     </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default BookingApproval;
