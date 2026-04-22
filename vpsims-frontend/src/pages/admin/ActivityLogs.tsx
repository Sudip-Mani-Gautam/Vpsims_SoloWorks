import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, History, Shield, Clock, Loader2, User, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: number;
  action: string;
  details: string;
  timestamp: string;
  userName: string;
}

const ActivityLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    try {
      const { data } = await api.get('/activitylog');
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const filtered = logs.filter(l => 
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.details.toLowerCase().includes(search.toLowerCase()) ||
    l.userName.toLowerCase().includes(search.toLowerCase())
  );

  const getActionColor = (action: string) => {
    if (action.includes("CREATED") || action.includes("ADDED")) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (action.includes("UPDATED")) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    if (action.includes("DELETED")) return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    return "text-primary bg-primary/10 border-primary/20";
  };

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 bg-background min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg border border-slate-700">
             <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">Audit Ledger</h1>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Immutable Activity & Operation Registry</p>
          </div>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10 h-11 bg-card border-2 border-border rounded-xl font-bold uppercase text-[10px] focus:border-primary transition-all" 
            placeholder="Search action or entity..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-2 border-border rounded-2xl bg-card shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted border-b-2 border-border">
            <TableRow>
              <TableHead className="pl-6 text-[10px] font-black uppercase tracking-widest text-foreground">Temporal ID</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-foreground">Operational Protocol</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-foreground">Action Integrity Details</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-foreground">Actor</TableHead>
              <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest text-foreground">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((log) => (
              <TableRow key={log.id} className="border-b border-border hover:bg-muted/30 transition-colors h-16">
                <TableCell className="pl-6 font-mono text-xs font-bold text-primary">#LOG-{log.id.toString().padStart(6, '0')}</TableCell>
                <TableCell>
                   <Badge variant="outline" className={cn("font-black text-[9px] uppercase px-2 py-0.5 border-none", getActionColor(log.action))}>
                      {log.action}
                   </Badge>
                </TableCell>
                <TableCell className="max-w-md">
                   <p className="text-sm font-bold text-foreground line-clamp-1">{log.details}</p>
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-muted border border-border flex items-center justify-center">
                         <User className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <span className="text-xs font-black uppercase">{log.userName}</span>
                   </div>
                </TableCell>
                <TableCell className="text-right pr-6">
                   <div className="flex flex-col items-end">
                      <span className="text-xs font-bold">{new Date(log.timestamp).toLocaleDateString()}</span>
                      <span className="text-[9px] font-black text-muted-foreground uppercase">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                   </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-bold uppercase text-[10px]">No audit records found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ActivityLogs;
